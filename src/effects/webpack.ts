import path from 'path'
import webpack = require('webpack')
import { BuildResult } from '../types'
import { compact, concat, filter, isNull, isUndefined, map, noop } from 'lodash'
import { webpackConfiguration } from '../selectors'
import { store } from '../store'
import { BUILD_RESULT } from '../actions'

export const webpackBuild = async (
  module: 'cjs' | 'umd'
): Promise<{
  compiler: webpack.Compiler
  close: () => void
  invalidate: () => void
}> => {
  const callback = (result: BuildResult) => store.dispatch(BUILD_RESULT(result))

  const configuration = webpackConfiguration(module)(store.getState())

  const compiler = webpack(configuration)

  const method = (handler: webpack.ICompiler.Handler) => {
    // const state = store.getState()

    // if (condBuild(state)) {
    return compiler.run(handler) as undefined
    // } else if (condWatch(state)) {
    //   return compiler.watch(
    //     {
    //       aggregateTimeout: 300,
    //       poll: true
    //     },
    //     handler
    //   )
    // }
  }

  return new Promise<{
    compiler: webpack.Compiler
    close: () => void
    invalidate: () => void
  }>(resolve => {
    const watching: webpack.Compiler.Watching | undefined = method(
      // tslint:disable-next-line no-any
      (err: null | Error & { details?: string }, stats) => {
        const result: BuildResult = {
          module,
          assets: [],
          errors: [],
          hasErrors: false,
          stats: undefined
        }

        const info = stats.toJson({
          all: true
        })

        result.stats = info

        if (!isNull(err) || stats.hasErrors() === true) {
          result.hasErrors = true
          result.assets = map(info.assets, asset => asset.name)

          if (isNull(err)) {
            result.errors = map(stats.compilation.errors, value =>
              value.toString()
            )
          } else {
            result.errors = concat(compact([err.message, err.details]))
          }

          resolve({
            close: isUndefined(watching) ? noop : watching.close,
            compiler: compiler,
            invalidate: isUndefined(watching) ? noop : watching.invalidate
          })

          callback(result)
        } else {
          result.assets = filter(
            map(info.assets, asset =>
              path.join(info.outputPath as string, asset.name)
            ),
            p => !/\.js\.map/.test(p)
          )

          resolve({
            close: isUndefined(watching) ? noop : watching.close,
            compiler: compiler,
            invalidate: isUndefined(watching) ? noop : watching.invalidate
          })

          callback(result)
        }
      }
    )
  })
}
