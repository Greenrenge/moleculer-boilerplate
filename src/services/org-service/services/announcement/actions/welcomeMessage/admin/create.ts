import { Errors } from 'moleculer'
import {
	WelcomeMessageCreateParams,
	WelcomeMessageCreateReturn,
} from 'v1.announcement.welcomeMessage.admin.create'
import { AppContextMeta } from '@/common-types'
import { PermActions, PermSubjects } from '@/constants/business'
import { WelcomeMessage } from '@org/models/event'
import { Organization } from '@org/models/organization'

export default {
	cleanAfter: ['v1.announcement**'],
	cache: {
		ttl: 3, // concurrency control
	},
	permissions: [
		[PermActions.CREATE, PermSubjects.ORG_WELCOME_MSG],
		[PermActions.CREATE, PermSubjects.PUBLIC_METADATA],
	],
	params: {
		topic: {
			type: 'string',
			optional: true,
		},
		desc: 'string',
		start: { type: 'date', convert: true }, // required
		end: { type: 'date', convert: true }, // required
		compileContentId: {
			type: 'string',
			optional: true,
		},
		orgId: {
			type: 'string',
			optional: true,
		},
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(
		ctx: AppContextMeta<WelcomeMessageCreateParams>,
	): Promise<WelcomeMessageCreateReturn> {
		const { orgId: _orgId, topic, desc, start, end, compileContentId } = ctx.params

		if (_orgId) {
			if (!ctx.locals.permission?.can(PermActions.CREATE, PermSubjects.PUBLIC_METADATA))
				throw new Errors.MoleculerClientError('permission_denied')

			if (!(await Organization.findById(_orgId)))
				throw new Errors.MoleculerClientError('org not found')
		}

		if (start?.getTime() >= end?.getTime()) {
			throw new Errors.MoleculerClientError('start must be less than end')
		}

		const { orgId: creatorOrgId, empId } = ctx.meta

		const orgId = _orgId ?? creatorOrgId
		const createdBy = empId
		// @TODO: filter admin of the org / app here

		const doc = await WelcomeMessage.create({
			orgId,
			...(topic && { topic }),
			desc,
			createdBy,
			...(compileContentId && { compileContentId }),
			start,
			end,
		})

		return doc.toJSON()
	},
}
