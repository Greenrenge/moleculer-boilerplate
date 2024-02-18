import { Role } from '@org/models/role'
import { createCount } from './__one-list-count-creator'

export default createCount(
	Role,
	{},
	{
		params: {
			orgId: {
				type: 'string',
				optional: true,
			},
		},
		cacheKeys: ['orgId'],
	},
)
