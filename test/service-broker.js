import { ServiceBroker } from 'moleculer'
import { MongoDBSupportedMemoryCacher } from '@pkg/moleculer-components/cachers'

export default function TestServiceBroker(opt) {
  return new ServiceBroker({
    ...opt,
    logger: false,
    //     logLevel: 'debug',
    cacher: new MongoDBSupportedMemoryCacher(),
  })
}
