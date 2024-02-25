import mongoose, { Document, FlattenMaps, HydratedDocument, Model, Types } from 'mongoose'
import { schemaOption } from '@/models/common/index'

export interface ActivityLogDocument extends Document {
	date: Date
	key: string
	orgId: string
	empId?: string
}

export type ActivityLogInstance = HydratedDocument<ActivityLogDocument, {}>

export type TActivity = FlattenMaps<ActivityLogInstance>

const ActivityLogSchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		key: {
			type: String,
			required: true,
		},
		orgId: {
			type: String,
			required: true,
		},
		empId: String,
	},
	{
		versionKey: false,
		...schemaOption,
		timestamps: false,
	},
)

ActivityLogSchema.index({
	orgId: 1,
	key: 1,
	empId: 1,
	date: 1,
})

ActivityLogSchema.index({
	key: 1,
	empId: 1,
	date: 1,
})
type ActivityLogModel = mongoose.Model<ActivityLogDocument>

export const ActivityLog = mongoose.model<ActivityLogDocument, ActivityLogModel>(
	'ActivityLog',
	ActivityLogSchema,
)
