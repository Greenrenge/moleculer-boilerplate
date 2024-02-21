import axios from 'axios'
import type { ServiceBroker } from 'moleculer'
import { Errors } from 'moleculer'
import { MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'

interface GoogleProfile {
	iss: string
	azp: string
	aud: string
	sub: string
	email: string
	email_verified: string
	at_hash: string
	name: string
	picture: string
	given_name: string
	family_name: string
	locale: string
	iat: string
	exp: string
	alg: string
	kid: string
	typ: string
}

/**
 * Get Google Profile from given token
 */
const _verifyToken = async (token: string): Promise<GoogleProfile> => {
	const response = await axios({
		method: 'GET',
		url: 'https://oauth2.googleapis.com/tokeninfo',
		params: {
			id_token: token,
		},
	})
	return response.data
}

/**
 * Handle the Register/Login by Google Single Sign On
 */
async function registerByGoogle(
	this: MoleculerService,
	params: { [key: string]: any; accessToken?: string },
): Promise<{
	email: string
	firstName: string
	lastName: string
	image: string
	integration: { google: { userId: string; email: string; integratedAt: Date } }
}> {
	const { accessToken } = params || {}
	if (!accessToken) throw new ValidationError('INVALID_TOKEN')

	try {
		const profile = await _verifyToken(accessToken)
		return {
			email: profile.email,
			firstName: profile.given_name,
			lastName: profile.family_name,
			image: profile.picture,
			integration: {
				google: {
					userId: profile.sub,
					email: profile.email,
					integratedAt: new Date(),
				},
			},
		}
	} catch (error) {
		this.logger.error('Error when verifying google token', error)

		throw new ValidationError('UNAUTHORIZED_GOOGLE')
	}
}

export default registerByGoogle
