import { assign } from 'lodash'
import { IConfig as OclifConfig } from '@oclif/config'
import {
  ActionCreator,
  BuildResult,
  Mode,
  BuildConfig,
  PackageJson,
  Prefix,
  TestConfig
} from '../types'
import ts = require('typescript')

const actionCreatorFactory = <P>(type: string): ActionCreator<P> =>
  assign(
    (payload: P) => ({
      type,
      payload
    }),
    { type }
  )

// export const ADD_FILE_SOURCE = actionCreatorFactory<FileSource>('FILE_SOURCE')
// export const ADD_TYPESCRIPT_ERROR = actionCreatorFactory<TypescriptErrorRecord>(
//   'ADD_TYPESCRIPT_ERROR'
// )
export const BUILD_RESULT = actionCreatorFactory<BuildResult>('BUILD_RESULT')
export const RESET = actionCreatorFactory<undefined>('RESET')
// export const RESET_FILE_SOURCES = actionCreatorFactory<void>(
//   'RESET_FILE_SOURCES'
// )
// export const RESET_TYPESCRIPT_ERRORS = actionCreatorFactory<void>(
//   'RESET_TYPESCRIPT_ERRORS'
// )
export const SET_BUILD_CONFIG = actionCreatorFactory<Partial<BuildConfig>>(
  'SET_BUILD_CONFIG'
)
export const SET_CONTEXT = actionCreatorFactory<string>('SET_CONTEXT')
export const SET_MODE = actionCreatorFactory<Mode>('SET_MODE')
export const SET_OCLIF_CONFIG = actionCreatorFactory<OclifConfig>(
  'SET_OCLIF_CONFIG'
)
export const SET_PACKAGE_JSON = actionCreatorFactory<PackageJson>(
  'SET_PACKAGE_JSON'
)
export const SET_PREFIX = actionCreatorFactory<Prefix>('SET_PREFIX')
export const SET_TSCONFIG = actionCreatorFactory<string>('SET_TSCONFIG')
export const SET_TEST_CONFIG = actionCreatorFactory<TestConfig>(
  'SET_TEST_CONFIG'
)

export const SET_PARSED_TSCONFIG = actionCreatorFactory<
  ts.ParsedCommandLine & { rootDir: string }
>('SET_PARSSED_TSCONFIG')
