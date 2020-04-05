import { statAsync } from './stat-async'

export const isFile = async (
  file: string
): Promise<{ input: string; test: boolean }> =>
  statAsync(file)
    .then((res) => ({ input: file, test: res.isFile() }))
    .catch(() => ({ input: file, test: false }))
