import { ActionSchema, Context } from 'moleculer'

export default {
	cache: false,
	params: {
		a: 'number',
		b: 'number',
	},
	async handler(ctx: Context<{ a: number; b: number }>) {
		return ctx.params.a + ctx.params.b
	},
} as ActionSchema
