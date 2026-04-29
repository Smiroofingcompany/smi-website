#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const MAIN_SERVICE_SLUGS = new Set([
  'residential-roofing',
  'roof-repair',
  'storm-damage',
  'roof-inspections',
  'insurance-claims',
  'metal-roofs',
  'metal-roofing',
]);

const EXCLUDED_TOP_LEVEL = new Set([
  'api',
  'assets',
  'blog',
  'commercial-roofing',
  'docs',
  'industries',
  'privacy-policy',
  'reviews',
  'site-map',
  'sms-terms',
]);

const ENGLISH_SERVICE_LABELS = new Map([
  ['residential-roofing', 'residential roofing'],
  ['roof-repair', 'roof repair'],
  ['storm-damage', 'storm damage roof repair'],
  ['roof-inspections', 'roof inspection'],
  ['insurance-claims', 'insurance claim help'],
  ['metal-roofs', 'metal roofing'],
  ['metal-roofing', 'metal roofing'],
  ['state-farm-roof-claim', 'State Farm roof claim help'],
]);

const SPANISH_SERVICE_LABELS = new Map([
  ['techos-residenciales', 'techos residenciales'],
  ['reparacion-de-techo', 'reparacion de techo'],
  ['danos-por-tormenta', 'danos por tormenta'],
  ['reclamos-de-seguro', 'reclamos de seguro'],
]);

const GALLERY_STYLES = `<style data-m045-project-gallery-styles>
.m045-gallery{background:#f6f8fb;border-top:1px solid var(--line,#dce3eb);border-bottom:1px solid var(--line,#dce3eb)}
.m045-gallery .m045-gallery-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:30px}
.m045-gallery .m045-kicker{display:inline-flex;align-items:center;gap:10px;margin-bottom:14px;color:var(--cyan-dark,#00a5c7);font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.14em}
.m045-gallery .m045-kicker::before{content:"";width:30px;height:2px;background:var(--cyan,#00C8F0)}
.m045-gallery .m045-title{margin:0;font-family:var(--font-display,'Outfit',sans-serif);font-size:clamp(30px,4vw,52px);line-height:1.04;font-weight:900;letter-spacing:0;color:var(--ink,#111827)}
.m045-gallery .m045-lede{max-width:760px;margin:16px 0 0;color:var(--muted,#59677a);font-size:17px;line-height:1.7}
.m045-project-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.m045-project-card{background:#fff;border:1px solid var(--line,#dce3eb);border-radius:8px;overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,.05)}
.m045-project-image{aspect-ratio:4/3;background:#dce3eb;overflow:hidden}
.m045-project-image img{width:100%;height:100%;object-fit:cover;display:block}
.m045-project-body{padding:18px}
.m045-project-body h3{margin:0;font-family:var(--font-display,'Outfit',sans-serif);font-size:20px;line-height:1.12;color:var(--ink,#111827);letter-spacing:0}
.m045-project-body p{margin:9px 0 0;color:var(--muted,#59677a);font-size:14px;line-height:1.6}
@media(max-width:1040px){.m045-project-grid{grid-template-columns:1fr 1fr}.m045-gallery .m045-gallery-head{display:block}}
@media(max-width:760px){.m045-project-grid{grid-template-columns:1fr}.m045-gallery{padding:62px 0}.m045-gallery .m045-gallery-head{margin-bottom:22px}}
</style>`;

function listHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name === 'index.html') {
      files.push(fullPath);
    }
  }

  return files;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;|&mdash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function textContent(value) {
  return decodeEntities(
    String(value || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  );
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim() || '';
}

function canonicalPath(html) {
  try {
    return new URL(extractCanonical(html)).pathname;
  } catch {
    return '';
  }
}

function titleCaseSegment(segment) {
  const known = new Map([
    ['ar', 'AR'],
    ['dfw', 'DFW'],
    ['tn', 'TN'],
  ]);

  return segment
    .split('-')
    .map((part) => known.get(part) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function cityFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'service-areas') {
    return titleCaseSegment((segments[1] || '').replace(/-ar$/, ''));
  }

  if (segments[0] === 'commercial-roofing') {
    return titleCaseSegment((segments[1] || '').replace(/-ar$/, ''));
  }

  if (segments[0] === 'es') {
    return titleCaseSegment(segments[1] || '');
  }

  return titleCaseSegment(segments[0] || '');
}

function cityFromHtml(html, pathname) {
  const geo = html.match(/<meta name="geo\.placename" content="([^"]+)">/)?.[1]?.trim();
  if (geo) {
    return geo.split(',')[0].trim();
  }

  const areaServed = html.match(/"areaServed"\s*:\s*\{[\s\S]*?"name"\s*:\s*"([^"]+)"/)?.[1]?.trim();
  if (areaServed && areaServed !== 'Arkansas') {
    return areaServed;
  }

  return cityFromPath(pathname);
}

