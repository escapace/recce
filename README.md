# Recce

[![Build Status](https://travis-ci.org/escapace/recce.svg?branch=master)](https://travis-ci.org/escapace/recce)
[![Code Coverage](https://codecov.io/gh/escapace/recce/branch/master/graph/badge.svg)](https://codecov.io/gh/escapace/recce)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fescapace%2Frecce.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fescapace%2Frecce?ref=badge_shield)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![license](https://img.shields.io/badge/license-Mozilla%20Public%20License%20Version%202.0-blue.svg)]()

<!-- toc -->
* [Recce](#recce)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g recce
$ recce COMMAND
running command...
$ recce (-v|--version|version)
recce/2.1.5 linux-x64 node-v10.16.0
$ recce --help [COMMAND]
USAGE
  $ recce COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`recce build`](#recce-build)
* [`recce help [COMMAND]`](#recce-help-command)

## `recce build`

build TypeScript library

```
USAGE
  $ recce build

OPTIONS
  -e, --entry=entry         project entry point
  -h, --help                show CLI help
  -m, --module=cjs|umd|esm  module code generation (esm is always enabled)
  -o, --output=output       [default: lib] output directory path
  -p, --project=project     path to 'tsconfig.json', or to a folder with it
  --[no-]clean              [default: true] clean output directory
  --machine-readable        enables JSON output mode
  --[no-]minimize           [default: true] minimize javascript
  --stats                   write JSON file(s) with compilation statistics

EXAMPLES
  $ recce build -p [directory] -m esm -e src/hello.ts
  $ recce build -p [directory] -m cjs -e src/hello.ts -e src/world.ts
  $ recce build -m cjs -m umd -m esm -e src/hello.ts -e src/world.ts
  $ recce build --no-clean --no-minimize -m umd -e src/hello.ts
```

## `recce help [COMMAND]`

display help for recce

```
USAGE
  $ recce help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.0/src/commands/help.ts)_
<!-- commandsstop -->
