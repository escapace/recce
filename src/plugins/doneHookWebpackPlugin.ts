import { Compiler } from 'webpack'

import {
  dispatchFilesFromErrors,
  reportErrors,
  resetErrors
} from '../effects/errors'

export class DoneHookWebpackPlugin {
  public apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tap('RecceDoneHookWebpackPlugin', () => {
      resetErrors()
    })

    compiler.hooks.done.tapPromise('RecceDoneHookWebpackPlugin', async () => {
      return dispatchFilesFromErrors().then(reportErrors)
    })
  }
}