function serviceLabelForPath(pathname, html) {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments.at(-1) || '';

  if (segments[0] === 'commercial-roofing' && segments.length === 2) {
    return 'commercial roofing';
  }

  if (segments[0] === 'service-areas') {
    return 'roofing';
  }

  if (segments[0] === 'es') {
    return SPANISH_SERVICE_LABELS.get(last) || 'techos';
  }

  if (/^hail-damage-/.test(last)) {
    return 'hail damage inspection';
  }

  if (ENGLISH_SERVICE_LABELS.has(last)) {
    return ENGLISH_SERVICE_LABELS.get(last);
  }

  if (/<title>[^<]*\bCity Hub\b/i.test(html)) {
    return 'roofing';
  }

  return 'roofing';
}

function isCityHub(html) {
  return /<title>[^<]*\bCity Hub\b/i.test(html) && html.includes('#local-roofing-contractor');
}

function isLegacyServiceArea(pathname) {
  return /^\/service-areas\/[a-z0-9-]+-ar\/$/.test(pathname);
}

function isCommercialCity(pathname) {
  return /^\/commercial-roofing\/[a-z0-9-]+-ar\/$/.test(pathname);
}

function isEnglishCityService(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return false;
  if (EXCLUDED_TOP_LEVEL.has(segments[0])) return false;
  if (segments[0] === 'es' || segments[0] === 'service-areas') return false;

  const last = segments.at(-1);
  return MAIN_SERVICE_SLUGS.has(last) || last === 'state-farm-roof-claim' || /^hail-damage-/.test(last);
}

function isSpanishLocal(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] === 'es' && segments.length >= 2;
}

function targetKind(html, pathname) {
  if (isCityHub(html)) return 'city-hub';
  if (isLegacyServiceArea(pathname)) return 'legacy-city-page';
  if (isCommercialCity(pathname)) return 'commercial-city-page';
  if (isEnglishCityService(pathname)) return 'city-service-page';
  if (isSpanishLocal(pathname)) return 'spanish-local-page';
  return null;
}

function sectionBlocks(html) {
  return [...html.matchAll(/<section\b[\s\S]*?<\/section>/gi)]
    .map((match) => match[0])
    .filter((section) => /data-m045-project-gallery|id="gallery"|class="[^"]*gallery|class="[^"]*photo-grid|photo-grid/i.test(section));
}

function imageData(block) {
  return [...block.matchAll(/<img\b([^>]*)>/gi)].map((match) => ({
    src: match[1].match(/\ssrc="([^"]*)"/)?.[1]?.trim() || '',
    alt: match[1].match(/\salt="([^"]*)"/)?.[1]?.trim() || '',
  }));
}

function isCompliantGallery(html) {
  for (const block of sectionBlocks(html)) {
    const images = imageData(block);
    if (images.length < 3 || images.length > 6) {
      continue;
    }

    if (images.every((image) => image.src.startsWith('/assets/') && image.alt.length >= 18)) {
      return true;
    }
  }

  return false;
}

