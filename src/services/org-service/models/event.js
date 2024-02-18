import mongoose from 'mongoose'
import { schemaOption } from '@/models/common'

/**
 * @typedef {import('mongoose').Model} Model
 */

const EventSchema = new mongoose.Schema(
	{
		orgId: {
			type: String,
			required: true,
			index: true,
		},
		topic: {
			type: String,
		},
		desc: {
			type: String,
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		compileContentId: String, // for any multi language content ?
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

export const Event = mongoose.model('Event', EventSchema)

const WelcomeMessageSchema = new mongoose.Schema({}, schemaOption)

export const WelcomeMessage = Event.discriminator(
	'WelcomeMessage',
	WelcomeMessageSchema,
	'welcome_message',
)
