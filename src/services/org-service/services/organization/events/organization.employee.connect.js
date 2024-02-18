import ld from 'lodash'
import { Employee } from '@org/models/employee'

const { fromPairs } = ld

export default {
	cleanAfter: ['v1.organization.employee**', 'v1.organization.friendship**'],
	/**
	 * employee connected
	 * 1. move user's firstName lastName to emp if emp is absent (for searching purpose)
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const employee = ctx.params
		if (!employee) return

		const toBeUpdated = [
			!employee.firstName && 'firstName',
			!employee.lastName && 'lastName',
			!employee.nickName && 'nickName',
		].filter((a) => !!a)

		if (!toBeUpdated.length) return
		const userObject = (await Employee.findById(employee.userId))?.toObject()
		if (userObject) {
			Employee.findByIdAndUpdate(
				employee._id,
				{
					$set: fromPairs(toBeUpdated.map((f) => [f, userObject[f]])),
				},
				{ useFindAndModify: false, upsert: false },
			).catch((err) => {
				ctx.broker.logger.error('[EVENTS] error to default employee from user data', err)
			})
		}
	},
}
