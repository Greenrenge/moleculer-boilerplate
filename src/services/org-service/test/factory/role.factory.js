import { factory } from 'factory-girl'
import { Role } from '@org/models/role'

factory.define('role', Role, {
  name: factory.chance('string'),
  orgId: factory.chance('string'),
  permissions: [],
})
