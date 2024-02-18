import { Ability, AbilityBuilder } from '@casl/ability'
import { Employee } from '@org/models/employee'

// TODO: memoize it, test it
export const defineAbilityFor = ({ userId, employee: _employee, friendIds: _friendIds }) => {
	const employee = _employee ?? {}
	const friendIds = _friendIds ?? []
	const { can, cannot, rules } = new AbilityBuilder()
	const { _id: empId, orgId, deptId, reportTo } = employee

	if (userId === '__admin') {
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

export const fetchAbility = async (
	{ userId, empId, ctx },
	requiredArray = ['Employee', 'Friendship'],
) => {
	const [employee, friends] = await Promise.all([
		requiredArray.includes('Employee') && empId && Employee.findById(empId), // TODO: implement ctx.cacher in memo pattern
		requiredArray.includes('Friendship') &&
			empId &&
			ctx.broker.call(
				'v1.organization.friendship.list',
				{ type: 'all', status: 'accepted', id: empId },
				{ meta: { empId, userId } },
			),
	])
	const friendIds = friends ? friends.map((d) => d.empId) : []
	return defineAbilityFor({ userId, employee, friendIds })
}
