import { store } from '../store'
import resolveFrom from 'resolve-from'
import { BuildResult } from '../types'
import path from 'path'
import { BUILD_RESULT } from '../actions'
import { fork } from 'child_process'
import { assign, compact, filter, map, union } from 'lodash'
import recursiveReaddir from 'recursive-readdir'
import { rimraf, writeFileAsync, isFalsy } from '../utilities'
import Bluebird from 'bluebird'

import {
  condBuild,
  condTest,
  context,
  contextModules,
  declaration,
  outputPathEsm,
  outputPathTypes,
  tscBabelOptions,
  tsconfig,
  compilerOptions
} from '../selectors'
import { EOL } from 'os'
import babel = require('@babel/core')

export const tsc = async () => {
  const state = store.getState()

  const executable = path.resolve(
    path.dirname(resolveFrom(contextModules(state), 'typescript')),
    '../bin/tsc'
  )

  const testDeclarations = (file: string) => /\.spec\.d\.ts$/.test(file)
  const tests = (file: string) =>
    condTest(state)
      ? false
      : /\.spec\.js$/.test(file) || /\.spec\.js\.map$/.test(file)
  const notSourceMap = (file: string) => !/\.js.map$/.test(file)
  const onlyJs = (file: string) => /\.js$/.test(file)

  const result: BuildResult = {
    module: 'esm',
    assets: [],
    errors: [],
    hasErrors: false,
    stats: undefined
  }

  await new Bluebird((resolve, reject) => {
    const suite = fork(
      executable,
      union(
        [
          '--module',
          compilerOptions(state).module,
          '--target',
          compilerOptions(state).target,
          '--importHelpers',
          '--project',
          tsconfig(state),
          '--inlineSourceMap',
          '--outDir',
          outputPathEsm(state)
        ],
        declaration(state)
          ? ['--declaration', '--declarationDir', outputPathTypes(state)]
          : []
      ),
      {
        cwd: context(state),
        silent: false,
        env: {
          NODE_PATH: compact([
            process.env.NODE_PATH,
            contextModules(state)
          ]).join(':')
        }
      }
    )

    suite.on('close', (n) => {
      // process.exitCode = code
      if (n === 0) {
        resolve()
      } else {
        result.hasErrors = true

        reject()
      }
    })
  })
    .then(() => recursiveReaddir(outputPathTypes(state)))
    .then((files) => Bluebird.all(map(filter(files, testDeclarations), rimraf)))
    .then(() => recursiveReaddir(outputPathEsm(state)))
    .then((files) =>
      Bluebird.all(map(filter(files, tests), rimraf)).then(() =>
        filter(files, (file) => !tests(file) || !notSourceMap(file))
      )
    )
    .then((files) =>
      Bluebird.all(
        map(filter(files, onlyJs), (filename) =>
          babel
            .transformFileAsync(filename, ({
              root: context(state),
              cwd: context(state),
              sourceMaps: condTest(state) ? 'inline' : true,
              // sourceMaps: true,
              inputSourceMap: true,
              configFile: false,
              filenameRelative: path.relative(context(state), filename),
              filename,
              ...tscBabelOptions(state)
            } as unknown) as babel.TransformOptions)
            .then((result) => {
              if (result !== null) {
                return Bluebird.all(
                  compact([
                    writeFileAsync(
                      filename,
                      !isFalsy(result.map) && condBuild(state)
                        ? `${
                            result.code
                          }${EOL}//# sourceMappingURL=${path.basename(
                            filename
                          )}.map${EOL}`
                        : (result.code as string)
                    ),
                    !isFalsy(result.map) && condBuild(state)
                      ? writeFileAsync(
                          `${filename}.map`,
                          JSON.stringify(result.map)
                        )
                      : undefined
                  ])
                )
              }
            })
        )
      ).then(() => files)
    )
    .then((assets) => store.dispatch(BUILD_RESULT(assign(result, { assets }))))
}
