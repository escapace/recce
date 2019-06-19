import { helloA, helloB } from './index'

import { assert } from 'chai'

describe('Browser', () => {
  it('helloA', done => {
    helloA('one')
      .then(result => {
        assert.equal(result, 'Hello One')

        done()
      })
      .catch(done)
  })
})
