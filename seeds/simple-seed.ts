import '../src/mongodb'

// import { Boilerplate } from '../src/models/boilerplate'
import logger from '../src/utils/logger'

async function run() {
	// TODO write your seed here.
	// Example:
	// Remove old data from db
	try {
		// const res = await Boilerplate.deleteMany({})
		// logger.info('Seed: Deleted', res.deletedCount)
	} catch (error) {
		logger.error('Seed: Error when delete data', error)
		process.exit(1)
	}
	// Add new data to db
	try {
		// const res = await Boilerplate.insertMany([{ name: 'test' }])
		// logger.info('Seed: Inserted', res.length || 0)
	} catch (error) {
		logger.error('Seed: Error when insert data', error)
		process.exit(1)
	}
	logger.info('Seed: Done.')
	process.exit()
}

run()
