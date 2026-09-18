import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    // Integration tests boot a real Payload instance and hit its local API
    // directly — there is no DOM involved. `jsdom` gives Buffer objects a
    // different realm than the global Uint8Array, which breaks `instanceof`
    // checks inside Payload's upload pipeline (the `file-type` package used
    // by checkFileRestrictions) and makes every file upload fail with
    // "Expected the `input` argument to be of type `Uint8Array`". Plain
    // `node` is what these tests actually need.
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./tests/int/globalSetup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    // Booting a real Payload instance is slow, and parallel files racing on one
    // SQLite file causes lock errors.
    testTimeout: 60_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
})
