import { capitalize } from 'lodash'

export const helloA = async (name: string): Promise<string> =>
  Promise.resolve(`Hello ${capitalize(name)}`)

export const helloB = async (name: string): Promise<string> =>
  Promise.resolve(`Hello ${capitalize(name)}`)

