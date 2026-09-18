import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Booting a real Payload instance is slow, and parallel files racing on one
    // SQLite file causes lock errors.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
})
