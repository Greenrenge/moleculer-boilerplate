import { Cachers } from 'moleculer'
import { Types } from 'mongoose'

function isObject(o) {
	return o !== null && typeof o === 'object' && !(o instanceof String)
}

function isDate(d) {
	return d instanceof Date && !Number.isNaN(d.getTime())
}

export class MongoDBSupportedRedisCacher extends Cachers.Redis {
	_generateKeyFromObject(obj) {
		if (Array.isArray(obj)) {
			return `[${obj.map((o) => this._generateKeyFromObject(o)).join('|')}]`
		}
		if (isDate(obj)) {
			return obj.valueOf()
		}
		if (obj instanceof Types.ObjectId) {
			return obj.toString()
		}
		if (isObject(obj)) {
			return Object.keys(obj)
				.map((key) => [key, this._generateKeyFromObject(obj[key])].join('|'))
				.join('|')
		}
		if (obj != null) {
			return obj.toString()
		}
		return 'null'
	}
}

export default MongoDBSupportedRedisCacher
