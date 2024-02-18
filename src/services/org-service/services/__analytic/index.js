import { getQuery } from '@/models/common/query-audience'
import load from '@utils/moduleLoader'

export const actions = load('actions')

export const events = load('events')

export default {
	name: 'analytic',
	version: 1,
	actions,
	events,
	methods: {
		getEmployeeFilter: async ({ filter, ctx }) => {
			// transform filter to query
			const { orgId } = ctx.meta
			if (!filter.length) {
				filter.push({ kind: 'org', audienceIds: [orgId] })
			}

			// transform to query
			const orQuery = await getQuery({
				audiences: filter,
				ctx,
				defaultOrgId: orgId,
			}) // only active

			const query = {
				$or: orQuery,
				userId: { $exists: true },
				orgId,
				active: true,
			}
			return {
				query,
			}
		},
	},
}
