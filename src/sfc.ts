import { compileScript, parse } from '@vue/compiler-sfc'

export async function parseSfc(content: string): Promise<string> {
  const { descriptor } = parse(content)

  if (descriptor.script || descriptor.scriptSetup) {
    const scriptResult = compileScript(
      descriptor,
      { id: new Date().toISOString(), inlineTemplate: true }
    )
    return scriptResult.content
  }

  return content
}
