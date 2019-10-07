import { createSelector } from 'reselect'
import { FilterWebpackPlugin } from '../plugins'
import { readFileSync } from 'fs'
import {
  State,
  BuildModule,
  BuildModules,
  CompilerOptions,
  LodashOptions,
  MinifyOptions,
  NodeOptions,
  PackageJson
} from '../types'
import resolveFrom from 'resolve-from'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

import { relative, join, resolve } from 'path'

import {
  assign,
  camelCase,
  compact,
  filter,
  find,
  flatten,
  get,
  includes,
  intersection,
  isString,
  keys,
  map,
  mapValues,
  omit,
  pick,
  values
} from 'lodash'
import LodashPlugin = require('lodash-webpack-plugin')
import nodeExternals = require('webpack-node-externals')
import path = require('path')
import semver = require('semver')
import TerserPlugin = require('terser-webpack-plugin')

import webpack = require('webpack')

export const tsconfig = (state: State) => state.buildConfig.tsconfig

const babelOptions = (module: BuildModule) => (state: State) => ({
  cacheDirectory: false,
  babelrc: false,
  plugins: compact([
    resolveFrom(rootModules(state), '@babel/plugin-syntax-dynamic-import'),
    module === 'esm'
      ? resolveFrom(rootModules(state), 'babel-plugin-annotate-pure-calls')
      : undefined,
    module === 'esm' && condLodash(state)
      ? [
          resolveFrom(rootModules(state), 'babel-plugin-lodash'),
          {
            id: lodashId(state),
            cwd: context(state)
          }
        ]
      : undefined,
    module === 'esm' && condRamda(state)
      ? [
          resolveFrom(rootModules(state), 'babel-plugin-ramda'),
          {
            useES: true
          }
        ]
      : undefined,
    module !== 'esm' && condTest(state) && condCoverage(state)
      ? [
          resolveFrom(rootModules(state), 'babel-plugin-istanbul'),
          babelPluginIstanbulOptions(state)
        ]
      : undefined
  ]),
  presets: compact([
    module !== 'esm'
      ? [
          resolveFrom(rootModules(state), '@babel/preset-env'),
          {
            configPath: context(state),
            exclude: ['transform-async-to-generator', 'transform-regenerator'],
            useBuiltIns: false,
            modules: false,
            loose: true,
            ignoreBrowserslistConfig: module === 'cjs',
            ...(module === 'cjs'
              ? {
                  targets: {
                    node: nodeTarget(state)
                  }
                }
              : {})
          }
        ]
      : undefined
  ])
})

export const tscBabelOptions = (state: State) =>
  omit(babelOptions('esm')(state), ['cacheDirectory'])

export const buildResults = (state: State) => state.runtime.build

export const compilerOptions = (state: State): CompilerOptions =>
  state.tsConfig.options

export const tsFiles = (state: State): string[] => state.tsConfig.fileNames

export const concatenateModules = (state: State): boolean =>
  state.buildConfig.concatenateModules
export const condClean = (state: State): boolean => state.buildConfig.clean
const condMinimize = (state: State): boolean => state.buildConfig.minimize
export const context = (state: State): string => state.buildConfig.context
export const contextModules = (state: State): string =>
  state.buildConfig.prefix.context
export const declaration = (state: State): boolean =>
  !!(get(state, 'tsConfig.options.declaration', false) as boolean)

// const files = (state: State) => state.runtime.files
export const machineReadable = (state: State): boolean =>
  state.buildConfig.machineReadable
const mode = (state: State) => state.buildConfig.mode
export const modules = (state: State): BuildModules => state.buildConfig.modules
const nodeOptions = (state: State): NodeOptions => state.defaults.node
const packageJson = (state: State): PackageJson => state.buildConfig.pjson
const rootDir = (state: State) => state.tsConfig.rootDir
export const rootModules = (state: State): string =>
  state.buildConfig.prefix.root
