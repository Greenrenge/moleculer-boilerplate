import bcrypt from 'bcrypt'
import mongoose, { Document, FlattenMaps, HydratedDocument, Model } from 'mongoose'
import { schemaOption } from '@/models/common'

export const encryptPassword = (password: string): Promise<string> => bcrypt.hash(password, 10)
export interface UserLoginDocument extends Document<string> {
	email: string
	password: string
	integration: {
		facebook: {
			userId: string
			email: string
			integratedAt: Date
		}
		google: {
			userId: string
			email: string
			integratedAt: Date
		}
		apple: {
			userId: string
			email: string
			integratedAt: Date
		}
		line: {
			userId: string
			email: string
			integratedAt: Date
		}
	}
	createdAt: Date
	updatedAt: Date
}

const IntegrationSchema = new mongoose.Schema(
	{
		userId: String,
		email: String,
		integratedAt: Date,
	},
	{
		_id: false,
	},
)

const UserLoginSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			sparse: true,
		},
		password: {
			type: String,
		},
		integration: {
			facebook: {
				type: IntegrationSchema,
			},
			google: {
				type: IntegrationSchema,
			},
			apple: {
				type: IntegrationSchema,
			},
			line: {
				type: IntegrationSchema,
			},
		},
	},
	{
		...schemaOption,
		toJSON: {
			virtuals: true,
			transform(_, ret) {
				delete ret.password
			},
		},
		toObject: {
			virtuals: true,
			transform(_, ret) {
				delete ret.password
			},
		},
	},
)

UserLoginSchema.pre('save', async function (next) {
	try {
		if (this.email) {
			this.email = this.email.toLowerCase()
		}
		if (this.password && this.isModified('password')) {
			this.password = await encryptPassword(this.password)
		}
		next()
	} catch (err) {
		next(err)
	}
})

export type UserLoginModel = Model<UserLoginDocument>

export const UserLogin = mongoose.model<UserLoginDocument, UserLoginModel>(
	'UserLogin',
	UserLoginSchema,
	'user_login',
)

export type UserLoginInstance = HydratedDocument<UserLoginDocument>

export type TUserLogin = FlattenMaps<UserLoginInstance>
