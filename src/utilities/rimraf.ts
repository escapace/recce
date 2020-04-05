import { isFalsy } from './isFalsy'
import rr = require('rimraf')

export const rimraf = async (path: string) =>
  new Promise((resolve, reject) => {
    rr(path, (err) => {
      if (!isFalsy(err)) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
