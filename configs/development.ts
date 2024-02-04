import type { AppConfig } from '@configs/common'

export default {
	mongodb: {
		host: process.env.MONGO_HOST || 'localhost:27021,localhost:27022,localhost:27023',
		port: process.env.PORT || 27024,
		user: 'application',
		password: 'password',
		replicaSet: 'rs0',
		database: 'application',
		databaseAgenda: 'application',
		options: {},
	},
} as AppConfig
