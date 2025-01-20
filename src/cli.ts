#!/usr/bin/env node
import type { TsType, TsTypeAnnotation } from '@swc/core'
import fs from 'node:fs'
import process from 'node:process'
import { parse } from '@swc/core'
import { Visitor } from '@swc/core/Visitor'
import chalk from 'chalk'
import { Command } from 'commander'
import { getTsFiles } from './fg'
import { parseSfc } from './sfc'

const program = new Command()

program
  .version('1.0.0')
  .description('A CLI tool to detect the use of the `any` type in a TypeScript project')
  .option('-d, --dir <dir>', 'Input directory')
  .option('-t, --type <type>', 'Input project type')
  .action(async (options) => {
    const files = await getTsFiles(options.dir, options.type)
    const { default: boxen } = await import('boxen')
    let total = 0
    let count = 0

    for (const file of files) {
      const results = await getAnyTypeRate(file)
      if (results !== 0) {
        total += results
        count++
      }
      const icon = results === 0 ? '✅' : results > 50 ? '🚨' : '🚧'
      const percentage = chalk.bold(results === 0 ? chalk.green(`${results}%`) : results > 50 ? chalk.red(`${results}%`) : chalk.yellow(`${results}%`))
      const relativePath = file.split('/').slice(-2).join('/')
      console.log(`${icon} ${chalk.blue(relativePath.padEnd(30))} ${percentage}`)
    }

    const average = count > 0 ? `${Math.round(total / count)}%` : 'None'
    const result = `${average}`
    const message = boxen(
      `${chalk.yellow.bold(result)} of type annotations are ${chalk.red('any')}\n`
      + `${chalk.dim(`Analyzed ${files.length} files, ${count} ${count > 1 ? 'files' : 'file'} with any type`)}`,
      {
        padding: 1,
        borderStyle: 'round',
        title: chalk.gray.bold('How Any 🤔'),
        titleAlignment: 'left',
      }
    )

    console.log(`\n${message}`)
  })

program.parse(process.argv)

class AnyTypeVisitor extends Visitor {
  public anyTypeCount: number = 0
  public typeAnnotationCount: number = 0

  visitTsType(node: TsType): TsType {
    if (node.type === 'TsKeywordType' && node.kind === 'any') {
      this.anyTypeCount++
    }
    this.typeAnnotationCount++

    return node
  }

  visitTsTypeAnnotation(node: TsTypeAnnotation | undefined): TsTypeAnnotation | undefined {
    if (!node?.typeAnnotation)
      return node

    if (node.typeAnnotation.type === 'TsKeywordType'
      && node.typeAnnotation.kind === 'any') {
      this.anyTypeCount++
    }
    this.typeAnnotationCount++

    return node
  }
}

export async function getAnyTypeRate(file: string): Promise<number> {
  const content = fs.readFileSync(file, 'utf-8')
  let scriptContent = content
  if (file.endsWith('.vue')) {
    scriptContent = await parseSfc(content)
  }
  const ast = await parse(scriptContent, {
    syntax: 'typescript',
    tsx: true,
  })

  const visitor = new AnyTypeVisitor()
  visitor.visitProgram(ast)
  const { anyTypeCount, typeAnnotationCount } = visitor

  const anyTypeRate = Math.round((anyTypeCount / typeAnnotationCount) * 100) || 0
  return anyTypeRate
}
