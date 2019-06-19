import { statAsync } from './statAsync'

export const isDirectory = async (
  file: string
): Promise<{ input: string; test: boolean }> =>
  statAsync(file)
    .then(res => ({ input: file, test: res.isDirectory() }))
    .catch(() => ({ input: file, test: false }))
