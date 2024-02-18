import ld from 'lodash'
import { Errors } from 'moleculer'
import { PUBLIC_ORG } from '@/constants/business'
import { ERRORS } from '@/constants/errors'
import { Employee } from '@org/models/employee'

const { find } = ld

/**
 *
 * @param {import('moleculer').Context} ctx
 */
async function selectProfile(ctx) {
	this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
	const { empId } = ctx.params
	const { userId } = ctx.meta

	const user = await Employee.findById(userId)
	if (!user)
		throw new Errors.MoleculerClientError(
			ERRORS.USER_NOT_EXIST.MESSAGE,
			400,
			ERRORS.USER_NOT_EXIST.CODE,
		)

	const fetchPermissions = async (roleId) => {
		if (!roleId) return []
		try {
			const permissions = await ctx.broker.call(
				'v1.permission.getByRoleId',
				{
					id: roleId,
				},
				{ meta: ctx.meta },
			)
			return permissions
		} catch (err) {
			ctx.broker.logger.error(`error to call v1.permission.getByRoleId ${err}`)
			return []
		}
	}

	if (!empId) {
		// public profile
		return ctx.broker.call(
			'v1.auth.issueUserAccessToken',
			{
				userId,
				empId: user._id,
				...(user.roleId && { roleId: user.roleId }),
				orgId: user.orgId,
				permissions: await fetchPermissions(user.roleId),
			},
			{ meta: ctx.meta },
		)
	}

	const emp = find(
		(await ctx.broker.call(
			'v1.organization.employee.listProfile',
			{},
			{
				meta: {
					userId,
				},
			},
		)) ?? [],
		(employee) => employee._id === empId || (empId === true && employee.orgId !== PUBLIC_ORG), // if empId == true means select the first found one that is not public profile
	)
	return ctx.broker.call(
		'v1.auth.issueUserAccessToken',
		{
			userId,
			empId: emp ? emp._id : user._id,
			orgId: emp ? emp.orgId : user.orgId,
			...(emp
				? { roleId: emp.roleId }
				: user.roleId && {
						roleId: emp ? emp.roleId : user.roleId,
					}),
			permissions: await fetchPermissions(emp ? emp.roleId : user.roleId),
		},
		{ meta: ctx.meta },
	)
}

export default {
	trackActivity: 'login',
	params: {
		empId: {
			type: 'multi',
			rules: [{ type: 'boolean' }, { type: 'string' }],
			optional: true,
		},
	},
	handler: selectProfile,
}
