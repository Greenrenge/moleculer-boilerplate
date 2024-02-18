import { PermActions, PermSubjects } from '@/constants/business'
import { Department } from '@org/models/department'

export default {
	cache: false,
	params: {
		departments: {
			type: 'array',
			min: 1,
			max: 1000,
			items: {
				type: 'object',
				props: {
					name: 'string',
					orgId: 'string',
				},
			},
		},
	},
	permission: [[PermActions.CREATE, PermSubjects.DEPARTMENT]],
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { departments } = ctx.params
		return Department.insertMany(departments)
	},
}
