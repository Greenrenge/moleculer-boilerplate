import { PUBLIC_ORG } from '@/constants/business'
import { Role } from '@org/models/role'

export default {
	cleanAfter: ['v1.organization**'],
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const organization = ctx.params
		if (!organization) return

		// TODO: add org admin user with password ?

		// add seed role
		const roles = (await Role.find({ orgId: PUBLIC_ORG, isDefaultRole: true })).map((r) =>
			r.toObject(),
		)

		await Role.create(
			roles.map(({ _id, isDefaultRole, orgId, ...rest }) => ({
				...rest,
				orgId: organization._id,
			})),
		)
	},
}
