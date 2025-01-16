// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: ['dist', 'node_modules', '*.log', '.gitignore'],
  rules: {
    'vue/no-useless-v-bind': 'off',
    'vue/component-name-in-template-casing': 'off',
    'vue/attribute-hyphenation': 'off',
    'style/comma-dangle': 'off'
  }
})
