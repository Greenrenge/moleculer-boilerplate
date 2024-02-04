import '@/mongodb'

import type { ServiceSchema } from 'moleculer'
import rootBroker, { createBroker } from '@/customBroker'
import helloWorldService from '@/services/helloWorld.service'

// Register Service
const allBrokers = [rootBroker]
const rootBrokerServices = [helloWorldService]

const allServices: ServiceSchema[] = []

for (const srv of allServices) {
	const { brokerStandalone, ...services } = srv
	if (brokerStandalone) {
		const { services: brokerServices, ...brokerConfig } = brokerStandalone
		const newBroker = createBroker(brokerConfig)
		allBrokers.push(newBroker)

		for (const s of brokerServices) {
			// eslint-disable-next-line no-console
			console.log(`DedicatedBroker :: Register service ${s.name} to broker ${newBroker.nodeID}`)
			newBroker.createService(s)
		}

		for (const service of Object.values(services)) {
			rootBrokerServices.push(service)
		}
	} else {
		for (const service of Object.values(services)) {
			rootBrokerServices.push(service)
		}
	}
}

for (const service of rootBrokerServices) {
	console.log(`Register service ${service.name} to root broker`)
	rootBroker.createService(service)
}
for (const broker of allBrokers) {
	broker.start().then(() => process.env.REPL && broker.repl())
}

export default allBrokers
