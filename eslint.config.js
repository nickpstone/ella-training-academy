import parser from '@typescript-eslint/parser'
export default [
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**'] },
  { files: ['**/*.ts', '**/*.tsx'], languageOptions: { parser, parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: { 'no-debugger': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'no-constant-condition': 'error', 'no-unsafe-finally': 'error', 'no-sparse-arrays': 'error' } },
]
