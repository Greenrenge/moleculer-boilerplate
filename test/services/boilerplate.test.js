// import { expect } from 'chai'
// import ServiceBroker from '@test/service-broker'
// import BoilerplateService from '../../src/services/boilerplate.js'

// describe('Test "BoilerplateService"', () => {
//   // Create a service broker
//   const broker = new ServiceBroker({ logger: false })
//   // Create the actual service
//   const service = broker.createService(BoilerplateService)

//   // Start the broker. It will also init the service
//   before(() => broker.start())
//   // Gracefully stop the broker after all tests
//   after(() => broker.stop())

//   context('Test "boilerplate.sayHello" action', () => {
//     it('should return "Hello World"', async () => {
//       const result = await broker.call('boilerplate.sayHello', {
//         name: 'World',
//       })
//       expect(result).to.equal('Hello World')
//     })
//   })

//   context('Test "BoilerplateService" private methods', () => {
//     it('should return "Greeting" user', () => {
//       const result = service.greeting('user')
//       expect(result).to.equal('Greeting user')
//     })
//   })
// })
