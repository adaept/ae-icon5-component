// ESLint 9 flat config — mirrors aedh's flat-config approach.
// Replaces the legacy .eslintrc.json (eslint-config-standard).
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default tseslint.config(
  {
    // Build outputs and generated files are not linted.
    ignores: ['dist/', 'www/', 'loader/', 'src/components.d.ts', 'src/assets/build-stamp.js']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-side tooling + tests (build-stamp generator, icon guard, smoke test).
    // `globals.browser` covers the document/window used inside puppeteer
    // page.evaluate callbacks, which lint sees in the Node file.
    files: ['scripts/**/*.{js,mjs,cjs}', 'testing/**/*.{js,mjs,cjs}', '*.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser
      }
    },
    rules: {
      'space-before-function-paren': 'off',
      'spaced-comment': 'off',
      // The component uses implicit-any in a few render helpers; keep additive
      // (relax to warnings rather than block the modernization build).
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
    }
  }
)
