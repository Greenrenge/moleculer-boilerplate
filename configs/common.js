import { MongoDBSupportedMemoryCacher } from '@pkg/moleculer-components/cachers/index.js'

export default {
  logLevel: process.env.LOG_LEVEL || 'debug',
  mongodb: {
    host: process.env.MONGO_HOST || 'localhost:27021,localhost:27022,localhost:27023',
    user: process.env.MONGO_USER || 'root',
    password: process.env.MONGO_PASSWORD || 'toor',
    replicaSet: process.env.MONGO_REPLICASET || 'rs0',
    port: process.env.MONGO_PORT || 27024,
    database: 'application',
    databaseAgenda: 'agenda',
  },
  moleculer: {
    namespace: process.env.SERVICE_NAMESPACE || 'development',
    transporter: process.env.TRANSPORTER || 'nats://localhost:4222',
    requestTimeout: 30000,
    apiPort: process.env.API_PORT || 3000,
    adminApiPort: process.env.ADMIN_API_PORT || 3001,
    cacher: new MongoDBSupportedMemoryCacher({
      maxParamsLength: 80,
      ttl: 5 * 60,
    }),
    // cacher: {
    //   type: 'Memory',
    //   options: {
    //     maxParamsLength: 80,
    //     ttl: 5 * 60,
    //   },
    // },
  },
}
