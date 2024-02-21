import bcrypt from 'bcrypt'
import type { ServiceBroker } from 'moleculer'
import { Errors } from 'moleculer'
import type { ChangePasswordParams, ChangePasswordReturn } from 'v1.auth.changePassword'
import type { AppContextMeta, MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { UserLogin } from '@/services/auth-service/models/user-login'

export default {
	params: {
		oldPassword: { type: 'string', min: 8 },
		newPassword: { type: 'string', min: 8 },
	},
	async handler(
		this: MoleculerService,
		ctx: AppContextMeta<ChangePasswordParams>,
	): Promise<ChangePasswordReturn> {
		this.logger.info(`ACTION: ${ctx.action?.name}`, ctx)

		const { userId } = ctx.meta
		const { oldPassword, newPassword } = ctx.params

		try {
			const user = await UserLogin.findById(userId)

			if (!user) {
				throw new ValidationError('USER_NOT_FOUND')
			}

			const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password)

			if (!isOldPasswordCorrect) {
				throw new ValidationError('USER_INCORRECT_CREDENTIALS')
			}

			user.password = newPassword
			const savedUser = await user.save()

			// Returning the user data might expose sensitive information.
			// If not needed, consider returning a more generic success message.
			return {
				message: 'success',
			}
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error
			} else {
				throw new Errors.MoleculerError(
					'An unexpected error occurred.',
					500,
					'UNEXPECTED_ERROR',
					error,
				)
			}
		}
	},
}
