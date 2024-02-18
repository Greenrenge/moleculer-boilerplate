import { Department } from '@org/models/department'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['orgId'],
	},
	params: {
		orgId: 'string|optional',
	},
	async handler(ctx) {
		const { orgId } = ctx.params
		const doc = await Department.aggregate([
			{
				$match: { orgId },
			},
			{
				$lookup: {
					from: 'employees',
					localField: '_id',
					foreignField: 'deptId',
					as: 'employees',
				},
			},
		])
		return doc
	},
}
