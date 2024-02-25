/* eslint-disable no-console */
import { PureAbility } from '@casl/ability'
import { unpackRules } from '@casl/ability/extra'
import _ from 'lodash'

const { isFunction, isArray, isString, isPlainObject } = _

/*
permission: (can,cannot)=>can('create','role)
 permission: [
    ['create','role',]  // OR
    ['update', 'role'],
  ],

   permission: [
     'create','role'
  ],
*/

const isActionPair = (item) => isArray(item) && item.length === 2 && item.every((a) => isString(a))

const createPermissionChecker = (ctx, ability) => {
	function checker(item) {
		if (isFunction(item)) return item(ctx, ability.can.bind(ability), ability.cannot.bind(ability))

		if (isActionPair(item)) {
			return ability.can(item[0], item[1])
		}

		if (isPlainObject(item)) {
			const requireAnyPermissions = item._permissions
			// require permissions
			if (requireAnyPermissions) {
				if (
					!checker(requireAnyPermissions) && // root level
					!(isArray(requireAnyPermissions) && requireAnyPermissions.some(checker)) // array level
				)
					return false
			}

			return Object.entries(item)
				.filter(([k, v]) => k !== '_permissions' && isString(v))
				.every(([k, v]) => {
					if (ctx.params[k] /* || ctx.params[k] === false */) {
						// aim to filter orgId ... only not boolean
						// has params value
						const metaValue = ctx.meta[v.startsWith('#') ? v.replace('#', '') : v]
						return metaValue === ctx.params[k] // if equal
					}
					return false // no params sent in
				})
		}

		return false
	}

	return checker
}

export default {
	name: 'permission-middleware',
	localAction(handler, action) {
		const fetchPermission = action.fetchPermission || action.fetchPermissions
		const permissions = action.permission || action.permissions
		if (fetchPermission || permissions) {
			return async function (ctx) {
				const ability = new PureAbility(
					ctx.meta.permissions ? unpackRules(ctx.meta.permissions) : [],
				)

				ctx.locals.permission = ability

				if (permissions) {
					const permissionChecker = createPermissionChecker(ctx, ability)
					const hasPermissionInFirstLevel = permissionChecker(permissions)
					const hasPermissionInSecondLevel =
						isArray(permissions) && permissions.some((p) => permissionChecker(p))

					if (!hasPermissionInFirstLevel && !hasPermissionInSecondLevel)
						throw new Error('permission_denied')
				}

				const res = await handler(ctx)
				return res
				// eslint-disable-next-line no-extra-bind
			}.bind(this)
		}
		// Return original handler, because feature is disabled
		return handler
	},
	localEvent(handler, event) {
		const fetchPermission = event.fetchPermission || event.fetchPermissions
		const permissions = event.permission || event.permissions
		if (fetchPermission || permissions) {
			return async function (ctx) {
				const ability = new PureAbility(
					ctx.meta.permissions ? unpackRules(ctx.meta.permissions) : [],
				)

				ctx.locals.permission = ability

				if (permissions) {
					const permissionChecker = createPermissionChecker(ctx, ability)
					const hasPermissionInFirstLevel = permissionChecker(permissions)
					const hasPermissionInSecondLevel =
						isArray(permissions) && permissions.some((p) => permissionChecker(p))

					if (!hasPermissionInFirstLevel && !hasPermissionInSecondLevel)
						throw new Error('permission_denied')
				}

				const res = await handler(ctx)
				return res
				// eslint-disable-next-line no-extra-bind
			}.bind(this)
		}
		// Return original handler, because feature is disabled
		return handler
	},
}
