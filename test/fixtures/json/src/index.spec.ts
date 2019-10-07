import { assert } from 'chai'
import { port } from './index'

it('json import', () => {
  assert.equal(port, 8080)
})
