import axios from 'axios'
import type { ServiceBroker } from 'moleculer'
import config from '@/config'
import { ValidationError } from '@/constants/errors'

const { line } = config.sso

interface LineProfile {
	iss: string
	sub: string
	aud: string
	exp: number
	iat: number
	nonce: string
	amr: string[]
	name: string
	picture: string
	email: string
}

/**
 * Get Line Profile from given id token
 * @param {string} token
 * @returns {object} profile
 */
const _verifyToken = async (token: string): Promise<LineProfile> => {
	const params = new URLSearchParams()
	params.append('id_token', token)
	params.append('client_id', line.channelId)

	const response = await axios({
		method: 'POST',
		url: 'https://api.line.me/oauth2/v2.1/verify',
		params,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	})

	return response.data
}

const _parseName = (name: string): { firstName: string; lastName: string } => {
	const [firstName, lastName] = name.split(' ')
	return {
		firstName: firstName || '',
		lastName: lastName || '',
	}
}

/**
 * Handle the Register/Login by Line Single Sign On
 * @param {object} params
 * @param {string} params.accessToken
 */
async function registerByLine(
	this: ServiceBroker,
	params: { [key: string]: any; accessToken?: string },
): Promise<{
	email: string
	firstName: string
	lastName: string
	image: string
	integration: { line: { userId: string; email: string; integratedAt: Date } }
}> {
	const { accessToken } = params || {}
	if (!accessToken) throw new ValidationError('INVALID_TOKEN')

	try {
		const profile = await _verifyToken(accessToken)
		const name = _parseName(profile.name || '')

		return {
			email: profile.email,
			firstName: name.firstName,
			lastName: name.lastName,
			image: profile.picture,
			integration: {
				line: {
					userId: profile.sub,
					email: profile.email,
					integratedAt: new Date(),
				},
			},
		}
	} catch (error) {
		this.logger.error('Error when verifying line token', error)
		throw new ValidationError('UNAUTHORIZED_LINE')
	}
}

export default registerByLine
