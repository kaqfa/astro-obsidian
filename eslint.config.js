import js from '@eslint/js';
import pluginAstro from 'eslint-plugin-astro';
import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import pluginAstro from 'eslint-plugin-astro';
import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import pluginAstro from 'eslint-plugin-astro';
import pluginImport from 'eslint-plugin-import';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default [
  // Ignore patterns first (applies to all configs)
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.astro/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      'vitest.config.ts',
      'vault/**',
      '*.js', // Only lint TypeScript files
      'create-user.js',
      'create-user.mjs',
      'migrate.ts',
      'setup.ts',
      '**/*.astro', // Astro files handled by their own plugin
    ],
  },

  // Base JS config
  js.configs.recommended,

  // TypeScript config (for .ts and .tsx files)
  ...tseslint.configs.recommended,

  // Astro plugin
  ...pluginAstro.configs.recommended,

  // React plugins (for .tsx files)
  {
    files: ['**/*.tsx'],
    plugins: {
      'react-hooks': pluginReactHooks,
      react: pluginReact,
      import: pluginImport,
    },
    rules: {
      // Disable React hooks exhaustive-deps for now (requires refactoring)
      'react-hooks/exhaustive-deps': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed with React 17+
      'react/jsx-uses-react': 'off',
      'react/jsx-no-undef': 'error',
      'react/no-unknown-property': 'error',
      // Import rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'off', // TypeScript handles this
      'import/no-duplicates': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // TypeScript specific rules (for .ts and .tsx files)
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
];
