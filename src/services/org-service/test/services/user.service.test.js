/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-identical-title */
import { expect } from 'chai'
import { factory } from 'factory-girl'
import { Errors } from 'moleculer'
import { GENDER } from '@/constants/business'
import TestServiceBroker from '@/test/service-broker'
import { Employee } from '@org/models/employee'
import OrganizationService from '@/services/org-service/services/organization/organization.service'
import UserService from '@/services/org-service/services/user/user.service'

describe('Test "UserService"', () => {
	const broker = new TestServiceBroker({ logger: false })
	const service = broker.createService(UserService)
	const serviceOrg = broker.createService(OrganizationService)

	before(() => broker.start())
	after(() => broker.stop())

	context('#action:user.*', () => {
		context('#create action', () => {
			test('should return created user', async () => {
				const user = await factory.attrs('user')
				const result = await broker.call('v1.user.create', user)
				expect(result).to.have.property('email', user.email)
				expect(result).to.have.property('firstName', user.firstName)
				expect(result).to.have.property('lastName', user.lastName)
				expect(result).to.have.property('gender', user.gender)
				expect(result).to.have.property('phoneNumber', user.phoneNumber)
				expect(result).to.have.property('dateOfBirth', user.dateOfBirth)
				expect(result).to.have.property('language', user.language)
			})
		})

		context('#profile.update action', () => {
			test('should throw an error when cannot find the userId', async () => {
				const userId = 'any'
				await broker
					.call(
						'v1.user.profile.update',
						{
							gender: GENDER.MALE,
						},
						{
							meta: {
								userId,
							},
						},
					)
					.should.be.rejectedWith('User not found')
			})
			test('should update user profile', async () => {
				const user = await factory.create('user')
				const result = await broker.call(
					'v1.user.profile.update',
					{
						gender: GENDER.MALE,
					},
					{
						meta: {
							userId: user._id,
						},
					},
				)
				expect(result).to.have.property('gender', GENDER.MALE)
			})

			test('should update the employee profile if empId is in the meta', async () => {
				const user = await factory.create('user', {
					gender: GENDER.FEMALE,
				})
				const employee = await factory.create('employee', {
					userId: user._id,
				})

				const result = await broker.call(
					'v1.user.profile.update',
					{
						firstName: 'orgNaJa',
						nickName: 'Koy',
						gender: GENDER.MALE,
					},
					{
						meta: {
							userId: user._id,
							empId: employee._id,
						},
					},
				)
				expect(result).to.have.property('gender', GENDER.MALE)
				expect(result).to.have.property('firstName', 'orgNaJa')
				expect(result).to.have.property('nickName', 'Koy')
				expect(result).to.have.property('email', user.email)

				const userInDb = await Employee.findById(user._id)
				expect(userInDb.firstName).to.equal(user.firstName)
				expect(userInDb.nickName).to.equal(user.nickName)
				expect(userInDb.gender).to.equal(GENDER.MALE)

				const empInDb = await Employee.findById(employee._id)
				expect(empInDb.firstName).to.equal('orgNaJa')
				expect(empInDb.nickName).to.equal('Koy')
			})
		})
	})
})
