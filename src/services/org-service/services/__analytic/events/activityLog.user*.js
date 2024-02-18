import { DateTime } from 'luxon'
import { ActivityLog } from '@org/models/activityLog'
import {
	ApplicationActivity,
	APP_ACTIVITY_KIND,
	USER_TYPES,
} from '@org/models/application-activity'
import {
	ApplicationActivityImpression,
	IMPRESSION_KIND,
} from '@org/models/application-activity-impression'
import transaction from '@utils/transaction'

async function handleDailyStats(ctx) {
	const { eventName, payload } = ctx.params

	const now = new Date()
	const today = DateTime.fromJSDate(now).setZone('Asia/Bangkok').startOf('day').toJSDate()

	const createDailyStats = (key) =>
		ActivityLog.findOneAndUpdate(
			{
				date: today,
				key,
				orgId: ctx.meta.orgId ?? 'public', // public is for login event
				empId: ctx.meta.empId ?? ctx.meta.userId, // default is for login event
			},
			{
				date: today,
				key,
				orgId: ctx.meta.orgId ?? 'public', // public is for login event
				empId: ctx.meta.empId ?? ctx.meta.userId, // default is for login event
			},
			{ upsert: true, setDefaultsOnInsert: true, useFindAndModify: false },
		)

	const EVENTS = {
		'answer.list': 'daily_action',
		'post.list': 'daily_action',
		'survey.created': 'daily_action',
		'survey.updated': 'daily_action',
		'survey.deactivated': 'daily_action',
		'survey.text-answer.created': 'daily_action',
		'survey.answer.created': 'daily_action',
		'feedback.created': 'daily_action',
		'friend.created': 'daily_action',
		'profile.updated': 'daily_action',
		login: 'daily_action',
		registered: 'registered',
	}

	// ignores the 360 events
	if (
		['survey.created', 'survey.updated', 'survey.deactivated'].includes(eventName) &&
		['app', 'org'].includes(payload?.ownerType)
	) {
		return undefined
	}

	if (eventName === 'registered') {
		return ActivityLog.create({
			date: now,
			key: EVENTS[eventName],
			orgId: 'public',
		}).then(() => createDailyStats('daily_login'))
	}

	if (EVENTS[eventName]) {
		return createDailyStats(EVENTS[eventName])
	}
	return undefined
}

