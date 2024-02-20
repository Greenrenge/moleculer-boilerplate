import get from 'lodash/get'
import type { Document } from 'mongoose'
import { LoginMethod } from '@/constants/business'

const getUserFilterQuery = (entity: Document, registerType: LoginMethod): Record<string, any> => {
	switch (registerType) {
		case LoginMethod.FACEBOOK: {
			const userIdPath = 'integration.facebook.userId'
			return {
				[userIdPath]: get(entity, userIdPath, undefined),
			}
		}
		case LoginMethod.GOOGLE: {
			const userIdPath = 'integration.google.userId'
			return {
				[userIdPath]: get(entity, userIdPath, undefined),
			}
		}
		case LoginMethod.LINE: {
			const userIdPath = 'integration.line.userId'
			return {
				[userIdPath]: get(entity, userIdPath, undefined),
			}
		}
		case LoginMethod.APPLE: {
			const userIdPath = 'integration.apple.userId'
			return {
				[userIdPath]: get(entity, userIdPath, undefined),
			}
		}
		default:
			return {
				email: get(entity, 'email'),
			}
	}
}

export default getUserFilterQuery // need to assign type to broker
