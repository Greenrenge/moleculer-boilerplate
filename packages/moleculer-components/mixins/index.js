import activityLogEmitter from './activity-log-emitter.mixin'
import authentication from './authentication.mixin'
import authorizationToMeta from './authorization-to-meta.mixin'
import cacheCleanerDependency from './cache.cleaner.dependency.mixin'
import cacheCleaner from './cache.cleaner.mixin'
import config from './config.mixin'
import memoize from './memoize.mixin'
import authMixin from './meta-auth.mixin'
import passport from './passport.mixin'
import secureId from './secure-id.mixin'
import strategies from './strategies/index'
import tokenGenerator from './token-generator.mixin'

export default {
	cacheCleaner,
	cacheCleanerDependency,
	config,
	memoize,
	passport,
	secureId,
	strategies,
	tokenGenerator,
	authentication,
	authorizationToMeta,
	activityLogEmitter,
	authMixin,
}
