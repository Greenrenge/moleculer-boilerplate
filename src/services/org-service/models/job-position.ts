import mongoose, { Document, Model, FlattenMaps } from 'mongoose'
import { schemaOption } from '@/models/common'

export interface JobPositionDocument extends Document {
	orgId: string
	image?: string
	name: string
	level?: number
	skillSet: string[]
	active: boolean
	deletedAt?: Date
	createdAt: Date
	updatedAt: Date
}

export type JobPositionInstance = JobPositionDocument

export type TJobPosition = FlattenMaps<JobPositionInstance>

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
		active: { type: Boolean, default: true, required: true },
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

type JobPositionModel = mongoose.Model<JobPositionDocument>

export const JobPosition = mongoose.model<JobPositionDocument, JobPositionModel>(
	'JobPosition',
	JobPositionSchema,
	'job_positions',
)
