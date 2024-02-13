import merge from 'lodash/merge'
import common from '@configs/common'
import development from '@configs/development'
import production from '@configs/production'
import test from '@configs/test'

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
