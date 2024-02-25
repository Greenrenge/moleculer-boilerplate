import TestServiceBroker from '@test/service-broker'
import { expect } from 'chai'
import type { Context } from 'moleculer'

describe('Test "BoilerplateService"', () => {
	// Create a service broker
	const broker = TestServiceBroker({ logger: false })
	// Create the actual service
	const service = broker.createService({
		name: 'boilerplate',
		actions: {
			sayHello(ctx: Context<{ name: string }>) {
				return `Hello ${ctx.params.name}`
			},
		},
	})

	// Start the broker. It will also init the service
	before(() => broker.start())
	// Gracefully stop the broker after all tests
	after(() => broker.stop())

	test('should return with "Hello John', async () => {
		const result = await broker.call('boilerplate.sayHello', { name: 'John' })
		expect(result).to.be.eq('Hello John')
	})
})
