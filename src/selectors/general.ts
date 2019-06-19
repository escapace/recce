import { createSelector } from 'reselect'
import { join, resolve } from 'path'
import { assign, filter, map, mapValues } from 'lodash'

import {
  BuildModules,
  CompilerOptions,
  NodeOptions,
  PackageJson,
  State,
  TypescriptErrorRecord
} from '../types'

export const buildResults = (state: State) => state.runtime.build
export const compilerOptions = (state: State): CompilerOptions =>
  state.options.compilerOptions
export const condClean = (state: State): boolean => state.options.clean
export const condMinimize = (state: State): boolean => state.options.minimize
export const context = (state: State): string => state.options.context
export const contextModules = (state: State): string =>
  state.options.prefix.context
export const declaration = (state: State): boolean =>
  !!state.options.compilerOptions.declaration
export const files = (state: State) => state.runtime.files
export const machineReadable = (state: State): boolean =>
  state.options.machineReadable
export const mode = (state: State) => state.options.mode
export const modules = (state: State): BuildModules => state.options.modules
export const nodeOptions = (state: State): NodeOptions => state.defaults.node
export const packageJson = (state: State): PackageJson => state.options.pjson
export const rootDir = (state: State) => state.options.rootDir
export const rootModules = (state: State): string => state.options.prefix.root
export const tsErrors = (
  state: State
): { [key: string]: TypescriptErrorRecord } => state.runtime.errors
export const tsconfig = (state: State) => state.options.tsconfig

export const buildResultsWithErrors = createSelector(
  buildResults,
  results => filter(results, result => result.hasErrors)
)

export const condBuildWithErrors = createSelector(
  buildResultsWithErrors,
  a => a.length !== 0
)

const _entries = (state: State) => state.options.entries

export const entries = createSelector(
  _entries,
  context,
  (
    ents,
    ctx
  ): {
    [key: string]: string[]
  } => mapValues(ents, value => map(value, ent => resolve(ctx, ent)))
)

const _outputPath = (state: State): string => state.options.outputPath

export const outputPath = createSelector(
  context,
  _outputPath,
  resolve
)

export const outputPathEsm = createSelector(
  outputPath,
  o => join(o, 'esm')
)

export const outputPathCjs = createSelector(
  outputPath,
  o => join(o, 'cjs')
)

export const outputPathUmd = createSelector(
  outputPath,
  o => join(o, 'umd')
)

export const outputPathTypes = createSelector(
  outputPath,
  o => join(o, 'types')
)

export const condWatch = createSelector(
  mode,
  () => false
)
export const condBuild = createSelector(
  mode,
  m => m === 'build'
)

export const condTest = createSelector(
  mode,
  m => m === 'test'
)

export const dependencies = createSelector(
  packageJson,
  pj => pj.dependencies
)
export const devDependencies = createSelector(
  packageJson,
  pj => pj.devDependencies
)
export const combinedDependencies = createSelector(
  devDependencies,
  dependencies,
  (dev, dep) => assign({}, dev, dep)
)

export const packageName = createSelector(
  packageJson,
  pj => pj.name
)
