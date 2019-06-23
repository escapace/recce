/* tslint:disable no-any */

import { AnyAction } from 'redux'
import { IConfig as OclifConfig } from '@oclif/config'
import { Package } from 'normalize-package-data'
import { Node as NodeOptions } from 'webpack'
import { Options as LodashOptions } from 'lodash-webpack-plugin'
import { MinifyOptions } from 'terser-webpack-plugin'
// import { CompilerOptions } from 'typescript'

export interface TypescriptError {
  code: number
  content: string
  severity: 'error' | 'warning'
  file: string
  line: number
  character: number
  context: string
}

export interface TypescriptErrorRecord {
  modules: BuildModule[]
  error: TypescriptError
  hash: string
}

export interface CompilerOptions {
  [key: string]: any
}

export interface Action<P> extends AnyAction {
  type: string
  payload: P
}

export interface ActionCreator<P> {
  type: string
  (payload: P): Action<P>
}

export { AnyAction } from 'redux'

export type BuildModule = 'cjs' | 'umd' | 'esm'
export type BuildModules = BuildModule[]

export interface BuildReport {
  assets: string[]
  size: number
  gzipSize: number
}

export interface BuildReports {
  umd: BuildReport
  cjs: BuildReport
  esm: BuildReport
}

export interface FileSource {
  file: string
  source: string
}

export interface Prefix {
  root: string
  context: string
}

export interface Options {
  mode: Mode
  rootDir?: string
  compilerOptions: CompilerOptions
  entries: { [key: string]: string[] }
  modules: BuildModules
  outputPath: string
  minimize: boolean
  clean: boolean
  stats: boolean
  context: string
  tsconfig: string
  prefix: Prefix
  pjson: PackageJson
  machineReadable: boolean
}

export type Mode = 'build' | 'test'

export interface State {
  oclifConfig: OclifConfig
  options: Options
  runtime: {
    errors: { [key: string]: TypescriptErrorRecord }
    files: { [key: string]: string }
    build: BuildResult[]
  }
  defaults: {
    node: NodeOptions
    minify: MinifyOptions
    lodash: {
      id: string[]
      options: LodashOptions
    }
    compilerOptions: CompilerOptions
    test: TestConfig
  }
}

export interface PackageJson extends Package {
  browserlist: string[]
}

export interface BuildResult {
  module: BuildModule
  assets: string[]
  errors: string[]
  hasErrors: boolean
  stats: any
}

export interface TestConfig {
  coverageExclude: string[]
  coverage: boolean
  output: string
  captureConsole: boolean
}

export { MinifyOptions } from 'terser-webpack-plugin'
export { Node as NodeOptions } from 'webpack'
export { Options as LodashOptions } from 'lodash-webpack-plugin'

export type Reporter =
  | 'lcovonly'
  | 'text'
  | 'clover'
  | 'cobertura'
  | 'html'
  | 'json'
  | 'json-summary'
  | 'lcov'
  | 'none'
  | 'teamcity'
  | 'text-lcov'
  | 'text-summary'
