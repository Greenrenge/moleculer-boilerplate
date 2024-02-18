import _ from 'lodash'
import { Errors } from 'moleculer'
import pkg from 'moleculer-apollo-server'
import metaAuthMixin from '@pkg/moleculer-components/mixins/meta-auth.mixin'
import {
	createUserResolver,
	DepartmentResolver,
	JobPositionResolver,
	OrganizationResolver,
	RoleResolver,
} from '../__common_resolvers'
import { overrideEmployeeProfile } from './__override-profile'
import { type as gqlType } from './graphql'
// import { MOBILE_APP_PERMISSIONS } from '@/constants/business.js'

const { moleculerGql: gql } = pkg

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 */
const mixBooleanNumberOptional = {
	type: 'multi',
	rules: [{ type: 'boolean' }, { type: 'number' }],
	optional: true,
}

export default {
	name: 'gateway.profile',
	version: 1,
	mixins: [metaAuthMixin],
	settings: {
		graphql: {
			type: gqlType,
			resolvers: {
				User: {
					// EMPLOYEE
					organization: OrganizationResolver,
					department: DepartmentResolver,
					jobPosition: JobPositionResolver,
					role: RoleResolver,
					supervisor: createUserResolver('reportTo'),
					underling: {
						action: 'v1.gateway.organization.underling',
						nullIfError: true,
						rootParams: {
							id: 'id',
						},
					},
					isCurrentProfile: {
						action: 'v1.gateway.profile.isCurrentProfile',
						nullIfError: true,
						rootParams: {
							id: 'id',
						},
					},
				},
			},
		},
	},
	hooks: {
		before: {
			'*': ['checkIsAuthenticated'],
		},
	},
	actions: {
		me: {
			graphql: {
				query: gql`
					type Query {
						me: User
					}
				`,
			},
			restricted: true,
			async handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				const { empId } = ctx.meta
				const orgProfile = await ctx.broker.call(
					'v1.organization.employee.one',
					{
						id: empId,
					},
					{
						meta: { ...ctx.meta, $cache: false },
					},
				)
				return {
					...orgProfile,
					...(await ctx.broker.call('v1.gateway.profile.getUserIntegration', null, {
						meta: ctx.meta,
					})),
				}
			},
		},
		getUserIntegration: {
			graphql: {
				query: gql`
					type Query {
						getUserIntegration: UserIntegration
					}
				`,
			},
			restricted: true,
			/** @param {Context} ctx */
			async handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				const { userId } = ctx.meta
				const login = await ctx.broker.call(
					'v1.auth.findOneUserLogin',
					{
						query: { _id: userId },
					},
					{
						meta: ctx.meta,
					},
				)
				return {
					integration: login?.integration || {},
				}
			},
		},
		changePassword: {
			graphql: {
				mutation: gql`
					type Mutation {
						changePassword(oldPassword: String!, newPassword: String!): User
					}
				`,
			},
			restricted: true,
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call('v1.auth.changePassword', ctx.params, {
					meta: {
						userId: ctx.meta.userId,
					},
				})
			},
		},
		updateProfile: {
			graphql: {
				mutation: gql`
					type Mutation {
						updateProfile(
							firstName: String
							lastName: String
							image: String
							gender: Gender
							phoneNumber: String
							dateOfBirth: String
							language: String
							jobId: String
						): User
					}
				`,
			},
			restricted: true,
			/** @param {Context} ctx */
			async handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return ctx.broker.call('v1.user.profile.update', ctx.params, {
					meta: ctx.meta,
				})
			},
		},
		listProfile: {
			graphql: {
				query: gql`
					type Query {
						listProfile: [User!]!
					}
				`,
			},
			restricted: true,
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return ctx.broker.call(
					'v1.organization.employee.listProfile',
					{},
					{
						meta: ctx.meta,
					},
				)
			},
		},
		selectProfile: {
			graphql: {
				mutation: gql`
					type Mutation {
						selectProfile(empId: String): Token
					}
				`,
			},
			restricted: true,
			params: {
				empId: 'string',
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call('v1.user.profile.selectProfile', ctx.params, {
					meta: ctx.meta,
				})
			},
		},

		userMany: {
			graphql: {
				query: gql`
					type Query {
						userMany(ids: [ID!]!): [User]
					}
				`,
			},
			params: {
				ids: { type: 'array', items: 'string' },
			},
			/** @param {Context} ctx */
			handler(ctx) {
				const { ids } = ctx.params
				return Promise.all(
					ids.map((id) =>
						ctx.broker.call('v1.gateway.profile.userOne', { id }, { meta: ctx.meta }),
					),
				)
			},
		},

		isCurrentProfile: {
			params: {
				id: 'string',
			},
			/** @param {Context} ctx */
			handler(ctx) {
				const { empId } = ctx.meta
				return ctx.params.id === empId
			},
		},
	},
	methods: {},
}
