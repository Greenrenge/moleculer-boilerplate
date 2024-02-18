import { PermActions, PermSubjects } from '@/constants/business'
import { JobPosition } from '@org/models/job-position'

export default {
	permission: [
		[PermActions.CREATE, PermSubjects.JOB_POSITION],
		[PermActions.UPDATE, PermSubjects.JOB_POSITION],
	],
	params: {
		jobPositions: {
			type: 'array',
			min: 1,
			max: 1000,
			items: {
				type: 'object',
				props: {
					name: 'string',
					orgId: 'string',
					level: { type: 'number', optional: true },
					skillSet: { type: 'object', optional: true },
				},
			},
		},
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { jobPositions } = ctx.params

		return JobPosition.insertMany(jobPositions)
	},
}
