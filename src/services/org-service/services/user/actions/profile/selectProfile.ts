import _ from 'lodash'
import { Errors } from 'moleculer'
import type { ServiceBroker } from 'moleculer'
import {
	IssueUserAccessTokenParams,
	IssueUserAccessTokenReturn,
} from 'v1.auth.issueUserAccessToken'
import { ListProfileParams, ListProfileReturn } from 'v1.organization.employee.listProfile'
import { GetByRoleIdParams, GetByRoleIdReturn, IPermission } from 'v1.permission.getByRoleId'
import { SelectProfileParams, SelectProfileReturn } from 'v1.user.profile.selectProfile'
import type { AppContextMeta } from '@/common-types'
import { PUBLIC_ORG } from '@/constants/business'
import { USER_ERRORS, ValidationError } from '@/constants/errors'
import { Employee } from '@org/models/employee'

export default {
	trackActivity: 'login',
	params: {
		empId: {
			type: 'multi',
			rules: [{ type: 'boolean' }, { type: 'string' }],
			optional: true,
		},
	},
	handler: async function selectProfile(
		this: ServiceBroker,
		ctx: AppContextMeta<SelectProfileParams>,
	): SelectProfileReturn {
		this.logger.info(`ACTION: ${ctx.action!.name}`, ctx)
		const { empId } = ctx.params
		const { userId } = ctx.meta

		const user = await Employee.findById(userId)
		if (!user) {
			throw new ValidationError('USER_NOT_EXIST')
		}

		const fetchPermissions = async (roleId: string): Promise<IPermission[]> => {
			if (!roleId) return []
			try {
				const permissions = await ctx.call<GetByRoleIdReturn, GetByRoleIdParams>(
					'v1.permission.getByRoleId',
					{
						id: roleId,
					},
				)
				return permissions
			} catch (err) {
				ctx.broker.logger.error(`error to call v1.permission.getByRoleId ${err}`)
				return []
			}
		}

		if (!empId) {
			// public profile
			return ctx.call<IssueUserAccessTokenReturn, IssueUserAccessTokenParams>(
				'v1.auth.issueUserAccessToken',
				{
					userId,
					empId: user._id,
					...(user.roleId && { roleId: user.roleId }),
					orgId: user.orgId,
					permissions: await fetchPermissions(user.roleId),
				},
			)
		}

		const emp = _.find(
			(await ctx.call<ListProfileReturn, ListProfileParams>(
				'v1.organization.employee.listProfile',
				{},
				{
					meta: {
						userId,
					},
				},
			)) ?? [],
			(employee) => employee._id === empId || (empId === true && employee.orgId !== PUBLIC_ORG),
		)
		return ctx.call<IssueUserAccessTokenReturn, IssueUserAccessTokenParams>(
			'v1.auth.issueUserAccessToken',
			{
				userId,
				empId: emp ? emp._id : user._id,
				orgId: emp ? emp.orgId : user.orgId,
				...(emp
					? { roleId: emp.roleId }
					: user.roleId && {
							roleId: user.roleId,
						}),
				permissions: await fetchPermissions(emp ? emp.roleId : user.roleId),
			},
		)
	},
}
