import { factory } from 'factory-girl'
import { Types } from 'mongoose'
import { Employee } from '@org/models/employee'

factory.define('employee', Employee, {
  _id: factory.chance('string'),
  firstName: factory.chance('name'),
  lastName: factory.chance('name'),
  nickName: factory.chance('name'),
  orgId: factory.chance('string'),
  deptId: () => new Types.ObjectId(),
  jobId: () => new Types.ObjectId(),
})
