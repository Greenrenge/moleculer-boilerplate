import fs from 'fs'
import path from 'path'
import type Moleculer from 'moleculer'
import { TracerOptions } from 'moleculer'
import type { ConnectOptions } from 'mongoose'
import { MongoDBSupportedMemoryCacher } from '@pkg/moleculer-components/cachers/index.js'

export type AppConfig = {
	mongodb: {
		host: string
		user: string
		password: string
		replicaSet: string
		port: number
		database: string
		databaseAgenda: string
		options: ConnectOptions
	}
	moleculer: {
		logLevel?: Moleculer.LogLevelConfig | Moleculer.LogLevels
		namespace: string
		transporter: string
		requestTimeout?: number
		apiPort: number
		adminApiPort: number
		cacher: Moleculer.Cacher
	}
	jwt: {
		jwks: any
		expiresIn: string
		issuer: string
		privateJwks: any
		signingKey: any
		audience: string
	}
	sso: {
		facebook: {
			clientId: string
			clientSecret: string
			apiVersion: string
		}
		line: {
			channelId: string
			channelSecret: string
		}
	}
	s3: {
		accessKeyId: string
		secretAccessKey: string
		bucketName: string
		signatureVersion: string
		region: string
	}
	cdn: {
		url: string
	}
}
const privateJwks = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../private-jwks.json'), 'utf8'),
)
export default {
	mongodb: {
		host: process.env.MONGO_HOST || 'localhost:27021,localhost:27022,localhost:27023',
		user: process.env.MONGO_USER || 'root',
		password: process.env.MONGO_PASSWORD || 'toor',
		replicaSet: process.env.MONGO_REPLICASET || 'rs0',
		port: process.env.MONGO_PORT || 27024,
		database: 'application',
		databaseAgenda: 'agenda',
		options: {},
	},
	moleculer: {
		logLevel: process.env.LOG_LEVEL || 'debug',
		namespace: process.env.SERVICE_NAMESPACE || 'development',
		transporter: process.env.TRANSPORTER || 'nats://localhost:4222',
		requestTimeout: 10000,
		apiPort: process.env.API_PORT || 3000,
		adminApiPort: process.env.ADMIN_API_PORT || 3001,
		cacher: new MongoDBSupportedMemoryCacher({
			maxParamsLength: 80,
			ttl: 5 * 60,
		}),
	},
	jwt: {
		jwks: JSON.parse(fs.readFileSync(path.join(__dirname, '../jwks.json'), 'utf8')),
		privateJwks,
		signingKey: privateJwks?.keys?.find(
			({ use, kty }: { use: string; kty: string }) => use === 'sig' && kty === 'RSA',
		),
		expiresIn: process.env.JWT_EXPIRES_IN || '1d',
		issuer: process.env.JWT_ISSUER || 'http://localhost:3000',
		audience: process.env.JWT_AUDIENCE || 'http://localhost:3000',
	},
	sso: {
		facebook: {
			clientId: process.env.FACEBOOK_APP_ID || '1275990892785884',
			clientSecret: process.env.FACEBOOK_APP_SECRET || '9316d3fc6609ffac84de84324e18954e',
			apiVersion: process.env.FACEBOOK_API_VERSION || 'v7.0',
		},
		line: {
			channelId: process.env.LINE_CHANNEL_ID || '1655636944',
			channelSecret: process.env.LINE_CHANNEL_SECRET || '662cab8033bec433ac361193c4a2cb02',
		},
	},
	s3: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID || 'AKIAWAZRORFY6ZMZTO6Z',
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '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',
		bucketName: process.env.S3_BUCKET_NAME || 'commandsee-storage-dev',
		signatureVersion: process.env.S3_VERSION || 'v4',
		region: process.env.S3_REGION || 'ap-southeast-1',
	},
	cdn: {
		url: process.env.CDN_DOMAIN_URL || 'https://dnjtv5hp5gixy.cloudfront.net',
	},
} as AppConfig
