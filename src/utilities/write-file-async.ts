import { promisify } from 'util'
import { writeFile } from 'fs'

export const writeFileAsync = promisify(writeFile)
