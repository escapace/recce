import {
  CompilerOptions,
  LodashOptions,
  MinifyOptions,
  NodeOptions,
  Reporter,
  State
} from '../types'
import { flags } from '@oclif/command'
import { DeepPartial } from 'redux'

export const Reporters: Reporter[] = [
  'lcovonly',
  'text',
  'clover',
  'cobertura',
  'html',
  'json',
  'json-summary',
  'lcov',
  'none',
  'teamcity',
  'text-lcov',
  'text-summary'
]

export const commandFlags = {
  entry: flags.string({
    char: 'e',
    helpValue: 'path',
    description: [
      'Path to the library entry point(s).',
      'Can be specified multiple times.'
    ].join('\n'),
    multiple: true,
    required: false
  }),
  output: flags.string({
    char: 'o',
    helpValue: 'directory',
    description: 'Redirect output structure to a directory.',
    required: false
  }),
  minimize: flags.boolean({
    description: 'Emit minifed JavaScript. Enalbed by default.',
    allowNo: true
  }),
  stats: flags.boolean({
    description: 'Write JSON files with compilation statistics.',
    default: false
  }),
  clean: flags.boolean({
    description: [
      'Delete the output directory in advance.',
      'Enabled by default.'
    ].join('\n'),
    allowNo: true
  }),
  module: flags.string({
    char: 'm',
    description: [
      'CommonJS, Universal Module Definition or EcmaScript modules.',
      'EcmaScript modules are always enabled.',
      'Can be specified multiple times.'
    ].join('\n'),
    multiple: true,
    options: ['cjs', 'umd', 'esm'],
    required: false
  }),
  browser: flags.string({
    helpValue: 'pattern',
    char: 'b',
    description: [
      'Glob pattern that matches test files to run on Node.js.',
      'Can be specified multiple times.'
    ].join('\n'),
    multiple: true,
    required: false
  }),
  node: flags.string({
    helpValue: 'pattern',
    char: 'n',
    description: [
      'Glob pattern that matches test files to run in the browser.',
      'Can be specified multiple times.'
    ].join('\n'),
    multiple: true,
    required: false
  }),
  coverage: flags.boolean({
    description: [
      'Collect and report test coverage.',
      'Enabled by default.'
    ].join('\n'),
    allowNo: true
  }),
  'coverage-exclude': flags.string({
    helpValue: 'pattern',
    description: [
      'Glob pattern that matches files to execlude from coverage.',
      'Can be specified multiple times.'
    ].join('\n'),
    multiple: true,
    required: false
  }),
  'capture-console': flags.boolean({
    description: [
      'Capture all console output and pipe it to the terminal.',
      'Disabled by default.'
    ].join('\n'),

    allowNo: true
  }),
  reporter: flags.string({
    description: [
      `Test coverage reporter(s): ${Reporters.slice(0, 5).join(', ')},`,
      `${Reporters.slice(5).join(', ')}.`,
      'Can be specified multiple times.'
    ].join('\n'),
    // options: Reporters,
    multiple: true,
    required: false
  }),
  'machine-readable': flags.boolean({
    description: 'Produce machine readable JSON output.',
    default: false
  }),
  'concatenate-modules': flags.boolean({
    description: [
      'Find segments of the module graph which',
      'can be safely concatenated into a single module.',
      'Enabled by default.'
    ].join('\n'),
    allowNo: true
  })
}

const TS_COMPILER_OPTIONS: CompilerOptions = {
  downlevelIteration: true,
  importHelpers: true,
  target: 'es6',
  module: 'esnext',
  moduleResolution: 'node',
  sourceMap: true
}

const WEBPACK_NODE: NodeOptions = {
  console: false,
  global: false,
  process: true,
  __filename: false,
  __dirname: false,
  Buffer: false,
  setImmediate: false
}

const LODASH_OPTIONS: LodashOptions = {
  collections: true,
  exotics: true
  // cloning: true,
  // caching: true,
  // collections: true,
  // unicode: true,
  // memoizing: true,
  // coercions: true,
  // flattening: true,
  // paths: true
}

const MINIFY_OPTIONS: MinifyOptions = {
  compress: {
    passes: 2,
    defaults: true,
    pure_getters: true,
    toplevel: true,
    arrows: true,
    collapse_vars: true,
    comparisons: true,
    computed_props: true,
    // hoist_funs: true,
    // hoist_props: true,
    // hoist_vars: true,
    inline: true,
    loops: true,
    negate_iife: true,
    properties: true,
    reduce_funcs: true,
    reduce_vars: true,
    switches: true,
    typeofs: true,
    booleans: true, // 0.7kb
    if_return: true, // 0.4kb
    sequences: true, // 0.7kb
    unused: true, // 2.3kb
    conditionals: true,
    dead_code: true,
    evaluate: true
  },
  module: true,
  toplevel: true,
  safari10: true
}

export const INITIAL_STATE: DeepPartial<State> = {
  buildConfig: {},
  testConfig: { coverage: false, coverageExclude: [] },
  tsConfig: {},
  runtime: {
    files: {},
    // errors: {},
    build: []
  },
  defaults: {
    lodash: {
      id: ['lodash-es', 'lodash', 'lodash-fp'],
      options: LODASH_OPTIONS
    },
    minify: MINIFY_OPTIONS,
    node: WEBPACK_NODE,
    compilerOptions: TS_COMPILER_OPTIONS
  }
}
