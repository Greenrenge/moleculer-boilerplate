import mongoose from 'mongoose'
import logger from '@/utils/logger.js'

export default async (fn, options) => {
  const session = await mongoose.startSession({
    defaultTransactionOptions: {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' },
    },
  })

  try {
    return await new Promise((resolve, reject) => {
      let result

      session
        .withTransaction(
          () =>
            fn(session).then((res) => {
              result = res
            }),
          options,
        )
        .then(() => resolve(result))
        .catch((error) => {
          logger.error('Transaction failed:', error)
          reject(error)
        })
    })
  } finally {
    session.endSession()
  }
}
