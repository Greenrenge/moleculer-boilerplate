declare module 'v1.permission.getByRoleId' {
	export type GetByRoleIdParams = {
		id: import('../services/org-service/models/role').TRole['_id'] | string
	}
	export type GetByRoleIdReturn = IPermission[]
	export interface IPermission {
		subject: string
		action: string
		inheritance: boolean
	}
}
