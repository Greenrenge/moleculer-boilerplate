import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

/**
 * @typedef {import('mongoose').Model} Model
 */

const DepartmentSchema = new mongoose.Schema(
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
		active: { type: Boolean, default: true },
		deletedAt: Date,
	},
	schemaOption,
)

DepartmentSchema.index({
	name: 'text',
})

DepartmentSchema.index({
	orgId: 1,
	name: 1,
})

export const Department = mongoose.model('Department', DepartmentSchema)
