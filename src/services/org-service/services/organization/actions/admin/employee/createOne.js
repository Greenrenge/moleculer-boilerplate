import { Errors } from 'moleculer'
import { PermActions, PermSubjects } from '@/constants/business'
import { ControlState } from '@/models/common/control-state'
import { Department } from '@org/models/department'
import { Employee, MARITAL_STATUS } from '@org/models/employee'
import { JobPosition } from '@org/models/job-position'
import { Organization } from '@org/models/organization'

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export const params = {
	id: { type: 'string', optional: true },
	email: { type: 'email' },
	firstName: { type: 'string', optional: true },
	lastName: { type: 'string', optional: true },
	nickName: { type: 'string', optional: true },
	orgId: { type: 'string' },
	deptId: { type: 'string' },
	jobId: { type: 'string' },
	reportTo: { type: 'string', optional: true },
	sendInvite: { type: 'boolean', optional: true },
	hiredAt: { type: 'date', convert: true, optional: true },
	maritalStatus: {
		type: 'string',
		optional: true,
		enum: Object.values(MARITAL_STATUS),
	},
	numberOfChildren: { type: 'number', optional: true },
}
export default {
	cache: false,
	permissions: [
		{
			_permissions: [
				[PermActions.CREATE, PermSubjects.ORG_MEMBER],
				[PermActions.UPDATE, PermSubjects.ORG_MEMBER],
				[PermActions.CREATE, PermSubjects.DEPARTMENT_MEMBER],
				[PermActions.UPDATE, PermSubjects.DEPARTMENT_MEMBER],
			],
			orgId: '#orgId',
		},
	],
	params,
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const {
			id,
			email,
			orgId,
			deptId,
			jobId,
			reportTo,
			sendInvite,
			firstName,
			lastName,
			nickName,
			hiredAt,
			maritalStatus,
			numberOfChildren,
		} = ctx.params

		// permissions
		if (
			!ctx.locals.permission.can(PermActions.CREATE, PermSubjects.ORG_MEMBER) &&
			!ctx.locals.permission.can(PermActions.UPDATE, PermSubjects.ORG_MEMBER)
		) {
			// only create in user's dept
			const creator = await Employee.findById(ctx.meta.empId)
			if (creator?.deptId?.toString() !== deptId?.toString()) {
				throw new Errors.MoleculerClientError(
					'You have no permission to action',
					'permission_denied',
				)
			}
		}

		// validate all relations
		const [org, dept, job] = await Promise.all([
			Organization.findById(orgId),
			Department.findById(deptId),
			JobPosition.findById(jobId),
		])

		if (
			!org ||
			!dept ||
			dept.orgId.toString() !== org._id.toString() ||
			(jobId && (!job || job.orgId.toString() !== org._id.toString()))
		) {
			throw new Errors.MoleculerClientError(
				'Organization or Department or Job Position not found',
				'not_found',
			)
		}

		let doc
		if (id) {
			doc = await Employee.findByIdAndUpdate(
				id,
				{
					email,
					firstName,
					lastName,
					nickName,
					orgId,
					deptId,
					jobId,
					reportTo,
					hiredAt,
					maritalStatus,
					numberOfChildren,
				},
				{
					useFindAndModify: false,
					setDefaultsOnInsert: true,
					upsert: false,
				},
			)
		} else {
			const nextId = await ControlState.getNextEmployeeId(orgId)
			doc = new Employee({
				_id: nextId,
				email,
				firstName,
				lastName,
				nickName,
				orgId,
				deptId,
				jobId,
				hiredAt,
				maritalStatus,
				numberOfChildren,
				...(reportTo && { reportTo }),
				...(sendInvite && { lastInvitedAt: new Date() }),
			})
			await doc.save()
			const obj = doc?.toObject?.()
			if (sendInvite) {
				ctx.broker.emit(
					'email.org-invitation',
					{
						orgName: org.name,
						email,
						privateCode: obj?.privateCode,
						privateCodeExpiredAt: obj?.privateCodeExpiredAt,
					},
					{ meta: ctx.meta },
				)
			}
			return obj
		}
		return doc?.toObject?.()
	},
}
