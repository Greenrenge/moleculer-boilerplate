import base62 from 'base62'
import type { Document, FlattenMaps, Model } from 'mongoose'
import mongoose from 'mongoose'
import { schemaOption } from '@/models/common'

interface ControlStateDocument extends Document {
	last: number
}

export type TControlState = FlattenMaps<ControlStateDocument>

interface ControlStateModel extends Model<ControlStateDocument> {
	getNextUserId(): Promise<string>
	getNextOrgId(): Promise<string>
	getNextEmployeeId(orgId: string): Promise<string>
	getNextId(idType?: string): Promise<string>
}

const ControlStateSchema = new mongoose.Schema(
	{
		_id: String,
		last: {
			type: Number,
			default: 0,
		},
	},
	schemaOption,
)

class ControlStateClass extends mongoose.Model {
	static async getNextUserId(this: ControlStateModel): Promise<string> {
		const updatedDoc = await this.findByIdAndUpdate(
			'userId',
			{ $inc: { last: 1 } },
			{
				new: true,
				useFindAndModify: false,
				upsert: true,
				setDefaultsOnInsert: true,
			},
		)
		return base62.encode(updatedDoc.last)
	}

	static async getNextOrgId(this: ControlStateModel): Promise<string> {
		const updatedDoc = await this.findByIdAndUpdate(
			'orgId',
			{ $inc: { last: 1 } },
			{
				new: true,
				useFindAndModify: false,
				upsert: true,
				setDefaultsOnInsert: true,
			},
		)
		return base62.encode(updatedDoc.last)
	}

	static async getNextEmployeeId(this: ControlStateModel, orgId: string): Promise<string> {
		const updatedDoc = await this.findByIdAndUpdate(
			`empId_${orgId}`,
			{ $inc: { last: 1 } },
			{
				new: true,
				useFindAndModify: false,
				upsert: true,
				setDefaultsOnInsert: true,
			},
		)
		return `${orgId}_${base62.encode(updatedDoc.last)}`
	}

	static async getNextId(this: ControlStateModel, idType = 'templateId'): Promise<string> {
		const updatedDoc = await this.findByIdAndUpdate(
			idType,
			{ $inc: { last: 1 } },
			{
				new: true,
				useFindAndModify: false,
				upsert: true,
				setDefaultsOnInsert: true,
			},
		)
		return base62.encode(updatedDoc.last)
	}
}

ControlStateSchema.loadClass(ControlStateClass)

export const ControlState = mongoose.model<ControlStateDocument, ControlStateModel>(
	'ControlState',
	ControlStateSchema,
)
