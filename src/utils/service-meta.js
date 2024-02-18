import { PermActions, PermSubjects } from '@/constants/business'

export const serviceMeta = {
	permission: (ctx) => {
		// TODO: change perm for analytic
		const { filter } = ctx.params
		if (
			(filter?.find?.((a) => a.kind === 'public') ||
				filter?.find?.((a) => a.kind === 'org' && a.audienceIds?.length)) &&
			ctx.locals.permission.cannot(PermActions.VIEW, PermSubjects.PUBLIC_USER)
		)
			return false

		return (
			ctx.locals.permission.can(PermActions.VIEW, PermSubjects.ORG_MEMBER) ||
			ctx.locals.permission.can(PermActions.VIEW, PermSubjects.PUBLIC_USER)
		)
	},
	cache: {
		keys: ['filter', 'limit', 'skip', '#orgId', 'start', 'end'],
		ttl: 300, // 5min
	},
	params: {
		filter: {
			type: 'array',
			min: 1,
			optional: true,
			empty: false,
			items: {
				type: 'object',
				props: {
					audienceIds: 'string[]|optional',
					exclusion: 'boolean|optional',
					kind: {
						type: 'string',
						enum: ['public', 'org', 'dept', 'group', 'job_position', 'user', 'friend'],
					},
				},
			},
		},
		start: {
			type: 'date',
			convert: true,
			default: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		},
		end: { type: 'date', convert: true, default: new Date() },
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
	},
}
