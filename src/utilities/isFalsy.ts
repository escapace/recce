import { isUndefined, isNull } from 'lodash'

export const isFalsy = (value: unknown): boolean =>
  isUndefined(value) || isNull(value)
