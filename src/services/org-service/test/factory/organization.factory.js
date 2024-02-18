import { factory } from 'factory-girl'
import { Organization } from '@org/models/organization'

factory.define('organization', Organization, {
  _id: factory.chance('string'),
  name: factory.chance('name'),
})
