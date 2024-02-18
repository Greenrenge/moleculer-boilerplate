/**
 * @typedef {import('moleculer').ServiceBroker} ServiceBroker
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('mongoose').Model} Model
 */
import { Errors } from 'moleculer'
import { Employee } from '@org/models/employee'

export default {
	cache: false,
	cleanAfter: ['v1.organization.employee**'],
	params: {
		privateCode: 'string',
	},
	/** @param {Context} ctx */
	async handler(ctx) {
		const { privateCode } = ctx.params
		const { userId } = ctx.meta
		if (privateCode === '') {
			throw new Errors.MoleculerClientError(
				'Not found the employee to connect',
				404,
				'ORG_PROFILE_NOT_FOUND',
				{ privateCode },
			)
		}
		const res = await Employee.findOneAndUpdate(
			{
				privateCode,
				userId: null,
			},
			{
				userId,
				connectedAt: new Date(),
			},
			{
				new: true,
				upsert: false,
				useFindAndModify: false,
			},
		)
		if (!res)
			throw new Errors.MoleculerClientError(
				'Not found the employee to connect',
				404,
				'ORG_PROFILE_NOT_FOUND',
				{ privateCode },
			)

		if ((res.privateCodeExpiredAt?.getTime() ?? 0) < new Date().getTime())
			throw new Errors.MoleculerClientError(
				'Private Code Expired or Null Value',
				400,
				'PRIVATE_CODE_EXPIRED_W/O_NULL',
				{ privateCode },
			)

		this.logger.debug('user connected to ', JSON.stringify(res))

		// emit the connected event
		ctx.broker.emit('organization.employee.connect', res, { meta: ctx.meta })

		return res?.toObject()
	},
}
