import pkg from 'moleculer-apollo-server'

const { moleculerGql: gql } = pkg

export const type = gql`
	"""
	This type describes a user entity.
	"""
	enum Gender {
		M
		F
	}

	enum MaritalStatus {
		single
		married
	}

	type User {
		id: ID!
		_id: ID
		email: String
		firstName: String
		lastName: String
		nickName: String
		fullName: String
		displayName: String
		image: String
		gender: Gender
		phoneNumber: String
		dateOfBirth: String
		language: String
		integration: Integration
		consentAnalytics: Boolean
		isPersonalProfile: Boolean
		connectedAt: Date

		# EMPLOYEE
		userId: ID
		orgId: String
		deptId: String
		jobId: String
		roleId: String
		reportTo: String
		privateCode: String
		privateCodeExpiredAt: Date
		active: Boolean
		hiredAt: Date
		maritalStatus: MaritalStatus
		numberOfChildren: Int

		#ENTITIES
		organization: Organization
		department: Department
		jobPosition: JobPosition
		role: Role

		# RELATIONS
		# friends(limit: Int, skip: Int): UserPagination
		supervisor: User
		underling(deptId: String): UserPagination

		lastInvitedAt: Date
		createdAt: Date
		updatedAt: Date
	}

	extend type User {
		isCurrentProfile: Boolean
	}

	type UserIntegration {
		integration: Integration
	}

	type IntegrationItem {
		userId: String
		email: String
		integratedAt: Date
	}

	type Integration {
		facebook: IntegrationItem
		google: IntegrationItem
		apple: IntegrationItem
		line: IntegrationItem
	}

	type UserPagination {
		items: [User]
		pagination: Pagination
	}
`

export default type
