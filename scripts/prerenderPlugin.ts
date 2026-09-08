import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { seedClimbs } from '../src/data/climbs';
import { climbGuides } from '../src/data/climbGuides';
import { seasonFor, nearbyClimbs } from '../src/lib/climbGuide';
import type { Climb } from '../src/types/climb';

const SITE = 'https://cyclingbeen-28952.web.app';

const climbs: Climb[] = seedClimbs.map((c) => ({ ...c, ...(climbGuides[c.id] ?? {}) }));

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function head(opts: {
  title: string;
  description: string;
  url: string;
  jsonLd?: object;
}): string {
  const { title, description, url, jsonLd } = opts;
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:site_name" content="Collect">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    jsonLd
      ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

/**
 * Static markup placed inside #root. React replaces it on mount, but crawlers
 * (and anyone on a slow connection) get the real content immediately.
 */
function shell(inner: string): string {
  return `<div style="max-width:820px;margin:0 auto;padding:40px 24px;font-family:Sora,system-ui,sans-serif;color:#eef1f6;background:#0b0d12">${inner}</div>`;
}

function climbBody(c: Climb): string {
  const near = nearbyClimbs(c, climbs, 75, 6);
  const parts: string[] = [];
  parts.push(`<h1 style="font-size:34px;margin:0 0 6px">${esc(c.name)}</h1>`);
  parts.push(`<p style="color:#8b93a3;margin:0 0 20px">${esc(c.region)}, ${esc(c.country)}</p>`);
  parts.push(
    `<ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:18px;margin:0 0 24px;color:#c4cad6">
      <li><strong>${c.elevationM.toLocaleString('de-DE')} m</strong> summit</li>
      <li><strong>${c.lengthKm} km</strong> long</li>
      <li><strong>${c.avgGradientPct}%</strong> average gradient</li>
      <li>${esc(c.difficulty === 'hors-categorie' ? 'Hors catégorie' : c.difficulty)}</li>
    </ul>`,
  );
  parts.push(`<h2 style="font-size:20px;margin:24px 0 8px">The story</h2><p style="color:#c4cad6;line-height:1.6">${esc(c.story)}</p>`);
  if (c.tourHistory) {
    parts.push(`<h2 style="font-size:20px;margin:24px 0 8px">Race history</h2><p style="color:#c4cad6;line-height:1.6">${esc(c.tourHistory)}</p>`);
  }
  parts.push(
    `<h2 style="font-size:20px;margin:24px 0 8px">Plan your ride</h2>
     <ul style="color:#c4cad6;line-height:1.7">
       <li><strong>Best time to go:</strong> ${esc(seasonFor(c))}</li>
       <li><strong>Start from:</strong> ${esc(c.startTown ?? `${c.region}, ${c.country}`)}</li>
     </ul>`,
  );
  if (c.tips?.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Local tips</h2><ul style="color:#c4cad6;line-height:1.7">${c.tips
        .map((t) => `<li>${esc(t)}</li>`)
        .join('')}</ul>`,
    );
  }
  if (near.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Ride these too</h2><ul style="line-height:1.8">${near
        .map(
          (n) =>
            `<li><a style="color:#f2b53a" href="/climb/${n.climb.id}">${esc(n.climb.name)}</a> — ${Math.round(n.km)} km away</li>`,
        )
        .join('')}</ul>`,
    );
  }
  parts.push(`<p style="margin-top:28px"><a style="color:#f2b53a" href="/">All legendary climbs</a></p>`);
  return shell(parts.join('\n'));
}

function homeBody(): string {
  const list = climbs
    .map(
      (c) =>
        `<li><a style="color:#f2b53a" href="/climb/${c.id}">${esc(c.name)}</a> — ${esc(c.region)}, ${esc(c.country)} · ${c.lengthKm} km at ${c.avgGradientPct}%</li>`,
    )
    .join('');
  return shell(
    `<h1 style="font-size:34px;margin:0 0 8px">The legendary climbs of cycling</h1>
     <p style="color:#8b93a3;margin:0 0 24px;line-height:1.6">Track the great ascents you have ridden, plan the ones you haven't, and compare your times with friends. ${climbs.length} climbs with ride guides, race history and practical advice.</p>
     <h2 style="font-size:20px;margin:24px 0 8px">All ${climbs.length} climbs</h2>
     <ul style="line-height:1.9">${list}</ul>`,
  );
}

function render(template: string, meta: string, body: string): string {
  return template
    // Drop the template's placeholder title so each page has exactly one.
    .replace(/\s*<title>[\s\S]*?<\/title>/, '')
    .replace('</head>', `    ${meta}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

/**
 * Writes real HTML for every public content route at build time, so search
 * engines and link previews see actual content instead of an empty SPA shell.
 * The app still hydrates into a normal single-page app on load.
 */
export function prerender(): Plugin {
  return {
    name: 'collect-prerender',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve('dist');
      const templatePath = path.join(outDir, 'index.html');
      if (!fs.existsSync(templatePath)) return;
      const template = fs.readFileSync(templatePath, 'utf8');

      // Home
      fs.writeFileSync(
        templatePath,
        render(
          template,
          head({
            title: 'Collect — the legendary climbs of cycling',
            description: `Track and plan cycling's great ascents. ${climbs.length} legendary climbs with ride guides, race history, practical tips and your own times.`,
            url: `${SITE}/`,
          }),
          homeBody(),
        ),
      );

      // One page per climb
      const climbDir = path.join(outDir, 'climb');
      fs.mkdirSync(climbDir, { recursive: true });
      for (const c of climbs) {
        const url = `${SITE}/climb/${c.id}`;
        const description = `${c.name}: ${c.lengthKm} km at ${c.avgGradientPct}% to ${c.elevationM} m in ${c.region}, ${c.country}. ${c.shortDescription}`;
        const meta = head({
          title: `${c.name} — cycling guide | Collect`,
          description,
          url,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'TouristAttraction',
            name: c.name,
            description,
            url,
            geo: { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng },
            address: { '@type': 'PostalAddress', addressRegion: c.region, addressCountry: c.country },
          },
        });
        fs.writeFileSync(path.join(climbDir, `${c.id}.html`), render(template, meta, climbBody(c)));
      }

      // Sitemap + robots
      const urls = [`${SITE}/`, ...climbs.map((c) => `${SITE}/climb/${c.id}`)];
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${u}</loc></url>`)
          .join('\n')}\n</urlset>\n`,
      );
      fs.writeFileSync(
        path.join(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
      );

      console.log(`\n  prerendered ${climbs.length + 1} pages + sitemap.xml`);
    },
  };
}
