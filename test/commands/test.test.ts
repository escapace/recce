import { expect, test } from '@oclif/test'
import { join, resolve } from 'path'
import { readFileAsync } from '../../src/utilities'

const fixtureA = resolve('test/fixtures/testing')
const fixtureB = resolve('test/fixtures/json')

// describe('failure modes', () => {
//   before(() => {
//     process.chdir(fixtureA)
//   })

//   test
//     .stdout()
//     .command(['build', '-p', fixtureA, '-m', 'cjs'])
//     .catch(/Specify at least one entry for CommonJS and UMD builds/)
//     .it('throws on target cjs and no entry')

//   test
//     .stdout()
//     .command(['build', '-p', fixtureA, '-m', 'umd'])
//     .catch(/Specify at least one entry for CommonJS and UMD builds/)
//     .it('throws on target umd and no entry')

//   test
//     .stdout()
//     .command(['build', '-p', fixtureZ])
//     .catch(/The specified path does not exist/)
//     .it('throws on invalid context')
// })

describe('test: coverage', () => {
  before(async () => {
    process.chdir(fixtureA)
  })

  // test
  //   .stdout()
  //   .command(['build', '-p', fixtureA])
  //   .it('build -p [directory]')

  // // One entry

  // test
  //   .stdout()
  //   .command(['build', '-p', fixtureA, '-e', 'src/hello.ts'])
  //   .it('build -p [directory] -e src/hello.ts')

  // test
  //   .stdout()
  //   .command(['build', '-p', fixtureA, '-m', 'cjs', '-e', 'src/hello.ts'])
  //   .it('build -p [directory] -m cjs -e src/hello.ts')

  // test
  //   .stdout()
  //   .command(['build', '-p', fixtureA, '-m', 'umd', '-e', 'src/hello.ts'])
  //   .it('build -p [directory] -m umd -e src/hello.ts')

  // Case 1

  test
    .stdout()
    .command([
      'test',
      '-p',
      fixtureA,
      '--browser',
      'src/*-browser.spec.ts',
      '--node',
      'src/*-node.spec.ts',
      '--reporter',
      'lcovonly'
    ])
    .it(
      "test -p [directory] --browser 'src/*-browser.spec.ts' --node 'src/*-node.spec.ts' --reporter lcovonly",
      async () => {
        const actual = (await readFileAsync(
          join(fixtureA, 'coverage', 'lcov.info')
        )).toString()
        const expected = (await readFileAsync(
          join(fixtureA, 'expected', 'lcov.info')
        )).toString()
        const fixed = actual
          .replace(/^SF:.*one\.ts$/gm, 'SF:src/one.ts')
          .replace(/^SF:.*two\.ts$/gm, 'SF:src/two.ts')

        expect(fixed).to.equal(expected)
      }
    )
})

describe('test: json import', () => {
  before(async () => {
    process.chdir(fixtureB)
  })

  test
    .stdout()
    .command([
      'test',
      '-p',
      fixtureB,
      '--browser',
      'src/*.spec.ts',
      '--node',
      'src/*.spec.ts'
    ])
    .it("test -p [directory] --browser 'src/*.spec.ts' --node 'src/*.spec.ts'")
})
