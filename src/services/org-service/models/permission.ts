import startCase from 'lodash/startCase'
import mongoose, { Document, FlattenMaps, HydratedDocument, Schema } from 'mongoose'
import { PermActions } from '@/constants/business'
import { schemaOption } from '@/models/common/index'

interface PermissionDocument extends Document<string> {
	_id: string
	label: string
	action: PermActions
	subject: string
	createdAt: Date
	updatedAt: Date
}

const PermissionsSchema = new Schema<PermissionDocument>(
	{
		_id: String,
		label: String,
		action: {
			type: String,
			enum: Object.values(PermActions),
			required: true,
		},
		subject: {
			type: String,
			required: true,
		},
	},
	{
		...schemaOption,
		toJSON: {
			virtuals: true,
			transform(doc, ret) {
				if (!ret?.label) {
					ret.label = `${startCase((doc as PermissionDocument).action)} ${startCase((doc as PermissionDocument).subject)}`
				}
				return ret
			},
		},
		toObject: {
			virtuals: true,
			transform(doc, ret) {
				if (!ret?.label) {
					ret.label = `${startCase((doc as PermissionDocument).action)} ${startCase((doc as PermissionDocument).subject)}`
				}
				return ret
			},
		},
	},
)

PermissionsSchema.static('getId', (action: PermActions, subject: string): string => {
	if (!action || !subject) {
		throw new Error(`no action or subject to create the id action:${action}, subject:${subject}`)
	}
	return `${subject}::${action}`
})
interface PermissionModel extends mongoose.Model<PermissionDocument> {
	getId(action: PermActions, subject: string): string
}

export const Permission = mongoose.model<PermissionDocument, PermissionModel>(
	'Permission',
	PermissionsSchema,
)

export type PermissionInstance = HydratedDocument<PermissionDocument>
export type TPermission = FlattenMaps<PermissionInstance>
