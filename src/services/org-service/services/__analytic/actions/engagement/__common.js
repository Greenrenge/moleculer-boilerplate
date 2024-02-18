import { PERIOD } from '@/constants/business'
import { APP_ACTIVITY_KIND, USER_TYPES } from '@org/models/application-activity'

export const actionOption = {
	//   // TODO: apply permission
	//   permission: (ctx) => {},
	cache: {
		keys: ['#orgId', 'start', 'end', 'period', 'from', 'activityType'],
		ttl: 15, // 15 sec
	},
	params: {
		from: {
			type: 'string',
			enum: Object.values(USER_TYPES),
			optional: true,
		},
		activityType: {
			type: 'string',
			enum: Object.values(APP_ACTIVITY_KIND),
			optional: true,
		},
		start: {
			type: 'date',
			convert: true,
			default: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		},
		end: { type: 'date', convert: true, default: new Date() },
		period: {
			type: 'string',
			enum: Object.values(PERIOD),
			default: PERIOD.DAILY,
		},
	},
}
