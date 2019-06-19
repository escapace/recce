import produce from 'immer'
import { AnyAction, DeepPartial, Store, createStore } from 'redux'
import { assign, defaults, isUndefined, union } from 'lodash'
import { INITIAL_STATE } from '../constants'

import { Action, ActionCreator, State } from '../types'

import {
  ADD_FILE_SOURCE,
  ADD_TYPESCRIPT_ERROR,
  BUILD_RESULT,
  RESET,
  RESET_FILE_SOURCES,
  RESET_TYPESCRIPT_ERRORS,
  SET_BUILD_OPTIONS,
  SET_CONTEXT,
  SET_MODE,
  SET_OCLIF_CONFIG,
  SET_PACKAGE_JSON,
  SET_PREFIX,
  SET_ROOTDIR,
  SET_TEST_CONFIG,
  SET_TSCONFIG
} from '../actions'

export function isType<P>(
  action: AnyAction,
  actionCreator: ActionCreator<P>
): action is Action<P> {
  return action.type === actionCreator.type
}

const reducer = (
  state: DeepPartial<State> = INITIAL_STATE,
  action: AnyAction
) => {
  return produce<State>(state as State, draft => {
    if (isType(action, SET_OCLIF_CONFIG)) {
      draft.oclifConfig = action.payload
    } else if (isType(action, SET_CONTEXT)) {
      draft.options.context = action.payload
    } else if (isType(action, SET_PACKAGE_JSON)) {
      draft.options.pjson = action.payload
    } else if (isType(action, SET_MODE)) {
      draft.options.mode = action.payload
    } else if (isType(action, SET_BUILD_OPTIONS)) {
      defaults(draft.options, action.payload)
    } else if (isType(action, SET_PREFIX)) {
      draft.options.prefix = action.payload
    } else if (isType(action, SET_ROOTDIR)) {
      draft.options.rootDir = action.payload
    } else if (isType(action, ADD_TYPESCRIPT_ERROR)) {
      const errors = draft.runtime.errors

      if (isUndefined(errors[action.payload.hash])) {
        errors[action.payload.hash] = action.payload
      } else {
        errors[action.payload.hash].modules = union(
          errors[action.payload.hash].modules,
          action.payload.modules
        )
      }
    } else if (isType(action, ADD_FILE_SOURCE)) {
      draft.runtime.files[action.payload.file] = action.payload.source
    } else if (isType(action, RESET_FILE_SOURCES)) {
      draft.runtime.files = {}
    } else if (isType(action, SET_TSCONFIG)) {
      draft.options.tsconfig = action.payload
    } else if (isType(action, BUILD_RESULT)) {
      draft.runtime.build.push(action.payload)
    } else if (isType(action, RESET)) {
      assign(draft, INITIAL_STATE)
    } else if (isType(action, SET_TEST_CONFIG)) {
      draft.defaults.test = action.payload

      return draft
    } else if (isType(action, RESET_TYPESCRIPT_ERRORS)) {
      draft.runtime.errors = {}
    }
  })
}

export const store: Store<State> = createStore(reducer)
