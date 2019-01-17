/* tslint:disable no-console */

// import { expect, test } from '@oclif/test'
import { test } from '@oclif/test'
import { join, resolve } from 'path'
import { compare } from '../helpers/compare'
// import { rimraf } from '../../src/utilities/rimraf'

const fixtureA = resolve('test/fixtures/hello-world')
const fixtureZ = resolve('test/fixtures/invalid')

describe('failure modes', () => {
  before(() => {
    process.chdir(fixtureA)
  })

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'cjs'])
    .catch(/Specify at least one entry for CommonJS and UMD builds/)
    .it('throws on target cjs and no entry')

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'umd'])
    .catch(/Specify at least one entry for CommonJS and UMD builds/)
    .it('throws on target umd and no entry')

  test
    .stdout()
    .command(['build', '-p', fixtureZ])
    .catch(/The specified path does not exist/)
    .it('throws on invalid context')
})

describe('one entry', () => {
  before(async () => {
    process.chdir(fixtureA)
  })

  test
    .stdout()
    .command(['build', '-p', fixtureA])
    .it('build -p [directory]')

  // One entry

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-e', 'src/hello.ts'])
    .it('build -p [directory] -e src/hello.ts')

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'cjs', '-e', 'src/hello.ts'])
    .it('build -p [directory] -m cjs -e src/hello.ts')

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'umd', '-e', 'src/hello.ts'])
    .it('build -p [directory] -m umd -e src/hello.ts')

  // Case 1

  test
    .stdout()
    .command([
      'build',
      '-p',
      fixtureA,
      '--no-minimize',
      '-m',
      'cjs',
      '-m',
      'umd',
      '-e',
      'src/hello.ts'
    ])
    .it('build -p [directory] --no-minimize -m cjs -m umd -e src/hello.ts', async () =>
      compare(join(fixtureA, 'lib'), join(fixtureA, 'expected/case-1'))
    )
})

describe('two entries', () => {
  before(() => {
    process.chdir(fixtureA)
  })

  // Two entries

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'cjs', '-e', 'src/hello.ts', '-e', 'src/world.ts'])
    .it('build -p [directory] -m cjs -e src/hello.ts -e src/world.ts')

  test
    .stdout()
    .command(['build', '-p', fixtureA, '-m', 'umd', '-e', 'src/hello.ts', '-e', 'src/world.ts'])
    .it('build -p [directory] -m umd -e src/hello.ts -e src/world.ts')

  // Case 2

  test
    .stdout()
    .command([
      'build',
      '-p',
      fixtureA,
      '--no-minimize',
      '-m',
      'cjs',
      '-m',
      'umd',
      '-e',
      'src/hello.ts',
      '-e',
      'src/world.ts'
    ])
    .it(
      'build -p [directory] --no-minimize -m cjs -m umd -e src/hello.ts -e src/world.ts',
      async () => compare(join(fixtureA, 'lib'), join(fixtureA, 'expected/case-2'))
    )
})
