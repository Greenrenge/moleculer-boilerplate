/* eslint-disable @typescript-eslint/no-unused-expressions */
import { packRules } from '@casl/ability/extra'
import { expect } from 'chai'
import { factory } from 'factory-girl'
import { PermActions, PermSubjects } from '@/constants/business'
import OrganizationService from '@/services/org-service/services/organization/organization.service'
import PermissionService from '@/services/org-service/services/permission/permission.service'
import TestServiceBroker from '@/test/service-broker'
import { Department } from '@org/models/department'
import { Employee } from '@org/models/employee'
import { JobPosition } from '@org/models/job-position'
import { Permission } from '@org/models/permission'
import { Role } from '@org/models/role'
import permissionMiddleware from '@pkg/moleculer-components/middlewares/permission-middleware'

describe('#organization.admin', () => {
	const broker = new TestServiceBroker({
		logger: false,
		cacher: 'memory',
		middlewares: [permissionMiddleware],
	})
	const service = broker.createService(OrganizationService)
	const permService = broker.createService(PermissionService)

	before(() => broker.start())
	after(() => broker.stop())

	context('#v1.organization.admin.role', () => {
		context('.createOne', () => {
			let publicOrg
			let publicEmp
			let createPublicRolePermission
			let permission
			before(async () => {
				permission = (
					await Permission.create({
						_id: Permission.getId(PermActions.CREATE, 'announcement'),
						action: PermActions.CREATE,
						subject: 'announcement',
					})
				).toObject()

				createPublicRolePermission = (
					await Permission.create({
						_id: Permission.getId(PermActions.CREATE, PermSubjects.PUBLIC_ROLE),
						action: PermActions.CREATE,
						subject: PermSubjects.PUBLIC_ROLE,
					})
				).toObject()

				const [org, emp] = await Promise.all([
					factory.create('organization', {
						_id: 'public',
					}),
					factory.create('employee', {
						orgId: 'public',
					}),
				])

				publicEmp = emp
				publicOrg = org
			})
			test('should reject if there is no any permissions in ctx.meta', async () => {
				await expect(
					broker.call('v1.organization.admin.role.createOne', {
						name: 'any',
						permissions: [],
					}),
				).to.be.rejectedWith('permission_denied')
			})

			test('should reject if ctx.meta.permissions is []', async () => {
				await expect(
					broker.call(
						'v1.organization.admin.role.createOne',
						{
							name: 'any',
							permissions: [],
						},
						{
							meta: {
								userId: publicEmp._id,
								empId: publicEmp._id,
								orgId: publicOrg._id,
								permission: [],
							},
						},
					),
				).to.be.rejectedWith('permission_denied')
			})

			test('should reject if employee has no roleId', async () => {
				await expect(
					broker.call(
						'v1.organization.admin.role.createOne',
						{
							name: 'any',
							permissions: [
								{
									...permission,
									inheritance: true,
								},
							],
						},
						{
							meta: {
								userId: publicEmp._id,
								empId: publicEmp._id,
								orgId: publicOrg._id,
								permissions: packRules([
									{ action: PermActions.CREATE, subject: PermSubjects.ROLE },
									permission,
								]),
							},
						},
					),
				).to.rejectedWith('permission_denied')
			})

			test('should allow to create role if ctx.meta.permissions contains the packed create-role', async () => {
				const role = await Role.create({
					orgId: publicOrg._id,
					name: 'announcer',
					permissions: [
						{
							_id: permission._id,
							inheritance: true,
						},
					],
				})
				const emp = await factory.create('employee', {
					roleId: role._id,
					orgId: publicOrg._id,
				})

				const res = await broker.call(
					'v1.organization.admin.role.createOne',
					{
						name: 'any',
						permissions: [
							{
								...permission,
								inheritance: true,
							},
						],
					},
					{
						meta: {
							userId: emp._id,
							empId: emp._id,
							orgId: publicOrg._id,
							permissions: packRules([
								{ action: PermActions.CREATE, subject: PermSubjects.ROLE },
								permission,
							]),
						},
					},
				)
				const inDb = await Role.findById(res.id)
				expect(inDb).to.have.property('name', 'any')
				expect(inDb.toObject())
					.to.have.property('permissions')
					.that.deep.equal([
						{
							_id: permission._id,
							id: permission._id,
							inheritance: true,
						},
					])
			})
			test('should allow to create role if ctx.meta.permissions contains the packed update-role', async () => {
				const role = await Role.create({
					orgId: publicOrg._id,
					name: 'announcer',
					permissions: [
						{
							_id: permission._id,
							inheritance: true,
						},
					],
				})
				const emp = await factory.create('employee', {
					roleId: role._id,
					orgId: publicOrg._id,
				})

				const res = await broker.call(
					'v1.organization.admin.role.createOne',
					{
						name: 'any',
						permissions: [
							{
								...permission,
								inheritance: true,
							},
						],
					},
					{
						meta: {
							userId: emp._id,
							empId: emp._id,
							orgId: publicOrg._id,
							permissions: packRules([
								{ action: PermActions.UPDATE, subject: PermSubjects.ROLE },
								permission,
							]),
						},
					},
				)
				const inDb = await Role.findById(res.id)
				expect(inDb).to.have.property('name', 'any')
				expect(inDb.toObject())
					.to.have.property('permissions')
					.that.deep.equal([
						{
							_id: permission._id,
							id: permission._id,
							inheritance: true,
						},
					])
			})

			test('should reject when the creating permission is not inheritance=true', async () => {
				const role = await Role.create({
					orgId: publicOrg._id,
					name: 'announcer',
					permissions: [
						{
							_id: permission._id,
							inheritance: false,
						},
					],
				})
				const emp = await factory.create('employee', {
					roleId: role._id,
					orgId: publicOrg._id,
				})

				await expect(
					broker.call(
						'v1.organization.admin.role.createOne',
						{
							name: 'any',
							permissions: [
								{
									...permission,
									inheritance: true,
								},
							],
						},
						{
							meta: {
								userId: emp._id,
								empId: emp._id,
								orgId: publicOrg._id,
								permissions: packRules([
									{ action: PermActions.UPDATE, subject: PermSubjects.ROLE },
									permission,
								]),
							},
						},
					),
				).to.rejectedWith('permission_denied')
			})

			test('should allow to specify org if the permission has create-public_role', async () => {
				const role = await Role.create({
					orgId: publicOrg._id,
					name: 'app-admin',
					permissions: [
						{
							_id: permission._id,
							inheritance: true,
						},
						{
							_id: createPublicRolePermission._id,
							inheritance: false,
						},
					],
				})

				const emp = await factory.create('employee', {
					roleId: role._id,
					orgId: publicOrg._id,
				})

				const targetOrg = await factory.create('organization', {
					orgId: 'targetOrg',
				})

				const res = await broker.call(
					'v1.organization.admin.role.createOne',
					{
						name: 'any',
						orgId: targetOrg._id,
						permissions: [
							{
								...permission,
								inheritance: true,
							},
						],
					},
					{
						meta: {
							userId: emp._id,
							empId: emp._id,
							orgId: publicOrg._id,
							permissions: packRules([createPublicRolePermission, permission]),
						},
					},
				)
				const inDb = await Role.findById(res.id)
				expect(inDb).to.have.property('name', 'any')
				expect(inDb.toObject())
					.to.have.property('permissions')
					.that.deep.equal([
						{
							_id: permission._id,
							id: permission._id,
							inheritance: true,
						},
					])
				expect(inDb.toObject()).to.have.property('orgId', targetOrg._id)
			})
			test('should not allow to specify org if the permission has no create-public_role', async () => {
				const role = await Role.create({
					orgId: publicOrg._id,
					name: 'app-admin',
					permissions: [
						{
							_id: permission._id,
							inheritance: true,
						},
					],
				})

				const emp = await factory.create('employee', {
					roleId: role._id,
					orgId: publicOrg._id,
				})

				const targetOrg = await factory.create('organization', {
					orgId: 'targetOrg',
				})

				await expect(
					broker.call(
						'v1.organization.admin.role.createOne',
						{
							name: 'any',
							orgId: targetOrg._id,
							permissions: [
								{
									...permission,
									inheritance: true,
								},
							],
						},
						{
							meta: {
								userId: emp._id,
								empId: emp._id,
								orgId: publicOrg._id,
								permissions: packRules([
									{ action: PermActions.UPDATE, subject: PermSubjects.ROLE },
									permission,
								]),
							},
						},
					),
				).to.rejectedWith('permission_denied')
			})
		})
	})

	context('#v1.organization.admin.department', () => {
		let permission
		before(async () => {
			permission = (
				await Permission.create({
					_id: Permission.getId(PermActions.CREATE, 'org_department'),
					action: PermActions.CREATE,
					subject: 'org_department',
				})
			).toObject()
		})
		context('#createMany', () => {
			test('should create many a department', async () => {
				const orgId = 'org_d_1'
				const departments = [
					{
						name: 'Programmer',
						orgId,
					},
					{
						name: 'HR',
						orgId,
					},
					{
						name: 'MK',
						orgId,
					},
				]
				const res = await broker.call(
					'v1.organization.admin.department.createMany',
					{
						departments,
						permissions: [
							{
								...permission,
								inheritance: true,
							},
						],
					},
					{
						meta: {
							orgId,
							permissions: packRules([permission]),
						},
					},
				)
				const expected = await Department.find({ orgId })
				expect(res).to.be.length(expected.length)
				res.forEach((v) => {
					expect(expected.some((c) => c.id === v.id)).to.be.true
				})
			})
		})
	})

	context('#v1.organization.admin.job-position', () => {
		let permission
		before(async () => {
			permission = (
				await Permission.create({
					_id: Permission.getId(PermActions.CREATE, 'org_job_position'),
					action: PermActions.CREATE,
					subject: 'org_job_position',
				})
			).toObject()
		})
		context('#createMany', () => {
			test('should create many a jon position', async () => {
				const orgId = 'org_j_1'
				const jobPositions = [
					{
						name: 'Programmer',
						level: 1,
						skillSet: {
							required: ['5fe9f7cafdc59b266b8430df', '5fe9f7cafdc59b266b8430e2'],
						},
						orgId,
					},
					{
						name: 'HR',
						orgId,
						skillSet: {
							required: ['5fe9f7cafdc59b266b8430df', '5fe9f7cafdc59b266b8430e2'],
						},
					},
				]
				const res = await broker.call(
					'v1.organization.admin.job-position.createMany',
					{
						jobPositions,

						permissions: [
							{
								...permission,
								inheritance: true,
							},
						],
					},
					{
						meta: {
							orgId,
							permissions: packRules([permission]),
						},
					},
				)
				const expected = await JobPosition.find({ orgId })
				expect(res).to.be.length(expected.length)
				res.forEach((v) => {
					expect(expected.some((c) => c.id === v.id)).to.be.true
				})
			})
		})
	})
})
