#!/usr/bin/env node

import type { TsType, TsTypeAnnotation } from '@swc/core'
import fs from 'node:fs'
import process from 'node:process'
import { parse } from '@swc/core'
import { Visitor } from '@swc/core/Visitor'
import { Command } from 'commander'
import { getTsFiles } from './fg'

const program = new Command()

program
  .version('1.0.0')
  .description('A CLI tool to detect the use of the `any` type in a TypeScript project')
  .option('-d, --dir <dir>', 'Input directory')
  // TODO .option('-t, --type <type>', 'Input project type')
  .action(async (options) => {
    const files = await getTsFiles(options.dir, options.type)
    for (const file of files) {
      const results = await getAnyTypeRate(file)
      // TODO Better result display method
      console.log(file, `any type rate: ${results}%`)
    }
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
  const ast = await parse(content, {
    syntax: 'typescript',
    tsx: false,
  })

  const visitor = new AnyTypeVisitor()
  visitor.visitProgram(ast)
  const { anyTypeCount, typeAnnotationCount } = visitor

  const anyTypeRate = Math.round((anyTypeCount / typeAnnotationCount) * 100) || 0
  return anyTypeRate
}
