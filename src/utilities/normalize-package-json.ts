import normalizePackage from 'normalize-package-data'

import { PackageJson } from '../types'

import { noop } from 'lodash'

export const normalizePackageJson = (
  data: PackageJson,
  strict = true
): PackageJson => {
  normalizePackage(data, noop, strict)

  return data
}
