import { getRequestConfig } from 'next-intl/server';

export type Locale = 'zh' | 'en';
export const locales: Locale[] = ['zh', 'en'];
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
