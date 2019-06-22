import {
  compact,
  defaults,
  difference,
  filter,
  find,
  get,
  includes,
  isEmpty,
  map,
  mapValues,
  omitBy,
  without
} from 'lodash'
import { join, normalize, relative } from 'path'
import { build } from './build'
import { Reporters } from '../constants'
import { Reporter } from '../types'

import {
  buildResults,
  captureConsole,
  condCoverage,
  context,
  rootModules,
  testOutput,
  tsconfig
} from '../selectors'
import { fork } from 'child_process'
import {
  compilerOptions,
  parseJsonConfig,
  readFileAsync,
  rimraf,
  writeFileAsync
} from '../utilities'
import { SET_BUILD_OPTIONS, SET_TEST_CONFIG } from '../actions'
import { store } from '../store'
import istanbulCoverage, { FileCoverageData } from 'istanbul-lib-coverage'
import istanbulReport from 'istanbul-lib-report'
import istanbulReports from 'istanbul-reports'
import istanbulLibSourceMaps from 'istanbul-lib-source-maps'
import Karma from 'karma'
import micromatch from 'micromatch'
import puppeteer from 'puppeteer'
import resolveFrom from 'resolve-from'
import tmp = require('tmp')

interface Coverage {
  [key: string]: FileCoverageData
}

interface Result {
  code: number
  coverage?: Coverage
}

const testNode = async (props: string[]): Promise<Result> => {
  const source = `#!${process.execPath}

  const Mocha = require('${resolveFrom(
    rootModules(store.getState()),
    'mocha'
  )}')

  const mocha = new Mocha({
    ui: 'bdd'
  })

  ${map(props, file => `mocha.addFile('${file}')`).join('\n')}

  mocha.run(failures => {
    process.exitCode = failures ? 1 : 0

    ${condCoverage(store.getState()) ? `process.send(__coverage__)` : ''}
  })

  process.on('unhandledRejection', error => {
    console.error(error)

    process.exitCode = 1
  })
  `

  const executable = join(testOutput(store.getState()), 'node.js')

  await writeFileAsync(executable, source)

  let coverage

  const code = await new Promise<number>(resolve => {
    const suite = fork(executable, undefined, {
      cwd: context(store.getState()),
      silent: false,
      env: {
        NODE_PATH: compact([
          process.env.NODE_PATH,
          join(context(store.getState()), 'node_modules')
        ]).join(':')
      }
    })

    suite.on('message', m => {
      coverage = m
    })

    suite.on('close', n => {
      // process.exitCode = code
      resolve(n)
    })
  })

  if (condCoverage(store.getState()) && code === 0) {
    // coverage = JSON.parse(
    //   (await readFileAsync(
    //     join(testOutput(store.getState()), 'coverage', 'coverage-final.json')
    //   )).toString()
    // )
    // await rimraf(join(testOutput(store.getState()), 'coverage'))
    // await rimraf(join(testOutput(store.getState()), '.nyc_output'))
  }

  return {
    code,
    coverage
  }
}

const testBrowser = async (props: string[]): Promise<Result> => {
  const Server = Karma.Server

  process.env.CHROME_BIN = puppeteer.executablePath()

  // tslint:disable-next-line: no-any
  const karmaConfig: Karma.ConfigOptions & { coverageIstanbulReporter: any } = {
    basePath: context(store.getState()),
    port: 9876,
    client: {
      captureConsole: captureConsole(store.getState())
    },
    plugins: compact([
      'karma-chrome-launcher',
      'karma-mocha',
      condCoverage(store.getState())
        ? 'karma-coverage-istanbul-reporter'
        : undefined
    ]).map(plugin => resolveFrom(rootModules(store.getState()), plugin)),
    frameworks: ['mocha'],
    files: props,
    singleRun: true,
    concurrency: Infinity,
    reporters: compact([
      'dots',
      condCoverage(store.getState()) ? 'coverage-istanbul' : undefined
    ]),
    browsers: ['puppeteer'],
    customLaunchers: {
      puppeteer: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    },
    coverageIstanbulReporter: {
      reports: ['json'],
      dir: join(testOutput(store.getState()), 'coverage'),
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
      thresholds: {
        emitWarning: true,
        global: {
          statements: 0,
          lines: 0,
          branches: 0,
          functions: 0
        }
      }
    }
  }

  const code = await new Promise<number>(resolve => {
    const server = new Server(karmaConfig, n => {
      resolve(n)
    })

    server.start()
  })

  let coverage

  if (condCoverage(store.getState()) && code === 0) {
    coverage = JSON.parse(
      (await readFileAsync(
        join(testOutput(store.getState()), 'coverage', 'coverage-final.json')
      )).toString()
    )

    await rimraf(join(testOutput(store.getState()), 'coverage'))
    await rimraf(join(testOutput(store.getState()), '.nyc_output'))
  }

  return {
    code,
    coverage
  }
}

