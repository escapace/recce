import { helloC } from './index'

import { assert } from 'chai'

describe('Node', () => {
  it('helloC', done => {
    helloC('three')
      .then(result => {
        assert.equal(result, 'Hello Three')

        done()
      })
  })
})
