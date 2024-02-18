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
		empId: { type: 'string', optional: true },
		orgId: { type: 'string' },
		empIds: { type: 'array', items: 'string', optional: true },
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { empId, empIds = [], orgId } = ctx.params
		const validate = (emp, org) => {
			if (emp.orgId !== org._id) {
				throw new Errors.MoleculerClientError('Organization mismatch', 'Organization_mismatch')
			}
		}

		const org = await Organization.findById(orgId)
		if (!org) {
			throw new Errors.MoleculerClientError('Organization not found', 'organization_not_found')
		}

		const employees = empId
			? [await Employee.findById(empId)]
			: await Employee.find({ _id: { $in: empIds } })

		if (!employees.length) {
			throw new Errors.MoleculerClientError('User not found', 'User_not_found')
		}

		employees.forEach((employee) => validate(employee, org))
		await Employee.updateMany(
			{ _id: { $in: employees.map((emp) => emp._id) } },
			{ $set: { lastInvitedAt: new Date() } },
		)
		employees.forEach(async (employee) => {
			if (!employee.privateCode) {
				employee.regenerateCode()
				await employee.save()
			}
			ctx.broker.emit(
				'email.org-invitation',
				{
					orgName: org.name,
					email: employee.email,
					privateCode: employee.privateCode,
					privateCodeExpiredAt: employee.privateCodeExpiredAt,
				},
				{ meta: ctx.meta },
			)
		})
		return { matchedCount: employees.length, acknowledged: true }
	},
}
