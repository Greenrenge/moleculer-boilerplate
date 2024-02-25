import mongoose, { Document, FlattenMaps, HydratedDocument, Model } from 'mongoose'
import { schemaOption } from '@/models/common'

export interface EventDocument extends Document {
	orgId: string
	topic?: string
	desc: string
	createdBy: string
	compileContentId?: string
	start?: Date
	end?: Date
	createdAt: Date
	updatedAt: Date
}

export type EventInstance = HydratedDocument<EventDocument, {}>

export type TEvent = FlattenMaps<EventInstance>

const EventSchema = new mongoose.Schema(
	{
		orgId: {
			type: String,
			required: true,
			index: true,
		},
		topic: String,
		desc: {
			type: String,
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		compileContentId: String,
		start: Date,
		end: Date,
	},
	schemaOption,
)

EventSchema.index({
	orgId: 1,
	start: -1,
	end: -1,
})

type EventModel = mongoose.PaginateModel<EventDocument>

export type EventPaginateResult = ReturnType<EventModel['paginate']>

export const Event = mongoose.model<EventDocument, EventModel>('Event', EventSchema)

const WelcomeMessageSchema = new mongoose.Schema({}, schemaOption)

export const WelcomeMessage = Event.discriminator<EventDocument, EventModel>(
	'WelcomeMessage',
	WelcomeMessageSchema,
	'welcome_message',
)
