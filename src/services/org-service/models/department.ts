import mongoose, { Document, FlattenMaps, Model } from 'mongoose'
import { schemaOption } from '@/models/common/index'

export interface DepartmentDocument extends Document {
	orgId: string
	image?: string
	name: string
	active: boolean
	deletedAt?: Date
}

export type DepartmentInstance = DepartmentDocument

export type TDepartment = FlattenMaps<DepartmentInstance>

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

type DepartmentModel = Model<DepartmentDocument>

export const Department = mongoose.model<DepartmentDocument, DepartmentModel>(
	'Department',
	DepartmentSchema,
)
