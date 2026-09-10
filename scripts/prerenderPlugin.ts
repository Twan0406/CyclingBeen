import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { seedClimbs } from '../src/data/climbs';
import { climbGuides } from '../src/data/climbGuides';
import { allDestinations as destinations } from '../src/data/allDestinations';
import { categories } from '../src/types/destination';
import { seasonFor, nearbyClimbs } from '../src/lib/climbGuide';
import type { Climb } from '../src/types/climb';
import type { Destination, RouteSuggestion } from '../src/types/destination';
import { routeSlug } from '../src/lib/routeSlug';

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
    `<meta property="og:site_name" content="Ridewild">`,
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
  return `<div style="max-width:820px;margin:0 auto;padding:40px 24px;font-family:Inter,system-ui,sans-serif;color:#f4efe7;background:#14120f">${inner}</div>`;
}

function climbBody(c: Climb): string {
  const near = nearbyClimbs(c, climbs, 75, 6);
  const parts: string[] = [];
  parts.push(`<h1 style="font-size:34px;margin:0 0 6px">${esc(c.name)}</h1>`);
  parts.push(`<p style="color:#a1968a;margin:0 0 20px">${esc(c.region)}, ${esc(c.country)}</p>`);
  parts.push(
    `<ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:18px;margin:0 0 24px;color:#d6cec2">
      <li><strong>${c.elevationM.toLocaleString('de-DE')} m</strong> summit</li>
      <li><strong>${c.lengthKm} km</strong> long</li>
      <li><strong>${c.avgGradientPct}%</strong> average gradient</li>
      <li>${esc(c.difficulty === 'hors-categorie' ? 'Hors catégorie' : c.difficulty)}</li>
    </ul>`,
  );
  parts.push(`<h2 style="font-size:20px;margin:24px 0 8px">The story</h2><p style="color:#d6cec2;line-height:1.6">${esc(c.story)}</p>`);
  if (c.tourHistory) {
    parts.push(`<h2 style="font-size:20px;margin:24px 0 8px">Race history</h2><p style="color:#d6cec2;line-height:1.6">${esc(c.tourHistory)}</p>`);
  }
  parts.push(
    `<h2 style="font-size:20px;margin:24px 0 8px">Plan your ride</h2>
     <ul style="color:#d6cec2;line-height:1.7">
       <li><strong>Best time to go:</strong> ${esc(seasonFor(c))}</li>
       <li><strong>Start from:</strong> ${esc(c.startTown ?? `${c.region}, ${c.country}`)}</li>
     </ul>`,
  );
  if (c.tips?.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Local tips</h2><ul style="color:#d6cec2;line-height:1.7">${c.tips
        .map((t) => `<li>${esc(t)}</li>`)
        .join('')}</ul>`,
    );
  }
  if (near.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Ride these too</h2><ul style="line-height:1.8">${near
        .map(
          (n) =>
            `<li><a style="color:#dfa04a" href="/climb/${n.climb.id}">${esc(n.climb.name)}</a> — ${Math.round(n.km)} km away</li>`,
        )
        .join('')}</ul>`,
    );
  }
  parts.push(`<p style="margin-top:28px"><a style="color:#dfa04a" href="/">All legendary climbs</a></p>`);
  return shell(parts.join('\n'));
}

