/* eslint-disable @typescript-eslint/consistent-type-imports */

declare module 'v1.auth.changePassword' {
	export type ChangePasswordParams = {
		oldPassword: string
		newPassword: string
	}
	// return type
	export type ChangePasswordReturn = {
		message: string
	}
}

declare module 'v1.auth.connectSocial' {
	export type ConnectSocialParams = {
		registerType: import('@/constants/business').LoginMethod
		accessToken: string
	}
	export type ConnectSocialReturn =
		| import('@/services/auth-service/models/user-login').TUserLogin
		| undefined
		| null
}

declare module 'v1.auth.findOneUserLogin' {
	export type FindOneUserLoginParams = {
		// query: { _id: userId }
		// query: import('@/services/auth-service/models/user-login').UserLoginModel.findOne
		query: import('mongoose').FilterQuery<
			import('@/services/auth-service/models/user-login').UserLoginDocument
		>
	}
	export type FindOneUserLoginReturn =
		| import('@/services/auth-service/models/user-login').TUserLogin
		| null
		| undefined
}
declare module 'v1.auth.forgetPassword' {
	export type ForgotPasswordParams = {
		email: string
	}
	export type ForgotPasswordReturn = {
		message: string
	}
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
	export type IssueUserAccessTokenReturn = IToken
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

declare module 'v1.auth.resetPassword' {
	type ResetPasswordParams = {
		email: string
		code: string
		password: string
	}

	export type ResetPasswordReturn = {
		message: string
	}
}
declare module 'v1.auth.resolveToken' {
	export type ResolveTokenParams = {
		token: string
	}
	export type ResolveTokenReturn = jose.JWTPayload
}

declare module 'v1.auth.device.getByUserId' {
	export type GetDeviceByUserIdParams = {
		id?: string
	}
	export type GetDeviceByUserIdReturn =
		import('@/services/auth-service/models/user-login-device').TUserLoginDevice[]
}

declare module 'v1.auth.device.update' {
	export type UpdateDeviceParams = {
		deviceId?: string
		deviceToken?: string
		deviceType: string
	}
	export type UpdateDeviceReturn =
		import('@/services/auth-service/models/user-login-device').TUserLoginDevice
}

declare module 'v1.auth' {
	export enum AuthAction {
		changePassword = 'v1.auth.changePassword',
		connectSocial = 'v1.auth.connectSocial',
		issueUserAccessToken = 'v1.auth.issueUserAccessToken',
		login = 'v1.auth.login',
		register = 'v1.auth.register',
		resolveToken = 'v1.auth.resolveToken',
		resetPassword = 'v1.auth.resetPassword',
		forgetPassword = 'v1.auth.forgetPassword',
		findOneUserLogin = 'v1.auth.findOneUserLogin',
		'device.getByUserId' = 'v1.auth.device.getByUserId',
		'device.update' = 'v1.auth.device.update',
	}
}
