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
		login: {
			params: import('v1.auth.login').LoginParams
			return: import('v1.auth.login').LoginReturn
		}
		register: {
			params: import('v1.auth.register').RegisterParams
			return: import('v1.auth.register').RegisterReturn
		}
		resolveToken: {
			params: import('v1.auth.resolveToken').ResolveTokenParams
			return: import('v1.auth.resolveToken').ResolveTokenReturn
		}
		resetPassword: {
			params: import('v1.auth.resetPassword').ResetPasswordParams
			return: import('v1.auth.resetPassword').ResetPasswordReturn
		}
		forgetPassword: {
			params: import('v1.auth.forgetPassword').ForgotPasswordParams
			return: import('v1.auth.forgetPassword').ForgotPasswordReturn
		}
		findOneUserLogin: {
			params: import('v1.auth.findOneUserLogin').FindOneUserLoginParams
			return: import('v1.auth.findOneUserLogin').FindOneUserLoginReturn
		}
		'device.getByUserId': {
			params: import('v1.auth.device.getByUserId').GetDeviceByUserIdParams
			return: import('v1.auth.device.getByUserId').GetDeviceByUserIdReturn
		}
		'device.update': {
			params: import('v1.auth.device.update').UpdateDeviceParams
			return: import('v1.auth.device.update').UpdateDeviceReturn
		}
	}

	export type AuthModuleAction = keyof AuthModule
}