function gallerySection({ city, service, spanish }) {
  if (spanish) {
    return `<section class="m045-gallery section" id="gallery" data-m045-project-gallery>
<div class="container">
<div class="m045-gallery-head"><div><div class="m045-kicker">Galeria local</div><h2 class="m045-title">Fotos de proyectos para techos en ${escapeHtml(city)}.</h2><p class="m045-lede">Estas fotos muestran inspeccion, detalles terminados, documentacion de tormenta y capacidad comercial. Las fotos exactas de su propiedad vienen de la inspeccion, pero cada pagina local debe mostrar prueba visual antes de reservar.</p></div></div>
<div class="m045-project-grid">
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-two-roofers-jobsite.jpg" loading="lazy" alt="Equipo de SMI Roofing inspeccionando un techo cerca de ${escapeHtml(city)}"></div><div class="m045-project-body"><h3>Inspeccion en techo</h3><p>La recomendacion empieza con fotos claras de las condiciones reales del techo.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-aerial-roof-detail.jpg" loading="lazy" alt="Detalle de techo terminado para clientes de ${escapeHtml(city)}"></div><div class="m045-project-body"><h3>Detalles terminados</h3><p>Valles, cumbreras, ventilacion y limpieza deben verse bien desde arriba.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-storm-roof-inspection.jpg" loading="lazy" alt="Documentacion fotografica de danos por tormenta en ${escapeHtml(city)}"></div><div class="m045-project-body"><h3>Documentacion de tormenta</h3><p>Las fotos ayudan a explicar granizo, viento, filtraciones y accesorios danados.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-commercial-aerial-roof.jpg" loading="lazy" alt="Proyecto de techo comercial para propiedades en ${escapeHtml(city)}"></div><div class="m045-project-body"><h3>Capacidad comercial</h3><p>SMI tambien documenta techos de negocios, edificios y propiedades administradas.</p></div></article>
</div>
</div>
</section>`;
  }

  const serviceTitle = service.charAt(0).toUpperCase() + service.slice(1);
  return `<section class="m045-gallery section" id="gallery" data-m045-project-gallery>
<div class="container">
<div class="m045-gallery-head"><div><div class="m045-kicker">Local project gallery</div><h2 class="m045-title">Project photos for ${escapeHtml(city)} ${escapeHtml(service)} customers.</h2><p class="m045-lede">These photos show the kind of roof evidence SMI documents for ${escapeHtml(city)}: active jobsite inspection, finished roof details, storm evidence, and commercial roof capability. Your property photos should be specific to your roof, but every local page should show the work standard before you book.</p></div></div>
<div class="m045-project-grid">
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-two-roofers-jobsite.jpg" loading="lazy" alt="SMI Roofing crew inspecting a roof for ${escapeHtml(service)} near ${escapeHtml(city)}"></div><div class="m045-project-body"><h3>Inspection first</h3><p>Roof conditions are checked and photographed before a recommendation is made.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-aerial-roof-detail.jpg" loading="lazy" alt="Finished roof detail documented for ${escapeHtml(city)} ${escapeHtml(service)} customers"></div><div class="m045-project-body"><h3>Finished details</h3><p>Clean ridges, valleys, flashing, ventilation, and cleanup matter after the work is done.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-storm-roof-inspection.jpg" loading="lazy" alt="Storm roof inspection photo documentation for ${escapeHtml(city)} roof owners"></div><div class="m045-project-body"><h3>Storm documentation</h3><p>Photos help explain hail, wind, leaks, soft metals, and roof accessories clearly.</p></div></article>
<article class="m045-project-card"><div class="m045-project-image"><img src="/assets/smi-commercial-aerial-roof.jpg" loading="lazy" alt="Commercial roof project photo available to ${escapeHtml(city)} property owners"></div><div class="m045-project-body"><h3>${escapeHtml(serviceTitle)} support</h3><p>Homes, rentals, businesses, and managed properties all need visible project proof.</p></div></article>
</div>
</div>
</section>`;
}

function insertStyles(html) {
  if (html.includes('data-m045-project-gallery-styles')) {
    return html;
  }

  return html.replace('</head>', `${GALLERY_STYLES}\n</head>`);
}

function insertSection(html, section) {
  const patterns = [
    /<section\b[^>]*\bid="faq"[^>]*>/i,
    /<section\b[^>]*class="[^"]*\bfaq\b[^"]*"[^>]*>/i,
    /<section\b[^>]*class="[^"]*\bcta\b[^"]*"[^>]*>/i,
    /<\/main>/i,
    /<footer\b/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.index !== undefined) {
      return `${html.slice(0, match.index)}${section}\n${html.slice(match.index)}`;
    }
  }

  return html.replace('</body>', `${section}\n</body>`);
}

function syncFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const pathname = canonicalPath(html);
  if (!pathname) return null;

  const kind = targetKind(html, pathname);
  if (!kind) return null;

  if (isCompliantGallery(html)) {
    return { filePath, status: 'ok', kind };
  }

  if (mode !== 'write') {
    return { filePath, status: 'missing-gallery', kind };
  }

  const city = cityFromHtml(html, pathname);
  const service = serviceLabelForPath(pathname, html);
  const spanish = pathname.startsWith('/es/');
  const nextHtml = insertSection(insertStyles(html), gallerySection({ city, service, spanish }));
  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: 'updated', kind };
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const results = listHtmlFiles(rootDir).map(syncFile).filter(Boolean);
const failures = results.filter((result) => !['ok', 'updated'].includes(result.status));
const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] || 0) + 1;
  acc[`kind:${result.kind}`] = (acc[`kind:${result.kind}`] || 0) + 1;
  return acc;
}, {});

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.status}: ${relative(failure.filePath)} (${failure.kind})`);
  }
}

const summary = Object.entries(counts)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([status, count]) => `${status}: ${count}`)
  .join(', ');

if (mode === 'write') {
  console.log(`Local project gallery sync complete. Pages: ${results.length}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`Local project gallery validation passed. Pages: ${results.length}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
