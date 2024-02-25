import {
	createMongoAbility,
	Subject,
	MongoQuery,
	AbilityBuilder,
	PureAbility,
	MongoAbility,
	AbilityTuple,
} from '@casl/ability'
import { ADMIN_USER_ID } from '@/constants/business'
import { Employee, TEmployee } from '@org/models/employee'

interface DefineAbilityParams {
	userId: string
	employee?: TEmployee
}

export const defineAbilityFor = ({ userId, employee: _employee }: DefineAbilityParams) => {
	const employee = _employee ?? {
		_id: '',
		orgId: '',
		deptId: '',
		reportTo: '',
	}
	const { can, cannot, rules } = new AbilityBuilder(createMongoAbility)

	const { _id: empId, orgId, deptId, reportTo } = employee

	if (userId === ADMIN_USER_ID) {
		can('manage', 'all')
		return createMongoAbility(rules)
	}

	if (userId) can('read', 'Organization')

	if (!empId) {
		return createMongoAbility(rules)
	}

	// self profile
	can(['read', 'update'], 'Employee', { _id: empId })
	// Organization
	can('read', 'Department', { orgId })
	can('read', 'JobPosition', { orgId })
	can('read', 'Role', { orgId })
	can('read', 'Employee', { orgId })

	return createMongoAbility(rules)
}

interface FetchAbilityParams {
	userId: string
	empId?: string
	ctx: any // replace 'any' with the appropriate type
}

export const fetchAbility = async ({
	userId,
	empId,
	ctx,
}: FetchAbilityParams): Promise<MongoAbility<AbilityTuple, MongoQuery>> => {
	if (!empId) return defineAbilityFor({ userId })
	const employee = await Employee.findById(empId)
	return defineAbilityFor({ userId, employee })
}
