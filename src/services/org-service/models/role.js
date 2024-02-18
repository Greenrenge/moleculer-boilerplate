import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

const PermissionsSchema = new mongoose.Schema(
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

/**
 * @typedef {import('mongoose').Model} Model
 */

const RoleSchema = new mongoose.Schema(
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

export const Role = mongoose.model('Role', RoleSchema)
