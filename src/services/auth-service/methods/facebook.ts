import crypto from 'crypto'
import axios from 'axios'
import type { ServiceBroker } from 'moleculer'
import { MoleculerService } from '@/common-types'
import config from '@/config'
import { ValidationError } from '@/constants/errors'

interface FacebookProfile {
	id: string
	email: string
	first_name: string
	last_name: string
	picture: {
		data: {
			height: number
			is_silhouette: boolean
			url: string
			width: number
		}
	}
}

const { facebook } = config.sso

/**
 * Get Facebook Profile from given token
 * @param {string} token
 * @returns {object} profile {id,email,first_name,last_name}
 */
const _verifyToken = async (token: string): Promise<FacebookProfile> => {
	const appSecretProof = crypto
		.createHmac('sha256', facebook.clientSecret)
		.update(token)
		.digest('hex')
	const response = await axios({
		method: 'GET',
		url: `https://graph.facebook.com/${facebook.apiVersion}/me`,
		params: {
			fields: 'id,email,first_name,last_name,picture.width(100).height(100)',
			access_token: token,
			appsecret_proof: appSecretProof,
		},
	})
	return response.data
}

/**
 * Handle the Register/Login by Facebook Single Sign On
 * @param {object} params
 * @param {string} params.accessToken
 */
async function registerByFacebook(
	this: MoleculerService,
	params: { [key: string]: any; accessToken?: string },
): Promise<{
	email: string
	firstName: string
	lastName: string
	image: string
	integration: { facebook: { userId: string; email: string; integratedAt: Date } }
}> {
	const { accessToken } = params || {}
	if (!accessToken) throw new ValidationError('INVALID_TOKEN')

	try {
		const profile = await _verifyToken(accessToken)
		return {
			email: profile.email,
			firstName: profile.first_name,
			lastName: profile.last_name,
			image: profile.picture.data.url,
			integration: {
				facebook: {
					userId: profile.id,
					email: profile.email,
					integratedAt: new Date(),
				},
			},
		}
	} catch (error) {
		this.logger.error('Error when verifying facebook token', error)
		throw new ValidationError('INVALID_TOKEN')
	}
}

export default registerByFacebook
