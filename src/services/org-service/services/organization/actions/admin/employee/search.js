/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

import { Errors } from 'moleculer'
import { PUBLIC_ORG, PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'

export default {
	cache: {
		keys: ['searchTerm', '#empId', '#userId', 'limit', 'skip'],
	},
	permissions: [
		[PermActions.VIEW, PermSubjects.PUBLIC_USER],
		[PermActions.VIEW, PermSubjects.ORG_MEMBER],
		[PermActions.VIEW, PermSubjects.DEPARTMENT_MEMBER],
	],
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
		const { empId, userId, orgId } = ctx.meta

		if (
			orgId === PUBLIC_ORG &&
			!ctx.locals.permission.can(PermActions.VIEW, PermSubjects.PUBLIC_USER)
		)
			throw new Errors.MoleculerError('You have no permission', 'permission_denied')

		if (
			orgId !== PUBLIC_ORG &&
			!(
				ctx.locals.permission.can(PermActions.VIEW, PermSubjects.ORG_MEMBER) ||
				ctx.locals.permission.can(PermActions.VIEW, PermSubjects.DEPARTMENT_MEMBER)
			)
		)
			throw new Errors.MoleculerError('You have no permission', 'permission_denied')

		const filter = {
			orgId,
			...(orgId !== PUBLIC_ORG &&
				!ctx.locals.permission.can(PermActions.VIEW, PermSubjects.ORG_MEMBER) && {
					deptId: (await Employee.findById(ctx.meta.empId))?.deptId,
				}),
		}

		const $regex = searchTerm && new RegExp(`^${searchTerm.trim()}`, 'i')

		return Employee.paginate(
			{
				...(searchTerm && {
					$or: [
						{ $text: { $search: searchTerm.trim() } },
						{ firstName: { $regex } },
						{ lastName: { $regex } },
						{ nickName: { $regex } },
						{ email: { $regex } },
					],
				}),
				...filter,
			},
			{ skip, limit },
		)
	},
}
