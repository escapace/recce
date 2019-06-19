import { helloD } from './index'

import { assert } from 'chai'

describe('Node', () => {
  it('helloD', done => {
    helloD('three')
      .then(result => {
        assert.equal(result, 'Hello Three')

        done()
      })
  })
})
