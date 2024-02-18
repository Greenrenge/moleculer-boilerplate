import pkg from 'moleculer-apollo-server'

const { moleculerGql: gql } = pkg

export const AuthTypeDefs = gql`
	"""
	This type describes a authentication entity.
	"""
	enum RegisterType {
		email
		facebook
		google
		line
		apple
	}

	type Token {
		access_token: String
		token_type: String
	}
`
