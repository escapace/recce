import pkgUp = require('pkg-up')
import { PackageJson } from '../types'
import { isNull } from 'lodash'
import { normalizePackageJson } from './normalizePackageJson'
import { readFileAsync } from './readFileAsync'
import { isDirectory } from './isDirectory'

export const packageJson = async (
  cwd: string
): Promise<{
  path: string
  content: PackageJson
}> => {
  const { test } = await isDirectory(cwd)

  if (!test) {
    throw new Error(`${cwd}: No such directory`)
  }

  const path = await pkgUp({ cwd })

  if (!isNull(path)) {
    return {
      path: path,
      content: normalizePackageJson(
        JSON.parse(await readFileAsync(path, 'utf8'))
      )
    }
  }

  throw new Error(`package.json: No such file`)
}
