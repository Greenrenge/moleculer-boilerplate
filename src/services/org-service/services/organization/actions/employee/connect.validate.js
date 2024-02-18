/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Employee } from '@org/models/employee'

export default {
	cache: false,
	params: {
		privateCode: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { privateCode } = ctx.params
		if (privateCode === '') return null
		const res = await Employee.findOne({
			privateCode,
			userId: null,
			privateCodeExpiredAt: { $gte: new Date() },
		})
		return res
	},
}
