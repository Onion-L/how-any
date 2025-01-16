import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['bin/*.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  shims: true,
})
