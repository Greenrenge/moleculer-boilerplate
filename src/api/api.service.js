import fs from 'fs'
import { Kind } from 'graphql'
import GraphQLJSON from 'graphql-type-json'
import moleculerApolloServer from 'moleculer-apollo-server'
import ApiGateway from 'moleculer-web'
import config from '@/config'
import { SURVEY_KINDS } from '@/constants/business'
import AuthorizationToMeta from '@pkg/moleculer-components/mixins/authorization-to-meta.mixin'

const { ApolloService, GraphQLUpload, moleculerGql: gql } = moleculerApolloServer

const { moleculer } = config

const typeDefs = gql`
	scalar Date
	scalar Timestamp
	scalar JSON
	scalar Upload

	type Pagination {
		total: Int
		skip: Int
		limit: Int
	}

	type Response {
		message: String
	}
`

/** @type {import('moleculer').ServiceSchema} graphql service */
const api = {
	name: 'api',
	mixins: [
		ApiGateway,
		ApolloService({
			// Global GraphQL typeDefs
			typeDefs,
			// Global resolvers
			resolvers: {
				Upload: GraphQLUpload,
				// ActivityOrigin: {
				// 	__resolveType(obj, context, info) {
				// 		if (obj.kind === 'feedback_personal') {
				// 			return 'PersonalFeedback'
				// 		}
				// 		if (obj.kind === 'feedback_to_colleague') {
				// 			return 'ColleagueFeedback'
				// 		}
				// 		if (obj.kind === 'feedback_to_org') {
				// 			return 'OrganizationFeedback'
				// 		}
				// 		if (obj.kind === 'request_to_feedback') {
				// 			return 'RequestFeedback'
				// 		}
				// 		if (obj.kind === 'request_evaluate_feedback') {
				// 			return 'RequestEvaluateFeedback'
				// 		}
				// 		if (obj.kind === 'request_evaluate_skillset') {
				// 			return 'RequestEvaluateSkillSet'
				// 		}
				// 		// if (obj.kind === 'share_evaluate_skillset') {
				// 		//   return ''
				// 		// }
				// 		if (obj.friendshipStatus) {
				// 			return 'Friendship'
				// 		}
				// 		if (Object.values(SURVEY_KINDS).includes(obj.kind)) {
				// 			return 'Survey'
				// 		}
				// 		if (obj.kind === 'recommend_video') {
				// 			return 'Video'
				// 		}
				// 		return null // GraphQLError is thrown
				// 	},
				// },
				// RecommendOrigin: {
				// 	__resolveType(obj, context, info) {
				// 		if (obj.kind === 'course') {
				// 			return 'CourseRecommends'
				// 		}
				// 		return null // GraphQLError is thrown
				// 	},
				// },
				// Feedback: {
				// 	__resolveType(obj, context, info) {
				// 		if (obj.kind === 'feedback_personal') {
				// 			return 'PersonalFeedback'
				// 		}
				// 		if (obj.kind === 'feedback_to_colleague') {
				// 			return 'ColleagueFeedback'
				// 		}
				// 		if (obj.kind === 'feedback_to_org') {
				// 			return 'OrganizationFeedback'
				// 		}
				// 		if (obj.kind === 'feedback_to_request') {
				// 			return 'AnswerFeedback'
				// 		}
				// 		if (obj.kind === 'request_to_feedback') {
				// 			return 'RequestFeedback'
				// 		}
				// 		return null // GraphQLError is thrown
				// 	},
				// },
				JSON: GraphQLJSON,
				Date: {
					__parseValue(value) {
						return new Date(value) // value from the client
					},
					__serialize(value) {
						return new Date(value) //  value sent to the client
					},
					__parseLiteral(ast) {
						if (ast.kind === Kind.INT) {
							return parseInt(ast.value, 10) // ast value is always in string format
						}

						return null
					},
				},
				Timestamp: {
					__parseValue(value) {
						return new Date(value) // value from the client
					},
					__serialize(value) {
						return new Date(value).toISOString() // value sent to the client
					},
					__parseLiteral(ast) {
						if (ast.kind === Kind.INT) {
							return parseInt(ast.value, 10) // ast value is always in string format
						}

						return null
					},
				},
				// SurveyUser: {
				// 	__resolveType(obj, context, info) {
				// 		if (obj.orgId) {
				// 			return 'User'
				// 		}
				// 		return 'Organization'
				// 	},
				// },
			},
			// API Gateway route options
			routeOptions: {
				path: '/graphql',
				authentication: true,
				// authorization: true,
				cors: true,
				mappingPolicy: 'restrict',
			},
			// serverOptions: {
			// },
		}),
		AuthorizationToMeta(),
	],
	settings: {
		port: moleculer.apiPort,
		routes: [
			{
				path: '/api',
				whitelist: ['$node.services', '$node.actions', 'api.options', '$node.list'],
				aliases: {
					'GET /nodes/services': '$node.services',
					'GET /nodes/actions': '$node.actions',
					'GET /nodes/options': 'api.options',
					'GET /nodes/list': '$node.list',
				},
				mappingPolicy: 'restrict',
			},
		],
		assets: {
			folder: './src/api/public',
			options: {},
		},
	},
	actions: {
		options: ({ broker }) => {
			const { options } = broker
			return {
				...options,
				...(options?.transporter && {
					transporter: options?.transporter?.startsWith('nats://') ? 'nats' : false,
				}),
				...(options?.cacher && { cacher: options?.cacher?.type || false }),
			}
		},
	},
	events: {
		'graphql.schema.updated': function ({ schema }) {
			// this.logger.info(`Generated GraphQL schema:\n\n${schema}`)
			this.logger.info('GraphQL Schema is Generated')
			fs.writeFileSync('./schema.gql', schema, 'utf8')
		},
	},
}

export default api
