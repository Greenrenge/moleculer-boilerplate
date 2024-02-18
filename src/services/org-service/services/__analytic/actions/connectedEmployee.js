import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], skip, limit } = ctx.params
		const { query } = await this.getEmployeeFilter({ ctx, filter })
		const res = await Employee.paginate(query, { skip, limit })
		const formatted = {
			...res,
			items: res.items.map((i) => i.toObject()),
		}
		return formatted
	},
}
