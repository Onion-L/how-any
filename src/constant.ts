export const IGNORE_PATTERNS = [
  // 目录
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  // 配置文件
  '**/*.config.*',
  // 类型声明文件
  '**/*.d.ts',
]

export const PROJECT_TYPES = {
  ts: ['ts', 'tsx'],
  vue: ['vue', 'ts', 'tsx'],
  svelte: ['svelte', 'ts', 'tsx'],
  astro: ['astro', 'ts', 'tsx'],
} as const
