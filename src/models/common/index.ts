export const schemaOption = {
	strictPopulate: false,
	timestamps: true,
	discriminatorKey: 'kind',
	toJSON: {
		virtuals: true,
	},
	toObject: {
		virtuals: true,
	},
}

export const LANGUAGE_OPTION = {
	languages: ['th', 'en', 'ja'],
	defaultLanguage: 'th',
	fallback: true,
}
