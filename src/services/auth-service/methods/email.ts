import type { ServiceBroker } from 'moleculer'
import { MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'

interface RegisterParams {
	[key: string]: any
	email?: string
	password?: string
}

export default function registerByEmail(
	this: MoleculerService,
	params: RegisterParams,
): {
	email: string
	password: string
} {
	const { email: rawEmail, password } = params
	if (!password || !rawEmail) {
		throw new ValidationError('USER_INCORRECT_CREDENTIALS')
	}

	const email = rawEmail.toLowerCase()

	const entity = {
		email,
		password,
	}

	return entity
}
