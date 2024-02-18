import flattenDeep from 'lodash/flattenDeep'
import { mongo } from 'mongoose'

const { ObjectId } = mongo

export const getQuery = async ({ audiences = [], ctx, defaultOrgId }) => {
	// stream user for create answer
	const included = audiences.filter((a) => !a.exclusion)
	const excluded = audiences.filter((a) => !!a.exclusion)
	const friendIds = audiences.some((a) => a.kind === 'friend')
		? await ctx.broker.call(
				'v1.organization.friendship.list',
				{
					type: 'all',
					status: 'accepted',
					id: ctx.meta.empId,
					mapOnlyId: true,
				},
				{ meta: ctx.meta },
			)
		: []
	const groupMemberIds = audiences.some((a) => a.kind === 'group')
		? await ctx.broker.call(
				'v1.group.member.getMembersByGroupIds',
				{
					groupIds: flattenDeep(
						included.filter((e) => e.kind === 'group').map((e) => e.audienceIds),
					),
					mapOnlyId: true,
				},
				{ meta: ctx.meta },
			)
		: []
	// exclusion
	const orgIds = flattenDeep(
		excluded.filter((e) => e.kind === 'org').map((e) => e.audienceIds), // cannot exclude self org
	)
	const deptIds = flattenDeep(excluded.filter((e) => e.kind === 'dept').map((e) => e.audienceIds))
	let userIds = flattenDeep(excluded.filter((e) => e.kind === 'user').map((e) => e.audienceIds))

	const excludeFriend = excluded.filter((e) => e.kind === 'friend')
	if (excludeFriend.length) {
		userIds = userIds.concat(friendIds)
	}

	const jobIds = flattenDeep(
		excluded.filter((e) => e.kind === 'job_position').map((e) => e.audienceIds),
	)
	const excludeQuery = {
		...(orgIds.length && { orgId: { $nin: orgIds } }),
		...(deptIds.length && {
			deptId: { $nin: deptIds.map((d) => new ObjectId(d)) },
		}),
		...(userIds.length && { _id: { $nin: userIds } }),
		...(jobIds.length && {
			jobId: { $nin: jobIds.map((j) => new ObjectId(j)) },
		}),
	}

	return included.map((audience) => {
		const { kind, audienceIds } = audience
		return kind === 'org' && !orgIds?.includes(audienceIds[0])
			? {
					...excludeQuery,
					orgId: audienceIds[0] || defaultOrgId,
				}
			: kind === 'user' && audienceIds?.length
				? { ...excludeQuery, _id: { $in: audienceIds, ...excludeQuery._id } }
				: kind === 'dept'
					? {
							...excludeQuery,
							deptId: {
								$in: audienceIds.map((d) => new ObjectId(d)),
								...excludeQuery.deptId,
							},
						}
					: kind === 'public' // MEANS EVERY ONE FOR NOW, SINCE IF WE TRY TO LET THEM ONCE ACROSS MULTIPLE PROFILE --> it hard to filter history and hard to filter pending
						? // ? { orgId: 'public' } // connected user will found public also (think about showing since history / friend result cannot shown)
							{
								...excludeQuery,
							}
						: kind === 'job_position'
							? {
									...excludeQuery,
									jobId: {
										$in: audienceIds.map((j) => new ObjectId(j)),
										...excludeQuery.jobId,
									},
								}
							: kind === 'friend'
								? { ...excludeQuery, _id: { $in: friendIds, ...excludeQuery._id } }
								: kind === 'group'
									? { ...excludeQuery, _id: { $in: groupMemberIds } }
									: undefined
	})
}
