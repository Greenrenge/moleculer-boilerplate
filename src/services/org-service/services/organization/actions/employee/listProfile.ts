import { ListProfileParams, ListProfileReturn } from 'v1.organization.employee.listProfile'
import { AppContextMeta } from '@/common-types'
import { Employee, EmployeeDocument } from '@org/models/employee'

export default {
	async handler(ctx: AppContextMeta<ListProfileParams>): ListProfileReturn {
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
			.map((a) => a?.toObject() as EmployeeDocument)
	},
}
