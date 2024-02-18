/* eslint-disable prefer-const */

import { PUBLIC_ORG } from '@/constants/business'
import { Employee } from '@org/models/employee'

/**
 * Create Employee as Public profile
 * @param {import('moleculer').Context} ctx
 */
async function createUser(ctx) {
	this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
	const userInfo = ctx.params

	userInfo.image = userInfo.image ? userInfo.image : undefined // TODO: why ??

	const newUser = new Employee({
		...userInfo,
		orgId: PUBLIC_ORG,
		userId: null,
	})

	const user = await newUser.save()
	return user
}

export default {
	cleanAfter: ['v1.organization.employee**'],
	trackActivity: 'registered',
	handler: createUser,
}
