import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/__tests__/**',
        'src/app.ts',
        'src/env.d.ts',
        'src/schemaModels/**'
      ],
      thresholds: {
        lines: 80,
        functions: 70,
        branches: 60,
        statements: 80
      }
    }
  }
});
