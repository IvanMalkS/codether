// https://nuxt.com/docs/api/configuration/nuxt-config
import cssAutoImport from "vite-plugin-css-auto-import";

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@pinia/nuxt',
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    [
        '@vee-validate/nuxt',
      {
        autoImports: true,
      }
    ]
    ,
  ],
  googleFonts: {
    families: {
      'Space+Mono': [400, 700]
    }
  },
  vite: {
    plugins: [
      cssAutoImport()
    ]
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Codether',
    }
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui'
  },
  pinia: {
    storesDirs: [
        '~/store/**/*.ts'
    ]
  },
})