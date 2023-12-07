export const schemaOption = {
  timestamps: true,
  discriminatorKey: 'kind',
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
}
