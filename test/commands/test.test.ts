import { test } from '@oclif/test'
import { resolve } from 'path'
// import { readFileAsync } from '../../src/utilities'
// import { mapKeys } from 'lodash'

// const fixtureA = resolve('test/fixtures/testing')
const fixtureB = resolve('test/fixtures/json')

// const expected = {
//   total: {
//     lines: {
//       total: 10,
//       covered: 9,
//       skipped: 0,
//       pct: 90
//     },
//     statements: {
//       total: 10,
//       covered: 9,
//       skipped: 0,
//       pct: 90
//     },
//     functions: {
//       total: 5,
//       covered: 4,
//       skipped: 0,
//       pct: 80
//     },
//     branches: {
//       total: 0,
//       covered: 0,
//       skipped: 0,
//       pct: 100
//     }
//   },
//   'src/one.ts': {
//     lines: {
//       total: 4,
//       covered: 4,
//       skipped: 0,
//       pct: 100
//     },
//     functions: {
//       total: 2,
//       covered: 2,
//       skipped: 0,
//       pct: 100
//     },
//     statements: {
//       total: 4,
//       covered: 4,
//       skipped: 0,
//       pct: 100
//     },
//     branches: {
//       total: 0,
//       covered: 0,
//       skipped: 0,
//       pct: 100
//     }
//   },
//   'src/two.ts': {
//     lines: {
//       total: 6,
//       covered: 5,
//       skipped: 0,
//       pct: 83.33
//     },
//     functions: {
//       total: 3,
//       covered: 2,
//       skipped: 0,
//       pct: 66.67
//     },
//     statements: {
//       total: 6,
//       covered: 5,
//       skipped: 0,
//       pct: 83.33
//     },
//     branches: {
//       total: 0,
//       covered: 0,
//       skipped: 0,
//       pct: 100
//     }
//   }
// }

// describe('test: coverage', () => {
//   before(async () => {
//     process.chdir(fixtureA)
//   })
//
//   // Case 1
//
//   test
//     .stdout()
//     .command([
//       'test',
//       '-p',
//       fixtureA,
//       '--browser',
//       'src/*-browser.spec.ts',
//       '--node',
//       'src/*-node.spec.ts',
//       '--reporter',
//       'json-summary'
//     ])
//     .it(
//       "test -p [directory] --browser 'src/*-browser.spec.ts' --node 'src/*-node.spec.ts' --reporter json-summary",
//       async () => {
//         const actual = mapKeys(
//           JSON.parse(
//             (
//               await readFileAsync(
//                 join(fixtureA, 'coverage', 'coverage-summary.json')
//               )
//             ).toString()
//           ),
//           (_, key) =>
//             key === 'total'
//               ? 'total'
//               : key
//                   .replace(/.*one\.ts$/gm, 'src/one.ts')
//                   .replace(/.*two\.ts$/gm, 'src/two.ts')
//         )
//
//         expect(actual).to.deep.equal(expected)
//       }
//     )
// })

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
