import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

/**
 * @typedef {import('mongoose').Model} Model
 */

const JobPositionSchema = new mongoose.Schema(
	{
		orgId: {
			type: String,
			required: true,
			index: true,
		},
		image: String,
		name: {
			type: String,
			required: true,
		},
		level: {
			type: Number,
			default: 0,
		},
		skillSet: {
			required: {
				type: [String],
			},
		},
		active: { type: Boolean, default: true },
		deletedAt: Date,
	},
	schemaOption,
)

JobPositionSchema.index({
	name: 'text',
})

JobPositionSchema.index({
	orgId: 1,
	name: 1,
})

export const JobPosition = mongoose.model('JobPosition', JobPositionSchema, 'job_positions')
