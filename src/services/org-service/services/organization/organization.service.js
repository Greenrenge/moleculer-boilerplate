import load from '@utils/moduleLoader'

/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */

export default {
	name: 'organization',
	version: 1,
	// mixins: [authentication('*')], // every one call this have to have userId
	// mixins: [cacheCleanerDependency([])], // every one call this have to have userId
	actions: load('actions'),
	events: load('events'),
	methods: load('methods'),
}
