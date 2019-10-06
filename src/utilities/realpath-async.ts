import { realpath } from 'fs'
import { promisify } from 'util'

export const realpathAsync = promisify(realpath)
