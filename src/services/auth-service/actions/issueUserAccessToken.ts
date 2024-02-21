import { packRules } from '@casl/ability/extra'
import type { ServiceBroker } from 'moleculer'
import type {
	IssueUserAccessTokenParams,
	IssueUserAccessTokenReturn,
} from 'v1.auth.issueUserAccessToken'
import type { AppContextMeta, MoleculerService } from '@/common-types'
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
	// user for admin imporsonate
	async handler(
		this: MoleculerService,
		ctx: AppContextMeta<IssueUserAccessTokenParams>,
	): Promise<IssueUserAccessTokenReturn> {
		// orgId is the target org
		const { empId, orgId, roleId, permissions: _permissions = [] } = ctx.params

		const login = await UserLogin.findById(ctx.params.userId)

		if (!login) {
			throw new ValidationError('USER_NOT_EXIST')
		}

		const permissions = _permissions.length ? packRules(_permissions) : _permissions

		const token = await issueUserAccessToken(login, { empId, orgId, permissions, roleId })
		return token
	},
}
