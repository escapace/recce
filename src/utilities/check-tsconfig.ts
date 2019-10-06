import { isFile } from './is-file'

import { context, tsconfig } from '../selectors'
import { store } from '../store'
import { relative } from 'path'

export const checkTsconfig = async () => {
  const state = store.getState()

  if (!(await isFile(tsconfig(state))).test) {
    throw new Error(
      `File not found: ${relative(
        context(state),
        tsconfig(state)
      )} in ${context(state)}`
    )
  }
}
