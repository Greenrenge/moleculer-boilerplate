import mongoose, { Document, FlattenMaps, HydratedDocument, Schema, Types } from 'mongoose'
import { schemaOption } from '@/models/common/index'

export interface PermissionsDocument extends Document<string> {
	inheritance: boolean
}

export interface RoleDocument extends Document<Types.ObjectId> {
	orgId: string
	name: string
	permissions: PermissionsDocument[]
	isDefaultRole: boolean
	createdAt: Date
	updatedAt: Date
}

const PermissionsSchema = new Schema<PermissionsDocument>(
	{
		_id: {
			type: String,
			required: true,
		},
		inheritance: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{ ...schemaOption, timestamps: false },
)

const RoleSchema = new Schema<RoleDocument>(
	{
		orgId: {
			type: String,
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		permissions: {
			type: [PermissionsSchema],
		},
		isDefaultRole: {
			type: Boolean,
			default: false,
		},
	},
	schemaOption,
)

export const Role = mongoose.model<RoleDocument>('Role', RoleSchema)

export type PermissionsInstance = HydratedDocument<PermissionsDocument>
export type TPermissions = FlattenMaps<PermissionsInstance>

export type RoleInstance = HydratedDocument<RoleDocument>
export type TRole = FlattenMaps<RoleInstance>
