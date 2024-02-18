import { factory } from 'factory-girl'
import { JobPosition } from '@org/models/job-position'

factory.define('jobPosition', JobPosition, {
  name: factory.chance('name'),
  level: 0,
  orgId: factory.chance('string'),
})
