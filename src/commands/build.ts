/* tslint:disable no-unsafe-any */

import Command from '../base'
import { SET_MODE } from '../actions'
import { pick } from 'lodash'
import { commandFlags } from '../constants'

export default class Build extends Command {
  public static description = 'Bundle the library for publishing.'

  public static examples = [
    '$ recce build -p [directory] -m esm -e src/hello.ts',
    '$ recce build -p [directory] -m cjs -e src/hello.ts -e src/world.ts',
    '$ recce build -m cjs -m umd -m esm -e src/hello.ts -e src/world.ts',
    '$ recce build --no-clean --no-minimize -m umd -e src/hello.ts'
  ]

  public static flags = {
    ...Command.flags,
    ...pick(commandFlags, [
      'clean',
      'entry',
      'machine-readable',
      'minimize',
      'module',
      'output',
      'stats'
    ])
  }

  public static args = []

  public async run() {
    // tslint:disable-next-line no-shadowed-variable
    const { flags } = this.parse(Build)

    this.store.dispatch(SET_MODE('build'))

    const { build, setup } = await import('../effects/build')

    await setup(flags)

    return build()
  }
}
