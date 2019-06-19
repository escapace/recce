import { CompilerOptions } from '../types'
import { defaults, findKey, isArray, isNumber, map, omit } from 'lodash'
import { store } from '../store'
import { tsconfig } from '../selectors'
import { checkTsconfig } from './checkTsconfig'

import ts from 'typescript'
import { dirname } from 'path'

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

/**
 * Load TypeScript configuration.
 */
export const parseJsonConfig = (
  filename: string
): { compilerOptions: CompilerOptions; parsedConfig: ts.ParsedCommandLine } => {
  const result = ts.readConfigFile(filename, ts.sys.readFile)

  // Return diagnostics.
  if (result.error) {
    throw new Error('Failed to parse TypeScript options')
  }

  const config = result.config

  const basePath: string = dirname(filename)

  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    useCaseSensitiveFileNames: true
  }

  // tslint:disable-next-line: no-any
  const parsedConfig: any = ts.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    basePath,
    undefined,
    filename
  )

  if (isNumber(parsedConfig.options.module)) {
    parsedConfig.options.module = findKey(
      ModuleKind,
      m => m === parsedConfig.options.module
    ) as string
  }

  if (isNumber(parsedConfig.options.target)) {
    parsedConfig.options.target = findKey(
      ScriptTarget,
      m => m === parsedConfig.options.target
    )
  }

  if (isNumber(parsedConfig.options.moduleResolution)) {
    parsedConfig.options.moduleResolution = findKey(
      ModuleResolutionKind,
      m => m === parsedConfig.options.moduleResolution
    )
  }

  if (isArray(parsedConfig.options.lib)) {
    parsedConfig.options.lib = map(parsedConfig.options.lib, (l: string) =>
      l.replace(/^lib\./, '').replace(/\.d\.ts$/, '')
    )
  }

  return {
    compilerOptions: omit(parsedConfig.options, [
      'configFilePath',
      'paths',
      'typeRoots'
    ]),
    parsedConfig
  }
}

export const compilerOptions = async (
  prop?: ReturnType<typeof parseJsonConfig>
): Promise<CompilerOptions> => {
  await checkTsconfig()

  const state = store.getState()
  const filename = tsconfig(state)

  return defaults(
    prop ? prop.compilerOptions : parseJsonConfig(filename).compilerOptions,
    state.defaults.compilerOptions
  )
}
