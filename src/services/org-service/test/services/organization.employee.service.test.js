import { expect } from 'chai'
import { factory } from 'factory-girl'
import sortBy from 'lodash/sortBy'
import { Employee } from '@org/models/employee'
import { Friendship, FRIENDSHIP_STATUS } from '@org/models/friendship'
import OrganizationService from '@/services/org-service/services/organization/organization.service'
import TestServiceBroker from '@/test/service-broker'

before(async () => {
	await Employee.init()
})

describe('# organization.employee.*', () => {
	const broker = new TestServiceBroker({ logger: false, cacher: 'memory' })
	const service = broker.createService(OrganizationService)
	before(() => broker.start())
	after(() => broker.stop())
	// it('should able to create a new concurrency organization"', async () => {
	//   const lastBefore = (await ControlState.findById('orgId'))?.last ?? 0
	//   const [org1, org2, org3] = await Promise.all(
	//     ['orgA', 'orgB', 'orgC'].map((name) =>
	//       broker.call(`${serviceName}.admin.createOne`, {
	//         name,
	//       }),
	//     ),
	//   )
	//   const lastAfter = (await ControlState.findById('orgId'))?.last ?? 0
	//   expect(org1.name).to.equal('orgA')
	//   expect(org2.name).to.equal('orgB')
	//   expect(org3.name).to.equal('orgC')
	//   expect(lastAfter).to.greaterThan(lastBefore)
	//   expect(lastAfter - lastBefore).to.equal(3)
	// })
	context('# v1.organization.employee.connect.validate', () => {
		it('should return rejected if privateCode is dup', async () => {
			const emp = await factory.create('employee', {
				privateCode: '12234',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})

			expect(emp).to.have.property('id')
			await expect(
				factory.create('employee', {
					privateCode: '12234',
					privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
				}),
			).to.be.rejected
		})

		it('should return successful if privateCode is null', async () => {
			const emp = await factory.create('employee')
			const emp1 = await factory.create('employee')
			expect(emp).to.have.property('id')
			expect(emp1).to.have.property('id')
		})

		it('should rejected if privateCode is empty string', async () => {
			const emp = await factory.create('employee', {
				privateCode: '',
			})
			const emp1 = await factory.create('employee', {
				privateCode: '',
			})
			expect(emp).to.have.property('id')
			expect(emp1).to.have.property('id')
		})
	})

	context('# v1.organization.employee.connect.validate', () => {
		it('should return null if privateCode is incorrect', async () => {
			expect(
				await broker.call('v1.organization.employee.connect.validate', {
					privateCode: '11',
				}),
			).to.be.null
		})

		it('should return null if privateCode is empty', async () => {
			const emp = await factory.create('employee', {
				privateCode: '',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			await Employee.updateOne({ _id: emp._id }, { privateCode: '' })
			const updatedEmp = await Employee.findById(emp._id)
			expect(updatedEmp.privateCode).to.be.equals('')
			const res = await broker.call(
				'v1.organization.employee.connect.validate',
				{
					privateCode: '',
				},
				{
					meta: { userId: 'its_me' },
				},
			)
			expect(res).to.be.null
		})

		it('should employee privateCode is correct and not dup', async () => {
			const emp = await factory.create('employee', {
				privateCode: '121231212',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			const res = await broker.call(
				'v1.organization.employee.connect.validate',
				{
					privateCode: emp.privateCode,
				},
				{
					meta: { userId: 'its_me' },
				},
			)
			expect(res).to.have.property('id', emp._id)
			expect(res).to.have.property('connectedAt').to.be.undefined
		})
		it('should employee privateCode is correct and expiredCodeAt is not expired', async () => {
			const emp = await factory.create('employee', {
				privateCode: '12123121211',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			const res = await broker.call(
				'v1.organization.employee.connect.validate',
				{
					privateCode: emp.privateCode,
				},
				{
					meta: { userId: 'its_me' },
				},
			)
			expect(res).to.have.property('id', emp._id)
			expect(res).to.have.property('connectedAt').to.be.undefined
		})

		it('should be null if employee privateCode is correct and expiredCodeAt is expired', async () => {
			const emp = await factory.create('employee', {
				email: 'test.12123121212',
				privateCode: '12123121212',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() - 1),
			})
			const res = await broker.call(
				'v1.organization.employee.connect.validate',
				{
					privateCode: emp.privateCode,
				},
				{
					meta: { userId: 'its_me' },
				},
			)
			expect(res).to.be.null
		})
	})

	context('# v1.organization.employee.connect', () => {
		it('should throw Error if privateCode is incorrect', async () => {
			await expect(
				broker.call('v1.organization.employee.connect', {
					privateCode: '11',
				}),
			).to.be.rejected
		})

		it('should reject if privateCode is empty', async () => {
			const emp = await factory.create('employee', {
				privateCode: '',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			await Employee.updateOne({ _id: emp._id }, { privateCode: '' })
			const updatedEmp = await Employee.findById(emp._id)
			expect(updatedEmp.privateCode).to.be.equals('')
			await expect(
				broker.call(
					'v1.organization.employee.connect',
					{
						privateCode: '',
					},
					{
						meta: { userId: 'its_me' },
					},
				),
			).to.be.rejected
		})

		it('should connect successfully if privateCode is correct and not dup', async () => {
			const emp = await factory.create('employee', {
				email: 'test.1212312123',
				privateCode: '1212312123',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			const res = await broker.call(
				'v1.organization.employee.connect',
				{
					privateCode: emp.privateCode,
				},
				{
					meta: { userId: 'its_me' },
				},
			)
			expect(res).to.have.property('userId', 'its_me')
			expect(res).to.have.property('connectedAt').not.to.be.undefined
			await expect(
				broker.call(
					'v1.organization.employee.connect',
					{
						privateCode: emp.privateCode,
					},
					{
						meta: { userId: 'its_me2' },
					},
				),
			).to.be.rejected
		})
		it('should connect successfully if privateCode is correct and expiredCodeAt is not Expired', async () => {
			const emp = await factory.create('employee', {
				email: 'test.1212312124',
				privateCode: '1212312124',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() + 3),
			})
			const res = await broker.call(
				'v1.organization.employee.connect',
				{
					privateCode: emp.privateCode,
				},
				{
					meta: { userId: 'its_me_yeah' },
				},
			)
			expect(res).to.have.property('userId', 'its_me_yeah')
			expect(res).to.have.property('connectedAt').not.to.be.undefined
		})

		it('should connect failed if privateCode is correct and expiredCodeAt is expired', async () => {
			const emp = await factory.create('employee', {
				email: 'test.1212312125',
				privateCode: '1212312125',
				privateCodeExpiredAt: new Date().setMonth(new Date().getMonth() - 1),
			})
			await expect(
				broker.call(
					'v1.organization.employee.connect',
					{
						privateCode: emp.privateCode,
					},
					{
						meta: { userId: 'its_me_yeah' },
					},
				),
			).to.be.rejected
		})
	})

	context('# v1.organization.employee.listProfile', () => {
		it('should return empty arr if not found profile', async () => {
			const res = await broker.call('v1.organization.employee.listProfile', {})
			expect(res).to.deep.equal([])
		})

		it('should return the profile that is active and connect by user', async () => {
			const userId = 'onlyActiveNa'
			await factory.createMany('employee', 2, {
				userId,
				active: true,
			})

			await factory.createMany('employee', 12, {
				userId,
				active: false,
			})
			await factory.createMany('employee', 12, {
				active: true,
			})

			const res = await broker.call(
				'v1.organization.employee.listProfile',
				{},
				{
					meta: { userId },
				},
			)
			expect(res).to.lengthOf(2)
		})
	})

	context('# v1.organization.employee.search', () => {
		it('should be able to search the employee', async () => {
			const me = await factory.create('employee', {
				firstName: 'seeja',
			})
			const found = await factory.create('employee', {
				firstName: 'seeraj',
				orgId: me.orgId,
			})
			const found2 = await factory.create('employee', {
				nickName: 'seeja',
				orgId: me.orgId,
			})
			const notfound = await factory.create('employee', {
				orgId: me.orgId,
			})
			const res = await broker.call(
				'v1.organization.employee.search',
				{ searchTerm: ' see ' },
				{
					meta: { empId: me._id, userId: me.userId },
				},
			)
			expect(res.items).lengthOf(2)
		})
	})

	context('# v1.organization.employee.suggestion', () => {
		it('should be able to find suggest employee who only connected to the org', async () => {
			const orgA = 'theOrgA'
			const orgB = 'theOrgB'

			const orgAEmps = await factory.createMany('employee', 23, {
				orgId: orgA,
				userId: 'any',
			})
			await factory.createMany('employee', 10, {
				orgId: orgA,
			})

			const orgBEmps = await factory.createMany('employee', 10, {
				orgId: orgB,
			})

			const [userA, userB, userC] = orgAEmps

			await factory.create('friendship', {
				_id: Friendship.getId(userA._id, userB._id),
				requesterId: userA._id,
				responderId: userB._id,
				friendshipStatus: FRIENDSHIP_STATUS.ACCEPTED,
			})
			await factory.create('friendship', {
				_id: Friendship.getId(userA._id, userC._id),
				requesterId: userA._id,
				responderId: userC._id,
				friendshipStatus: FRIENDSHIP_STATUS.ACCEPTED,
			})

			const res = await broker.call(
				'v1.organization.employee.suggestion',
				{},
				{
					meta: { empId: userA._id, userId: 'anyMockup', orgId: userA.orgId },
				},
			)

			expect(res).lengthOf(20)
			expect(res.map(({ empId }) => empId)).to.not.includes(userA._id)
			expect(res.map(({ empId }) => empId)).to.not.includes(userB._id)
			expect(res.map(({ empId }) => empId)).to.not.includes(userC._id)
		})
	})

	context('# v1.organization.employee.team', () => {
		context('.parent', () => {
			it('should find the employee that user`s  reportTo', async () => {
				const boss = await factory.create('employee', {
					orgId: 'commandsee',
				})
				const self = await factory.create('employee', {
					reportTo: boss._id,
					orgId: 'commandsee',
				})
				const bossRes = await broker.call(
					'v1.organization.employee.team.parent',
					{},
					{
						meta: { empId: self._id },
					},
				)

				expect(bossRes).to.deep.equal(await boss.toObject())
			})
		})

		context('.children', () => {
			it('should find the children employee', async () => {
				const self = await factory.create('employee', {
					orgId: 'commandsee',
				})
				const children = await factory.createMany('employee', 3, {
					reportTo: self._id,
					orgId: 'commandsee',
				})

				const childrenRes = await broker.call(
					'v1.organization.employee.team.children',
					{},
					{
						meta: { empId: self._id },
					},
				)
				const sorted = sortBy(childrenRes, '_id')
				const resSorted = sortBy(await Promise.all(children.map((c) => c.toObject())), '_id')
				expect(sorted).to.deep.equal(resSorted)
			})
		})

		context('.sharedParent', () => {
			it('should find the employee who has share the parent but not include self', async () => {
				const boss = await factory.create('employee', {
					orgId: 'commandsee',
				})

				const children = await factory.createMany('employee', 5, {
					reportTo: boss._id,
					orgId: 'commandsee',
				})
				const [self, ...rest] = children

				const emps = await broker.call(
					'v1.organization.employee.team.sharedParent',
					{},
					{
						meta: { empId: self._id },
					},
				)

				const res = await Promise.all(rest.map((c) => c.toObject()))

				expect(sortBy(emps, '_id')).to.deep.equal(sortBy(res, '_id'))
			})
		})
	})

	context('# v1.organization.employee.profile.update', () => {
		it('should throw an error if empId and userId is not found', async () => {
			await expect(
				broker.call('v1.organization.employee.profile.update', {
					email: 'not@dd.com',
				}),
			).to.be.rejected
		})
		it('should update employee profile successfully', async () => {
			const emp = await factory.create('employee', {
				userId: 'whatsupman',
				email: 'thiswillbeupdate@commandsee.co',
				firstName: 'abc',
				lastName: 'def',
			})
			const res = await broker.call(
				'v1.organization.employee.profile.update',
				{
					email: 'whatsupman@commandsee.co',
				},
				{
					meta: {
						empId: emp._id,
						userId: 'whatsupman',
					},
				},
			)
			expect(res).to.have.property('userId', 'whatsupman')
			expect(res).to.have.property('email', 'whatsupman@commandsee.co')
		})
	})

	context('# v1.organization.employee.list.dept', () => {
		it('should return employees by deptId', async () => {
			const department = await factory.create('department')
			await factory.createMany('employee', 3, [
				{ deptId: department.id },
				{ deptId: department.id },
				{ deptId: department.id },
			])

			const res = await broker.call('v1.organization.employee.list.dept', {
				deptId: department.id,
			})
			expect(res.length).to.equal(3)
		})
		it('should return jobs when sent group by is job', async () => {
			const jobPosition1 = await factory.create('jobPosition')
			const jobPosition2 = await factory.create('jobPosition')
			const department = await factory.create('department')
			const [emp1, emp2, emp3] = await factory.createMany('employee', 3, [
				{ deptId: department.id, jobId: jobPosition1.id },
				{ deptId: department.id, jobId: jobPosition1.id },
				{ deptId: department.id, jobId: jobPosition2.id },
			])

			const res = await broker.call('v1.organization.employee.list.dept', {
				deptId: department.id,
				groupBy: 'job',
			})

			expect(res.length).to.equal(2)
			const foundJob1 = res.find((r) => r._id.toString() === jobPosition1.id)
			expect(foundJob1).to.have.property('name', jobPosition1.name)

			const sortedRes = sortBy(
				foundJob1.empIds?.map((e) => e.toString()),
				(e) => e.toString(),
			)

			expect(sortedRes).to.deep.equals(sortBy([emp1.id, emp2.id], (e) => e.toString()))
			const foundJob2 = res.find((r) => r._id.toString() === jobPosition2.id)

			expect(foundJob2.empIds?.map((e) => e.toString())).to.deep.equals([emp3.id])
			expect(foundJob2._id.toString()).to.equal(jobPosition2.id)
		})
	})
})
