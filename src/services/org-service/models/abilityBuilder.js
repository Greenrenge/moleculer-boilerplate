import { Ability, AbilityBuilder } from '@casl/ability'
import { ADMIN_USER_ID } from '@/constants/business'
import { Employee } from '@org/models/employee'

// TODO: memoize it, test it
export const defineAbilityFor = ({ userId, employee: _employee }) => {
	const employee = _employee ?? {}
	const { can, cannot, rules } = new AbilityBuilder()
	const { _id: empId, orgId, deptId, reportTo } = employee

	if (userId === ADMIN_USER_ID) {
		can('manage', 'all')
		return new Ability(rules)
	}

	if (userId) can('read', 'Organization')

	if (!empId) {
		return new Ability(rules)
	}

	// self profile
	can(['read', 'update'], 'Employee', { _id: empId })
	// Organization
	can('read', 'Department', { orgId })
	can('read', 'JobPosition', { orgId })
	can('read', 'Role', { orgId })
	can('read', 'Employee', { orgId })

	return new Ability(rules)
}

export const fetchAbility = async ({ userId, empId, ctx }) => {
	if (!empId) return defineAbilityFor({ userId })
	const employee = await Employee.findById(empId)
	return defineAbilityFor({ userId, employee })
}
