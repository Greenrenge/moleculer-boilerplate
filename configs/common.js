export default {
  logLevel: process.env.LOG_LEVEL || 'debug',
  mongodb: {
    host: process.env.MONGO_HOST || 'localhost',
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || '',
    replicaSet: process.env.MONGO_REPLICASET || '',
    port: process.env.MONGO_PORT || 27017,
    database: 'boilerplate',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      directConnection: true,
    },
  },
  moleculer: {
    namespace: process.env.SERVICE_NAMESPACE || 'development',
    transporter: process.env.TRANSPORTER || 'nats://localhost:4222',
    requestTimeout: 30000,
    tracing: {
      enabled: process.env.TRACING_ENABLED === 'true',
      event: true,
      exporter: [
        {
          type: 'Jaeger',
          options: {
            host: process.env.TRACING_EXPORTER_JAEGER_HOST || '127.0.0.1',
            port: 6832,
            defaultTags: null,
          },
        },
      ],
    },
    cacher: {
      type: 'Memory',
      options: {
        maxParamsLength: 80,
        ttl: 5 * 60,
      },
    },
  },
}
