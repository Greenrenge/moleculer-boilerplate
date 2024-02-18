import { Department } from '@org/models/department'
import { createPaginate } from './__one-list-count-creator'

export default createPaginate(
	Department,
	{
		active: true,
	},
	{
		params: {
			searchTerm: {
				type: 'string',
				default: '',
				optional: true,
				trim: true,
				min: 3,
			},
			orgId: {
				type: 'string',
				optional: true,
			},
		},
		cacheKeys: ['orgId', 'searchTerm'],
	},
)
