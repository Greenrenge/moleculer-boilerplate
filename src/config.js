import merge from 'lodash/merge.js'
import common from '@configs/common.js'
import development from '@configs/development.js'
import production from '@configs/production.js'
import test from '@configs/test.js'

const loadConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return merge(common, production)
    case 'test':
      return merge(common, test)
    default:
      return merge(common, development)
  }
}

export default loadConfig()
