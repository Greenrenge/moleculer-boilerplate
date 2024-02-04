import type { TransactionOptions, WithTransactionCallback } from 'mongodb'
import mongoose from 'mongoose'
import logger from '@/utils/logger'

const transaction = async <T>(fn: WithTransactionCallback<T>, options: TransactionOptions) => {
	const session = await mongoose.startSession({
		defaultTransactionOptions: {
			readPreference: 'primary',
			readConcern: { level: 'local' },
			writeConcern: { w: 'majority' },
		},
	})

	try {
		return await new Promise((resolve, reject) => {
			let result: T | void

			session
				.withTransaction<T>(
					(_session) =>
						fn(_session).then((res) => {
							result = res
							return res
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

export default transaction
