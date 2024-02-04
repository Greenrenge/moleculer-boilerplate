// @ts-nocheck
const defaultOptions = {
	customLabels: {
		totalDocs: 'total',
		limit: 'limit',
		page: 'page',
		totalPages: 'totalPages',
		docs: 'items',
		nextPage: 'nextPage',
		prevPage: 'prevPage',
		pagingCounter: 'pagingCounter',
		hasPrevPage: 'hasPrevPage',
		hasNextPage: 'hasNextPage',
		meta: 'pagination',
	},
	collation: {},
	lean: false,
	leanWithId: true,
	limit: 10,
	projection: {},
	select: '',
	options: {},
	pagination: true,
	useEstimatedCount: false,
	useCustomCountFn: false,
	forceCountFn: false,
}

export function paginate(query, options, callback) {
	options = {
		...defaultOptions,
		...paginate.options,
		...options,
	}
	query = query || {}

	const {
		collation,
		lean,
		leanWithId,
		populate,
		projection,
		read,
		select,
		sort,
		pagination,
		useEstimatedCount,
		useCustomCountFn,
		forceCountFn,
	} = options

	const customLabels = {
		...defaultOptions.customLabels,
		...options.customLabels,
	}

	const limit = parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0

	const isCallbackSpecified = typeof callback === 'function'
	const findOptions = options.options

	let page
	let skip

	let docsPromise = []

	// Labels
	const labelDocs = customLabels.docs
	const labelLimit = customLabels.limit
	const labelNextPage = customLabels.nextPage
	const labelPage = customLabels.page
	const labelPagingCounter = customLabels.pagingCounter
	const labelPrevPage = customLabels.prevPage
	const labelTotal = customLabels.totalDocs
	const labelTotalPages = customLabels.totalPages
	const labelHasPrevPage = customLabels.hasPrevPage
	const labelHasNextPage = customLabels.hasNextPage
	const labelMeta = customLabels.meta

	if (Object.prototype.hasOwnProperty.call(options, 'skip')) {
		skip = parseInt(options.skip, 10)
	} else if (Object.prototype.hasOwnProperty.call(options, 'page')) {
		page = parseInt(options.page, 10)
		skip = (page - 1) * limit
	} else {
		page = 1
		skip = 0
	}

	let countPromise

	if (forceCountFn === true) {
		// Deprecated since starting from MongoDB Node.JS driver v3.1

		// Hack for mongo < v3.4
		if (Object.keys(collation).length > 0) {
			countPromise = this.count(query).collation(collation).exec()
		} else {
			countPromise = this.count(query).exec()
		}
	} else if (useEstimatedCount === true) {
		countPromise = this.estimatedDocumentCount().exec()
	} else if (typeof useCustomCountFn === 'function') {
		countPromise = useCustomCountFn()
	} else {
		// Hack for mongo < v3.4
		if (Object.keys(collation).length > 0) {
			countPromise = this.countDocuments(query).collation(collation).exec()
		} else {
			countPromise = this.countDocuments(query).exec()
		}
	}

	if (limit) {
		const mQuery = this.find(query, projection, findOptions)

		if (populate) {
			mQuery.populate(populate)
		}

		mQuery.select(select)
		mQuery.sort(sort)
		mQuery.lean(lean)

		if (read && read.pref) {
			/**
			 * Determines the MongoDB nodes from which to read.
			 * @param read.pref one of the listed preference options or aliases
			 * @param read.tags optional tags for this query
			 */
			mQuery.read(read.pref, read.tags)
		}

		// Hack for mongo < v3.4
		if (Object.keys(collation).length > 0) {
			mQuery.collation(collation)
		}

		if (pagination) {
			mQuery.skip(skip)
			mQuery.limit(limit)
		}

		docsPromise = mQuery.exec()

		if (lean && leanWithId) {
			docsPromise = docsPromise.then((docs) => {
				docs.forEach((doc) => {
					if (doc._id) {
						doc.id = String(doc._id)
					}
				})
				return docs
			})
		}
	}

	return Promise.all([countPromise, docsPromise])
		.then((values) => {
			const [count, docs] = values
			const meta = {
				[labelTotal]: count,
			}

			let result = {}

			if (typeof skip !== 'undefined') {
				meta.skip = skip
				page = Math.ceil((skip + 1) / limit)
			}

			const pages = limit > 0 ? Math.ceil(count / limit) || 1 : null

			// Setting default values
			meta[labelLimit] = count
			meta[labelTotalPages] = 1
			meta[labelPage] = page
			meta[labelPagingCounter] = (page - 1) * limit + 1

			meta[labelHasPrevPage] = false
			meta[labelHasNextPage] = false
			meta[labelPrevPage] = null
			meta[labelNextPage] = null

			if (pagination) {
				meta[labelLimit] = limit
				meta[labelTotalPages] = pages

				// Set prev page
				if (page > 1) {
					meta[labelHasPrevPage] = true
					meta[labelPrevPage] = page - 1
				}

				// Set next page
				if (page < pages) {
					meta[labelHasNextPage] = true
					meta[labelNextPage] = page + 1
				}
			}

			// Remove customLabels set to false
			// eslint-disable-next-line dot-notation
			delete meta.false

			// eslint-disable-next-line eqeqeq
			if (limit == 0) {
				meta[labelLimit] = 0
				meta[labelTotalPages] = null
				meta[labelPage] = null
				meta[labelPagingCounter] = null
				meta[labelPrevPage] = null
				meta[labelNextPage] = null
				meta[labelHasPrevPage] = false
				meta[labelHasNextPage] = false
			}

			if (labelMeta) {
				result = {
					[labelDocs]: docs,
					[labelMeta]: meta,
				}
			} else {
				result = {
					[labelDocs]: docs,
					...meta,
				}
			}

			return isCallbackSpecified ? callback(null, result) : Promise.resolve(result)
		})
		.catch((error) => (isCallbackSpecified ? callback(error) : Promise.reject(error)))
}

export default (schema) => {
	schema.statics.paginate = paginate
}
