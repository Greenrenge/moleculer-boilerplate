import type { BrokerOptions } from 'moleculer'
import { ServiceBroker } from 'moleculer'
import { MongoDBSupportedMemoryCacher } from '@pkg/moleculer-components/cachers'

export default function TestServiceBroker(opt: BrokerOptions = {}) {
	return new ServiceBroker({
		...opt,
		logger: false,
		//     logLevel: 'debug',
		cacher: new MongoDBSupportedMemoryCacher(),
	})
}
