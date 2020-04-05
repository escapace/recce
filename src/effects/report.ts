import {
  buildResults,
  buildResultsWithErrors,
  condBuild,
  machineReadable
} from '../selectors'
import { readFileAsync } from '../utilities'
import { logger } from '@escapace/logger'
import { store } from '../store'
import { BuildReports } from '../types'
import {
  filter,
  flatten,
  forEach,
  fromPairs,
  isEmpty,
  isUndefined,
  map,
  toUpper,
  uniq
} from 'lodash'
import prettyBytes from 'pretty-bytes'
import gzipSize = require('gzip-size')

export const report = async () => {
  const results = buildResults(store.getState())
  const fail = buildResultsWithErrors(store.getState())

  if (!isEmpty(fail)) {
    // Report webpack errors
    forEach(
      uniq(
        flatten(
          map(
            filter(fail, (f) => f.hasErrors && !isUndefined(f.stats)),
            ({ errors }) => errors
          )
        )
      ),
      (e) => logger.error(e)
    )

    throw new Error('Recce could not finish the build')
  }

  const reports = fromPairs(
    await Promise.all(
      map(results, async (result) => {
        let size = 0
        let buf = Buffer.alloc(0)

        for (const p of result.assets) {
          const asset = await readFileAsync(p)
          const tmpBuf = Buffer.concat([asset, buf])
          buf = tmpBuf
          size += asset.length
        }

        const gSize = await gzipSize(buf)

        return [
          result.module,
          {
            assets: result.assets,
            gzipSize: gSize,
            size
          }
        ]
      })
    )
  ) as BuildReports

  if (condBuild(store.getState())) {
    if (machineReadable(store.getState())) {
      console.log(JSON.stringify(reports, null, '  '))
    } else {
      logger.log('')

      forEach(reports, ({ gzipSize, size }, key) => {
        logger.log(
          `${toUpper(key)}: ${prettyBytes(size)} (${prettyBytes(
            gzipSize
          )} gzipped)`
        )
      })
    }
  }
}
