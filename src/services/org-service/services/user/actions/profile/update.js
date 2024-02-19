import { Errors } from 'moleculer'
import { USER_ERRORS } from '@/constants/errors'
import { Employee, getProfileImagePath } from '@org/models/employee'
import { JobPosition } from '@org/models/job-position'

export default {
	cache: false,
	trackActivity: 'profile.updated',
	cleanAfter: ['v1.organization.employee**', 'v2.user.public**'],
	params: {
		firstName: {
			type: 'string',
			optional: true,
		},
		lastName: {
			type: 'string',
			optional: true,
		},
		image: {
			type: 'string',
			optional: true,
		},
		gender: {
			type: 'string',
			optional: true,
		},
		phoneNumber: {
			type: 'string',
			optional: true,
		},
		dateOfBirth: {
			type: 'string',
			optional: true,
		},
		language: {
			type: 'string',
			optional: true,
		},
		jobId: 'string|optional',
	},
	/**
	 * Update User Profile
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		this.logger.info(`ACTION: ${ctx.action.name}`, ctx)
		const { userId, empId, orgId } = ctx.meta
		const { firstName, lastName, nickName, image, jobId, ...rest } = ctx.params

		// validate job
		if (jobId) {
			const job = await JobPosition.findById(jobId)
			if (!job) {
				throw new Errors.MoleculerClientError(
					USER_ERRORS.JOB_NOT_FOUND.MESSAGE,
					404,
					USER_ERRORS.JOB_NOT_FOUND.CODE,
				)
			}
		}
		const userUpdatedInfo = {
			...rest,
			...(empId === userId && {
				// public profile
				...(firstName && { firstName }),
				...(lastName && { lastName }),
				...(nickName && { nickName }),
				...(image && { image: getProfileImagePath(orgId, empId) }),
				...(jobId && { jobId }),
			}),
		}

		const updatedUser = await Employee.findByIdAndUpdate(
			userId,
			{
				$set: userUpdatedInfo,
			},
			{ new: true },
		)
		if (!updatedUser) {
			throw new Errors.MoleculerClientError(
				USER_ERRORS.USER_NOT_FOUND.MESSAGE,
				404,
				USER_ERRORS.USER_NOT_FOUND.CODE,
			)
		}
		ctx.broker.emit('user.profile.update', updatedUser, { meta: ctx.meta })

		if (empId && empId !== userId) {
			await ctx.broker.call(
				'v1.organization.employee.profile.update',
				{
					...(firstName && { firstName }),
					...(lastName && { lastName }),
					...(nickName && { nickName }),
					...(image && { image }),
					...(jobId && { jobId }),
				},
				{ meta: ctx.meta },
			)
			const emp = await Employee.findById(empId)
			return emp?.toObject()
		}

		return updatedUser
	},
}
