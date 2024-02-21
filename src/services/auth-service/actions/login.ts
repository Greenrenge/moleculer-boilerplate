import bcrypt from 'bcrypt'
import type { ServiceBroker } from 'moleculer'
import type { LoginParams, LoginReturn } from 'v1.auth.login'
import { SelectProfileParams, SelectProfileReturn } from 'v1.user.profile.selectProfile'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { UserLogin } from '@/services/auth-service/models/user-login'

export default {
	params: {
		email: { type: 'string' },
		password: { type: 'string' },
		asEmployee: {
			type: 'multi',
			rules: [{ type: 'boolean' }, { type: 'string' }],
			default: true,
		},
	},
	handler: async function login(
		this: MoleculerService,
		ctx: AppContextMeta<LoginParams>,
	): Promise<LoginReturn> {
		// this.logger.info(`ACTION: ${ctx.action?.name}`, ctx);
		const { email, password, asEmployee = true } = ctx.params

		// Get user
		const user = await UserLogin.findOne({
			email: email?.toLowerCase(),
		})

		if (!user) throw new ValidationError('USER_NOT_EXIST')

		// Login with password
		const passwordMatch: boolean = await bcrypt.compare(password, user.password)

		if (!passwordMatch) {
			throw new ValidationError('USER_INCORRECT_CREDENTIALS')
		}

		return ctx.call<SelectProfileReturn, SelectProfileParams>(
			'v1.user.profile.selectProfile',
			{ empId: asEmployee },
			{
				meta: {
					userId: user._id,
				},
			},
		)
	},
}
