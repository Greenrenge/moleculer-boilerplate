import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let replSet

before(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 3, storageEngine: 'wiredTiger' },
  })
  const uri = replSet.getUri()
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  const files = fs.readdirSync(path.join(__dirname, './factory/'))
  await Promise.all(files.map((f) => import(path.join(__dirname, './factory/', f))))
})

after(async () => {
  await mongoose.disconnect()
  await replSet.stop()
})