// const tsErrors = (state: State): { [key: string]: TypescriptErrorRecord } =>
//   state.runtime.errors

export const buildResultsWithErrors = createSelector(
  buildResults,
  results => filter(results, result => result.hasErrors)
)

export const condBuildWithErrors = createSelector(
  buildResultsWithErrors,
  a => a.length !== 0
)

const _entries = (state: State) => state.buildConfig.entries

const entries = createSelector(
  _entries,
  context,
  (
    ents,
    ctx
  ): {
    [key: string]: string[]
  } => mapValues(ents, value => map(value, ent => resolve(ctx, ent)))
)

const _outputPath = (state: State): string => state.buildConfig.outputPath

export const outputPath = createSelector(
  context,
  _outputPath,
  resolve
)

export const outputPathEsm = createSelector(
  outputPath,
  o => join(o, 'esm')
)

const outputPathCjs = createSelector(
  outputPath,
  o => join(o, 'cjs')
)

const outputPathUmd = createSelector(
  outputPath,
  o => join(o, 'umd')
)

export const outputPathTypes = createSelector(
  outputPath,
  o => join(o, 'types')
)

// const condWatch = createSelector(
//   mode,
//   () => false
// )

export const condBuild = createSelector(
  mode,
  m => m === 'build'
)

export const condTest = createSelector(
  mode,
  m => m === 'test'
)

const dependencies = createSelector(
  packageJson,
  pj => pj.dependencies
)
const devDependencies = createSelector(
  packageJson,
  pj => pj.devDependencies
)
const combinedDependencies = createSelector(
  devDependencies,
  dependencies,
  (dev, dep) => assign({}, dev, dep)
)

const packageName = createSelector(
  packageJson,
  pj => pj.name
)

const id = (state: State): string[] => state.defaults.lodash.id

const lodashOptions = (state: State): LodashOptions =>
  state.defaults.lodash.options

const lodashId = createSelector(
  combinedDependencies,
  id,
  (a, b): string[] => intersection(keys(a), b)
)

const condLodash = createSelector(
  lodashId,
  (a): boolean => a.length !== 0
)

const condRamda = createSelector(
  combinedDependencies,
  (a): boolean => includes(keys(a), 'ramda')
)

export const condStats = (state: State) => state.buildConfig.stats

export const outputPathStats = (m: 'cjs' | 'umd') =>
  createSelector(
    m === 'cjs' ? outputPathCjs : outputPathUmd,
    (c: string) => path.join(c, 'stats.json')
  )

export const compilationStats = (m: 'cjs' | 'umd') => (state: State) => {
  const found = find(buildResults(state), ab => ab.module === m)

  return found === undefined ? undefined : found.stats
}

const testConfig = (state: State) => state.testConfig

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
          relative(_rootDir, resolve(_rootDir, _path)).replace(/\.ts$/, '.js')
        )
      )
    )
)

const babelPluginIstanbulOptions = createSelector(
  istanbulExclude,
  exclude => ({ exclude })
)

const minifyOptions = (state: State): MinifyOptions => state.defaults.minify

const webpackEntries = createSelector(
  entries,
  rootDir,
  outputPathEsm,
  context,
  (_entries, _rootDir, _outputPathEsm, _context): { [key: string]: string[] } =>
    mapValues(_entries, value =>
      map(
        value,
        _path =>
          resolve(
            _outputPathEsm,
            relative(_rootDir, resolve(_rootDir, _path)).replace(/\.ts$/, '.js')
          )
        // `./${relative(
        //   _context,
        //   resolve(
        //     _outputPathEsm,
        //     relative(
        //       _rootDir as string,
        //       resolve(_rootDir as string, _path)
        //     ).replace(/\.ts$/, '.js')
        //   )
        // )}`
      )
    )
)

