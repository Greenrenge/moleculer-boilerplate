/* eslint-disable global-require */
/* eslint-disable quotes */
import passport from 'passport'
import ghPassport from 'passport-github'

const providerName = 'github'

/**
 * Handle keys: https://github.com/settings/applications/new
 */
export default {
  methods: {
    registerGithubStrategy(setting, route) {
      let Strategy
      try {
        Strategy = ghPassport.Strategy
      } catch (error) {
        this.logger.error(
          "The 'passport-github' package is missing. Please install it with 'npm i passport-github' command.",
        )
        return
      }

      setting = {
        scope: 'user:email',
        ...setting,
      }

      passport.use(
        providerName,
        new Strategy(
          {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: `/auth/${providerName}/callback`,
            ...setting,
          },
          (accessToken, refreshToken, profile, done) => {
            this.logger.info(`Received '${providerName}' social profile: `, profile)

            this.signInSocialUser(
              {
                provider: providerName,
                accessToken,
                refreshToken,
                profile: this.processGithubProfile(profile),
              },
              done,
            )
          },
        ),
      )

      // Create route aliases
      const callback = this.socialAuthCallback(setting, providerName)

      route.aliases[`GET /${providerName}`] = (req, res) =>
        passport.authenticate(providerName, { scope: setting.scope })(req, res, callback(req, res))
      route.aliases[`GET /${providerName}/callback`] = (req, res) =>
        passport.authenticate(providerName, { session: false })(req, res, callback(req, res))
    },

    processGithubProfile(profile) {
      const res = {
        provider: profile.provider,
        socialID: profile.id,
        username: profile.username,
        firstName: profile.displayName,
        lastName: '',
        avatar: profile._json.avatar_url,
      }

      if (profile.emails && profile.emails.length > 0) {
        let email = profile.emails.find((e) => e.primary)
        // eslint-disable-next-line prefer-destructuring
        if (!email) email = profile.emails[0]

        res.email = email.value
      }

      return res
    },
  },
}