function routeBody(p: Destination, r: RouteSuggestion): string {
  const cat = categories.find((c) => c.id === p.category);
  const parts: string[] = [];
  parts.push(`<p style="color:#7a7066;margin:0 0 6px">${cat ? esc(cat.label) : ''} \u00b7 <a style="color:#dfa04a" href="/place/${p.id}">${esc(p.name)}</a>, ${esc(p.country)}</p>`);
  parts.push(`<h1 style="font-size:34px;margin:0 0 8px">${esc(r.name)}</h1>`);
  parts.push(
    `<p style="color:#a1968a;margin:0 0 20px">${r.distanceKm} km${r.elevationM != null ? ` \u00b7 ${r.elevationM} m climbing` : ''} \u00b7 ${esc(r.difficulty)}</p>`,
  );
  parts.push(`<p style="color:#e8e0d4;font-size:18px;line-height:1.6">${esc(r.description)}</p>`);
  if (r.waypoints?.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">The way it goes</h2><ol style="color:#d6cec2;line-height:1.7">${r.waypoints
        .map((w) => `<li>${esc(w.name)}</li>`)
        .join('')}</ol>`,
    );
  }
  parts.push(
    `<h2 style="font-size:20px;margin:24px 0 8px">Riding here</h2>
     <ul style="color:#d6cec2;line-height:1.7">
       <li><strong>Best time to go:</strong> ${esc(p.bestMonths)}</li>
       <li><strong>Start from:</strong> ${esc(p.startTown)}</li>
       <li><strong>Surface:</strong> ${esc(p.surface)}</li>
     </ul>`,
  );
  return parts.join('\n');
}

function placeBody(p: Destination): string {
  const cat = categories.find((c) => c.id === p.category);
  const parts: string[] = [];
  parts.push(`<h1 style="font-size:34px;margin:0 0 6px">${esc(p.name)}</h1>`);
  parts.push(`<p style="color:#a1968a;margin:0 0 20px">${esc(p.region)}, ${esc(p.country)}${cat ? ` \u00b7 ${esc(cat.label)}` : ''}</p>`);
  parts.push(`<p style="color:#e8e0d4;font-size:18px;line-height:1.6;margin:0 0 20px">${esc(p.summary)}</p>`);
  parts.push(`<p style="color:#d6cec2;line-height:1.7">${esc(p.story)}</p>`);
  parts.push(
    `<h2 style="font-size:20px;margin:24px 0 8px">Plan your ride</h2>
     <ul style="color:#d6cec2;line-height:1.7">
       <li><strong>Best time to go:</strong> ${esc(p.bestMonths)}</li>
       <li><strong>Start from:</strong> ${esc(p.startTown)}</li>
       <li><strong>Surface:</strong> ${esc(p.surface)}</li>
       <li><strong>Typical ride:</strong> ${p.typicalRideKm} km${p.elevationGainM != null ? ` \u00b7 ${p.elevationGainM} m climbing` : ''}</li>
     </ul>`,
  );
  if (p.days != null && p.totalKm != null) {
    parts.push(
      `<p style="color:#d6cec2;line-height:1.7"><strong>The whole route:</strong> ${p.totalKm} km in about ${p.days} days${p.totalElevationM ? ` \u00b7 ${p.totalElevationM} m climbing` : ''}</p>`,
    );
  }
  if (p.whenHeld) {
    parts.push(
      `<p style="color:#d6cec2;line-height:1.7"><strong>When:</strong> ${esc(p.whenHeld)}${p.distanceOptionsKm ? ` \u00b7 <strong>Distances:</strong> ${p.distanceOptionsKm.map((d) => `${d} km`).join(', ')}` : ''}</p>`,
    );
  }
  if (p.routes?.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Rides to do here</h2>${p.routes
        .map(
          (r) =>
            `<h3 style="font-size:17px;margin:16px 0 4px"><a style="color:#f4efe7" href="/place/${p.id}/route/${routeSlug(r.name)}">${esc(r.name)}</a></h3><p style="color:#7a7066;margin:0 0 4px">${r.distanceKm} km${r.elevationM != null ? ` \u00b7 ${r.elevationM} m climbing` : ''} \u00b7 ${esc(r.difficulty)}</p><p style="color:#d6cec2;line-height:1.7;margin:0">${esc(r.description)}</p>`,
        )
        .join('')}`,
    );
  }
  if (p.highlights?.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Don't miss</h2><ul style="color:#d6cec2;line-height:1.7">${p.highlights
        .map((x) => `<li>${esc(x)}</li>`)
        .join('')}</ul>`,
    );
  }
  if (p.tips.length) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Local tips</h2><ul style="color:#d6cec2;line-height:1.7">${p.tips
        .map((x) => `<li>${esc(x)}</li>`)
        .join('')}</ul>`,
    );
  }
  if (p.gettingThere || p.basedIn || p.refuel) {
    parts.push(
      `<h2 style="font-size:20px;margin:24px 0 8px">Practicalities</h2><ul style="color:#d6cec2;line-height:1.7">${[
        p.gettingThere ? `<li><strong>Getting there:</strong> ${esc(p.gettingThere)}</li>` : '',
        p.basedIn ? `<li><strong>Where to base yourself:</strong> ${esc(p.basedIn)}</li>` : '',
        p.refuel ? `<li><strong>Food &amp; water:</strong> ${esc(p.refuel)}</li>` : '',
      ].join('')}</ul>`,
    );
  }
  parts.push(`<p style="margin-top:28px"><a style="color:#dfa04a" href="/rides">All cycling destinations</a></p>`);
  return shell(parts.join('\n'));
}

