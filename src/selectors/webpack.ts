import TerserPlugin = require('terser-webpack-plugin')
import lodashPlugin = require('lodash-webpack-plugin')
import nodeExternals = require('webpack-node-externals')
import resolveFrom from 'resolve-from'
import { FilterWebpackPlugin } from '../plugins'
import { createSelector } from 'reselect'
import { relative, resolve } from 'path'
import { camelCase, compact, map, mapValues, pick } from 'lodash'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import { readFileSync } from 'fs'

import { MinifyOptions, State } from '../types'

import webpack = require('webpack')

import {
  condBuild,
  condMinimize,
  condTest,
  context,
  contextModules,
  entries,
  nodeOptions,
  outputPathCjs,
  outputPathEsm,
  outputPathUmd,
  packageName,
  rootDir,
  rootModules,
  tsconfig
} from './general'

import { condLodash, lodashOptions } from './lodash'

import { babelOptions } from './babel'

const minifyOptions = (state: State): MinifyOptions => state.defaults.minify

export const webpackEntries = createSelector(
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
            relative(
              _rootDir as string,
              resolve(_rootDir as string, _path)
            ).replace(/\.ts$/, '.js')
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
    exclude: /tslib/,
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
    minimize: false
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
    // condWatch(state) ? new DoneHookWebpackPlugin() : undefined,
    // new webpack.NoEmitOnErrorsPlugin(),
    condLodash(state) ? new lodashPlugin(lodashOptions(state)) : undefined,
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
    modules: [contextModules(state)],
    mainFields:
      module === 'umd' ? ['module', 'browser', 'main'] : ['module', 'main']
  },
  resolveLoader: {
    modules: [rootModules(state)]
  },
  node: module === 'cjs' ? nodeOptions(state) : undefined
})
