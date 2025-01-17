import process from 'node:process'
import fg from 'fast-glob'
import { IGNORE_PATTERNS, PROJECT_TYPES } from './constant'

export async function getTsFiles(dir: string, projectType: keyof typeof PROJECT_TYPES = 'ts'): Promise<string[]> {
  const projectPath = dir ? `${process.cwd()}\\${dir}` : process.cwd()

  const extensions = PROJECT_TYPES[projectType]
  const files = await fg(`**/*.{${extensions.join(',')}}`, {
    cwd: projectPath,
    ignore: IGNORE_PATTERNS,
    absolute: true,
  })

  if (Array.isArray(files) && files.length === 0)
    throw new Error('No ts files found in the current directory')
  return files
}
