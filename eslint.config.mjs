import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

import eslintConfigPrettier from 'eslint-config-prettier'; // Disable conflicts
import eslintPluginPrettier from 'eslint-plugin-prettier'; // Enable Prettier

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
    rules: {
      // Enforces that Prettier formatting issues are treated as an ESLint error
      'prettier/prettier': 'error',
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
