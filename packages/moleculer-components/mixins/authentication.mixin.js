import fromPairs from 'lodash/fromPairs.js'

export default (...paths) => ({
	hooks: {
		before: {
			...(paths.length
				? fromPairs(paths.map((p) => [p, ['authorizationUser']]))
				: { '*': ['authorizationUser'] }),
		},
	},
	methods: {
		authorizationUser(ctx) {
			if (!ctx.meta.userId) throw new Error('AUTHENTICATION_REQUIRED')
		},
	},
})
