import type { APIRoute } from 'astro';
import { site as content } from '../content/site';

/** robots.txt собирается автоматически: адрес карты сайта берётся из astro.config.mjs */
export const GET: APIRoute = ({ site }) => {
  const body = content.preview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
