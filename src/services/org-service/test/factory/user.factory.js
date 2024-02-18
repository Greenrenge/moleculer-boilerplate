import { factory } from 'factory-girl'
import { ControlState } from '@/models/common/control-state'
import { Employee } from '@org/models/employee'

factory.define('user', Employee, {
  email: factory.seq('UserV2.email', (n) => `user2_${n}@commandsee.co`),
  _id: () => factory.chance('guid')(),
  firstName: factory.chance('first'),
  lastName: factory.chance('last'),
  nickName: factory.chance('last'),
  gender: factory.chance('pickone', ['M', 'F']),
  phoneNumber: factory.chance('string', {
    length: 10,
    pool: '1234567890',
  }),
  dateOfBirth: factory.chance('birthday', { string: true, american: false }),
  timeOfBirth: () =>
    `${factory.chance('hour', {
      twentyfour: true,
    })()}:${factory.chance('minute')()}`,
  language: factory.chance('pickone', ['en', 'th', 'ch']),
  timezone: 'Asia/Bangkok',
})
