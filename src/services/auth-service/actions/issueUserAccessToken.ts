import { packRules } from '@casl/ability/extra'
import type { ServiceBroker } from 'moleculer'
import type {
	IssueUserAccessTokenParams,
	IssueUserAccessTokenReturn,
} from 'v1.auth.issueUserAccessToken'
import type { AppContextMeta } from '@/common-types'
import { ValidationError } from '@/constants/errors'
import { UserLogin } from '@/services/auth-service/models/user-login'
import { issueUserAccessToken } from '../utils/token'

export default {
	params: {
		userId: 'string',
		empId: 'string',
		roleId: {
			type: 'string',
			optional: true,
		},
		permissions: {
			type: 'array',
			optional: true,
			default: [],
		},
		orgId: 'string',
	},
	async handler(
		this: ServiceBroker,
		ctx: AppContextMeta<IssueUserAccessTokenParams>,
	): IssueUserAccessTokenReturn {
		const { empId, orgId, roleId, permissions: _permissions = [] } = ctx.params

		const user = await UserLogin.findById(ctx.params.userId)

		if (!user) {
			throw new ValidationError('USER_NOT_EXIST')
		}

		const permissions = _permissions.length ? packRules(_permissions) : _permissions

		const token = await issueUserAccessToken(user, { empId, orgId, permissions, roleId })
		return token
	},
}
