import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { accessibleRecordsPlugin } from '@casl/mongoose'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import mongoosePaginate from '@pkg/mongoose-paginate-v2/index.js'

// loads plugins
mongoose.plugin(accessibleRecordsPlugin)
mongoose.plugin(mongoosePaginate)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
let replSet
const SERVICES = [
  'user-service',
  'organization-service',
  'activity-service',
  'metadata-service',
  'gateway',
  'gateway-admin',
  'notification-service',
  'video-service',
  'coaching-service',
  'survey-service',
  'group-service',
  'cms',
]

before(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  })
  const uri = replSet.getUri()
  await mongoose.connect(uri)
  // eslint-disable-next-line no-console
  console.log('connected to mongo memory server')
  const files = []

  const folders = ['./factory/', ...SERVICES.map((s) => `../src/${s}/test/factory`)]
  for (const folder of folders) {
    try {
      files.push(...fs.readdirSync(path.join(__dirname, folder)).map((f) => [folder, f]))
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('folder not found', folder)
    }
  }
  await Promise.all(files.map(([folder, f]) => import(path.join(__dirname, folder, f))))
})

after(async () => {
  await mongoose.disconnect()
  await replSet.stop()
})
