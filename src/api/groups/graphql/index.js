import pkg from 'moleculer-apollo-server'

const { moleculerGql: gql } = pkg

export const GroupDefs = gql`
	"""
	Group
	"""
	type Group {
		id: ID!
		_id: ID!
		name: String
		desc: String
		image: String
		type: GroupType!
		createdAt: String
		updatedAt: String
		orgId: String
		empId: String

		# Resolvers
		members(limit: Int, skip: Int): UserPagination
	}

	enum GroupType {
		private
		public
	}

	input GroupMemberInput {
		empId: String
	}

	"""
	list of Group
	"""
	type GroupPagination {
		items: [Group]
		pagination: Pagination
	}

	"""
	This type describes a File entity.
	"""
	type File {
		filename: String!
		encoding: String!
		mimetype: String!
	}
`
