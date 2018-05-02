// import { expect, test } from '@oclif/test'
import { test } from '@oclif/test'
import { resolve } from 'path'

describe('build', () => {
  // test
  //   .stdout()
  //   .command(['build'])
  //   .it('runs build', ctx => {
  //     expect(ctx.error).to.equal(undefined)
  //     // expect(ctx.stdout).to.contain('hello world')
  //   })
  test
    .stdout()
    .command(['build'])
    .catch(/Change the working directory/)
    .it('throws in recce directory')

  test
    .stdout()
    .command(['build', '-c', resolve('test/fixtures/invalid')])
    .catch(/No such directory/)
    .it('throws on invalid context')

  test
    .stdout()
    .command(['build', '-c', resolve('test/fixtures/hello-world'), '-m', 'cjs'])
    .catch(/Specify at least one entry for CommonJS and UMD builds/)
    .it('throws on target cjs and no entry')

  test
    .stdout()
    .command(['build', '-c', resolve('test/fixtures/hello-world'), '-m', 'umd'])
    .catch(/Specify at least one entry for CommonJS and UMD builds/)
    .it('throws on target umd and no entry')

  test
    .stdout()
    .command(['build', '-c', resolve('test/fixtures/hello-world')])
    .it('build -c [directory]')

  // One entry

  test
    .stdout()
    .command(['build', '-c', resolve('test/fixtures/hello-world'), '-m', 'esm'])
    .it('build -c [directory] -m esm -e src/hello.ts')

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'cjs',
      '-e',
      'src/hello.ts'
    ])
    .it('build -c [directory] -m cjs -e src/hello.ts')

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'umd',
      '-e',
      'src/hello.ts'
    ])
    .it('build -c [directory] -m umd -e src/hello.ts')

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'cjs',
      '-m',
      'umd',
      '-m',
      'esm',
      '-e',
      'src/hello.ts'
    ])
    .it('build -c [directory] -m cjs -m umd -m esm -e src/hello.ts')

  // Two entries

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'cjs',
      '-e',
      'src/hello.ts',
      '-e',
      'src/world.ts'
    ])
    .it('build -c [directory] -m cjs -e src/hello.ts -e src/world.ts')

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'umd',
      '-e',
      'src/hello.ts',
      '-e',
      'src/world.ts'
    ])
    .it('build -c [directory] -m umd -e src/hello.ts -e src/world.ts')

  test
    .stdout()
    .command([
      'build',
      '-c',
      resolve('test/fixtures/hello-world'),
      '-m',
      'cjs',
      '-m',
      'umd',
      '-m',
      'esm',
      '-e',
      'src/hello.ts',
      '-e',
      'src/world.ts'
    ])
    .it('build -c [directory] -m cjs -m umd -m esm -e src/hello.ts -e src/world.ts')
})
