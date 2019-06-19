import { createSelector } from 'reselect'
import { intersection, keys } from 'lodash'
import { LodashOptions, State } from '../types'

import { combinedDependencies } from './general'

const id = (state: State): string[] => state.defaults.lodash.id

export const lodashOptions = (state: State): LodashOptions =>
  state.defaults.lodash.options

export const lodashId = createSelector(
  combinedDependencies,
  id,
  (a, b): string[] => intersection(keys(a), b)
)

export const condLodash = createSelector(
  lodashId,
  (a): boolean => a.length !== 0
)
