import crypto, { randomBytes } from 'crypto'
import * as jose from 'jose'
import type { Types } from 'mongoose'
import type { IToken } from 'v1.auth.issueUserAccessToken'
import config from '@/config'
import { ValidationError } from '@/constants/errors'

const JWKS = jose.createLocalJWKSet(config.jwt.jwks)
/**
 * Generate a JWT token from user entity.
 */
const alg = 'RS256'
let privatekey: any

function loadPrivateKey() {
	return jose.importJWK(config.jwt.signingKey, alg)
}

const generateToken = async (payload: any): Promise<string> => {
	privatekey = privatekey || (await loadPrivateKey())
	return new jose.SignJWT({
		...payload,
	})
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setIssuer(config.jwt.issuer)
		.setAudience(config.jwt.audience)
		.setExpirationTime(config.jwt.expiresIn)
		.setSubject(payload?._id)
		.sign(privatekey)
}

export const generateRandomToken = (): string => {
	const buffer = randomBytes(256)
	return crypto.createHash('sha1').update(buffer).digest('hex')
}

/**
 * Verify a JWT token and return the decoded payload
 */
export const verifyJWT = async (token: string): Promise<any> => {
	try {
		const { key, payload, protectedHeader } = await jose.jwtVerify(token, JWKS, {
			issuer: config.jwt.issuer,
			audience: config.jwt.audience,
		})
		return payload
	} catch (error) {
		throw new ValidationError('INVALID_TOKEN')
	}
}

export const issueUserAccessToken = async (
	user: {
		[key: string]: any
		_id: string | Types.ObjectId
		email: string
	},
	otherClaims?: Record<string, any>,
): Promise<IToken> => {
	const accessToken = await generateToken({
		_id: user._id,
		email: user.email,
		...otherClaims,
	})
	return {
		access_token: accessToken,
		token_type: 'Bearer',
	}
}
