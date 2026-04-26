import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          experimentalObjectRestSpread: true
        }
      },
      globals: {
        localStorage: true,
        window: true,
        document: true,
        console: true,
        process: true,
        Buffer: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        exports: true,
        global: true
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'import': importPlugin
    },
    rules: {
      'no-control-regex': 'off',
      'no-console': 'warn',
      'no-eval': 'error',
      'import/first': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react/prop-types': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': ['error']
    }
  }
];
