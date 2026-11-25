import { defineVitestConfig } from '@stencil/vitest/config'

// Component specs + unit tests on Vitest via @stencil/vitest (modernization-plan §10.1).
//   unit — pure logic, no Stencil renderer: icon registry/manifest specs + the harness POC.
//   spec — renders the *built* lazy loader (dist/aeicon5) in Stencil's mock DOM; `npm test`
//          (`stencil-test`) builds first, a bare `vitest` run does not.
export default defineVitestConfig({
  stencilConfig: './stencil.config.ts',
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/icons/**/*.spec.ts', 'test/**/*.vitest.ts'],
          environment: 'jsdom',
          globals: true
        }
      },
      {
        test: {
          name: 'spec',
          include: ['src/components/**/*.spec.{ts,tsx}'],
          environment: 'stencil',
          setupFiles: ['./vitest-setup.ts'],
          globals: true
        }
      }
    ]
  }
})
