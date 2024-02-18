import { Employee } from '@org/models/employee'

export const findEmp = (ctx, empId) =>
	ctx.broker.call('v1.organization.employee.one', { id: empId }, { meta: ctx.meta })

export const findEmps = (ctx, empIds) =>
	ctx.broker.mcall(
		empIds.map((empId) => ({
			action: 'v1.organization.employee.one',
			params: { id: empId },
			options: { meta: ctx.meta },
		})),
	)

export const findUser = async (userId) => {
	const user = await Employee.findById(userId)
	return user.toObject()
}

export const findUsers = async (userIds = []) => {
	const users = await Employee.find({ _id: { $in: userIds } })
	return users.map((u) => u.toObject())
}