function categoryBody(catId: string | null): string {
  const cat = categories.find((c) => c.id === catId);
  const places = destinations.filter((d) => !catId || d.category === catId);
  const showClimbs = !catId || catId === 'climbs';
  const parts: string[] = [];
  parts.push(`<h1 style="font-size:34px;margin:0 0 8px">${esc(cat ? cat.label : 'Where to ride')}</h1>`);
  parts.push(
    `<p style="color:#a1968a;margin:0 0 24px;line-height:1.6">${esc(
      cat ? cat.tagline : 'Mountains, gravel, hills, coastline and trails \u2014 all in one place.',
    )}</p>`,
  );
  if (places.length) {
    parts.push(
      `<ul style="line-height:1.9">${places
        .map(
          (d) =>
            `<li><a style="color:#dfa04a" href="/place/${d.id}">${esc(d.name)}</a> \u2014 ${esc(d.region)}, ${esc(d.country)}: ${esc(d.summary)}</li>`,
        )
        .join('')}</ul>`,
    );
  }
  if (showClimbs) {
    parts.push(`<h2 style="font-size:20px;margin:24px 0 8px">${climbs.length} legendary climbs</h2>`);
    parts.push(
      `<ul style="line-height:1.9">${climbs
        .map(
          (c) =>
            `<li><a style="color:#dfa04a" href="/climb/${c.id}">${esc(c.name)}</a> \u2014 ${esc(c.region)}, ${esc(c.country)}</li>`,
        )
        .join('')}</ul>`,
    );
  }
  return shell(parts.join('\n'));
}

