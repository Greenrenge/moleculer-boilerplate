import './mongodb.js'

import broker from './broker.js'
import BoilerplateService from './services/boilerplate.js'
import HelloService from './services/hello/index.js'

// Register Service
broker.createService(BoilerplateService)
broker.createService(HelloService)

broker.start().then(() => process.env.REPL && broker.repl())

export default broker
