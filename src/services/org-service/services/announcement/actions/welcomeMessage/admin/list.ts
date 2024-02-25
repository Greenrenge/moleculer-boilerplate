import { Errors } from 'moleculer'
import {
	WelcomeMessageListParams,
	WelcomeMessageListReturn,
} from 'v1.announcement.welcomeMessage.admin.list'
import { AppContextMeta } from '@/common-types'
import { PermActions, PermSubjects } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'
import { Organization } from '@org/models/organization'

export default {
	cache: {
		ttl: 5 * 60, // 5 min
		keys: ['orgId', 'limit', 'skip', 'start', 'end', '#orgId'],
	},
	permissions: [
		[PermActions.VIEW, PermSubjects.ORG_WELCOME_MSG],
		[PermActions.VIEW, PermSubjects.PUBLIC_METADATA],
	],
	params: {
		limit: { type: 'number', optional: true, default: 10 },
		skip: { type: 'number', optional: true, default: 0 },
		orgId: { type: 'string', optional: true },
		start: { type: 'date', convert: true, optional: true },
		end: { type: 'date', convert: true, optional: true },
	},
	async handler(ctx: AppContextMeta<WelcomeMessageListParams>): Promise<WelcomeMessageListReturn> {
		const { limit, skip, start, end, orgId: _orgId } = ctx.params

		if (_orgId) {
			if (!(await Organization.findById(_orgId)))
				throw new Errors.MoleculerClientError('org not found')
		}

		if (start && end && start.getTime() >= end.getTime()) {
			throw new Errors.MoleculerClientError('start must be less than end')
		}

		const { orgId: creatorOrgId, empId } = ctx.meta

		const orgId = _orgId ?? creatorOrgId

		const query = {
			orgId,
			...(start && { start: { $gte: start } }),
			...(end && { end: { $lt: end } }),
		}

		return WelcomeMessage.paginate(query, {
			skip,
			limit,
			sort: { createdAt: -1 },
		})
	},
}