function homeBody(): string {
  const cats = categories
    .map((c) => {
      const n = c.id === 'climbs' ? climbs.length : destinations.filter((d) => d.category === c.id).length;
      return `<li><a style="color:#dfa04a" href="/rides/${c.id}">${esc(c.label)}</a> \u2014 ${esc(c.tagline)} (${n})</li>`;
    })
    .join('');
  return shell(
    `<h1 style="font-size:34px;margin:0 0 8px">Every road is an adventure</h1>
     <p style="color:#d6cec2;margin:0 0 24px;line-height:1.7">Legendary mountain passes, white gravel roads, sea dikes with endless horizons and singletrack that ends at the beach. Find where to ride \u2014 then keep a record of everything you have conquered.</p>
     <h2 style="font-size:20px;margin:24px 0 8px">Pick your terrain</h2>
     <ul style="line-height:1.9">${cats}</ul>
     <p style="margin-top:20px"><a style="color:#dfa04a" href="/rides">Browse all destinations</a></p>`,
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
            title: 'Ridewild — cycling adventures: mountains, gravel, bikepacking and events',
            description: `Find your next ride: ${climbs.length} legendary climbs plus hand-picked gravel, hill, coastal and mountain bike destinations, each with a practical guide.`,
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
          title: `${c.name} — cycling guide | Ridewild`,
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

      // One page per destination
      const placeDir = path.join(outDir, 'place');
      fs.mkdirSync(placeDir, { recursive: true });
      for (const d of destinations) {
        const url = `${SITE}/place/${d.id}`;
        const description = `Cycling in ${d.name}, ${d.country}: ${d.summary}. Best time to go, where to start, and practical local tips.`;
        const meta = head({
          title: `${d.name} — cycling guide | Ridewild`,
          description,
          url,
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: d.name,
            description,
            url,
            geo: { '@type': 'GeoCoordinates', latitude: d.lat, longitude: d.lng },
            address: { '@type': 'PostalAddress', addressRegion: d.region, addressCountry: d.country },
          },
        });
        fs.writeFileSync(path.join(placeDir, `${d.id}.html`), render(template, meta, placeBody(d)));
      }

      // One page per suggested route
      for (const d of destinations) {
        if (!d.routes?.length) continue;
        const dir = path.join(placeDir, d.id, 'route');
        fs.mkdirSync(dir, { recursive: true });
        for (const r of d.routes) {
          const slug = routeSlug(r.name);
          const url = `${SITE}/place/${d.id}/route/${slug}`;
          const description = `${r.name}: a ${r.distanceKm} km ${r.difficulty} ride from ${d.name}, ${d.country}. Route map, what to expect and a GPX download.`;
          fs.writeFileSync(
            path.join(dir, `${slug}.html`),
            render(
              template,
              head({
                title: `${r.name} — ${d.name} | Ridewild`,
                description,
                url,
                jsonLd: {
                  '@context': 'https://schema.org',
                  '@type': 'TouristTrip',
                  name: r.name,
                  description,
                  url,
                  itinerary: {
                    '@type': 'ItemList',
                    itemListElement: (r.waypoints ?? []).map((w, i) => ({
                      '@type': 'ListItem',
                      position: i + 1,
                      name: w.name,
                    })),
                  },
                },
              }),
              routeBody(d, r),
            ),
          );
        }
      }

      // The trip finder
      const findBody = `<h1 style="font-size:34px;margin:0 0 10px">Find your next cycling adventure</h1>
        <p style="color:#e8e0d4;font-size:18px;line-height:1.6">Answer five questions \u2014 how long you have got, how far you want to go, which bike you are taking, what you are after and how hard you want it \u2014 and get a trip from this guide that actually fits, with the reasons it fits and the catches spelled out.</p>
        <h2 style="font-size:20px;margin:24px 0 8px">What it asks</h2>
        <ul style="color:#d6cec2;line-height:1.7">
          <li>How long have you got: a day, a weekend, a week or longer</li>
          <li>How far you want to travel from the Low Countries</li>
          <li>Road bike, gravel bike or mountain bike</li>
          <li>Mountains, quiet open roads, short steep hills, trails, or an event to train for</li>
          <li>How hard you want it, and which month you are going</li>
        </ul>
        <p style="color:#d6cec2;line-height:1.7"><a style="color:#dfa04a" href="/rides">Or browse every destination instead.</a></p>`;
      fs.writeFileSync(
        path.join(outDir, 'find.html'),
        render(
          template,
          head({
            title: 'Find your next cycling adventure | Ridewild',
            description:
              'Answer a handful of questions — how long you have, how far you will go, which bike, what you are after — and get a cycling trip that actually fits.',
            url: `${SITE}/find`,
          }),
          findBody,
        ),
      );

      // Category landing pages
      const ridesDir = path.join(outDir, 'rides');
      fs.mkdirSync(ridesDir, { recursive: true });
      const ridesIndex = render(
          template,
          head({
            title: 'Where to ride — every cycling destination | Ridewild',
            description:
              'Browse every cycling destination: legendary mountain passes, gravel, hills, flat coastal riding and mountain bike trails, each with a practical ride guide.',
            url: `${SITE}/rides`,
          }),
          categoryBody(null),
      );
      // Written both ways so Firebase resolves /rides regardless of whether it
      // prefers the file or the directory index.
      fs.writeFileSync(path.join(outDir, 'rides.html'), ridesIndex);
      fs.writeFileSync(path.join(ridesDir, 'index.html'), ridesIndex);

      for (const cat of categories) {
        fs.writeFileSync(
          path.join(ridesDir, `${cat.id}.html`),
          render(
            template,
            head({
              title: `${cat.label} — where to ride | Ridewild`,
              description: `${cat.tagline}. Hand-picked ${cat.label.toLowerCase()} cycling destinations with practical ride guides.`,
              url: `${SITE}/rides/${cat.id}`,
            }),
            categoryBody(cat.id),
          ),
        );
      }

      // Sitemap + robots
      const urls = [
        `${SITE}/`,
        `${SITE}/rides`,
        `${SITE}/find`,
        ...categories.map((c) => `${SITE}/rides/${c.id}`),
        ...climbs.map((c) => `${SITE}/climb/${c.id}`),
        ...destinations.map((d) => `${SITE}/place/${d.id}`),
        ...destinations.flatMap((d) =>
          (d.routes ?? []).map((r) => `${SITE}/place/${d.id}/route/${routeSlug(r.name)}`),
        ),
      ];
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

      console.log(`\n  prerendered ${urls.length} pages + sitemap.xml`);
    },
  };
}
