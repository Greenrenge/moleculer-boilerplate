/* eslint-disable jest/expect-expect */
import { expect } from 'chai'
import { factory } from 'factory-girl'
import TestServiceBroker from '@/test/service-broker'
import OrganizationService from '@/services/org-service/services/organization/organization.service'
import permissionMiddleware from '@pkg/moleculer-components/middlewares/permission-middleware'

describe('# organization.one', () => {
	const broker = new TestServiceBroker({
		logger: false,
		cacher: 'memory',
		middlewares: [permissionMiddleware],
	})
	const service = broker.createService(OrganizationService)

	before(() => broker.start())
	after(() => broker.stop())
	context('# v1.organization.organization.one', () => {
		test('should not be fetch if user id is not found in meta', async () => {
			const org = await factory.create('organization')
			await expect(broker.call('v1.organization.organization.one', { id: org._id }, {})).to.be
				.rejected
		})

		test('should return the org if orgId is sent in meta and equal to the id', async () => {
			const org = await factory.create('organization')
			await broker.call(
				'v1.organization.organization.one',
				{ id: org._id },
				{ meta: { orgId: org._id.toString(), userId: 'whatever' } },
			)
		})
	})
})
