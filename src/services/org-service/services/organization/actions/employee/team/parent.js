/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Employee } from '@org/models/employee'

// graphql do not use this --> it resolves reportTo to employee
export default {
	cache: {
		keys: ['#empId', 'id', '#__origin_gateway_admin'],
		fetchPermission: true,
		params: {
			id: {
				type: 'string',
				optional: true,
			},
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id: _empId } = ctx.params
		const { empId, userId } = ctx.meta
		const self = await Employee.findById(_empId ?? empId)
		return (
			self?.reportTo && (await Employee.findOne({ _id: self.reportTo, active: true }))?.toObject()
		)
	},
}
