import pkg from 'moleculer-apollo-server'

const { moleculerGql: gql } = pkg

export default gql`
	type WelcomeMessage {
		id: String
		topic: String
		desc: String
		start: Date
		end: Date
		organization: Organization
	}
`
