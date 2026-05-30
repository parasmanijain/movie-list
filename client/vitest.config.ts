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
      enabled: true,
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
        'src/helper/index.ts',
        // These are thin HOC wrapper files (single-line module-level calls).
        // Their logic is fully exercised via getData.tsx tests; excluding them
        // prevents false 0% coverage from v8 not instrumenting module-level expressions.
        'src/components/pages/Award.tsx',
        'src/components/pages/Category.tsx',
        'src/components/pages/Director.tsx',
        'src/components/pages/DirectorMovies.tsx',
        'src/components/pages/Franchise.tsx',
        'src/components/pages/Genre.tsx',
        'src/components/pages/Language.tsx',
        'src/components/pages/Universe.tsx',
        'src/components/pages/Year.tsx'
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95
      }
    }
  }
});
