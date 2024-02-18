import { Errors } from 'moleculer'

export default {
	methods: {
		checkIsAuthenticated(ctx) {
			if (!ctx.meta.userId) {
				throw new Errors.MoleculerClientError('Unauthorized', 401, 'unauthorized')
			}
		},
	},
}
