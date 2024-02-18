import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

/**
 * @typedef {import('mongoose').Model} Model
 */

const OrganizationSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		abbreviation: {
			type: String,
		},
		image: {
			type: String,
		},
		features: {
			type: new mongoose.Schema({
				_id: false,
				assessments: {
					type: new mongoose.Schema({
						_id: false,
						disabled: Boolean,
					}),
				},
			}),
		},
	},
	schemaOption,
)

OrganizationSchema.statics.getcommandseePublicOrg = function () {
	return {
		id: 'public',
		_id: 'public',
		name: 'commandsee',
		displayName: 'commandsee',
		abbreviation: 'commandsee',
		image: 'https://commandsee-public-asset.s3-ap-southeast-1.amazonaws.com/commandsee-logo.png',
	}
}

export const Organization = mongoose.model('Organization', OrganizationSchema)
