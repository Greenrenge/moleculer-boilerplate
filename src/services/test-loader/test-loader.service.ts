import load from '@/utils/moduleLoader'
import { ActionSchema, type Context, type ServiceSchema } from 'moleculer'

const actions = load<ActionSchema>('actions')

export default {
	name: 'test-loader',
	version: 1,
	actions,
} as ServiceSchema
