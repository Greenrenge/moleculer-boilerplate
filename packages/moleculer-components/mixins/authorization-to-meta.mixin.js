import cookie from 'cookie'

export default (authActionName = 'v1.auth.resolveToken') => ({
  methods: {
    async authenticate(ctx, route, req) {
      // Get JWT token from cookie or Get JWT token from Authorization header
      const parsedCookie = req.headers.cookie && cookie.parse(req.headers.cookie)

      const lang = (parsedCookie && parsedCookie.lang) || req.headers['x-language']
      ctx.meta.lang = lang || 'th'

      ctx.meta.deviceType = req.headers['x-device-type'] || 'unknown'

      const token =
        (parsedCookie && parsedCookie['jwt-token']) ||
        (req.headers.authorization &&
          req.headers.authorization.startsWith('Bearer ') &&
          req.headers.authorization.slice(7))

      if (token) {
        try {
          const {
            _id,
            empId,
            orgId,
            permissions = [],
            roleId,
          } = await ctx.call(authActionName, {
            token,
          })
          if (_id) {
            ctx.meta.token = token
            ctx.meta.userId = _id
            ctx.meta.roleId = roleId
            ctx.meta.empId = empId
            ctx.meta.orgId = orgId
            ctx.meta.permissions = permissions
            return { userId: _id, empId, orgId, lang, roleId } // assigned to ctx.meta.user !! @TODO: should we trust on this fields rather than the {meta:{userId,empId}}
          }
        } catch (err) {
          return null
        }
      }
      return null
    },
  },
})
