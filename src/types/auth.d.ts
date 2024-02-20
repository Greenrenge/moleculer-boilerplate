/* eslint-disable @typescript-eslint/consistent-type-imports */

declare module 'v1.auth.changePassword' {
	export type ChangePasswordParams = {
		oldPassword: string
		newPassword: string
	}
	// return type
	export type ChangePasswordReturn = Promise<{
		message: string
	}>
}

declare module 'v1.auth.connectSocial' {
	export type ConnectSocialParams = {
		registerType: import('@/constants/business').LoginMethod
		accessToken: string
	}
	export type ConnectSocialReturn = Promise<
		import('@/services/auth-service/models/user-login').UserLoginDocument | null
	>
}

declare module 'v1.auth.issueUserAccessToken' {
	export interface IToken {
		access_token: string
		token_type: string
	}

	export type IssueUserAccessTokenParams = {
		userId: string
		empId: string
		roleId?: string
		permissions?: RawRule<any, any>[]
		orgId: string
	}
	export type IssueUserAccessTokenReturn = Promise<IToken>
}

declare module 'v1.auth.findOneUserLogin' {
	export type FindOneUserLoginParams = {
		// query: { _id: userId }
		query: Parameters<typeof UserLogin.findOne>[0]
	}
	export type FindOneUserLoginReturn = Promise<
		import('@/services/auth-service/models/user-login').UserLoginDocument | null
	>
}
declare module 'v1.auth.forgetPassword' {
	export type ForgotPasswordParams = {
		email: string
	}
	export type ForgotPasswordReturn = Promise<{
		message: string
	}>
}
declare module 'v1.auth.login' {
	export type LoginParams = {
		email: string
		password: string
		asEmployee?: boolean | string
	}
	export type LoginReturn = import('v1.user.profile.selectProfile').SelectProfileReturn
}
declare module 'v1.auth.register' {
	export type RegisterParams = {
		email?: string
		password?: string
		registerType?: import('@/constants/business').LoginMethod
		accessToken?: string
		asEmployee: boolean | string
	}
	export type RegisterReturn = import('v1.auth.issueUserAccessToken').IssueUserAccessTokenReturn
}

declare module 'v1.auth' {
	export type AuthModule = {
		changePassword: {
			params: import('v1.auth.changePassword').ChangePasswordParams
			return: import('v1.auth.changePassword').ChangePasswordReturn
		}
		connectSocial: {
			params: import('v1.auth.connectSocial').ConnectSocialParams
			return: import('v1.auth.connectSocial').ConnectSocialReturn
		}
		issueUserAccessToken: {
			params: import('v1.auth.issueUserAccessToken').IssueUserAccessTokenParams
			return: import('v1.auth.issueUserAccessToken').IssueUserAccessTokenReturn
		}
	}
}
