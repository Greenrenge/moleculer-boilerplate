declare module 'v1.organization.employee.listProfile' {
	export type ListProfileParams = {}
	export type ListProfileReturn = Promise<import('@org/models/employee').EmployeeDocument[]> // TODO: change to IUser with toObject and common keys of profile
}