const reportCoverage = async (
  reports: { node: Result; browser: Result },
  files: string[],
  reporters: Reporter[]
) => {
  if (condCoverage(store.getState())) {
    // TODO: do this?
    await rimraf(join(context(store.getState()), 'coverage'))

    // const coverage = result.coverage
    const sourceMapStore = istanbulLibSourceMaps.createSourceMapStore()
    const coverageMap = istanbulCoverage.createCoverageMap()
    const coverageContext = istanbulReport.createContext()

    const nodeCoverage = reports.node.coverage
    const browserCoverage = reports.browser.coverage

    if (nodeCoverage !== undefined) {
      Object.keys(nodeCoverage).forEach(filename => {
        const fixedPath = normalize(nodeCoverage[filename].path)
        nodeCoverage[filename].path = fixedPath

        coverageMap.addFileCoverage(nodeCoverage[filename])
      })
    }

    const remappedCoverageMap = sourceMapStore.transformCoverage(coverageMap)
      .map

    if (browserCoverage !== undefined) {
      Object.keys(browserCoverage).forEach(filename => {
        remappedCoverageMap.addFileCoverage(browserCoverage[filename])
      })
    }

    remappedCoverageMap.filter(path => includes(files, path))

    const tree = istanbulReport.summarizers.pkg(remappedCoverageMap)

    reporters.forEach(reporter =>
      tree.visit(istanbulReports.create(reporter, {}), coverageContext)
    )
  }
}

export const test = async (flags: {
  browser: string[]
  node: string[]
  reporter: string[]
  coverage: boolean
  'capture-console': boolean
}) => {
  defaults(flags, {
    browser: [],
    node: [],
    coverage: true,
    reporter: ['text-summary'],
    'capture-console': false
  })

  const parsedJsonConfig = parseJsonConfig(tsconfig(store.getState()))

  const files: string[] = get(parsedJsonConfig, 'parsedConfig.fileNames', [])

  if (isEmpty(files)) {
    throw new Error('The project does not contain any files')
  }

  const enabled = {
    node: !isEmpty(flags.node),
    browser: !isEmpty(flags.browser)
  }

  if (!enabled.browser && !enabled.node) {
    throw new Error(`Either '--browser' or '--node' is required`)
  }

  const testFiles = (mapValues(enabled, (value, key: 'node' | 'browser') => {
    if (!value) {
      return []
    }

    const glob = key === 'node' ? flags.node : flags.browser

    return filter(files, file =>
      micromatch.any(relative(context(store.getState()), file), glob)
    )
  }) as unknown) as {
    node: string[]
    browser: string[]
  }

  const nonTestFiles = without(files, ...testFiles.browser, ...testFiles.node)

  if (isEmpty(testFiles.node) && isEmpty(testFiles.browser)) {
    throw new Error('No test files found')
  }

  const invalidReporters = difference(flags.reporter, Reporters)

  if (!isEmpty(invalidReporters)) {
    throw new Error(`No such reporter: ${invalidReporters.join(', ')}`)
  }

  const moduleType = (target: 'node' | 'browser') =>
    target === 'node' ? 'cjs' : 'umd'

  const tmpobj = tmp.dirSync({ prefix: 'recce-', unsafeCleanup: true })

  const output = tmpobj.name

  tmp.setGracefulCleanup()

  process.env.NYC_CWD = output

  store.dispatch(
    SET_TEST_CONFIG({
      output,
      coverage: flags.coverage,
      captureConsole: flags['capture-console']
    })
  )

  store.dispatch(
    SET_BUILD_OPTIONS({
      clean: true,
      compilerOptions: await compilerOptions(parsedJsonConfig),
      entries: omitBy(
        {
          node: testFiles.node,
          browser: testFiles.browser
        },
        // tslint:disable-next-line: no-unnecessary-callback-wrapper
        value => isEmpty(value)
      ),
      minimize: false,
      outputPath: output,
      modules: compact([
        'esm',
        enabled.browser ? 'umd' : undefined,
        enabled.node ? 'cjs' : undefined
      ]),
      stats: false,
      machineReadable: true
    })
  )

  await build()
  const results = buildResults(store.getState())

  const compiledTestFiles = (target: 'node' | 'browser') =>
    filter(
      get(
        find(results, result => result.module === moduleType(target)),
        'assets',
        []
      ),
      file => file.substr(-3) === '.js'
    )

  const resultDisabled: Result = {
    code: 0
  }

  const resultNode = enabled.node
    ? await testNode(compiledTestFiles('node'))
    : resultDisabled

  // logger.info(resultNode.coverage)

  const resultBrowser = enabled.browser
    ? await testBrowser(compiledTestFiles('browser'))
    : resultDisabled

  await reportCoverage(
    { node: resultNode, browser: resultBrowser },
    nonTestFiles,
    flags.reporter as Reporter[]
  )

  if (resultBrowser.code + resultNode.code !== 0) {
    process.exitCode = 1
  }
}
