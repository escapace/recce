import { promisify } from 'util'
import { readFile } from 'fs'

export const readFileAsync = promisify(readFile)
