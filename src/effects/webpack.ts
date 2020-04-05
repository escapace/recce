import path from 'path'
import { BuildResult } from '../types'
import { compact, concat, filter, isNull, map, get, includes } from 'lodash'
import { webpackConfiguration, modules } from '../selectors'
import { store } from '../store'
import { BUILD_RESULT } from '../actions'
import webpack = require('webpack')

export const webpackBuild = async () => {
  const mod = modules(store.getState())

  const configuration = compact([
    includes(mod, 'cjs')
      ? webpackConfiguration('cjs')(store.getState())
      : undefined,
    includes(mod, 'umd')
      ? webpackConfiguration('umd')(store.getState())
      : undefined
  ])

  return new Promise<BuildResult[]>((resolve) => {
    webpack(configuration, (err, _stats) => {
      const statsArray: webpack.Stats[] = get(_stats, 'stats')

      const results = map(statsArray, (stats) => {
        const result: BuildResult = {
          module: get(stats, 'compilation.name'),
          assets: [],
          errors: [],
          hasErrors: false,
          stats: undefined
        }

        const info = stats.toJson({
          all: true
        })

        result.stats = info

        if (!isNull(err) || stats.hasErrors()) {
          result.hasErrors = true
          result.assets = map(info.assets, (asset) => asset.name)

          if (isNull(err)) {
            result.errors = map(stats.compilation.errors, (value) =>
              value.toString()
            )
          } else {
            result.errors = concat(compact([err.message, get(err, 'details')]))
          }
        } else {
          result.assets = filter(
            map(info.assets, (asset) =>
              path.join(info.outputPath as string, asset.name)
            ),
            (p) => !/\.js\.map$/.test(p)
          )
        }

        return result
      })

      results.forEach((result) => store.dispatch(BUILD_RESULT(result)))

      resolve(results)
    })
  })
}
