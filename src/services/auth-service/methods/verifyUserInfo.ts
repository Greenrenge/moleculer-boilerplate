import { RegisterParams } from 'v1.auth.register'
import { MoleculerService } from '@/common-types'
import type apple from './apple'
import type email from './email'
import type facebook from './facebook'
import type google from './google'
import type line from './line'

function verifyUserInfo(
	this: MoleculerService & {
		facebook: typeof facebook
		google: typeof google
		line: typeof line
		apple: typeof apple
		email: typeof email
	},
	params: RegisterParams,
):
	| ReturnType<typeof facebook>
	| ReturnType<typeof google>
	| ReturnType<typeof line>
	| ReturnType<typeof apple>
	| ReturnType<typeof email> {
	switch (params.registerType) {
		case 'facebook':
			return this.facebook(params)
		case 'google':
			return this.google(params)
		case 'line':
			return this.line(params)
		case 'apple':
			return this.apple(params)
		default:
			return this.email(params)
	}
}

export default verifyUserInfo
