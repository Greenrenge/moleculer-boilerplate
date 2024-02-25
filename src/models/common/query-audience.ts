import flattenDeep from 'lodash/flattenDeep'
import { mongo } from 'mongoose'
import { AppContextMeta } from '@/common-types'

const { ObjectId } = mongo

interface Audience {
	kind: string
	audienceIds: string[]
	exclusion?: boolean
}

export const getQuery = async ({
	audiences = [],
	ctx,
	defaultOrgId,
}: {
	audiences?: Audience[]
	ctx: AppContextMeta
	defaultOrgId: string // Replace with the actual type
}) => {
	// stream user for create answer
	const included = audiences.filter((a) => !a.exclusion)
	const excluded = audiences.filter((a) => !!a.exclusion)

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
	const userIds = flattenDeep(excluded.filter((e) => e.kind === 'user').map((e) => e.audienceIds))

	const jobIds = flattenDeep(
		excluded.filter((e) => e.kind === 'job_position').map((e) => e.audienceIds),
	)
	const excludeQuery: any = {
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
					: kind === 'public'
						? {
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
							: kind === 'group'
								? { ...excludeQuery, _id: { $in: groupMemberIds } }
								: undefined
	})
}
