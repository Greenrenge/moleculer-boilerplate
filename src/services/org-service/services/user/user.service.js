import load from '@utils/moduleLoader'

export const actions = load('actions')
export const methods = load('methods')
export const events = load('events')

export default {
	name: 'user',
	version: 1,
	actions,
	events,
	methods,
}
