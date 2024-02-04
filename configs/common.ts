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
}
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
} as AppConfig
