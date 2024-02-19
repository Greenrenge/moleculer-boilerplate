import pkg from 'moleculer-apollo-server'
import metaAuthMixin from '@pkg/moleculer-components/mixins/meta-auth.mixin'
import load from '@utils/moduleLoader'
import gqlType from './graphql/index'

const { moleculerGql: gql } = pkg

export const actions = load('actions')

export default {
	name: 'gateway.organization', // merge identity and find people according to the access_token
	mixins: [metaAuthMixin],
	version: 1,
	settings: {
		graphql: {
			type: gqlType,
			resolvers: {
				Organization: {
					displayName: {
						action: 'v1.gateway.organization.displayName',
						nullIfError: true,
						rootParams: {
							name: 'displayName',
						},
					},
					members: {
						action: 'v1.gateway.organization.convertPagination',
						params: {
							actionName: 'v1.organization.employee',
						},
						nullIfError: true,
						rootParams: {
							id: 'orgId',
						},
					},
					departments: {
						action: 'v1.organization.department.list',
						nullIfError: true,
						rootParams: {
							id: 'orgId',
						},
					},
					jobPositions: {
						action: 'v1.organization.jobPosition.list',
						nullIfError: true,
						rootParams: {
							id: 'orgId',
						},
					},
					roles: {
						action: 'v1.gateway.organization.convertPagination',
						params: {
							actionName: 'v1.organization.role',
						},
						nullIfError: true,
						rootParams: {
							id: 'orgId',
						},
					},
				},
				Department: {
					members: {
						action: 'v1.gateway.organization.convertPagination',
						nullIfError: true,
						params: {
							actionName: 'v1.organization.employee',
						},
						rootParams: {
							id: 'deptId',
							orgId: 'orgId',
						},
					},
				},
				JobPosition: {
					members: {
						action: 'v1.gateway.organization.convertPagination',
						nullIfError: true,
						params: {
							actionName: 'v1.organization.employee',
						},
						rootParams: {
							id: 'jobId',
							orgId: 'orgId',
						},
					},
				},
				Role: {
					permissions: {
						action: 'v1.gatewayAdmin.permission.readRolePermission',
						// nullIfError: true,
						rootParams: { id: 'id' },
					},
				},
			},
		},
	},
	actions: {
		displayName: (ctx) => ctx.params.displayName,
		organizationProfileCheck: {
			graphql: {
				mutation: gql`
					type Mutation {
						organizationProfileCheck(privateCode: String!): User
					}
				`,
			},
			params: { privateCode: 'string' },
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				const { privateCode } = ctx.params
				return ctx.broker.call(
					'v1.organization.employee.connect.validate',
					{
						privateCode,
					},
					{
						meta: ctx.meta,
					},
				)
			},
		},
		organizationProfileConnect: {
			graphql: {
				mutation: gql`
					type Mutation {
						organizationProfileConnect(privateCode: String!): EmployeeConnectResult
					}
				`,
			},
			params: { privateCode: 'string' },
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				const { privateCode } = ctx.params
				const employee = await ctx.broker.call(
					'v1.organization.employee.connect',
					{
						privateCode,
					},
					{
						meta: ctx.meta,
					},
				)
				if (!employee) return null

				const token = await ctx.broker.call(
					'v1.gateway.profile.selectProfile',
					{ empId: employee.id },
					{ meta: ctx.meta },
				)

				return {
					profile: employee,
					token,
				}
			},
		},
		organizationProfileCancel: {
			graphql: {
				mutation: gql`
					type Mutation {
						organizationProfileCancel(privateCode: String!): User
					}
				`,
			},
			params: { email: 'email', privateCode: 'string' },
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				const { privateCode } = ctx.params
				return ctx.broker.call(
					'v1.organization.employee.connect.cancel',
					{
						privateCode,
					},
					{
						meta: ctx.meta,
					},
				)
			},
		},
		convertPagination: {
			params: {
				actionName: 'string',
				orgId: 'string',
				jobId: 'string|optional',
				searchTerm: {
					type: 'string',
					optional: true,
					min: 3,
				},
				deptId: {
					type: 'string',
					optional: true,
				},
				limit: { type: 'number', optional: true },
				skip: { type: 'number', optional: true },
			},
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				const { deptId, orgId, actionName, limit, skip, jobId, searchTerm } = ctx.params

				const [items, count] = await Promise.all([
					ctx.broker.call(
						`${actionName}.list`,
						{
							orgId,
							...(deptId && { deptId }),
							...(jobId && { jobId }),
							...(searchTerm && { searchTerm }),
							limit,
							skip,
						},
						{
							meta: ctx.meta,
						},
					),
					ctx.broker.call(
						`${actionName}.count`,
						{
							orgId,
							...(deptId && { deptId }),
							...(jobId && { jobId }),
						},
						{
							meta: ctx.meta,
						},
					),
				])

				return {
					items,
					pagination: {
						total: count,
						limit: limit ?? items.length,
						skip: skip ?? 0,
					},
				}
			},
		},
		jobPositions: {
			graphql: {
				query: gql`
					type Query {
						jobPositions(limit: Int, skip: Int, searchTerm: String): JobPositionPagination
					}
				`,
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				return ctx.broker.call(
					'v1.organization.jobPosition.list',
					{ ...ctx.params, orgId: ctx.meta.orgId },
					{
						meta: ctx.meta,
					},
				)
			},
		},
		departments: {
			graphql: {
				query: gql`
					type Query {
						departments(limit: Int, skip: Int, searchTerm: String): DepartmentPagination
					}
				`,
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			handler(ctx) {
				return ctx.broker.call(
					'v1.organization.department.list',
					{ ...ctx.params, orgId: ctx.meta.orgId },
					{
						meta: ctx.meta,
					},
				)
			},
		},
		underling: {
			params: {
				id: 'string', // root id
				deptId: 'string|optional',
			},
			/** @param {Context} ctx */
			async handler(ctx) {
				const children = await ctx.broker.call(
					'v1.organization.employee.team.children',
					{
						id: ctx.params.id,
					},
					{ meta: ctx.meta },
				)
				const items = (children ?? []).filter(
					(c) => !ctx.params.depId || c.deptId?.toString() === ctx.params.deptId?.toString(),
				)
				return {
					items,
					pagination: {
						total: items.length,
						limit: items.length,
						skip: 0,
					},
				}
			},
		},
		// publicOrganization: {
		// 	graphql: {
		// 		query: gql`
		// 			type Query {
		// 				publicOrganization: Organization
		// 			}
		// 		`,
		// 	},
		// 	restricted: true,
		// 	/**
		// 	 * @param @param {import('moleculer').Context} ctx
		// 	 */
		// 	handler(ctx) {
		// 		return ctx.broker.call(
		// 			'v1.organization.organization.one',
		// 			{ id: 'public' },
		// 			{
		// 				meta: ctx.meta,
		// 			},
		// 		)
		// 	},
		// },
	},
}
