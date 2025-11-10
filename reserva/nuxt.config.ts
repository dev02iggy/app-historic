// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  experimental: {
    payloadExtraction: false
  },
  css: [
    'vuetify/styles',
    '~/assets/sass/app.scss',
    '@mdi/font/css/materialdesignicons.css'
  ],
  build: {
    transpile: ['vuetify'],
  },
  modules: ['@nuxt/icon', '@nuxt/test-utils', '@pinia/nuxt', 'nuxt3-notifications'],
  app: {
    head: {
      title: 'Conect One RH',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: '',
        },
      ],
      link: [
        {
          key: 'favicon',
          rel: 'icon',
          type: 'image/png',
          href: '/favicon.png',
        },
        {
          key: 'mobileicon',
          rel: 'apple-touch-icon',
          sizes: '512x512',
          href: '/mobileicon.png',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
        },
      ],
      script: [],
    },
  },
  runtimeConfig: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.NUXT_SUPABASE_ROLE_KEY,
    MAILGUN_API_KEY: process.env.NUXT_MAILGUN_API_KEY,
    MAILGUN_DOMAIN: process.env.NUXT_MAILGUN_DOMAIN,

    public: {
      SUPABASE_URL: process.env.NUXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
      EMAIL_OFFICIAL: process.env.NUXT_PUBLIC_EMAIL_OFFICIAL
    }
  }
})
