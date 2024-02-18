import mongoose from 'mongoose'
import config from '@/config'
import { Gender, PUBLIC_ORG } from '@/constants/business'
import { schemaOption } from '@/models/common/index'
import { randomPrivateCode } from '@utils/random'

/**
 * @typedef {import('mongoose').Model} Model
 */
export const getProfileImagePath = (orgId, empId) => `/profile/organization/${orgId}/${empId}`

const resolveUserImage = (doc) => {
	// Add prefix for CDN URL profile image
	if (doc.image) {
		doc.image = doc.image.startsWith('http')
			? doc.image // Social Profile image
			: `${config.cdn.url}${doc.image}`
	}
	return doc
}

export const MIN_USER_KEYS = [
	'id',
	'_id',
	// profile
	'firstName',
	'lastName',
	'nickName',
	'image',
	// virtual
	'fullName',
	'displayName',
	// org
	'userId',
	'orgId',
	'deptId',
	'jobId',
	'reportTo',
	'connectedAt',
	'lastInvitedAt',
]

export const PUBLIC_USER_KEYS = [
	'id',
	'_id',
	// profile
	'firstName',
	'lastName',
	'nickName',
	'email',
	'gender',
	'image',
	// virtual
	'fullName',
	'displayName',
	// org
	'userId',
	'orgId',
	'deptId',
	'jobId',
	'reportTo',
	'connectedAt',
	'lastInvitedAt',
	'dateOfBirth',
]

export const MARITAL_STATUS = {
	SINGLE: 'single',
	MARRIED: 'married',
}

const EmployeeSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		userId: {
			type: String,
			index: true,
		},
		firstName: String,
		lastName: String,
		nickName: String,
		image: {
			type: String,
		},
		email: String,
		privateCode: String,
		privateCodeExpiredAt: Date,
		orgId: {
			type: String,
			required: true,
			default: PUBLIC_ORG,
		},
		deptId: mongoose.Types.ObjectId,
		jobId: mongoose.Types.ObjectId,
		reportTo: String,
		roleId: mongoose.Types.ObjectId,
		lastInvitedAt: Date,
		active: { type: Boolean, default: true },
		connectedAt: Date,
		unconnectedAt: Date,
		// personal
		gender: {
			type: String,
			enum: Object.values(Gender),
		},
		phoneNumber: {
			type: String,
		},
		dateOfBirth: {
			type: String, // 1995-05-20
		},
		language: {
			type: String,
		},
		hiredAt: Date,
		maritalStatus: {
			type: String,
			enum: Object.values(MARITAL_STATUS),
		},
		numberOfChildren: Number,
	},
	{
		...schemaOption,
		toObject: {
			virtuals: true,
			transform(doc, ret) {
				const updatedDoc = resolveUserImage(doc)
				if (updatedDoc.image) ret.image = updatedDoc.image
				return ret
			},
		},
	},
)

EmployeeSchema.index(
	{
		firstName: 'text',
		lastName: 'text',
		nickName: 'text',
		email: 'text',
	},
	{
		language_override: 'prevent_language_error',
	},
)

EmployeeSchema.index({
	firstName: 1,
})
EmployeeSchema.index({
	lastName: 1,
})

EmployeeSchema.index({
	nickName: 1,
})

EmployeeSchema.index({
	email: 1,
})

EmployeeSchema.index({
	orgId: 1,
	active: 1,
	deptId: 1,
})

EmployeeSchema.index({
	orgId: 1,
	active: 1,
	userId: 1,
})

EmployeeSchema.index({
	deptId: 1,
	active: 1,
	userId: 1,
})

EmployeeSchema.index({
	jobId: 1,
	active: 1,
	userId: 1,
})

EmployeeSchema.index({
	reportTo: 1,
})

EmployeeSchema.index(
	{ privateCode: 1 },
	{
		unique: true,
		partialFilterExpression: {
			privateCode: { $exists: true, $gt: '' },
		},
	},
)

EmployeeSchema.index(
	{ orgId: 1, email: 1 },
	{
		unique: true,
		partialFilterExpression: {
			orgId: { $exists: true, $gt: '' },
			email: { $exists: true, $gt: '' },
		},
	},
)

EmployeeSchema.virtual('fullName').get(function () {
	return this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : ''
})

EmployeeSchema.virtual('isPersonalProfile').get(function () {
	return this.orgId === PUBLIC_ORG
})

EmployeeSchema.virtual('displayName').get(function () {
	const fullName =
		this.firstName || this.lastName
			? `${this.firstName ? `${this.firstName} ` : ''}${this.lastName}`
			: ''

	return this.nickName ?? fullName ?? 'Someone'
})

EmployeeSchema.post('init', resolveUserImage)

EmployeeSchema.pre('save', function (next) {
	try {
		if (this.email) {
			this.email = this.email.toLowerCase()
		}
		if (!this.privateCode && this.orgId !== PUBLIC_ORG) {
			this.regenerateCode()
		}
		if (this.privateCode === '' || (this.orgId === PUBLIC_ORG && this.privateCode)) {
			this.privateCode = null
		}
		next()
	} catch (err) {
		next(err)
	}
})

EmployeeSchema.methods.regenerateCode = function () {
	const date = new Date()
	this.privateCode = randomPrivateCode()
	this.privateCodeExpiredAt = date.setMonth(date.getMonth() + 3) //  3 months
	return this
}

export const Employee = mongoose.model('Employee', EmployeeSchema)
