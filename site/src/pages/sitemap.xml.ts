import type { APIRoute } from 'astro';
import { programs, site } from '../data/content';

const pages = [
  '/',
  '/directions/',
  ...programs.map((program) => `/directions/${program.slug}/`),
  '/jobs/',
  '/contacts/',
  '/documents/',
  '/info-organization/',
  '/politic/',
];

export const GET: APIRoute = ({ site: astroSite }) => {
  const base = astroSite ?? new URL(site.url);

  const urls = pages
    .map(
      (path) => `  <url>\n    <loc>${new URL(path, base).href}</loc>\n    <changefreq>monthly</changefreq>\n  </url>`,
    )
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
