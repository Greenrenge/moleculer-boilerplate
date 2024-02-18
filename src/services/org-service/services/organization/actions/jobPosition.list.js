import { JobPosition } from '@org/models/job-position'
import { createPaginate } from './__one-list-count-creator'

export default createPaginate(
	JobPosition,
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
