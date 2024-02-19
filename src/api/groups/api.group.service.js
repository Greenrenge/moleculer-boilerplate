import { Errors } from 'moleculer'
import pkg from 'moleculer-apollo-server'
import metaAuthMixin from '@pkg/moleculer-components/mixins/meta-auth.mixin'
import { GroupDefs } from './graphql/index'

const { moleculerGql: gql } = pkg

export default {
	name: 'gateway.groups',
	version: 1,
	mixins: [metaAuthMixin],
	hooks: {
		before: {
			'*': ['checkIsAuthenticated'],
		},
	},
	settings: {
		graphql: {
			type: GroupDefs,
			resolvers: {
				Group: {
					members: {
						action: 'v1.gateway.groups.resolveUsers',
						nullIfError: true,
						rootParams: {
							id: 'groupId',
						},
					},
				},
			},
		},
	},
	actions: {
		list: {
			params: {
				limit: { type: 'number', optional: true, default: 10 },
				skip: { type: 'number', optional: true, default: 0 },
				searchTerm: { type: 'string', optional: true },
			},
			graphql: {
				query: gql`
					type Query {
						groups(limit: Int, skip: Int, searchTerm: String): GroupPagination
					}
				`,
			},
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				return ctx.broker.call('v1.group.listGroupUser', ctx.params, {
					meta: ctx.meta,
				})
			},
		},
		create: {
			graphql: {
				mutation: gql`
					type Mutation {
						createGroup(
							name: String!
							desc: String
							type: GroupType
							members: [GroupMemberInput]
						): Group
					}
				`,
			},
			params: {
				name: { type: 'string' },
				desc: { type: 'string', optional: true },
				type: { type: 'enum', values: ['private', 'public'], optional: true },
				members: { type: 'array', optional: true, default: [] },
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				return ctx.broker.call('v1.group.create', ctx.params, {
					meta: {
						...ctx.meta,
					},
				})
			},
		},
		removeOne: {
			graphql: {
				mutation: gql`
					type Mutation {
						removeGroup(id: String!): Response
					}
				`,
			},
			params: {
				id: 'string',
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				const { id } = ctx.params
				const res = await ctx.broker.call(
					'v1.group.remove',
					{ id },
					{
						meta: ctx.meta,
					},
				)
				return { message: res }
			},
		},
		listMember: {
			graphql: {
				query: gql`
					type Query {
						groupMembers(limit: Int, skip: Int, groupId: ID!): UserPagination
					}
				`,
			},
			params: {
				groupId: { type: 'string' },
				limit: { type: 'number', optional: true, default: 10 },
				skip: { type: 'number', optional: true, default: 0 },
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				return ctx.broker.call('v1.gateway.groups.resolveUsers', ctx.params, {
					meta: ctx.meta,
				})
			},
		},
		addMembers: {
			graphql: {
				mutation: gql`
					type Mutation {
						addMembers(members: [GroupMemberInput]!, groupId: ID!): UserPagination
					}
				`,
			},
			params: {
				groupId: { type: 'string' },
				members: {
					type: 'array',
					items: {
						type: 'object',
						props: {
							empId: { type: 'string' },
						},
					},
					optional: true,
				},
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				await ctx.broker.call('v1.group.member.add', ctx.params, {
					meta: ctx.meta,
				})
				return ctx.broker.call(
					'v1.gateway.groups.resolveUsers',
					{ groupId: ctx.params.groupId },
					{
						meta: ctx.meta,
					},
				)
			},
		},
		removeMember: {
			graphql: {
				mutation: gql`
					type Mutation {
						removeMember(groupId: ID!, empId: String!): Response
					}
				`,
			},
			params: {
				groupId: { type: 'string' },
				empId: { type: 'string' },
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				const res = await ctx.broker.call('v1.group.member.remove', ctx.params, {
					meta: ctx.meta,
				})
				return { message: res }
			},
		},
		updateGroup: {
			graphql: {
				mutation: gql`
					type Mutation {
						updateGroup(groupId: ID!, name: String!, desc: String): Group
					}
				`,
			},
			handler(ctx) {
				return ctx.broker.call('v1.group.update', ctx.params, {
					meta: ctx.meta,
				})
			},
		},
		uploadGroupImage: {
			// example:
			// curl localhost:3000/graphql \
			// -F operations='{ "query": "mutation ($file: Upload!, $groupId: ID!) { uploadGroupImage(file: $file, groupId: $groupId) { id image } }", "variables": { "file": null, "groupId": "id" } }' \
			// -F map='{ "0": ["variables.file"] }' \
			// -F 0=@logo363.png
			hooks: {
				before(ctx) {
					if (
						!ctx.meta?.$fileInfo.mimetype.match(/(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|svg|svg\+xml)$/)
					) {
						throw new Errors.ValidationError('Only image files are allowed!')
					}
				},
			},
			graphql: {
				mutation: gql`
					type Mutation {
						uploadGroupImage(file: Upload!, groupId: ID!): Group
					}
				`,
				fileUploadArg: 'file',
			},
			async handler(ctx) {
				const { orgId } = ctx.meta
				const groupId = ctx.meta.$args?.groupId
				const objectKey = `profile/organization/${orgId}/group/${groupId}`
				await ctx.broker.call('v1.upload.singleFileUploadStream', ctx.params, {
					meta: {
						...ctx.meta,
						objectKey,
					},
				})
				return ctx.broker.call(
					'v1.group.update',
					{
						image: objectKey,
						groupId,
					},
					{
						meta: ctx.meta,
					},
				)
			},
		},
		resolveUsers: {
			params: {
				groupId: 'string',
				limit: { type: 'number', optional: true },
				skip: { type: 'number', optional: true },
			},
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, {
					params: ctx.params,
				})
				const { groupId, limit, skip } = ctx.params
				const groupMembers = await ctx.broker.call(
					'v1.group.member.list',
					{
						groupId,
						limit,
						skip,
					},
					{
						meta: ctx.meta,
					},
				)
				const members = await ctx.broker.call(
					'v1.gateway.profile.userMany',
					{
						ids: groupMembers?.items.map((u) => u.empId),
					},
					{
						meta: ctx.meta,
					},
				)
				return {
					items: members,
					pagination: groupMembers.pagination,
				}
			},
		},
		group: {
			graphql: {
				query: gql`
					"""
					Get the group by id
					"""
					type Query {
						group(id: ID!): Group
					}
				`,
			},
			restricted: true,
			async handler(ctx) {
				const video = await ctx.broker.call('v1.group.one', ctx.params, {
					meta: ctx.meta,
				})
				return video
			},
		},
	},
	methods: {},
}
