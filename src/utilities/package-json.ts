import pkgUp from 'pkg-up'
import { PackageJson } from '../types'
import { isNull } from 'lodash'
import { normalizePackageJson } from './normalize-package-json'
import { readFileAsync } from './read-file-async'
import { isDirectory } from './is-directory'

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
      path,
      content: normalizePackageJson(
        JSON.parse(await readFileAsync(path, 'utf8'))
      )
    }
  }

  throw new Error(`package.json: No such file`)
}
