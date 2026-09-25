// @ts-check
import { defineConfig } from 'astro/config';

// site — адрес сайта. Сейчас это адрес превью на Vercel,
// после подключения домена заменить на него.
export default defineConfig({
  site: 'https://kyryllismailov.vercel.app',
  compressHTML: true,
});
