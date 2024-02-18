import { Role } from '@org/models/role'
import { createList } from './__one-list-count-creator'

export default createList(
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
