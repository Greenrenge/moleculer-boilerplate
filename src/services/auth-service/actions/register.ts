import type { ActionSchema } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { LoginMethod } from '@/constants/business'
import { ValidationError } from '@/constants/errors'
import { ControlState } from '@/models/common/control-state'
import { UserLogin } from '@/services/auth-service/models/user-login'
import type { IToken } from '@/services/auth-service/utils/token'
import { issueUserAccessToken } from '@/services/auth-service/utils/token'

const _isRequiredPassword = (registerType: LoginMethod): boolean => {
	switch (registerType) {
		case LoginMethod.FACEBOOK:
		case LoginMethod.GOOGLE:
		case LoginMethod.LINE:
		case LoginMethod.APPLE:
			return false
		default:
			return true
	}
}
export type RegisterParams = {
	email?: string
	password?: string
	registerType?: LoginMethod
	accessToken?: string
	asEmployee: boolean | string
}
export default {
	params: {
		email: { type: 'string', optional: true },
		password: { type: 'string', min: 8, optional: true },
		registerType: { type: 'enum', values: Object.values(LoginMethod), optional: true },
		accessToken: { type: 'string', optional: true },
		// note: this is for login, not register --> enable UI to select the
		asEmployee: {
			type: 'multi',
			rules: [{ type: 'boolean' }, { type: 'string' }],
			default: true,
		},
	},

	handler: async function register(ctx: AppContextMeta<RegisterParams>): Promise<IToken> {
		// this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
		const { registerType = LoginMethod.EMAIL, asEmployee } = ctx.params

		const entity = await this.verifyUserInfo(ctx.params)
		const user = await UserLogin.findOne(this.getUserFilterQuery(entity, registerType))

		if (user) {
			// login flow
			if (registerType === LoginMethod.EMAIL) {
				throw new ValidationError('USER_EXISTS')
			}
			return ctx.broker.call(
				'v1.user.profile.selectProfile',
				{ empId: asEmployee },
				{
					meta: {
						...ctx.meta,
						userId: user._id,
					},
				},
			)
		}
		// register
		// TODO: Implement - check user email if match should link with existing account instead of create a new user
		// Get running userId
		const _id = await ControlState.getNextUserId()
		const { email, password, ...rest } = entity
		const isRequiredPassword = _isRequiredPassword(registerType)
		const authInfo = {
			_id,
			...rest,
			email: email?.toLowerCase(), // make sure at least has a email key
			...(isRequiredPassword && { password }),
		}

		const newAuthUser = new UserLogin(authInfo)
		const createdAuthUser = await newAuthUser.save()

		const userInfo = { _id, email, ...rest }

		// create public profile
		const userPublicProfile = await this.broker.call('v1.user.create', userInfo, {
			meta: {
				...ctx.meta,
				userId: _id,
			},
		})
		const token = await issueUserAccessToken(userPublicProfile, {
			empId: userPublicProfile._id,
			permission: [],
			orgId: userPublicProfile.orgId,
		})
		return token
	},
} as ActionSchema