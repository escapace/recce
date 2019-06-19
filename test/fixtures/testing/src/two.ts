import { capitalize } from 'lodash'

export const helloC = async (name: string): Promise<string> =>
  Promise.resolve(`Hello ${capitalize(name)}`)

export const helloD = async (name: string): Promise<string> =>
  Promise.resolve(`Hello ${capitalize(name)}`)

export const helloE = async (name: string): Promise<string> =>
  Promise.resolve(`Hello ${capitalize(name)}`)

