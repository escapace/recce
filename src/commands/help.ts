import { Command, flags } from '@oclif/command'

import Help from '@oclif/plugin-help'

export default class HelpCommand extends Command {
  public static description = 'Print usage and options.'
  public static flags = {
    all: flags.boolean({ description: 'See all commands in CLI.' })
  }
  public static args = [
    {
      name: 'command',
      required: false,
      description: 'Command to show help for.'
    }
  ]
  public static strict = false

  public async run() {
    // tslint:disable-next-line: no-shadowed-variable
    const { flags, argv } = this.parse(HelpCommand)
    const help = new Help(this.config, { all: flags.all })
    help.showHelp(argv)
  }
}
