import { createSelector } from 'reselect'
import { State } from '../types'
import { relative, resolve } from 'path'
import { flatten, map, values } from 'lodash'

import { entries, outputPathEsm, rootDir } from './general'

export const testConfig = (state: State) => state.defaults.test

export const captureConsole = createSelector(
  testConfig,
  config => config.captureConsole
)

export const condCoverage = createSelector(
  testConfig,
  ({ coverage }) => coverage
)

export const testOutput = createSelector(
  testConfig,
  ({ output }) => output
)

export const coverageExclude = createSelector(
  testConfig,
  config => config.coverageExclude
)

const istanbulExclude = createSelector(
  entries,
  rootDir,
  outputPathEsm,
  testOutput,
  (_entries, _rootDir, _outputPathEsm, _testOutput): string[] =>
    map(flatten(values(_entries)), _path =>
      relative(
        _testOutput,
        resolve(
          _outputPathEsm,
          relative(
            _rootDir as string,
            resolve(_rootDir as string, _path)
          ).replace(/\.ts$/, '.js')
        )
      )
    )
)

export const babelPluginIstanbulOptions = createSelector(
  istanbulExclude,
  exclude => ({ exclude })
)
