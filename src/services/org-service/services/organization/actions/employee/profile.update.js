/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Errors } from 'moleculer'
import { Employee, getProfileImagePath } from '@org/models/employee'

export default {
	cache: false,
	cleanAfter: ['v1.organization.employee.**'],
	params: {
		firstName: { type: 'string', optional: true },
		lastName: { type: 'string', optional: true },
		nickName: { type: 'string', optional: true },
		image: { type: 'string', optional: true },
		jobId: 'string|optional',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { empId, userId, orgId } = ctx.meta
		const res = await Employee.findOneAndUpdate(
			{ _id: empId, userId },
			{
				$set: {
					...ctx.params,
					...(ctx.params.image && {
						image: getProfileImagePath(orgId, empId),
					}),
				},
			},
			{ new: true, useFindAndModify: false },
		)
		if (!res)
			throw new Errors.MoleculerClientError('Not found the employee', 404, 'ORG_PROFILE_NOT_FOUND')
		return res
	},
}
