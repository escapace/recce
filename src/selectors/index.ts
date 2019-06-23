export {
  tsErrors,
  tsconfig,
  packageName,
  outputPathUmd,
  outputPathTypes,
  outputPathEsm,
  outputPathCjs,
  outputPath,
  modules,
  machineReadable,
  files,
  entries,
  declaration,
  contextModules,
  rootModules,
  context,
  condWatch,
  condTest,
  condClean,
  condBuildWithErrors,
  condBuild,
  compilerOptions,
  buildResultsWithErrors,
  buildResults
} from './general'

export { compilationStats, condStats, outputPathStats } from './stats'

export { webpackConfiguration, webpackEntries } from './webpack'

export { gulpBabelOptions } from './babel'

export {
  condCoverage,
  testOutput,
  captureConsole,
  coverageExclude
} from './test'

export { lodashId } from './lodash'
