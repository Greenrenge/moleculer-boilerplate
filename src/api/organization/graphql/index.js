import pkg from 'moleculer-apollo-server'

const { moleculerGql: gql } = pkg

export default gql`
	"""
	Organization
	"""
	type Organization {
		id: ID!
		_id: ID
		name: String!
		displayName: String
		abbreviation: String
		image: String
		# features: OrganizationFeatures
		members(searchTerm: String, limit: Int, skip: Int): UserPagination
		departments(searchTerm: String, limit: Int, skip: Int): DepartmentPagination
		jobPositions(limit: Int, skip: Int, searchTerm: String): JobPositionPagination
		roles(limit: Int, skip: Int): RolePagination
	}

	# type OrganizationFeatures {
	# 	assessments: OrganizationFeatureAssessment
	# }

	# type OrganizationFeatureAssessment {
	# 	disabled: Boolean
	# }

	type DepartmentPagination {
		items: [Department]
		pagination: Pagination
	}

	type JobPositionPagination {
		items: [JobPosition]
		pagination: Pagination
	}

	"""
	Department
	"""
	type Department {
		id: ID!
		_id: ID
		orgId: String!
		image: String
		name: String!
		members: UserPagination
	}

	type SkillSetOfPosition {
		required: [String]
	}

	"""
	Job Position
	"""
	type JobPosition {
		id: ID!
		_id: ID
		orgId: String!
		image: String
		name: String!
		level: Int!
		members: UserPagination
	}

	"""
	Permission
	"""
	type Permission {
		id: ID!
		label: String
		action: String!
		subject: String!
		inheritance: Boolean!
	}

	"""
	Role
	"""
	type Role {
		id: ID!
		_id: ID
		orgId: String!
		name: String!
		permissions: [Permission]
	}

	type RolePagination {
		items: [Role]
		pagination: Pagination
	}

	type EmployeeConnectResult {
		profile: User!
		token: Token!
	}
`
