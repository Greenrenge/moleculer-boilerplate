export const OrganizationResolver = {
	action: 'v1.organization.organization.one',
	nullIfError: true,
	rootParams: {
		orgId: 'id',
	},
}

export const fetchUser = (ctx, id) =>
	ctx.broker.call('v1.gateway.profile.userOne', { id }, { meta: ctx.meta })

export const createUserResolver = (field) => ({
	action: 'v1.gateway.profile.userOne',
	nullIfError: true,
	rootParams: {
		[field]: 'id',
	},
})
export const createUsersResolver = (field) => ({
	action: 'v1.gateway.profile.userMany',
	nullIfError: true,
	rootParams: {
		[field]: 'ids',
	},
})

export const DepartmentResolver = {
	action: 'v1.organization.department.one',
	nullIfError: true,
	rootParams: {
		deptId: 'id',
	},
}
export const JobPositionResolver = {
	action: 'v1.organization.jobPosition.one',
	nullIfError: true,
	rootParams: {
		jobId: 'id',
	},
}
export const RoleResolver = {
	action: 'v1.organization.role.one',
	nullIfError: true,
	rootParams: {
		roleId: 'id',
	},
}
