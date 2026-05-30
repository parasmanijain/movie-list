import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), viteTsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/__tests__/**',
        'src/index.tsx',
        'src/react-app-env.d.ts',
        'src/setupTests.ts',
        'src/App.css',
        'src/index.css',
        'src/logo.svg',
        'src/types/**',
        'src/models/**',
        'src/components/index.ts',
        'src/components/pages/index.ts',
        'src/components/routes/index.ts',
        'src/components/templates/index.ts',
        'src/helper/index.ts'
      ],
      thresholds: {
        lines: 70,
        functions: 55,
        branches: 45,
        statements: 70
      }
    }
  }
});
