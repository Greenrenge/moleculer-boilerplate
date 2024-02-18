/* eslint-disable jest/no-identical-title */
import { expect } from 'chai'
import { factory } from 'factory-girl'
import TestServiceBroker from '@/test/service-broker'
import OrganizationService from '@/services/org-service/services/organization/organization.service'

describe('# Information in root level', () => {
	const broker = new TestServiceBroker({ logger: false, cacher: 'memory' })
	const service = broker.createService(OrganizationService)

	before(() => broker.start())
	after(() => broker.stop())

	context('# v1.organization.employee.one', () => {
		test('should fetch if it is the user', async () => {
			const userId = 'rootLevel1'

			const emp = await factory.create('employee', {
				userId,
			})
			const res = await broker.call(
				'v1.organization.employee.one',
				{ id: emp._id },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res).to.deep.equal(emp.toObject())
		})

		test('should fetch if it the same org', async () => {
			const userId = 'rootLevel2'

			const emp = await factory.create('employee', {
				userId,
			})
			const empOther = await factory.create('employee', {
				orgId: emp.orgId,
			})

			const res = await broker.call(
				'v1.organization.employee.one',
				{ id: empOther._id },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res).to.deep.equal(await empOther.toObject())
		})

		test('should not fetch if not same org', async () => {
			const userId = 'rootLevel3'

			const emp = await factory.create('employee', {
				userId,
			})
			const empOther = await factory.create('employee')

			const res = await broker.call(
				'v1.organization.employee.one',
				{ id: empOther._id },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res).to.deep.equal(undefined)
		})
	})

	context('# v1.organization.employee.list', () => {
		test('should fetch if it the same org', async () => {
			const userId = 'rootLevel4'

			const emp = await factory.create('employee', {
				userId,
			})

			const others = await factory.createMany('employee', 11, {
				orgId: emp.orgId,
			})
			const res = await broker.call(
				'v1.organization.employee.list',
				{ limit: 3 },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res).lengthOf(3)
			const res2 = await broker.call(
				'v1.organization.employee.list',
				{ limit: 12, skip: 3 },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res2).lengthOf(9) // 12-3
		})

		test('should not fetch if it the difference org', async () => {
			const userId = 'rootLevel5'

			const emp = await factory.create('employee', {
				userId,
			})

			const others = await factory.createMany('employee', 19, {
				orgId: emp.orgId,
			})
			const othersDiffOrg = await factory.createMany('employee', 20, {})

			const res = await broker.call(
				'v1.organization.employee.list',
				{ limit: 8 },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res).lengthOf(8)
			const res2 = await broker.call(
				'v1.organization.employee.list',
				{ limit: 100, skip: 8 },
				{
					meta: {
						userId,
						empId: emp._id,
					},
				},
			)
			expect(res2).lengthOf(12)
		})
	})
})
