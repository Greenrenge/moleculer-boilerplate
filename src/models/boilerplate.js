import mongoose from 'mongoose'
import { schemaOption } from './common/index.js'
import mongoosePaginate from './mongoose-paginate-v2.js'

const boilerplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  schemaOption,
)

boilerplateSchema.plugin(mongoosePaginate)

boilerplateSchema.index({
  name: 'text',
})

export const Boilerplate = mongoose.model('Boilerplate', boilerplateSchema)
