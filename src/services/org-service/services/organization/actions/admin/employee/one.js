import { Employee } from '@org/models/employee'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['#orgId', 'id'],
	},
	fetchPermission: true,
	params: {
		id: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { id } = ctx.params

		const { orgId } = ctx.meta

		const doc = await Employee.findOne({
			_id: id,
		})

		const obj = await doc?.toObject()
		return obj
	},
}
