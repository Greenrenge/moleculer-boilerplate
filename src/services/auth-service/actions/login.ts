import bcrypt from 'bcrypt'
import type { ServiceBroker } from 'moleculer'
import type { AppContextMeta } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { UserLogin } from '@/services/auth-service/models/user-login'

type LoginParams = {
	email: string
	password: string
	asEmployee?: boolean | string
}

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
		this: ServiceBroker,
		ctx: AppContextMeta<LoginParams>,
	): Promise<any> {
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

		return this.broker.call(
			'v1.user.profile.selectProfile',
			{ empId: asEmployee },
			{
				meta: {
					...ctx.meta,
					userId: user._id,
				},
			},
		)
	},
}
