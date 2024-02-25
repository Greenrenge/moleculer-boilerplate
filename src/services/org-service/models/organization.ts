import mongoose, { Document, Model, FlattenMaps } from 'mongoose'
import { schemaOption } from '@/models/common'

export interface AssessmentFeatures {
	disabled?: boolean
}

export interface OrganizationFeatures {
	assessments?: AssessmentFeatures
}

export interface OrganizationDocument extends Document {
	_id: string
	name: string
	abbreviation?: string
	image?: string
	features?: OrganizationFeatures
	createdAt: Date
	updatedAt: Date
}

export interface OrganizationInstance extends OrganizationDocument {
	getPublicOrg: () => OrganizationDocument
}

export type TOrganization = FlattenMaps<OrganizationInstance>

const AssessmentFeaturesSchema = new mongoose.Schema(
	{
		disabled: Boolean,
	},
	{ _id: false },
)

const OrganizationFeaturesSchema = new mongoose.Schema(
	{
		assessments: {
			type: AssessmentFeaturesSchema,
		},
	},
	{ _id: false },
)

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
			type: OrganizationFeaturesSchema,
		},
	},
	schemaOption,
)

OrganizationSchema.statics.getPublicOrg = function () {
	return {
		id: 'public',
		_id: 'public',
		name: 'commandsee',
		displayName: 'commandsee',
		abbreviation: 'commandsee',
		image: 'https://commandsee-public-asset.s3-ap-southeast-1.amazonaws.com/commandsee-logo.png',
	}
}

type OrganizationModel = mongoose.Model<OrganizationDocument>

export const Organization = mongoose.model<OrganizationDocument, OrganizationModel>(
	'Organization',
	OrganizationSchema,
)
