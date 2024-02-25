declare module 'v1.announcement.welcomeMessage.admin.list' {
	export type WelcomeMessageListParams = {
		limit?: number
		skip?: number
		orgId?: string
		start?: Date
		end?: Date
	}
	export type WelcomeMessageListReturn = import('@org/models/event').EventPaginateResult
}

declare module 'v1.announcement.welcomeMessage.admin.create' {
	export type WelcomeMessageCreateParams = {
		topic?: string
		desc: string
		start: Date
		end: Date
		compileContentId?: string
		orgId?: string
	}
	export type WelcomeMessageCreateReturn = import('@org/models/event').TEvent
}
