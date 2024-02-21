import type { Document, FlattenMaps, HydratedDocument, Model, Types } from 'mongoose'
import mongoose from 'mongoose'
import { schemaOption } from '@/models/common/index'

export const DEVICE_TYPE = {
	ANDROID: 'ANDROID',
	IOS: 'IOS',
} as const

type DeviceType = (typeof DEVICE_TYPE)[keyof typeof DEVICE_TYPE]

export interface UserLoginDeviceDocument extends Document<Types.ObjectId> {
	userId: string
	deviceId: string
	deviceToken: string
	deviceType: DeviceType
	createdAt: Date
	updatedAt: Date
}

const UserLoginDeviceSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		deviceId: {
			type: String,
			required: true,
		},
		deviceToken: {
			type: String,
			required: true,
		},
		deviceType: {
			type: String,
			enum: Object.values(DEVICE_TYPE),
		} as const,
	},
	schemaOption,
)

UserLoginDeviceSchema.index({
	userId: 1,
	deviceId: 1,
	createdAt: -1,
})

UserLoginDeviceSchema.static('findByUserId', function findByUserId(userId: string): Promise<
	UserLoginDeviceInstance[]
> {
	return this.find({ userId })
})
interface UserLoginDeviceModel extends Model<UserLoginDeviceDocument> {
	findByUserId(userId: string): Promise<UserLoginDeviceDocument[]>
}

export const UserLoginDevice = mongoose.model<UserLoginDeviceDocument, UserLoginDeviceModel>(
	'UserLoginDevice',
	UserLoginDeviceSchema,
	'user_login_device',
)

export type UserLoginDeviceInstance = HydratedDocument<UserLoginDeviceDocument>

export type TUserLoginDevice = FlattenMaps<UserLoginDeviceInstance>