async function handleApplicationActivity(ctx) {
	const { eventName, payload } = ctx.params
	if (!payload || !eventName) {
		return undefined
	}

	const surveyFormatter = (doc) => ({
		_id: ApplicationActivity.getId({
			orgId: doc.orgId,
			kind: APP_ACTIVITY_KIND.SURVEY,
			originId: doc._id,
		}),
		kind: APP_ACTIVITY_KIND.SURVEY,
		active: eventName === 'survey.deactivated' ? false : !!doc.active,
		totalSent: +(doc.stats?.sent || 0),
		totalResponse: +(doc.stats?.response || 0),
		// engagement
		creatorId: doc.creatorId,
		orgId: doc.orgId,
		from: ['app', 'org'].includes(doc.ownerType) ? USER_TYPES.ORGANIZATION : USER_TYPES.USER,
		originId: doc._id,
		// date: doc.createdAt, // TODO: should be survey.startAt
		date: new Date(doc.startAt), // TODO: should be survey.startAt
	})

	const postFormatter = (doc) => ({
		_id: ApplicationActivity.getId({
			orgId: doc.orgId,
			kind: APP_ACTIVITY_KIND.POST,
			originId: doc._id,
		}),
		kind: APP_ACTIVITY_KIND.POST,
		active: true,
		creatorId: doc.owner,
		orgId: doc.orgId,
		from: USER_TYPES.USER,
		originId: doc._id,
		date: new Date(doc.createdAt),
	})

	const FORMATTER = {
		'survey.created': surveyFormatter,
		'survey.updated': surveyFormatter,
		'survey.deactivated': surveyFormatter,
		'post.created': postFormatter, // after feed post is created from activity service,
	}

	if (FORMATTER[eventName]) {
		const formatted = FORMATTER[eventName](payload)
		return ApplicationActivity.findOneAndUpdate(
			{
				_id: formatted?._id,
			},
			formatted,
			{ upsert: true, setDefaultsOnInsert: true, useFindAndModify: false },
		)
	}

	// update reaction stats
	if (['post.reaction.created', 'survey.reaction.created'].includes(eventName)) {
		return transaction(async (session) => {
			const docInDb = await ApplicationActivity.findOne(
				{
					...(eventName === 'survey.reaction.created' && {
						originId: payload.parent?.refId,
						kind: APP_ACTIVITY_KIND.SURVEY,
					}),
					...(eventName === 'post.reaction.created' && {
						originId: payload.parent?._id,
						kind: APP_ACTIVITY_KIND.POST,
					}),
				},
				null,
				{ session },
			)
			if (docInDb) {
				docInDb.reaction = payload.parent?.stats ?? {}
				docInDb.engagementTotal = +(payload.parent?.stats?.total || 0) + (docInDb.comments || 0)
				await docInDb.save(session)
			}
		})
	}

	// update comment stats
	if (['post.comment.created', 'survey.comment.created'].includes(eventName)) {
		return transaction(async (session) => {
			const docInDb = await ApplicationActivity.findOne(
				{
					...(eventName === 'survey.comment.created' && {
						originId: payload.id,
						kind: APP_ACTIVITY_KIND.SURVEY,
					}),
					...(eventName === 'post.comment.created' && {
						originId: payload.id,
						kind: APP_ACTIVITY_KIND.POST,
					}),
				},
				null,
				{ session },
			)

			if (docInDb) {
				docInDb.comments = payload.total || 0
				docInDb.engagementTotal = +(docInDb.reaction?.total || 0) + (payload.total || 0)
				await docInDb.save(session)
			}
		})
	}

	return undefined
}

/**
 * keep daily scope action of what impression (see), answer , reaction or comment
 * @param {Moleculer.Context} ctx
 * @returns
 */

