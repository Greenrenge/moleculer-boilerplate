/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Employee } from '@org/models/employee'

export default {
	cache: {
		keys: ['searchTerm', '#empId', '#userId', 'limit', 'skip'],
	},
	params: {
		searchTerm: {
			type: 'string',
			default: '',
			optional: true,
			trim: true,
			min: 3,
		},
		limit: { type: 'number', optional: true, default: 20 },
		skip: { type: 'number', optional: true, default: 0 },
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { searchTerm, limit, skip } = ctx.params
		const { empId, userId } = ctx.meta

		const $regex = searchTerm && new RegExp(`^${searchTerm.trim()}`, 'i')
		const employee = await Employee.findById(empId)
		if (!employee || !employee.active) return []

		const orgPublic = {
			_id: { $ne: empId },
		}

		const paginated = await Employee.paginate(
			{
				...(searchTerm && {
					$or: [
						{
							$or: [orgPublic],
							$text: { $search: searchTerm.trim() },
						},
						{ firstName: { $regex }, $or: [orgPublic] },
						{ lastName: { $regex }, $or: [orgPublic] },
						{ nickName: { $regex }, $or: [orgPublic] },
						{ email: { $regex }, $or: [orgPublic] },
					],
				}),
				orgId: employee.orgId,
				active: true,
			},
			{ skip, limit, sort: { createdAt: -1 } },
		)

		const isFetchSelf = (d) => [empId, userId].includes(d._id) || d?.userId === userId
		return {
			...paginated,
			items: paginated.items.map((d) => d.toObject()),
		}
	},
}
