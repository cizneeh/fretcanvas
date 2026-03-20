import node from '@astrojs/node'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'
import { SITE_URL } from './src/libs/site'

export default defineConfig({
  site: SITE_URL,
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
  integrations: [react()],
  i18n: {
    locales: ['en', 'ja'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
