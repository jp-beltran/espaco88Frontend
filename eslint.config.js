import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'           // <--- import
import eslintConfigPrettier from 'eslint-config-prettier'     // <--- import

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      'plugin:prettier/recommended', 
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettierPlugin,    // <--- adiciona aqui
    },
    rules: {
      // regras do react-hooks
      ...reactHooks.configs.recommended.rules,

      // integra as regras do Prettier
      'prettier/prettier': ['warn'],

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
)
