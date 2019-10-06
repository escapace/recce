import { checkTsconfig } from './check-tsconfig'
import {
  defaults,
  findKey,
  isArray,
  isUndefined,
  isNumber,
  map,
  assign,
  get,
  isString
} from 'lodash'
import path from 'path'
import { SET_PARSED_TSCONFIG } from '../../src/actions'
import { store } from '../store'
import { tsconfig, context } from '../selectors'
import ts from 'typescript'
import commonDir from 'common-dir'
import { CompilerOptions } from '../types'

const ModuleResolutionKind = {
  classic: 1,
  node: 2
}

const ModuleKind = {
  None: 0,
  CommonJS: 1,
  AMD: 2,
  UMD: 3,
  System: 4,
  ES2015: 5,
  ESNext: 6
}

const ScriptTarget = {
  ES3: 0,
  ES5: 1,
  ES2015: 2,
  ES2016: 3,
  ES2017: 4,
  ES2018: 5,
  ES2019: 6,
  ES2020: 7,
  ESNext: 8,
  JSON: 100,
  Latest: 8
}
const getRootDir = (parsedConfig: ts.ParsedCommandLine) => {
  if (isString(get(parsedConfig, 'options.rootDir'))) {
    // If a rootDir is specified use it as the commonSourceDirectory
    return path.resolve(context(store.getState()), parsedConfig.options
      .rootDir as string)
  } else if (
    (get(parsedConfig, 'options.composite', false) as boolean) &&
    isString(get(parsedConfig, 'options.configFilePath'))
  ) {
    // Project compilations never infer their root from the input source paths
    return path.dirname(parsedConfig.options.configFilePath as string)
  }

  return commonDir(parsedConfig.fileNames)
}

/**
 * Load TypeScript configuration.
 */
export const parseTsconfig = async () => {
  await checkTsconfig()

  const filename = tsconfig(store.getState())

  const result = ts.readConfigFile(filename, ts.sys.readFile)

  // Return diagnostics.
  if (!isUndefined(result.error)) {
    throw new Error('Failed to parse TypeScript options')
  }

  const config = result.config

  const basePath: string = path.dirname(filename)

  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true
  }

  const parsedConfig: ts.ParsedCommandLine = ts.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    basePath,
    undefined,
    filename
  )

  const options: CompilerOptions = get(parsedConfig, 'options', {})

  if (isNumber(get(parsedConfig, 'options.module'))) {
    options.module = findKey(
      ModuleKind,
      m => m === parsedConfig.options.module
    ) as string
  }

  if (isNumber(get(parsedConfig, 'options.target'))) {
    options.target = findKey(
      ScriptTarget,
      m => m === parsedConfig.options.target
    )
  }

  if (isNumber(get(parsedConfig, 'options.moduleResolution'))) {
    options.moduleResolution = findKey(
      ModuleResolutionKind,
      m => m === parsedConfig.options.moduleResolution
    )
  }

  if (isArray(get(parsedConfig, 'options.lib'))) {
    options.lib = map(parsedConfig.options.lib, (l: string) =>
      l.replace(/^lib\./, '').replace(/\.d\.ts$/, '')
    )
  }

  defaults(
    assign(parsedConfig.options, {
      ...options
    }),
    store.getState().defaults.compilerOptions
  )

  store.dispatch(
    SET_PARSED_TSCONFIG({
      ...parsedConfig,
      rootDir: getRootDir(parsedConfig)
    })
  )
}
