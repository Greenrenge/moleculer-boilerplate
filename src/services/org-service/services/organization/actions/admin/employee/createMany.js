import { PermActions, PermSubjects } from '@/constants/business'
import { Employee } from '@org/models/employee'
import { params } from './createOne'

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
	params: {
		employees: {
			type: 'array',
			min: 1,
			max: 1000,
			items: {
				type: 'object',
				props: {
					...params,
					supervisorEmail: 'email|optional',
				},
			},
		},
	},
	cleanAfter: ['v1.organization.**'],
	/** @param {Context} ctx */
	async handler(ctx) {
		const { employees } = ctx.params
		const createdEmployees = []
		const failedEmployees = []
		for (const employee of employees) {
			try {
				const resultEmp = await ctx.broker.call(
					'v1.organization.admin.employee.createOne',
					employee,
					{
						meta: ctx.meta,
					},
				)
				createdEmployees.push({ ...employee, id: resultEmp?.id })
			} catch (error) {
				failedEmployees.push({
					...employee,
					error,
				})
			}
		}

		// add supervisor
		const listEmp = createdEmployees?.filter?.((v) => v?.supervisorEmail)
		if (listEmp?.length) {
			for (const emp of listEmp) {
				try {
					const supervisor = await Employee.findOne({
						email: emp?.supervisorEmail,
					})
					// update employee
					if (supervisor)
						await ctx.broker.call(
							'v1.organization.admin.employee.createOne',
							{ ...emp, reportTo: supervisor?.id },
							{
								meta: ctx.meta,
							},
						)
					else
						failedEmployees.push({
							...emp,
							error: {
								message: `Supervisor ${emp?.supervisorEmail} not found`,
							},
						})
				} catch (error) {
					failedEmployees.push({
						...emp,
						error: {
							message: 'Add supervisor failed',
							...error,
						},
					})
				}
			}
		}
		return {
			createdEmployees,
			failedEmployees,
		}
	},
}
