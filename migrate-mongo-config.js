import config from './src/config.js'

const { host, port, user, password, replicaSet, database } = config.mongodb

const mongoUri = replicaSet
  ? `mongodb://${user}:${password}@${host}/${database}?replicaSet=${replicaSet}`
  : `mongodb://${host}:${port}/${database}`

const migrationConfig = {
  mongodb: {
    url: mongoUri,
    databaseName: database,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  migrationsDir: 'migrations',
  changelogCollectionName: 'migrations',
  migrationFileExtension: '.js',
}

export default migrationConfig
