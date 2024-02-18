import { Types } from 'mongoose'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		ttl: 60 * 60, // 1 hour
		keys: ['deptId', 'groupBy'],
	},
	params: {
		deptId: {
			type: 'string',
		},
		groupBy: {
			type: 'string',
			optional: true,
			enum: ['job'],
		},
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { deptId, groupBy } = ctx.params
		return Employee.aggregate([
			{
				$match: { deptId: new Types.ObjectId(deptId) },
			},
			...(groupBy === 'job'
				? [
						{
							$lookup: {
								from: 'job_positions',
								localField: 'jobId',
								foreignField: '_id',
								as: 'job_position',
							},
						},
						{
							$unwind: '$job_position',
						},
						{
							$group: {
								_id: '$jobId',
								name: {
									$first: '$job_position.name',
								},
								image: {
									$first: '$image',
								},
								skillSet: {
									$first: '$skillSet',
								},
								empIds: { $push: '$_id' },
							},
						},
					]
				: []),
		])
	},
}
