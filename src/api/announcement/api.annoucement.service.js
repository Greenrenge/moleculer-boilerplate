import pkg from 'moleculer-apollo-server'
import metaAuthMixin from '@pkg/moleculer-components/mixins/meta-auth.mixin'
import load from '@utils/moduleLoader'
import { OrganizationResolver } from '../__common_resolvers'
import gqlType from './graphql'

const { moleculerGql: gql } = pkg

export const actions = load('actions')

export default {
	name: 'gateway.announcement',
	mixins: [metaAuthMixin],
	version: 1,
	hooks: {
		before: {
			'*': ['checkIsAuthenticated'],
		},
	},
	settings: {
		graphql: {
			type: gqlType,
			resolvers: {
				WelcomeMessage: {
					organization: OrganizationResolver,
				},
			},
		},
	},
	actions: {
		welcomeMessage: {
			graphql: {
				query: gql`
					"""
					get current welcome message
					"""
					type Query {
						welcomeMessage: WelcomeMessage
					}
				`,
			},
			restricted: true,
			/**
			 * @param @param {import('moleculer').Context} ctx
			 */
			async handler(ctx) {
				return ctx.broker.call(
					'v1.announcement.welcomeMessage.one',
					{},
					{
						meta: ctx.meta,
					},
				)
			},
		},
	},
}
