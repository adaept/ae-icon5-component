import { defineConfig } from 'vitest/config'

// Vitest POC (modernization-plan D4): stands up the Vitest harness alongside the
// Stencil-Jest spec baseline. Scoped to test/**/*.vitest.ts so it never collides
// with `stencil test` (which runs *.spec.ts / *.e2e.ts under Jest). The full
// Jest → Vitest crossover of the component specs is deferred to the aedh-A22 sync.
export default defineConfig({
  test: {
    include: ['test/**/*.vitest.ts'],
    environment: 'jsdom',
    globals: true
  }
})
