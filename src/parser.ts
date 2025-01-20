export async function vueParser(content: string): Promise<string> {
  const scriptBlocks: string[] = []

  // 匹配 <script> 块，包括可能的 lang="ts" 和 setup
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/g
  const matches = content.matchAll(scriptRegex)

  for (const match of matches) {
    const [full, script] = match
    // 检查是否包含 lang="ts" 或 setup
    if (full.includes('lang="ts"') || full.includes('setup')) {
      scriptBlocks.push(script.trim())
    }
  }

  return scriptBlocks.join('\n\n')
}

// TODO svelte parser
export async function svelteParser(content: string): Promise<string> {
  return content
}
