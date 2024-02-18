import startCase from 'lodash/startCase'
import mongoose from 'mongoose'
import { PermActions } from '@/constants/business'
import { schemaOption } from '@/models/common/index'

const transform = function (doc, ret) {
	if (!ret?.label) {
		ret.label = `${startCase(doc.action)} ${startCase(doc.subject)}`
	}
	return ret
}

const PermissionsSchema = new mongoose.Schema(
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
			transform,
		},
		toObject: {
			virtuals: true,
			transform,
		},
	},
)

PermissionsSchema.statics.getId = function (action, subject) {
	if (!action || !subject)
		throw new Error(`no action or subject to create the id action:${action}, subject:${subject}`)
	return `${subject}::${action}`
}

export const Permission = mongoose.model('Permission', PermissionsSchema)
