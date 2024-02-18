/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Employee } from '@org/models/employee'

export default {
	/** @param {Context} ctx */
	async handler(ctx) {
		const { userId } = ctx.meta
		if (!userId) return []
		const [organizationProfiles, publicProfile] = await Promise.all([
			Employee.find({
				userId,
				active: true,
			}),
			Employee.findById(userId),
		])
		return [publicProfile, ...organizationProfiles]
			.filter((a) => !!a) // prevent not found publicProfile
			.map((a) => a?.toObject())
	},
}
