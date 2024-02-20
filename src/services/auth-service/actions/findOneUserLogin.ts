import type { FindOneUserLoginReturn, FindOneUserLoginParams } from 'v1.auth.findOneUserLogin'
import type { AppContextMeta } from '@/common-types'
import { UserLogin } from '@/services/auth-service/models/user-login'

/**
 * Query User from given query
 */
const findOneUserLogin = (ctx: AppContextMeta<FindOneUserLoginParams>): FindOneUserLoginReturn =>
	UserLogin.findOne(ctx.params.query)

export default findOneUserLogin
