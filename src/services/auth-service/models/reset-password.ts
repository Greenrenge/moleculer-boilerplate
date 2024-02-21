import type { Document, FlattenMaps, HydratedDocument, Model, Types } from 'mongoose'
import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'
import { randomCode } from '@/utils/random'

export interface ResetPasswordDocument extends Document<Types.ObjectId> {
	userId: string
	email: string
	code: string
	expiresAt?: Date

	// virtual and timestamp fields

	// isExpired: boolean // TODO: make it read but not assign when new Model() ?
	createdAt: Date
	updatedAt: Date
}

const ResetPasswordSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		code: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
		},
	},
	schemaOption,
)

ResetPasswordSchema.index({
	email: -1,
	code: -1,
})

type IResetPasswordVirtual = {
	isExpired: boolean
}
ResetPasswordSchema.virtual('isExpired').get(function (this: ResetPasswordDocument) {
	const isExpired = new Date().getTime() - (this.expiresAt?.getTime() || 0) > 0
	return isExpired
})

ResetPasswordSchema.static(
	'generateResetCode',
	async function (
		this: ResetPasswordRawModel,
		user: {
			_id: string | Types.ObjectId
			email: string
		},
	): Promise<ResetPasswordDocument> {
		const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
		const code = randomCode()
		const res = await this.findOneAndUpdate(
			{
				userId: user._id,
				email: user.email,
			},
			{
				code,
				expiresAt,
			},
			{
				upsert: true,
				new: true,
			},
		)
		return res
	},
)

type ResetPasswordRawModel = Model<ResetPasswordDocument, {}, {}, IResetPasswordVirtual>
export interface ResetPasswordModel extends ResetPasswordRawModel {
	generateResetCode(user: {
		_id: string | Types.ObjectId
		email: string
	}): Promise<ResetPasswordDocument>
}

export const ResetPassword = mongoose.model<ResetPasswordDocument, ResetPasswordModel>(
	'ResetPassword',
	ResetPasswordSchema,
	'reset_password',
)

export type ResetPasswordInstance = HydratedDocument<ResetPasswordDocument, IResetPasswordVirtual>
export type TResetPassword = FlattenMaps<ResetPasswordInstance>
