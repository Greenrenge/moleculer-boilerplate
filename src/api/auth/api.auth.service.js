/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 */

import pkg from 'moleculer-apollo-server'
import metaAuthMixin from '@pkg/moleculer-components/mixins/meta-auth.mixin'
import { AuthTypeDefs } from './graphql'

const { moleculerGql: gql } = pkg

export default {
	name: 'gateway.auth',
	version: 1,
	settings: {
		graphql: {
			type: AuthTypeDefs,
		},
	},
	mixins: [metaAuthMixin],
	hooks: {
		before: {
			connectSocial: ['checkIsAuthenticated'],
		},
	},
	actions: {
		login: {
			graphql: {
				mutation: gql`
					type Mutation {
						login(email: String!, password: String!): Token
					}
				`,
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				const { email, password } = ctx.params
				return this.broker.call(
					'v1.auth.login',
					{
						email,
						password,
					},
					{ meta: ctx.meta },
				)
			},
		},
		register: {
			graphql: {
				mutation: gql`
					type Mutation {
						register(
							email: String
							password: String
							registerType: RegisterType
							accessToken: String
						): Token
					}
				`,
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call(
					'v1.auth.register',
					{
						...ctx.params,
					},
					{ meta: ctx.meta },
				)
			},
		},
		forgotPassword: {
			graphql: {
				mutation: gql`
					type Mutation {
						forgotPassword(email: String!): Response
					}
				`,
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call('v1.auth.forgotPassword', ctx.params)
			},
		},
		resetPassword: {
			graphql: {
				mutation: gql`
					type Mutation {
						resetPassword(email: String!, code: String!, password: String!): Response
					}
				`,
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call('v1.auth.resetPassword', ctx.params)
			},
		},
		connectSocial: {
			graphql: {
				mutation: gql`
					type Mutation {
						connectSocial(registerType: RegisterType, accessToken: String): User
					}
				`,
			},
			/** @param {Context} ctx */
			handler(ctx) {
				this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
				return this.broker.call(
					'v1.auth.connectSocial',
					{
						...ctx.params,
					},
					{ meta: ctx.meta },
				)
			},
		},
	},
	methods: {},
}
