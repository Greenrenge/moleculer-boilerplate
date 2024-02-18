import type { AppContextMeta } from '@/common-types'
import { UserLogin } from '@/services/auth-service/models/user-login'

interface findOneUserParams {
	// query: { _id: userId }
	query: Parameters<typeof UserLogin.findOne>[0]
}
/**
 * Query User from given query
 */
const findOneUserLogin = (ctx: AppContextMeta<findOneUserParams>) =>
	UserLogin.findOne(ctx.params.query)

export default findOneUserLogin
