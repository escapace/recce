import { BuildModule, BuildModules } from '../types'
import { gulpBuild } from './gulp'
import { SET_BUILD_OPTIONS } from '../actions'
import {
  condBuild,
  condBuildWithErrors,
  condClean,
  condStats,
  condTest,
  context,
  machineReadable,
  modules
} from '../selectors'
import {
  clean,
  compilerOptions as parseCompilerOptions,
  realpathAsync
} from '../utilities'
import path from 'path'
import { store } from '../store'
import { webpackBuild } from './webpack'
import { writeStats } from './stats'
import { report } from './report'
import ora from 'ora'

import {
  compact,
  concat,
  filter,
  fromPairs,
  includes,
  isEmpty,
  isString,
  isUndefined,
  map,
  some,
  toLower,
  uniq
} from 'lodash'

const spinner = () => {
  const nonInteractive =
    process.env.TEST_OUTPUT === 'true' ||
    machineReadable(store.getState()) ||
    condTest(store.getState())

  const instance = nonInteractive
    ? null
    : ora({
        spinner: 'line',
        color: 'white'
      }).start()

  const update = (text: string) => {
    const success = !condBuildWithErrors(store.getState())

    if (instance !== null) {
      instance.stopAndPersist({
        symbol: success ? '✓' : '×',
        text
      })

      instance.start('')
    }
  }

  const stop = () => {
    if (instance !== null) {
      instance.stop()
    }
  }

  return {
    update,
    stop
  }
}

export interface BuildFlags {
  entry: string[]
  clean: boolean
  minimize: boolean
  module: string[] | string
  output: string | undefined
  stats: boolean
  'machine-readable': boolean
}

export const setup = async (flags: BuildFlags) => {
  const entries: string[] = await Promise.all(
    // tslint:disable-next-line no-unnecessary-callback-wrapper
    map(isUndefined(flags.entry) ? [] : uniq(compact(flags.entry)), file =>
      realpathAsync(file)
    )
  )

  if (condBuild(store.getState())) {
    if (
      uniq(map(entries, entry => path.parse(entry).name)).length !==
      entries.length
    ) {
      throw new Error(
        `Entry name collision, use different filenames:\n${entries}`
      )
    }
  }

  let buildModules: BuildModules

  if (isString(flags.module)) {
    buildModules = [flags.module as BuildModule]
  } else {
    const hasEntry = !isEmpty(entries)
    const defaultModules: BuildModules = hasEntry
      ? ['esm', 'cjs', 'umd']
      : ['esm']

    buildModules = uniq(
      filter(
        isUndefined(flags.module)
          ? defaultModules
          : (concat(flags.module, ['esm']) as BuildModules),
        t => t === 'cjs' || t === 'esm' || t === 'umd'
      )
    )

    if (!hasEntry && some(buildModules, t => t !== 'esm')) {
      throw new Error('Specify at least one entry for CommonJS and UMD builds')
    }
  }

  const outputPath = isUndefined(flags.output)
    ? path.resolve(context(store.getState()), 'lib')
    : path.resolve(flags.output)

  const _clean = isUndefined(flags.clean) ? true : flags.clean
  const minimize = isUndefined(flags.minimize) ? true : flags.minimize

  const compilerOptions = await parseCompilerOptions()

  if (!includes(['es6', 'es2015', 'esnext'], toLower(compilerOptions.module))) {
    throw new Error(
      "The 'module' in compiler options must be one of es6, es2015 or esnext"
    )
  }

  store.dispatch(
    SET_BUILD_OPTIONS({
      clean: _clean,
      compilerOptions,
      entries: fromPairs(map(entries, file => [path.parse(file).name, [file]])),
      minimize,
      outputPath,
      modules: buildModules,
      stats: !!flags.stats,
      machineReadable: !!flags['machine-readable']
    })
  )
}

export const build = async () => {
  const { update, stop } = spinner()

  await clean()
    .then(() => {
      if (condClean(store.getState())) {
        update('Cleaned the output directory')
      }
    })
    .then(gulpBuild)
    .then(() => update('Completed the ES Module build'))
    .then(() =>
      !condBuildWithErrors(store.getState()) &&
      includes(modules(store.getState()), 'cjs')
        ? webpackBuild('cjs' as 'cjs').then(() =>
            update('Completed the CommonJS build')
          )
        : undefined
    )
    .then(() =>
      !condBuildWithErrors(store.getState()) &&
      includes(modules(store.getState()), 'umd')
        ? webpackBuild('umd' as 'umd').then(() =>
            update('Completed the UMD (Universal Module Definition) build')
          )
        : undefined
    )
    .then(writeStats)
    .then(() => {
      const buildModules = modules(store.getState())

      if (
        condStats(store.getState()) &&
        !(buildModules.length === 1 && buildModules[0] === 'esm')
      ) {
        update('Saved the compilation statistics')
      }
    })
    .then(stop)
    .then(report)
    .catch(e => {
      stop()

      throw e
    })
}
