export default {
  mongodb: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.PORT || 27017,
    database: 'boilerplate',
    options: {
      useUnifiedTopology: false,
    },
  },
}
