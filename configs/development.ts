import type { AppConfig } from '@configs/common'

export default {
	mongodb: {
		host: process.env.MONGO_HOST || '127.0.0.1:27021,127.0.0.1:27022,127.0.0.1:27023',
		port: process.env.PORT || 27024,
		user: 'application',
		password: 'password',
		replicaSet: 'rs0',
		database: 'application',
		databaseAgenda: 'application',
		options: {
			connectTimeoutMS: 60000,
			serverSelectionTimeoutMS: 60000,
		},
	},
} as AppConfig
