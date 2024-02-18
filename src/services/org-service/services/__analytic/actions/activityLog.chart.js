import { DateTime } from 'luxon'
import {
	PERIOD,
	PERIOD_GROUPBY_LUXON_MAPPING,
	PERIOD_GROUPBY_LUXON_UNITS_MAPPING,
	PERIOD_GROUPBY_MONGO_MAPPING,
} from '@/constants/business'
import { serviceMeta } from '@/utils/service-meta'
import { ActivityLog } from '@org/models/activityLog'

export default {
	...serviceMeta,
	cache: {
		...serviceMeta.cache,
		keys: [...serviceMeta.cache.keys, 'key', 'period'],
	},
	params: {
		...serviceMeta.params,
		key: 'string',
		period: {
			type: 'string',
			enum: Object.values(PERIOD),
			default: PERIOD.DAILY,
		},
	},
	/**
	 * @param {import('moleculer').Context} ctx
	 */
	async handler(ctx) {
		const { filter = [], start: _start, end: _end, key, period } = ctx.params
		const start = new Date(_start)
		const end = new Date(_end)
		// lock only org of viewer
		const { orgId } = ctx.meta

		// filter start,end,org and left join
		const { query: empFilterQuery } = await this.getEmployeeFilter({
			ctx,
			filter,
		})
		// find daily of status count for employee in the filter
		const aggQuery = [
			{
				// org / start - end
				$match: {
					key,
					orgId,
					date: { $gte: start, $lt: end },
				},
			},
			{
				$lookup: {
					from: 'employees',
					let: { empId: '$empId' },
					pipeline: [
						{
							$match: {
								$and: [{ $expr: { $eq: ['$_id', '$$empId'] } }, empFilterQuery],
							},
						},
						{ $project: { _id: 1 } },
					],
					as: 'users',
				},
			},
			{
				$match: { users: { $size: 1 } },
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: PERIOD_GROUPBY_MONGO_MAPPING[period],
							date: '$date',
							timezone: 'Asia/Bangkok',
						},
					},
					count: { $sum: 1 },
				},
			},
		]

		const res = await ActivityLog.aggregate(aggQuery)

		const unit = PERIOD_GROUPBY_LUXON_UNITS_MAPPING[period]
		const diffObject = DateTime.fromJSDate(end).diff(DateTime.fromJSDate(start), unit)

		const keys = Array.from(Array(Math.ceil(diffObject[unit])))
			.map((_, i) =>
				DateTime.fromJSDate(end)
					.setZone('Asia/Bangkok')
					.plus({ [unit]: -1 * i })
					.toFormat(PERIOD_GROUPBY_LUXON_MAPPING[period]),
			)
			.reverse()

		const ret = keys
			.map((k) => res.find((r) => r._id === k) || { _id: k, count: 0 })
			.map(({ _id, count }) => ({
				date: DateTime.fromFormat(_id, PERIOD_GROUPBY_LUXON_MAPPING[period], {
					zone: 'Asia/Bangkok',
				})
					.toJSDate()
					.toISOString(),
				value: count,
			}))
		return ret
	},
}

/**
 * db.getCollection("activitylogs").aggregate([
  {
    $match: { orgId: "public" },
  },
  {
    $lookup: {
      from: "employees",
      //localField: 'empId',
      //foreignField: '_id',
      let: { empId: "$empId" },
      pipeline: [
        {
          $match: {
            $and: [
              { $expr: { $eq: ["$_id", "$$empId"] } },
              { $or: [{ _id:{$in:['h']} }] },
            ],
          },
        },
        { $project: { _id: 1 } },
      ],
      as: "users",
    },
  },
]);

 */

/*

db.getCollection('activitylogs').aggregate([
{
    $match:{ orgId:"public" }
},
{
   $lookup: 
    {
        from: 'employees',
        localField: 'empId',
        foreignField: '_id',
         as:'users'
     }   
}    ,
{
      $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$users", 0 ] }, "$$ROOT" ] } }
 },
  { $project: { users: 0 } }

]) * */
