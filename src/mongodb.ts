// @ts-ignore
import upsertMany from '@meanie/mongoose-upsert-many'
import mongoose from 'mongoose'
import config from '@/config'
import mongoosePaginate from '@pkg/mongoose-paginate-v2'
import { mongooseDbReady } from '@utils/gracefully'
import logger from '@utils/logger'

// loads plugins

mongoose.plugin(mongoosePaginate)
mongoose.plugin(upsertMany)

const { host, port, user, password, replicaSet, database, options } = config.mongodb

export const mongoUri = replicaSet
	? `mongodb://${user ? `${user}:${password}@` : ''}${host}/${database}?replicaSet=${replicaSet}`
	: `mongodb://${host}:${port}/${database}`

logger.info('Connecting to ', mongoUri, 'with options', JSON.stringify(options))

mongoose
	.connect(mongoUri, options)
	.then(() => {
		mongooseDbReady()
		logger.info('MongoDB: connection success')
	})
	.catch((err) => {
		mongooseDbReady.toNotReady()
		logger.error('MongoDB: connection error', err)
	})

const db = mongoose.connection

db.on('error', (err) => {
	logger.error('MongoDB: connection error', err)
	process.exit(1)
})

export default db
