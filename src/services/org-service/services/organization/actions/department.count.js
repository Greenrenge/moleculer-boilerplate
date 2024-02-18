import { Department } from '@org/models/department'
import { createCount } from './__one-list-count-creator'

export default createCount(
	Department,
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
