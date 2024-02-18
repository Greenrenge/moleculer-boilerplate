import { DateTime } from 'luxon'
import { serviceMeta } from '@/utils/service-meta'
import { Employee } from '@org/models/employee'

export default {
	...serviceMeta,
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [] } = ctx.params
		const { orgId } = ctx.meta

		if (!filter.length) {
			// all the emp
			// only who active and connected
			return []
		}

		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})
		const docs = await Employee.find(empFilterQuery, '_id').lean()
		return docs.map((a) => a._id)
	},
}
