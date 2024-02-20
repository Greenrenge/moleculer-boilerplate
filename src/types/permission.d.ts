declare module 'v1.permission.getByRoleId' {
	export type GetByRoleIdParams = {
		id: import('../services/org-service/models/role').RoleDocument['_id'] | string
	}
	export type GetByRoleIdReturn = Promise<IPermission[]>
	export interface IPermission {
		subject: string
		action: string
		inheritance: boolean
	}
}
