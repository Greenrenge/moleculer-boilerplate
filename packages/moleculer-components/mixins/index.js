import activityLogEmitter from './activity-log-emitter.mixin.js'
import authentication from './authentication.mixin.js'
import authorizationToMeta from './authorization-to-meta.mixin.js'
import cacheCleanerDependency from './cache.cleaner.dependency.mixin.js'
import cacheCleaner from './cache.cleaner.mixin.js'
import config from './config.mixin.js'
import memoize from './memoize.mixin.js'
import passport from './passport.mixin.js'
import secureId from './secure-id.mixin.js'
import strategies from './strategies/index.js'
import tokenGenerator from './token-generator.mixin.js'

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
}
