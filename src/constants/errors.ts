/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Errors } from 'moleculer'
import { ObjectValues } from '@/common-types'

// type ReadonlyError = Readonly<{
// 	[K in (typeof keys)[number]]: Readonly<{
// 		CODE: ErrorCode
// 		MESSAGE: ErrorMessage
// 	}>
// }>

export const ERRORS = {
	FILE_NOT_FOUND: {
		CODE: 'file_not_found',
		MESSAGE: 'File not found',
	},
} as const

export const USER_ERRORS = {
	JOB_NOT_FOUND: {
		CODE: 'job_not_found',
		MESSAGE: 'Job not found',
	},
	USER_EXISTS: {
		CODE: 'user_exists',
		MESSAGE: 'User already exists',
	},
	USER_NOT_EXIST: {
		CODE: 'user_not_exist',
		MESSAGE: 'User does not exist',
	},
	USER_NOT_FOUND: {
		CODE: 'user_not_found',
		MESSAGE: 'User not found',
	},
	USER_INCORRECT_CREDENTIALS: {
		CODE: 'user_incorrect_credentials',
		MESSAGE: 'Incorrect email or password',
	},
	INVALID_TOKEN: {
		CODE: 'invalid_token',
		MESSAGE: 'Invalid token',
	},
	INVALID_TOKEN_EXPIRED: {
		CODE: 'invalid_token_expired',
		MESSAGE: 'Invalid token expired',
	},
	INVALID_VERIFICATION_CODE: {
		CODE: 'invalid_verification_code',
		MESSAGE: 'Invalid verification code',
	},
	VERIFICATION_CODE_EXPIRED: {
		CODE: 'verification_code_expired',
		MESSAGE: 'Verification code expired',
	},
	UNAUTHORIZED_FACEBOOK: {
		CODE: 'unauthorized_facebook',
		MESSAGE: 'Invalid Facebook token',
	},
	UNAUTHORIZED_GOOGLE: {
		CODE: 'unauthorized_google',
		MESSAGE: 'Invalid Google token',
	},
	UNAUTHORIZED_LINE: {
		CODE: 'unauthorized_line',
		MESSAGE: 'Invalid Line token',
	},
	UNAUTHORIZED_APPLE: {
		CODE: 'unauthorized_apple',
		MESSAGE: 'Invalid Apple token',
	},
	SOCIAL_ALREADY_EXISTS: {
		CODE: 'social_already_exists',
		MESSAGE: 'Social already connected',
	},
} as const

type ErrorKey = keyof typeof USER_ERRORS
type ErrorValue = ObjectValues<typeof USER_ERRORS>

// const keys = Object.keys(ERRORS) as (keyof typeof ERRORS)[]

export class ValidationError extends Errors.ValidationError {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(key: ErrorKey, data?: any) {
		const msg = USER_ERRORS[key]?.MESSAGE
		const code = USER_ERRORS[key]?.CODE

		super(msg || 'Unknown Error', code, data)
	}
}

export class ServiceValidationError extends Errors.ValidationError {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	constructor(key: keyof typeof ERRORS, data?: any) {
		const msg = ERRORS[key]?.MESSAGE
		const code = ERRORS[key]?.CODE

		super(msg || 'Unknown Error', code, data)
	}
}
