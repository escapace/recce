import produce from 'immer'
import { AnyAction, DeepPartial, Store, createStore } from 'redux'
import { assign, defaults } from 'lodash'
import { INITIAL_STATE } from '../constants'

import { Action, ActionCreator, State } from '../types'

import {
  BUILD_RESULT,
  RESET,
  SET_BUILD_CONFIG,
  SET_CONTEXT,
  SET_MODE,
  SET_OCLIF_CONFIG,
  SET_PACKAGE_JSON,
  SET_PREFIX,
  SET_TEST_CONFIG,
  SET_TSCONFIG,
  SET_PARSED_TSCONFIG
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
      draft.buildConfig.context = action.payload
    } else if (isType(action, SET_PACKAGE_JSON)) {
      draft.buildConfig.pjson = action.payload
    } else if (isType(action, SET_MODE)) {
      draft.buildConfig.mode = action.payload
    } else if (isType(action, SET_BUILD_CONFIG)) {
      defaults(draft.buildConfig, action.payload)
    } else if (isType(action, SET_PREFIX)) {
      draft.buildConfig.prefix = action.payload
    } else if (isType(action, SET_TSCONFIG)) {
      draft.buildConfig.tsconfig = action.payload
    } else if (isType(action, BUILD_RESULT)) {
      draft.runtime.build.push(action.payload)
    } else if (isType(action, RESET)) {
      assign(draft, INITIAL_STATE)
    } else if (isType(action, SET_PARSED_TSCONFIG)) {
      assign(draft.tsConfig, action.payload)
    } else if (isType(action, SET_TEST_CONFIG)) {
      draft.testConfig = action.payload

      return draft
    }
  })
}

export const store: Store<State> = createStore(reducer)
