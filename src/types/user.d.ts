declare module 'v1.user.profile.selectProfile' {
	type SelectProfileParams = {
		empId?: boolean | string
	}

	export type SelectProfileReturn =
		import('v1.auth.issueUserAccessToken').IssueUserAccessTokenReturn
}

declare module 'v1.user.create' {
	export type CreateUserParams = Omit<
		import('@/services/org-service/models/employee').EmployeeDocument,
		['orgId', 'userId']
	>

	export type CreateUserReturn = import('@/services/org-service/models/employee').TEmployee
}
