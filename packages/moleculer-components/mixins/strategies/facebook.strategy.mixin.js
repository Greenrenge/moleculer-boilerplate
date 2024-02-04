import passport from 'passport'
import fbPassport from 'passport-facebook'

const providerName = 'facebook'

/**
 * Handle keys: https://developers.facebook.com/apps/
 */
export default {
	methods: {
		registerFacebookStrategy(setting, route) {
			let Strategy
			try {
				Strategy = fbPassport.Strategy
			} catch (error) {
				this.logger.error(
					// eslint-disable-next-line quotes
					"The 'passport-facebook' package is missing. Please install it with 'npm i passport-facebook' command.",
				)
				return
			}

			setting = {
				scope: ['email', 'user_location'],
				...setting,
			}

			passport.use(
				providerName,
				new Strategy(
					{
						clientID: process.env.FACEBOOK_CLIENT_ID,
						clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
						callbackURL: `/auth/${providerName}/callback`,
						profileFields: ['first_name', 'last_name', 'email', 'link', 'locale', 'timezone'],
						...setting,
					},
					(accessToken, refreshToken, profile, done) => {
						this.logger.info(`Received '${providerName}' social profile: `, profile)

						this.signInSocialUser(
							{
								provider: providerName,
								accessToken,
								refreshToken,
								profile: this.processFacebookProfile(profile),
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

		processFacebookProfile(profile) {
			const res = {
				provider: profile.provider,
				socialID: profile.id,
				firstName: profile.name.givenName,
				lastName: profile.name.familyName,
				email: profile._json.email,
				avatar: `https://graph.facebook.com/${profile.id}/picture?type=large`,
			}

			return res
		},
	},
}
