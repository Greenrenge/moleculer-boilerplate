/*
actually we can do by gql
me {
  reportTo {
    children{
      // exclude self
    }
  }
}
*/
/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { ForbiddenError } from '@casl/ability'
import { fetchAbility } from '@org/models/abilityBuilder'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		keys: ['#empId', 'id', '#__origin_gateway_admin'],
		fetchPermission: true,
		id: {
			type: 'string',
			optional: true,
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id: _empId } = ctx.params
		const { empId, userId } = ctx.meta
		const ability = await fetchAbility({ userId, empId, ctx })
		const self = await Employee.findById(_empId ?? empId)
		if (!self.reportTo) return null

		const sharedParentEmployees = await Employee.find({
			reportTo: self.reportTo,
			active: true,
		})

		sharedParentEmployees.forEach((c) => ForbiddenError.from(ability).throwUnlessCan('read', c))

		return sharedParentEmployees.filter((a) => a._id?.toString() !== empId).map((c) => c.toObject())
	},
}
