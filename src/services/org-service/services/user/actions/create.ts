import { ActionSchema, Context, ServiceBroker } from 'moleculer'
import { CreateUserParams, CreateUserReturn } from 'v1.user.create'
import { AppContextMeta } from '@/common-types'
import { PUBLIC_ORG } from '@/constants/business'
import { Employee, EmployeeDocument, TEmployee } from '@org/models/employee'

/**
 * Create Employee as Public profile
 * @param {Context} ctx
 */
export default {
	cleanAfter: ['v1.organization.employee**'],
	trackActivity: 'registered',
	handler: async function createUser(
		ctx: AppContextMeta<CreateUserParams>,
	): Promise<CreateUserReturn> {
		this.logger.info(`ACTION: ${this.action.name}`, ctx)
		const userInfo = ctx.params

		userInfo.image = userInfo.image ? userInfo.image : undefined // TODO: why ??

		const newUser = new Employee({
			...userInfo,
			orgId: PUBLIC_ORG,
			userId: null,
		})

		const user = await newUser.save()
		return user.toObject() as TEmployee
	},
} as ActionSchema
