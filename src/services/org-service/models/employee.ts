import mongoose, { Document, FlattenMaps, HydratedDocument, Schema, Types } from 'mongoose'
import config from '@/config'
import { Gender, PUBLIC_ORG } from '@/constants/business'
import { schemaOption } from '@/models/common/index'
import { randomPrivateCode } from '@utils/random'

export const getProfileImagePath = (orgId: string, empId: string) =>
	`/profile/organization/${orgId}/${empId}`

const resolveUserImage = (doc: EmployeeDocument) => {
	// Add prefix for CDN URL profile image
	if (doc.image) {
		doc.image = doc.image.startsWith('http') ? doc.image : `${config.cdn.url}${doc.image}`
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
} as const

// input type when create
export interface EmployeeDocument extends Document<string> {
	userId?: string
	firstName?: string
	lastName?: string
	nickName?: string
	image?: string
	email?: string
	privateCode?: string | null
	privateCodeExpiredAt?: Date | null
	orgId: string
	deptId?: Types.ObjectId
	jobId?: Types.ObjectId
	reportTo?: string
	roleId?: Types.ObjectId
	lastInvitedAt?: Date
	active: boolean
	connectedAt?: Date
	unconnectedAt?: Date
	gender?: Gender
	phoneNumber?: string
	dateOfBirth?: string
	language?: string
	hiredAt?: Date
	maritalStatus?: keyof typeof MARITAL_STATUS
	numberOfChildren?: number
	createdAt: Date
	updatedAt: Date

	// fullName: string
	// displayName: string
	// isPersonalProfile: boolean
}

const EmployeeSchema = new Schema(
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
		deptId: Types.ObjectId,
		jobId: Types.ObjectId,
		reportTo: String,
		roleId: Types.ObjectId,
		lastInvitedAt: Date,
		active: { type: Boolean, default: true, required: true },
		connectedAt: Date,
		unconnectedAt: Date,
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
			transform(doc: EmployeeDocument, ret: any) {
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
interface IEmployeeVirtual {
	fullName: string
	displayName: string
	isPersonalProfile: boolean
}

EmployeeSchema.virtual('fullName').get(function (this: EmployeeInstance) {
	return this.firstName && this.lastName ? `${this.firstName} ${this.lastName}` : ''
})

EmployeeSchema.virtual('isPersonalProfile').get(function (this: EmployeeInstance) {
	return this.orgId === PUBLIC_ORG
})

EmployeeSchema.virtual('displayName').get(function (this: EmployeeInstance) {
	const fullName =
		this.firstName || this.lastName
			? `${this.firstName ? `${this.firstName} ` : ''}${this.lastName}`
			: ''

	return this.nickName ?? fullName ?? ''
})

// @ts-ignore
EmployeeSchema.post('init', (doc: EmployeeInstance) => {
	// Add prefix for CDN URL profile image
	if (doc.image) {
		doc.image = doc.image.startsWith('http') ? doc.image : `${config.cdn.url}${doc.image}`
	}
	return doc
})

EmployeeSchema.pre('save', function (this: EmployeeInstance, next) {
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

interface IEmployeeMethods {
	regenerateCode: () => EmployeeDocument
}

EmployeeSchema.method('regenerateCode', function (this: EmployeeDocument) {
	const date = new Date()
	this.privateCode = randomPrivateCode()
	date.setMonth(date.getMonth() + 3) //  3 months
	this.privateCodeExpiredAt = date
	return this
})

type EmployeeModel = mongoose.Model<EmployeeDocument, any, IEmployeeMethods, IEmployeeVirtual>

export const Employee = mongoose.model<EmployeeDocument, EmployeeModel>('Employee', EmployeeSchema)

// return type
export type EmployeeInstance = HydratedDocument<
	EmployeeDocument,
	IEmployeeMethods & {
		fullName: string
		displayName: string
		isPersonalProfile: boolean
	}
>

// toJSON()
export type TEmployee = FlattenMaps<EmployeeInstance>
