// eslint-disable-next-line no-unused-vars
import { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'aeicon5',
  outputTargets: [
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
}
