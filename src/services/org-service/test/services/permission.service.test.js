import { expect } from 'chai'
import { factory } from 'factory-girl'
import TestServiceBroker from '@/test/service-broker'
import { Permission } from '@org/models/permission'
import PermissionService from '@/services/org-service/services/permission/permission.service'

describe('#PermissionService', () => {
	const broker = new TestServiceBroker({ logger: false, cacher: 'memory' })
	const service = broker.createService(PermissionService)

	before(() => broker.start())
	after(() => broker.stop())
	context('#Permission', () => {
		context('.getByRoleId', () => {
			test('should return the permission that is fetch from the roleId', async () => {
				const org = await factory.create('organization')
				const permission = await Permission.create({
					_id: Permission.getId('create', 'user'),
					action: 'create',
					subject: 'user',
				})

				const role = await factory.create('role', {
					org: org._id,
					permissions: [
						{
							_id: permission._id,
							inheritance: true,
						},
					],
				})
				const emp = await factory.create('employee', {
					orgId: org._id,
					roleId: role._id,
				})

				const res = await broker.call(
					'v1.permission.getByRoleId',
					{ id: role._id },
					{
						meta: { empId: emp._id },
					},
				)
				expect(res).to.deep.equal([{ ...permission.toJSON(), inheritance: true }])
			})
		})
	})
})
