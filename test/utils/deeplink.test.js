import { expect } from 'chai'
import { DEEPLINK_ROUTES, DEEPLINK_SCHEMA } from '@/constants/deeplink'
import { buildURLQuery, buildDeepLink } from '@/utils/deeplink'

describe('Test "Deeplink"', () => {
  context('#buildURLQuery', () => {
    it('should return query params correctly', () => {
      const result = buildURLQuery({ test: '1', another: '2' })
      expect(result).to.equal('test=1&another=2')
    })
  })
  context('#buildDeepLink', () => {
    it('should build and return deeplink correctly if passing only page', () => {
      const result = buildDeepLink({ page: DEEPLINK_ROUTES.MAIN_PAGE })
      expect(result).to.equal(`${DEEPLINK_SCHEMA}main_page`)
    })
    it('should build and return deeplink correctly if passing both page and path', () => {
      const result = buildDeepLink({ page: DEEPLINK_ROUTES.MAIN_PAGE, path: '/feed' })
      expect(result).to.equal(`${DEEPLINK_SCHEMA}main_page/feed`)
    })
    it('should build and return deeplink correctly if passing query params', () => {
      const result = buildDeepLink(
        { page: DEEPLINK_ROUTES.MAIN_PAGE, path: '/feed' },
        {
          id: '123',
        },
      )
      expect(result).to.equal(`${DEEPLINK_SCHEMA}main_page/feed?id=123`)
    })
    it('should build and return deeplink correctly if passing more than 1 query params', () => {
      const result = buildDeepLink(
        { page: DEEPLINK_ROUTES.MAIN_PAGE, path: '/feed' },
        {
          id: '123',
          type: 'test',
        },
      )
      expect(result).to.equal(`${DEEPLINK_SCHEMA}main_page/feed?id=123&type=test`)
    })
  })
})
