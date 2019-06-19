import { createSelector } from 'reselect'
import resolveFrom = require('resolve-from')
import semver = require('semver')
import { BuildModule, State } from '../types'
import { compact, get, isString, omit } from 'lodash'
import { condLodash, lodashId } from './lodash'
import { condRamda } from './ramda'
import { condTest, context, packageJson, rootModules } from './general'
import { babelPluginIstanbulOptions, condCoverage } from './test'

const nodeTarget = createSelector(
  packageJson,
  (pjson): string => {
    const node: string | undefined = get(pjson, 'engines.node')

    if (isString(node)) {
      if (semver.valid(node) !== null) {
        return node
      }

      const coerced = semver.coerce(node)

      // tslint:disable-next-line strict-type-predicates
      if (semver.validRange(node) !== null && coerced !== null) {
        return coerced.version
      }
    }

    return `${semver.major(process.versions.node)}.0.0`
  }
)

export const babelOptions = (module: BuildModule) => (state: State) => ({
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

export const gulpBabelOptions = (state: State) =>
  omit(babelOptions('esm')(state), ['cacheDirectory'])
