import { Errors } from 'moleculer'
import { Employee } from '@org/models/employee'
import { Organization } from '@org/models/organization'

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	cache: false,
	params: {
		email: { type: 'string' },
		orgId: { type: 'string' },
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { email, orgId } = ctx.params
		const org = await Organization.findById(orgId)
		if (!org) {
			throw new Errors.MoleculerClientError('Organization not found', 'organization_not_found')
		}
		const doc = await Employee.findOne({ email, orgId })

		if (!doc) {
			throw new Errors.MoleculerClientError(
				'Email in Organization not found',
				'Email in Organization not found',
			)
		}
		doc.regenerateCode()
		await doc.save()
		const obj = doc?.toObject?.()
		ctx.broker.emit(
			'email.org-invitation',
			{
				orgName: org.name,
				email,
				privateCode: obj?.privateCode,
				privateCodeExpiredAt: obj?.privateCodeExpiredAt,
			},
			{ meta: ctx.meta },
		)
		return obj
	},
}

// call v1.organization.admin.employee.createOne --email "test@test.com" --orgId "<commandsee-test>" --deptId "5faf5c21dd658e79d11ff150" --jobId "5fd0807b164429fc3f5f462d" --reportTo "<commandsee-test>_-"