const webpackRules = (module: 'cjs' | 'umd') => (
  state: State
): webpack.RuleSetRule[] => [
  {
    test: /\.js$/,
    use: resolveFrom(rootModules(state), 'source-map-loader'),
    enforce: 'pre'
  },
  {
    test: /\.js$/,
    exclude: /tslib|lodash/,
    use: [
      {
        loader: resolveFrom(rootModules(state), 'babel-loader'),
        options: babelOptions(module)(state)
      }
    ]
  }
]

export const webpackConfiguration = (module: 'cjs' | 'umd') => (
  state: State
): webpack.Configuration => ({
  name: module,
  cache: false,
  context: context(state),
  target: module === 'cjs' ? 'node' : 'web',
  externals:
    module === 'cjs'
      ? compact([
          nodeExternals({
            whitelist: ['lodash-es', /^ramda\/es/]
          })
        ])
      : undefined,
  mode: condBuild(state) ? 'production' : 'development',
  entry: condTest(state)
    ? pick(webpackEntries(state), module === 'cjs' ? 'node' : 'browser')
    : webpackEntries(state),
  devtool: condTest(state) ? 'inline-source-map' : 'source-map',
  output: {
    libraryTarget: module === 'cjs' ? 'commonjs2' : 'umd',
    library: module === 'cjs' ? undefined : camelCase(packageName(state)),
    path: module === 'cjs' ? outputPathCjs(state) : outputPathUmd(state),
    filename: `[name].js`,
    devtoolModuleFilenameTemplate: condTest(state)
      ? '[absolute-resource-path]'
      : undefined
  },
  module: {
    rules: webpackRules(module)(state)
  },
  optimization: {
    nodeEnv: false,
    minimize: false,
    concatenateModules: condTest(state) ? false : concatenateModules(state)
  },
  plugins: compact([
    // new DuplicatePackageCheckerPlugin({
    //   verbose: true,
    //   strict: true,
    //   showHelp: false,
    //   emitError: true
    // }),
    condTest(state)
      ? new webpack.BannerPlugin({
          banner:
            module === 'cjs'
              ? `require("${resolveFrom(
                  rootModules(state),
                  'source-map-support/register'
                )}");`
              : `${readFileSync(
                  resolveFrom(
                    rootModules(state),
                    'source-map-support/browser-source-map-support.js'
                  )
                ).toString()};sourceMapSupport.install();`,
          raw: true,
          entryOnly: true
        })
      : undefined,
    // new webpack.NoEmitOnErrorsPlugin(),
    condLodash(state) ? new LodashPlugin(lodashOptions(state)) : undefined,
    condMinimize(state)
      ? new TerserPlugin({
          terserOptions: minifyOptions(state),
          sourceMap: true,
          cache: false,
          parallel: true
        })
      : undefined,
    new FilterWebpackPlugin({
      patterns: ['*.d.ts']
    })
  ]),
  resolve: {
    alias: {
      ...(condTest(state) && module === 'umd'
        ? {
            'base64-js': resolveFrom(rootModules(state), 'base64-js'),
            ieee754: resolveFrom(rootModules(state), 'ieee754')
          }
        : {})
    },
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsconfig(state),
        mainFields:
          module === 'umd' ? ['module', 'browser', 'main'] : ['module', 'main'],
        silent: true
      })
    ],
    symlinks: true,
    extensions: ['.ts', '.js', '.tsx', '.json'],
    // modules: [contextModules(state)],
    mainFields:
      module === 'umd' ? ['module', 'browser', 'main'] : ['module', 'main']
  },
  resolveLoader: {
    modules: [rootModules(state)]
  },
  node: module === 'cjs' ? nodeOptions(state) : undefined
})

const nodeTarget = createSelector(
  packageJson,
  (pjson): string => {
    const node: string | undefined = get(pjson, 'engines.node')

    if (isString(node)) {
      if (semver.valid(node) !== null) {
        return node
      }

      const coerced = semver.coerce(node)

      if (semver.validRange(node) !== null && coerced !== null) {
        return coerced.version
      }
    }

    return `${semver.major(process.versions.node)}.0.0`
  }
)
