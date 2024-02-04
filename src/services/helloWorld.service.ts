import type { Context, ServiceSchema } from 'moleculer'

export default {
	name: 'helloworld',
	version: 1,
	actions: {
		hello: {
			rest: {
				method: 'GET',
				path: '/hello',
			},
			async handler(ctx: Context<{ name: string }>) {
				return 'Hello Moleculer'
			},
		},
	},
} as ServiceSchema
