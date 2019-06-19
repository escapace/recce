import { helloA, helloB } from './index'

import { assert } from 'chai'

describe('Browser', () => {
  it('helloB', done => {
    helloB('two')
      .then(result => {
        assert.equal(result, 'Hello Two')

        done()
      })
  })
})
