/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { compare as c } from 'dir-compare'
import { format } from 'util'
import { isUndefined } from 'lodash'

const states = { equal: '==', left: '->', right: '<-', distinct: '<>' }

export const compare = async (a: string, b: string) =>
  c(a, b, {
    compareDate: false,
    compareContent: true,
    noDiffSet: false
  }).then((res) => {
    if (!res.same) {
      let error = format(
        'equal: %s, distinct: %s, left: %s, right: %s, differences: %s, same: %s',
        res.equal,
        res.distinct,
        res.left,
        res.right,
        res.differences,
        res.same
      )

      if (!isUndefined(res.diffSet)) {
        error += '\n'

        res.diffSet.forEach((entry) => {
          const state = states[entry.state]
          const name1 = entry.name1 ? entry.name1 : ''
          const name2 = entry.name2 ? entry.name2 : ''

          if (state !== '==') {
            error += format(
              '%s(%s) %s %s(%s)\n',
              name1,
              entry.type1,
              state,
              name2,
              entry.type2
            )
          }
        })
      }

      throw new Error(`unexpected output \n${error}`)
    }
  })
