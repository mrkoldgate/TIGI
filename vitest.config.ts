import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// ---------------------------------------------------------------------------
// Vitest configuration for TIGI unit and integration tests.
//
// Test strategy:
//   - Pure library functions (rbac, session, readiness, programs, feature-gate)
//     are tested directly with no mocks.
//   - API route handlers are tested with vi.mock() for @/auth and @/lib/db,
//     treating them as ordinary async functions that return Response objects.
//   - React components are out of scope for this configuration — add
//     @testing-library/react + jsdom if component tests are needed later.
//
// Path resolution:
//   vite-tsconfig-paths reads the tsconfig.json paths (e.g. @/*) so imports
//   in tests match exactly what the application uses.
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: [
        'src/lib/**',
        'src/app/api/**',
      ],
      exclude: [
        'src/lib/**/*.mock.*',
        'src/lib/**/*mock*',
        'src/lib/**/*seed*',
      ],
      reporter: ['text', 'html'],
    },
  },
})
