// THIS IS SYSTEM ACTIVITY, NOT APPLICATION ACTIVITY

import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

// // daily basis
// export const ACTIVITY = {
//   FEED: 'feed',
//   SURVEY: 'survey',
// }

// empId + key + dayKey = unique

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
		timestamps: false,
		versionKey: false,
		...schemaOption,
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

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema)
