import mongoose from 'mongoose'
import config from './config.js'
import { mongooseDbReady } from './utils/gracefully.js'
import logger from './utils/logger.js'

const { host, port, user, password, replicaSet, database, options } = config.mongodb

export const mongoUri = replicaSet
  ? `mongodb://${user}:${password}@${host}/${database}?replicaSet=${replicaSet}`
  : `mongodb://${host}:${port}/${database}`

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
