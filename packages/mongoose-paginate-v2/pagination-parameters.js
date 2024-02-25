/* eslint-disable eqeqeq */
/* eslint-disable class-methods-use-this */
class PaginationParametersHelper {
	constructor(request) {
		this.query = request.query
	}

	/**
	 * Handle boolean options
	 * If the 'option'-Parameter is a string, check if it equals 'true'
	 * If not, it should be a boolean, and can be returned as it is.
	 *
	 * @param {string|boolean} option
	 * @return {boolean}
	 * */
	booleanOpt(option) {
		return typeof option === 'string' ? option === 'true' : option
	}

	/**
	 * Handle options that are strings or objects (including arrays)
	 *
	 * @param {object|string} option
	 * @return {object|string}
	 * */
	optObjectOrString(option) {
		// Since the JSON in the query object will be strings,
		// we need to be able to detect this, in order to differentiate between JSON-objects and pure strings.
		// a pure string, e.g. 'field -test', might not be parsed as wished by JSON.parse
		const openingBrackets = ['{', '[']
		const closingBrackets = ['}', ']']
		const firstCharIsBracket = option[0] && openingBrackets.includes(option[0])
		const lastCharIsBracket =
			option[option.length - 1] && closingBrackets.includes(option[option.length - 1])
		const optionIsObject = firstCharIsBracket && lastCharIsBracket

		try {
			return optionIsObject ? JSON.parse(option) : option
		} catch (err) {
			// Fallback for parsing errors of objects
			return {}
		}
	}

	/**
	 * Yields the "query" parameter for Model.paginate()
	 * given any attributes of the Express req.query-Object,
	 * */
	getQuery() {
		const filtersQueryParameter = this.query?.query

		if (!filtersQueryParameter) return {}

		try {
			return JSON.parse(filtersQueryParameter)
		} catch (err) {
			return {}
		}
	}

	/**
	 * Yields the "options" parameter for Model.paginate(),
	 * given any attributes of the Express req.query-Object
	 * */
	getOptions() {
		if (!this.query) return {}

		const options = {}

		// Instantiate variables with all the possible options for Model.paginate()
		const { select } = this.query
		const { collation } = this.query
		const { sort } = this.query
		const { populate } = this.query
		const { projection } = this.query
		const { lean } = this.query
		const { leanWithId } = this.query
		const { offset } = this.query
		const { page } = this.query
		const { limit } = this.query
		const { customLabels } = this.query
		const { pagination } = this.query
		const { useEstimatedCount } = this.query
		const { useCustomCountFn } = this.query
		const { forceCountFn } = this.query
		const { allowDiskUse } = this.query
		const { read } = this.query
		const mongooseOptions = this.query.options

		// For every option that is set, add it to the 'options' object-literal
		if (select) options.select = this.optObjectOrString(select)
		if (collation) options.collation = this.optObjectOrString(collation)
		if (sort) options.sort = this.optObjectOrString(sort)
		if (populate) options.populate = this.optObjectOrString(populate)
		if (projection !== undefined) options.projection = this.optObjectOrString(projection)
		if (lean !== undefined) options.lean = this.booleanOpt(lean)
		if (leanWithId !== undefined) options.leanWithId = this.booleanOpt(leanWithId)
		if (offset) options.offset = Number(offset)
		if (page) options.page = Number(page)
		if (limit || limit == 0) options.limit = Number(limit)
		if (customLabels) options.customLabels = this.optObjectOrString(customLabels)
		if (pagination !== undefined) options.pagination = this.booleanOpt(pagination)
		if (useEstimatedCount !== undefined)
			options.useEstimatedCount = this.booleanOpt(useEstimatedCount)
		if (useCustomCountFn !== undefined) options.useCustomCountFn = this.booleanOpt(useCustomCountFn)
		if (forceCountFn !== undefined) options.forceCountFn = this.booleanOpt(forceCountFn)
		if (allowDiskUse) options.allowDiskUse = this.booleanOpt(allowDiskUse)
		if (read) options.read = this.optObjectOrString(read)
		if (mongooseOptions) options.options = this.getOptions(mongooseOptions)

		return options
	}

	/**
	 * Yields an array with positions:
	 * [0] "query" parameter, for Model.paginate()
	 * [1] "options" parameter, for Model.paginate()
	 * */
	get() {
		return [{ ...this.getQuery() }, { ...this.getOptions() }]
	}
}

module.exports = PaginationParametersHelper
