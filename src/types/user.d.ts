declare module 'v1.user.profile.selectProfile' {
	type SelectProfileParams = {
		empId?: boolean | string
	}

	export type SelectProfileReturn =
		import('v1.auth.issueUserAccessToken').IssueUserAccessTokenReturn
}
