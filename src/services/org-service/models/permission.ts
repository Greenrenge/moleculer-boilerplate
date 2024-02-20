import startCase from 'lodash/startCase'
import mongoose, { Document, Schema } from 'mongoose'
import { PermActions } from '@/constants/business'
import { schemaOption } from '@/models/common/index'

interface PermissionDocument extends Document<string> {
	_id: string
	label: string
	action: PermActions
	subject: string
}

interface PermissionModel extends mongoose.Model<PermissionDocument> {
	getId(action: PermActions, subject: string): string
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

export const Permission = mongoose.model<PermissionDocument, PermissionModel>(
	'Permission',
	PermissionsSchema,
)
