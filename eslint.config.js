// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },

  // Reglas de fronteras para Feature-Sliced Design (FSD)
  // 1. `shared` no puede importar de ninguna otra capa.
  {
    files: ['src/shared/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/entities', '@/entities/**'], message: 'La capa `shared` no puede importar desde `entities`.' },
          { group: ['@/features', '@/features/**'], message: 'La capa `shared` no puede importar desde `features`.' },
          { group: ['@/widgets', '@/widgets/**'], message: 'La capa `shared` no puede importar desde `widgets`.' },
          { group: ['@/pages', '@/pages/**'], message: 'La capa `shared` no puede importar desde `pages`.' },
        ]
      }]
    }
  },

  // 2. `entities` solo puede importar de `shared`.
  {
    files: ['src/entities/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/features', '@/features/**'], message: 'La capa `entities` no puede importar desde `features`.' },
          { group: ['@/widgets', '@/widgets/**'], message: 'La capa `entities` no puede importar desde `widgets`.' },
          { group: ['@/pages', '@/pages/**'], message: 'La capa `entities` no puede importar desde `pages`.' },
        ]
      }]
    }
  },

  // 3. `features` solo puede importar de `entities` y `shared`.
  {
    files: ['src/features/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/widgets', '@/widgets/**'], message: 'La capa `features` no puede importar desde `widgets`.' },
          { group: ['@/pages', '@/pages/**'], message: 'La capa `features` no puede importar desde `pages`.' },
        ]
      }]
    }
  },

  // 4. `widgets` puede importar de `features`, `entities` y `shared`.
  {
    files: ['src/widgets/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/pages', '@/pages/**'], message: 'La capa `widgets` no puede importar desde `pages`.' },
        ]
      }]
    }
  },

  // 5. `pages` puede importar de `widgets`, `features`, `entities` y `shared`.
  // No se añaden reglas aquí, ya que no hay capas superiores dentro de `src` de las que no pueda importar.
{
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@/'] }]
    }
  }

]);
