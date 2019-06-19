import ObjectHash = require('node-object-hash')
import chalk from 'chalk'
import {
  ADD_FILE_SOURCE,
  ADD_TYPESCRIPT_ERROR,
  RESET_FILE_SOURCES,
  RESET_TYPESCRIPT_ERRORS
} from '../actions'
import { BuildModule, FileSource, TypescriptError } from '../types'
import { EOL } from 'os'
// tslint:disable-next-line no-submodule-imports
import { TypeScriptError } from 'gulp-typescript/release/reporter'
import { codeFrameColumns } from '@babel/code-frame'
import { context, files, tsErrors } from '../selectors/general'
import {
  forEach,
  forOwn,
  includes,
  isUndefined,
  keys,
  upperCase,
  values
} from 'lodash'
import { logger } from '@escapace/logger'
import { normalize, relative } from 'path'
import { store } from '../store'
import { readFileAsync } from '../utilities/readFileAsync'

const objectHash = ObjectHash()

export const resetErrors = () => {
  store.dispatch(RESET_FILE_SOURCES(undefined))
  store.dispatch(RESET_TYPESCRIPT_ERRORS(undefined))
}

export const dispatchError = (props: { module: BuildModule }) => (
  error: TypescriptError
): string => {
  const hash = objectHash.hash(error)
  store.dispatch(
    ADD_TYPESCRIPT_ERROR({
      modules: [props.module],
      hash,
      error
    })
  )

  return hash
}

export const dispatchFilesFromErrors = async () => {
  const state = store.getState()

  const filenames = keys(files(state))
  const p: { [key: string]: Promise<FileSource> } = {}

  forOwn(tsErrors(store.getState()), ({ error }) => {
    if (
      error.file !== '' &&
      !includes(filenames, error.file) &&
      isUndefined(p[error.file])
    ) {
      p[error.file] = readFileAsync(error.file)
        .then(buf => buf.toString('utf-8'))
        .then(source => ({
          source,
          file: error.file
        }))
    }
  })

  return Promise.all(values(p)).then(props => {
    forEach(props, prop => store.dispatch(ADD_FILE_SOURCE(prop)))
  })
}

export const reportErrors = () => {
  const state = store.getState()

  forEach(tsErrors(state), ({ error }) => {
    const file =
      error.file === '' ? '' : chalk.cyan(relative(error.context, error.file))
    const code = chalk.bold.gray(`TS${error.code}`)
    const severity =
      error.severity === 'error'
        ? chalk.bold.red(upperCase(error.severity))
        : chalk.bold.yellow(upperCase(error.severity))

    if (error.file === '') {
      logger.log(`${severity} ${code}: ${error.content}`)
    } else {
      const source = files(state)[error.file]

      let frame = ''

      if (!isUndefined(source)) {
        frame = codeFrameColumns(
          source,
          { start: { line: error.line, column: error.character } },
          { highlightCode: chalk.supportsColor.hasBasic }
        )
          .split('\n')
          .map(str => `  ${str}`)
          .join(EOL)
      }

      const loc = `:${chalk.yellow(String(error.line))}:${chalk.yellow(
        String(error.character)
      )}`

      logger.log(
        `\n${file}${loc} - ${severity} ${code}: ${error.content}`,
        EOL,
        frame,
        EOL
      )
    }
  })
}

// tslint:disable-next-line no-any
export const normalizeGulpError = (error: TypeScriptError, compiler: any) => {
  const state = store.getState()

  const severity = compiler.DiagnosticCategory[
    error.diagnostic.category
  ].toLowerCase()

  const file = error.diagnostic.file

  const position =
    file === undefined
      ? undefined
      : // tslint:disable-next-line no-non-null-assertion no-unnecessary-type-assertion
        file.getLineAndCharacterOfPosition(error.diagnostic.start!)

  const content = compiler.flattenDiagnosticMessageText(
    error.diagnostic.messageText,
    EOL
  )

  dispatchError({ module: 'esm' })({
    severity,
    code: error.diagnostic.code,
    content,
    file: file === undefined ? '' : normalize(file.fileName),
    // tslint:disable-next-line restrict-plus-operands
    line: position === undefined ? 0 : position.line + 1,
    // tslint:disable-next-line restrict-plus-operands
    character: position === undefined ? 0 : position.character + 1,
    context: context(state)
  })

  return error.message
}