const impressionDocFormatter = {
	'post.list': function (posts, ctx) {
		return (
			posts?.map((p) => [
				{
					_id: ApplicationActivityImpression.getId({
						userId: ctx.empId ?? ctx.userId,
						orgId: p.orgId,
						kind: IMPRESSION_KIND.IMPRESSION,
						originId: p._id,
						activityOriginKind: APP_ACTIVITY_KIND.POST,
					}),
					kind: IMPRESSION_KIND.IMPRESSION,
					orgId: p.orgId,
					originId: p._id,
					activityOriginKind: APP_ACTIVITY_KIND.POST,
					activityOriginDate: p.createdAt,
					activityOriginFrom: USER_TYPES.USER,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: ctx.empId ?? ctx.userId,
					...(p.contentCategoryId && {
						engagedCategoryId: p.contentCategoryId,
					}),
				},
				{ $inc: { value: 1 } },
			]) ?? []
		)
	},
	'answer.list': function (answers, ctx) {
		return (
			answers?.map((a) => [
				{
					_id: ApplicationActivityImpression.getId({
						userId: a.userId ?? ctx.empId ?? ctx.userId,
						orgId: a.orgId,
						kind: IMPRESSION_KIND.IMPRESSION,
						originId: a.surveyId,
						activityOriginKind: APP_ACTIVITY_KIND.SURVEY,
					}),
					kind: IMPRESSION_KIND.IMPRESSION,
					orgId: a.orgId,
					originId: a.surveyId,
					activityOriginKind: APP_ACTIVITY_KIND.SURVEY,
					activityOriginDate: new Date(a.startAt),
					activityOriginFrom: a.ownerType === 'user' ? USER_TYPES.USER : USER_TYPES.ORGANIZATION,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					...(a.categoryId && { engagedCategoryId: a.categoryId }),
					creatorId: a.userId ?? ctx.empId ?? ctx.userId,
					...(a.answerAt && { answerAt: a.answerAt }),
				},
				{ $inc: { value: 1 } },
			]) ?? []
		)
	},
	'post.reaction.created': function (payload, ctx) {
		const { parent, reaction } = payload ?? {}
		const orgId = parent?.orgId ?? ctx.orgId
		const originId = parent?._id
		const refId = reaction?._id
		const activityOriginKind = APP_ACTIVITY_KIND.POST
		const userId = reaction.userId ?? ctx.empId ?? ctx.userId
		const isIncrementEngagement = !!reaction.reaction // reaction.reaction === '' is unlike

		return [
			[
				{
					_id: ApplicationActivityImpression.getId({
						userId,
						orgId,
						kind: IMPRESSION_KIND.REACTION,
						originId,
						activityOriginKind,
					}),
					kind: IMPRESSION_KIND.REACTION,
					orgId,
					originId,
					refId,
					activityOriginKind,
					activityOriginDate: new Date(parent.createdAt),
					activityOriginFrom: USER_TYPES.USER,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: userId,
					...(parent?.contentCategoryId && {
						engagedCategoryId: parent.contentCategoryId,
					}),
				},
				{ $inc: { value: isIncrementEngagement ? 1 : -1 } },
			],
		]
	},
	'survey.reaction.created': async function (payload, ctx) {
		const { parent, reaction } = payload ?? {}
		const orgId = parent?.orgId ?? ctx.orgId
		const originId = parent?.refId
		const refId = reaction?._id
		const activityOriginKind = APP_ACTIVITY_KIND.SURVEY
		const userId = reaction.userId ?? ctx.empId ?? ctx.userId
		const isIncrementEngagement = !!reaction.reaction // reaction.reaction === '' is unlike

		const survey = await ctx.broker.call(
			'v1.survey.admin.one',
			{ id: originId },
			{
				meta: ctx.meta,
			},
		)

		return [
			[
				{
					_id: ApplicationActivityImpression.getId({
						userId,
						orgId,
						kind: IMPRESSION_KIND.REACTION,
						originId,
						activityOriginKind,
					}),
					kind: IMPRESSION_KIND.REACTION,
					orgId,
					originId,
					refId,
					activityOriginKind,
					activityOriginDate: new Date(survey.startAt),
					activityOriginFrom:
						survey.ownerType === 'user' ? USER_TYPES.USER : USER_TYPES.ORGANIZATION,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: userId,
					...(survey.category && { engagedCategoryId: survey.category }),
				},
				{ $inc: { value: isIncrementEngagement ? 1 : -1 } },
			],
		]
	},
	'post.comment.created': async function (payload, ctx) {
		const { id: postId, comment } = payload ?? {}
		const post = await ctx.broker.call('v1.post.admin.one', { id: postId }, { meta: ctx.meta })

		if (!post) {
			ctx.broker.logger.error(
				`['post.comment.created'] impression doc cannot find the parent post ${postId}`,
			)
			throw new Error('post not found')
		}

		const { orgId, createdAt, contentCategoryId } = post

		const originId = postId
		const refId = comment._id
		const activityOriginKind = APP_ACTIVITY_KIND.POST
		const userId = comment.owner ?? ctx.empId ?? ctx.userId

		return [
			[
				{
					_id: ApplicationActivityImpression.getId({
						userId,
						orgId,
						kind: IMPRESSION_KIND.COMMENT,
						originId,
						activityOriginKind,
					}),
					kind: IMPRESSION_KIND.COMMENT,
					orgId,
					originId,
					refId,
					activityOriginKind,
					activityOriginDate: new Date(createdAt),
					activityOriginFrom: USER_TYPES.USER,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: userId,
					...(contentCategoryId && { engagedCategoryId: contentCategoryId }),
				},
				{ $inc: { value: 1 }, $addToSet: { refIds: refId } },
			],
		]
	},
	'survey.comment.created': async function (payload, ctx) {
		const { id: surveyId, comment } = payload ?? {}
		const survey = await ctx.broker.call(
			'v1.survey.admin.one',
			{ id: surveyId },
			{
				meta: ctx.meta,
			},
		)

		if (!survey) {
			ctx.broker.logger.error(
				`['survey.comment.created'] impression doc cannot find the parent post ${surveyId}`,
			)
			throw new Error('post not found')
		}
		const { orgId, ownerType, startAt, category } = survey

		const originId = surveyId
		const refId = comment._id
		const activityOriginKind = APP_ACTIVITY_KIND.SURVEY
		const userId = comment.owner ?? ctx.empId ?? ctx.userId

		return [
			[
				{
					_id: ApplicationActivityImpression.getId({
						userId,
						orgId,
						kind: IMPRESSION_KIND.COMMENT,
						originId,
						activityOriginKind,
					}),
					kind: IMPRESSION_KIND.COMMENT,
					orgId,
					originId,
					refId,
					activityOriginKind,
					activityOriginDate: new Date(startAt),
					activityOriginFrom: ownerType === 'user' ? USER_TYPES.USER : USER_TYPES.ORGANIZATION,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: userId,
					...(category && { engagedCategoryId: category }),
				},
				{ $inc: { value: 1 }, $addToSet: { refIds: refId } },
			],
		]
	},
	'survey.answer.created': async function (payload, ctx) {
		const { survey, answer } = payload ?? {}

		const { orgId, ownerType, startAt, category } = survey

		const originId = survey._id
		const refId = answer._id
		const activityOriginKind = APP_ACTIVITY_KIND.SURVEY
		const userId = answer.userId ?? ctx.empId ?? ctx.userId

		return [
			[
				{
					_id: ApplicationActivityImpression.getId({
						userId,
						orgId,
						kind: IMPRESSION_KIND.ANSWER,
						originId,
						activityOriginKind,
					}),
					kind: IMPRESSION_KIND.ANSWER,
					orgId,
					originId,
					refId,
					activityOriginKind,
					activityOriginDate: new Date(startAt),
					activityOriginFrom: ownerType === 'user' ? USER_TYPES.USER : USER_TYPES.ORGANIZATION,
					date: DateTime.fromJSDate(new Date()).setZone('Asia/Bangkok').startOf('day'),
					creatorId: userId,
					...(category && { engagedCategoryId: category }),
				},
				{ $inc: { value: 1 } },
			],
		]
	},
	'survey.text-answer.created': function (...args) {
		return this['survey.answer.created'](...args)
	},
}

async function handleDailyImpression(ctx) {
	const { eventName, payload } = ctx.params
	// console.log(`IMPRESSION for ${JSON.stringify({ eventName, payload })}`)
	if (!payload || !eventName) {
		return
	}

	const formatter = impressionDocFormatter[eventName]
	if (!formatter) return

	// [ [doc,updateOb] ]
	const updates = await formatter(payload, ctx)
	// console.log(`GOT ${JSON.stringify(updates)}`)
	await Promise.all(
		updates.map(([doc, updateOb]) =>
			ApplicationActivityImpression.findByIdAndUpdate(
				doc._id,
				{
					...updateOb,
					$set: doc,
				},
				{ upsert: true, setDefaultsOnInsert: true, useFindAndModify: false },
			).catch((err) => {
				// eslint-disable-next-line no-console
				console.error('[ERROR] fail to ApplicationActivityImpression ', err)
			}),
		),
	)
}

export default {
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		await Promise.all([
			handleDailyStats(ctx),
			handleApplicationActivity(ctx),
			handleDailyImpression(ctx),
		])
	},
}
