import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

import eslintConfigPrettier from 'eslint-config-prettier'; // Disable conflicts
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Enable Prettier

import jestPlugin from 'eslint-plugin-jest';
import globals from 'globals';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Disable conflicts
  eslintConfigPrettier,
  {
    // Files on which Prettier should run
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser, // Allow window/document globals inside of components
        ...globals.node, // Allow process/Buffer globals inside of Server Actions and Prismie
      },
    },
    rules: {
      // Treat unused variables as an EsLint error
      '@typescript-eslint/no-unused-vars': 'error',
      // Enforces that Prettier formatting issues are treated as an ESLint error
      'prettier/prettier': 'error',
    },
  },

  // Tests configuration
  {
    files: ['**/__tests__/**/*', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      // Get definitions for Jest inside the 'eslint-plugin-jest' plugin
      globals: jestPlugin.environments.globals.globals,
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      'jest/consistent-test-it': ['error', { fn: 'it' }],
      '@typescript-eslint/no-explicit-any': 'off', // for mocks
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
