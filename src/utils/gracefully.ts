const createLightship = require('@greenrenge/gracefully')

const { createReadiness } = createLightship.default({ randomPortOnLocal: true })

export const [mongooseDbReady, moleculerReady] = createReadiness(2)
