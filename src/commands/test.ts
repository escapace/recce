import Command from '../base'
import { SET_MODE } from '../actions'
import { pick } from 'lodash'
import { commandFlags } from '../constants'

export default class Test extends Command {
  public static description = 'Run tests on Node.js and in the browser.'

  public static examples = [
    "$ recce test --browser 'src/**.spec.ts'",
    "$ recce test -p [directory] --browser 'src/**.spec.ts' --browser 'test/**.spec.ts'",
    "$ recce test -p [directory] --node 'src/**.spec.ts' --node 'test/**.spec.ts'",
    "$ recce test -p [directory] --node 'src/**.spec.ts' --browser 'src/**.spec.ts'"
  ]

  public static flags = {
    ...Command.flags,
    ...pick(commandFlags, [
      'browser',
      'capture-console',
      'coverage-exclude',
      'coverage',
      'node',
      'reporter'
    ])
  }

  public async run() {
    const parse = this.parse(Test)

    this.store.dispatch(SET_MODE('test'))

    const { test } = await import('../effects/test')

    return test(parse.flags)
  }
}
