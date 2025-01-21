import type { TsType, TsTypeAnnotation } from '@swc/core'
import fs from 'node:fs'
import { parse } from '@swc/core'
import { Visitor } from '@swc/core/Visitor'
import { svelteParser, vueParser } from './parser'

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
  try {
    const content = fs.readFileSync(file, 'utf-8')
    let scriptContent = content

    if (file.endsWith('.vue')) {
      scriptContent = await vueParser(content)
    }
    else if (file.endsWith('.svelte')) {
      scriptContent = await svelteParser(content)
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
  catch (error) {
    console.error(`Error processing file ${file}:`, error)
    return 0
  }
}
