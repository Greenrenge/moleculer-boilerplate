import jwt from 'jsonwebtoken'
import type { ServiceBroker } from 'moleculer'
import { MoleculerService } from '@/common-types'
import { ValidationError } from '@/constants/errors'

/**
 * Get Apple Profile from given id token
 * {
  "iss": "https://appleid.apple.com",
  "aud": "com.onlineordering.client",
  "exp": 1569914636,
  "iat": 1569914036,
  "sub": "000508.4301206fa59648d1850a35fbf7d3a102.2336",
  "at_hash": "3FT9oS2QSqdpVU_psd-2BA",
  "auth_time": 1569914034
  }
 */
const _verifyToken = (token: string) => {
	const decoded = jwt.decode(token)
	return decoded
}

/**
 * Handle the Register/Login by Apple Single Sign On
 */
export default function registerByApple(
	this: MoleculerService,
	params: { [key: string]: any; accessToken?: string },
): {
	integration: { apple: { userId: string; integratedAt: Date } }
} {
	const err = new ValidationError('INVALID_TOKEN')

	const { accessToken } = params

	if (!accessToken) {
		throw err
	}

	try {
		const profile = _verifyToken(accessToken)
		if (!profile || !profile.sub) {
			throw err
		}
		const userId = typeof profile.sub === 'function' ? profile.sub() : profile.sub
		return {
			integration: {
				apple: {
					userId,
					integratedAt: new Date(),
				},
			},
		}
	} catch (error) {
		this.logger.error(error)

		throw new ValidationError('UNAUTHORIZED_APPLE')
	}
}
