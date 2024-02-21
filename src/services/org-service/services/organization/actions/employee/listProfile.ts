import { ListProfileParams, ListProfileReturn } from 'v1.organization.employee.listProfile'
import { AppContextMeta } from '@/common-types'
import { Employee } from '@org/models/employee'

export default {
	async handler(ctx: AppContextMeta<ListProfileParams>): Promise<ListProfileReturn> {
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
