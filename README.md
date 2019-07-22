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
recce/3.2.4 linux-x64 node-v12.4.0
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
* [`recce test`](#recce-test)

## `recce build`

Bundle the library for publishing.

```
USAGE
  $ recce build

OPTIONS
  -e, --entry=path          Path to the library entry point(s).
                            Can be specified multiple times.

  -m, --module=cjs|umd|esm  CommonJS, Universal Module Definition or EcmaScript modules.
                            EcmaScript modules are always enabled.
                            Can be specified multiple times.

  -o, --output=directory    Redirect output structure to a directory.

  -p, --project=path        Path to project's configuration file, or to a folder with a 'tsconfig.json'.

  --[no-]clean              Delete the output directory in advance.
                            Enabled by default.

  --machine-readable        Produce machine readable JSON output.

  --[no-]minimize           Emit minifed JavaScript. Enalbed by default.

  --stats                   Write JSON files with compilation statistics.

EXAMPLES
  $ recce build -p [directory] -m esm -e src/hello.ts
  $ recce build -p [directory] -m cjs -e src/hello.ts -e src/world.ts
  $ recce build -m cjs -m umd -m esm -e src/hello.ts -e src/world.ts
  $ recce build --no-clean --no-minimize -m umd -e src/hello.ts
```

## `recce help [COMMAND]`

Print usage and options.

```
USAGE
  $ recce help [COMMAND]

ARGUMENTS
  COMMAND  Command to show help for.

OPTIONS
  --all  See all commands in CLI.
```

## `recce test`

Run tests on Node.js and in the browser.

```
USAGE
  $ recce test

OPTIONS
  -b, --browser=pattern       Glob pattern that matches test files to run on Node.js.
                              Can be specified multiple times.

  -n, --node=pattern          Glob pattern that matches test files to run in the browser.
                              Can be specified multiple times.

  -p, --project=path          Path to project's configuration file, or to a folder with a 'tsconfig.json'.

  --[no-]capture-console      Capture all console output and pipe it to the terminal.
                              Disabled by default.

  --[no-]coverage             Collect and report test coverage.
                              Enabled by default.

  --coverage-exclude=pattern  Glob pattern that matches files to execlude from coverage.
                              Can be specified multiple times.

  --reporter=reporter         Test coverage reporter(s): lcovonly, text, clover, cobertura, html,
                              json, json-summary, lcov, none, teamcity, text-lcov, text-summary.
                              Can be specified multiple times.

EXAMPLES
  $ recce test --browser 'src/**.spec.ts'
  $ recce test -p [directory] --browser 'src/**.spec.ts' --browser 'test/**.spec.ts'
  $ recce test -p [directory] --node 'src/**.spec.ts' --node 'test/**.spec.ts'
```
<!-- commandsstop -->
