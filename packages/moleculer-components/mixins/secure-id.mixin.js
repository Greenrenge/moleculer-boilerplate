import Hashids from 'hashids/cjs'

const hashids = new Hashids(process.env.HASHID_SALT || 'CmS2020')

export default function () {
	return {
		methods: {
			/**
			 * Encode ID of entity.
			 *
			 * @methods
			 * @param {any} id
			 * @returns {any}
			 */
			encodeID(id) {
				if (id != null) return hashids.encodeHex(id)
				return id
			},

			/**
			 * Decode ID of entity.
			 *
			 * @methods
			 * @param {any} id
			 * @returns {any}
			 */
			decodeID(id) {
				if (id != null) return hashids.decodeHex(id)
				return id
			},
		},
	}
}
