import sourcemaps = require('gulp-sourcemaps')
import babel = require('gulp-babel')
import gulpFilter = require('gulp-filter')
import gulpTap = require('gulp-tap')
import merge = require('merge2')
import path from 'path'
import resolveFrom = require('resolve-from')
import gulp = require('gulp')
import typescript = require('gulp-typescript')
import { BuildResult } from '../types'
import { BUILD_RESULT, SET_ROOTDIR } from '../actions'
import { compact, includes, isUndefined, noop } from 'lodash'
import { normalizeGulpError } from './errors'
import { store } from '../store'
import {
  compilerOptions,
  condBuild,
  condTest,
  context,
  contextModules,
  declaration,
  gulpBabelOptions,
  outputPathEsm,
  outputPathTypes,
  tsconfig
} from '../selectors'

export const gulpBuild = async () => {
  const state = store.getState()

  const compiler = await import(
    resolveFrom(contextModules(state), 'typescript')
  )

  return new Promise<BuildResult>(resolve => {
    const result: BuildResult = {
      module: 'esm',
      assets: [],
      errors: [],
      hasErrors: false,
      stats: undefined
    }

    const project = typescript.createProject(tsconfig(state), {
      noEmitOnError: true,
      typescript: compiler,
      sourceRoot: undefined,
      ...compilerOptions(state),
      removeComments: false,
      outDir: context(state),
      watch: false,
      sourceMap: true,
      inlineSourceMap: true,
      inlineSources: true
    })

    const stream = project
      .src()
      .pipe(sourcemaps.init())
      .pipe(
        project({
          error(error) {
            const rendered = normalizeGulpError(error, compiler)

            if (!includes(result.errors, rendered)) {
              result.errors.push(rendered)
            }
          },
          finish(data) {
            const showErrorCount = (count: number) => {
              if (count === 0) return

              result.hasErrors = true
            }

            store.dispatch(
              SET_ROOTDIR(
                isUndefined(project.options.rootDir)
                  ? context(state)
                  : project.options.rootDir
              )
            )

            showErrorCount(data.transpileErrors)
            showErrorCount(data.optionsErrors)
            showErrorCount(data.syntaxErrors)
            showErrorCount(data.globalErrors)
            showErrorCount(data.semanticErrors)
            showErrorCount(data.declarationErrors)
            showErrorCount(data.emitErrors)
          }
        })
      )
      .on('error', noop)

    const specFilter = gulpFilter(file =>
      condBuild(store.getState()) ? !/\.spec\.js$/.test(file.path) : true
    )

    const specTypesFilter = gulpFilter(file =>
      condBuild(store.getState()) ? !/\.spec\.d\.ts$/.test(file.path) : true
    )

    const ds = declaration(state)
      ? stream.dts.pipe(specTypesFilter).pipe(gulp.dest(outputPathTypes(state)))
      : undefined

    const es = stream.js
      .pipe(specFilter)
      // tslint:disable-next-line no-any
      .pipe(babel(gulpBabelOptions(state) as any))
      .pipe(
        sourcemaps.write('.', {
          includeContent: false,
          sourceRoot: condTest(state)
            ? context(state)
            : path.relative(outputPathEsm(state), context(state))
        })
      )
      .pipe(gulp.dest(outputPathEsm(state)))
      .pipe(
        gulpTap(file => {
          if (path.extname(file.path) === '.js') {
            result.assets.push(file.path)
          }
        })
      )

    merge(compact([ds, es]))
      .on('finish', () => {
        resolve(result)
      })
      .on('error', error => {
        if (error && error.message) {
          result.errors.push(error.message)
        }

        result.hasErrors = true

        resolve(result)
      })
  }).then(result => store.dispatch(BUILD_RESULT(result)))
}
