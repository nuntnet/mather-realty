import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'th', 'zh-CN', 'zh-TW', 'ja', 'ko', 'ru', 'de', 'fr', 'es', 'it', 'nl', 'sv', 'ar', 'hi'],
  defaultLocale: 'en',
})
