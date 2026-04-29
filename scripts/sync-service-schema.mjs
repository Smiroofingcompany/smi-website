#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const SITE_URL = 'https://smiroof.com';
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

const MAIN_SERVICE_SLUGS = new Map([
  ['residential-roofing', 'Residential Roofing'],
  ['roof-repair', 'Roof Repair'],
  ['storm-damage', 'Storm Damage Roof Repair'],
  ['roof-inspections', 'Roof Inspection'],
  ['insurance-claims', 'Roofing Insurance Claim Assistance'],
  ['metal-roofs', 'Metal Roofing Installation'],
  ['metal-roofing', 'Metal Roofing Installation'],
]);

const COMMERCIAL_SERVICE_OFFERS = [
  ['TPO Roofing', `${SITE_URL}/commercial-roofing/tpo-roofing/`],
  ['Standing Seam Metal Roofing', `${SITE_URL}/commercial-roofing/standing-seam-metal-roofing/`],
  ['Metal Panel Systems', `${SITE_URL}/commercial-roofing/metal-panel-systems/`],
  ['EPDM Roofing', `${SITE_URL}/commercial-roofing/epdm-roofing/`],
  ['Modified Bitumen Roofing', `${SITE_URL}/commercial-roofing/modified-bitumen-roofing/`],
  ['Built-Up Roofing', `${SITE_URL}/commercial-roofing/built-up-roofing/`],
  ['Roof Coatings and Restoration', `${SITE_URL}/commercial-roofing/roof-coatings-restoration/`],
  ['Commercial Roof Repair', `${SITE_URL}/commercial-roofing/commercial-roof-repair/`],
];

const ENTITY_MAP = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: '-',
  mdash: '-',
  hellip: '...',
};

const STATE_ABBR_TO_NAME = new Map([
  ['AR', 'Arkansas'],
  ['TX', 'Texas'],
  ['TN', 'Tennessee'],
]);

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return Object.prototype.hasOwnProperty.call(ENTITY_MAP, entity) ? ENTITY_MAP[entity] : match;
  });
}

function textContent(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

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

function directType(data) {
  if (Array.isArray(data?.['@type'])) {
    return data['@type'].includes('Service') ? 'Service' : data['@type'][0];
  }

  return data?.['@type'];
}

function findJsonLdScripts(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => ({
    fullMatch: match[0],
    jsonText: match[1],
    index: match.index,
  }));
}

function scriptTagForSchema(schema) {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim() || '';
}

function extractMetaDescription(html) {
  return html.match(/<meta name="description" content="([^"]*)">/)?.[1]?.trim() || '';
}

function extractTitle(html) {
  return textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
}

function extractH1(html) {
  return textContent(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function extractGeoPlacename(html) {
  return html.match(/<meta name="geo\.placename" content="([^"]+)">/)?.[1]?.trim() || '';
}

function extractGeoRegion(html) {
  return html.match(/<meta name="geo\.region" content="US-([A-Z]{2})">/)?.[1]?.trim() || '';
}

function schemaScripts(html) {
  return findJsonLdScripts(html).map((script) => {
    try {
      return { ...script, data: JSON.parse(script.jsonText.trim()) };
    } catch (error) {
      return { ...script, error };
    }
  });
}

function directSchemas(html) {
  return schemaScripts(html).filter((script) => script.data);
}

function commercialCityFromSlug(slug) {
  return slug.replace(/-ar$/, '').split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function pathFromCanonical(canonical) {
  try {
    return new URL(canonical).pathname;
  } catch {
    return '';
  }
}

function topServiceSlug(canonicalPath) {
  const slug = canonicalPath.replace(/^\/|\/$/g, '');
  return MAIN_SERVICE_SLUGS.has(slug) ? slug : '';
}

function isCommercialHub(canonicalPath) {
  return canonicalPath === '/commercial-roofing/';
}

function isCommercialCityPage(canonicalPath) {
  return /^\/commercial-roofing\/[a-z0-9-]+-ar\/$/.test(canonicalPath);
}

function isTargetWithoutExistingService(canonicalPath) {
  return isCommercialHub(canonicalPath) || isCommercialCityPage(canonicalPath);
}

function findDirectServiceScript(scripts) {
  return scripts.find((script) => script.data && directType(script.data) === 'Service') || null;
}

function providerIdForPage(schemas, existingService) {
  if (existingService?.provider?.['@id']) {
    return existingService.provider['@id'];
  }

  const localProvider = schemas.find(
    (script) =>
      script.data &&
      directType(script.data) === 'RoofingContractor' &&
      String(script.data['@id'] || '').endsWith('#local-roofing-contractor'),
  );
  if (localProvider?.data?.['@id']) {
    return localProvider.data['@id'];
  }

  return ORGANIZATION_ID;
}

function areaServedForPage(html, schemas, existingService) {
  if (existingService?.areaServed) {
    return existingService.areaServed;
  }

  const localBusiness = schemas.find((script) => script.data && directType(script.data) === 'RoofingContractor');
  if (localBusiness?.data?.areaServed) {
    return localBusiness.data.areaServed;
  }

  const placename = extractGeoPlacename(html);
  const [city, stateNameFromGeo] = placename.split(',').map((part) => part.trim());
  const stateAbbr = extractGeoRegion(html);
  const stateName = stateNameFromGeo || STATE_ABBR_TO_NAME.get(stateAbbr) || 'Arkansas';

  if (city && stateName) {
    return {
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'State',
        name: stateName,
      },
    };
  }

  return {
    '@type': 'State',
    name: stateName,
  };
}

function offerForPage(canonical, existingService) {
  const existingOffer = existingService?.offers && !Array.isArray(existingService.offers) ? existingService.offers : {};
  return {
    '@type': 'Offer',
    availability: existingOffer.availability || 'https://schema.org/InStock',
    priceCurrency: existingOffer.priceCurrency || 'USD',
    ...(existingOffer.price ? { price: existingOffer.price } : {}),
    ...(existingOffer.description ? { description: existingOffer.description } : {}),
    url: canonical,
  };
}

function serviceNameForPage(html, canonicalPath, existingService) {
  if (existingService?.name) {
    return existingService.name;
  }

  const h1 = extractH1(html);
  if (h1) {
    return h1;
  }

  const title = extractTitle(html).split('|')[0].trim();
  if (title) {
    return title;
  }

  if (isCommercialHub(canonicalPath)) {
    return 'Commercial Roofing in Arkansas';
  }

  if (isCommercialCityPage(canonicalPath)) {
    const city = commercialCityFromSlug(canonicalPath.split('/').filter(Boolean).at(-1));
    return `Commercial Roofing in ${city}, AR`;
  }

  return existingService?.serviceType || 'Roofing Service';
}

function serviceTypeForPage(canonicalPath, existingService) {
  if (existingService?.serviceType) {
    return existingService.serviceType;
  }

  if (isCommercialHub(canonicalPath) || isCommercialCityPage(canonicalPath)) {
    return 'Commercial Roofing';
  }

  const segments = canonicalPath.split('/').filter(Boolean);
  const last = segments.at(-1);
  return MAIN_SERVICE_SLUGS.get(last) || 'Roofing Service';
}

function catalogOffer(name, url, areaServed = null) {
  return {
    '@type': 'Offer',
    url,
    itemOffered: {
      '@type': 'Service',
      name,
      url,
      provider: {
        '@id': ORGANIZATION_ID,
      },
      ...(areaServed ? { areaServed } : {}),
    },
  };
}

function cityServiceCatalog(serviceSlug, serviceType, servicePages) {
  const offers = servicePages
    .filter((page) => page.serviceSlug === serviceSlug && page.depth === 2)
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((page) => catalogOffer(`${serviceType} in ${page.cityName}`, page.url, page.areaServed));

  if (offers.length === 0) {
    return null;
  }

  return {
    '@type': 'OfferCatalog',
    name: `${serviceType} city service pages`,
    itemListElement: offers,
  };
}

function commercialServiceCatalog(name, areaServed = null) {
  return {
    '@type': 'OfferCatalog',
    name,
    itemListElement: COMMERCIAL_SERVICE_OFFERS.map(([serviceName, url]) => catalogOffer(serviceName, url, areaServed)),
  };
}

function offerCatalogForPage(canonicalPath, serviceType, areaServed, servicePages) {
  const serviceSlug = topServiceSlug(canonicalPath);
  if (serviceSlug) {
    return cityServiceCatalog(serviceSlug === 'metal-roofing' ? 'metal-roofs' : serviceSlug, serviceType, servicePages);
  }

  if (isCommercialHub(canonicalPath)) {
    return commercialServiceCatalog('Commercial roofing service catalog', {
      '@type': 'State',
      name: 'Arkansas',
    });
  }

  if (isCommercialCityPage(canonicalPath)) {
    return commercialServiceCatalog(`${serviceType} local service catalog`, areaServed);
  }

  return null;
}

function serviceSchemaFrom(existingService, html, schemas, servicePages) {
  const canonical = extractCanonical(html);
  if (!canonical) {
    throw new Error('Missing canonical URL');
  }

  const canonicalPath = pathFromCanonical(canonical);
  const areaServed = areaServedForPage(html, schemas, existingService);
  const serviceType = serviceTypeForPage(canonicalPath, existingService);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${canonical}#service`,
    name: serviceNameForPage(html, canonicalPath, existingService),
    serviceType,
    url: canonical,
    provider: {
      '@id': providerIdForPage(schemas, existingService),
    },
    areaServed,
    description: decodeEntities(extractMetaDescription(html) || existingService?.description || ''),
    offers: offerForPage(canonical, existingService),
  };

  const offerCatalog = offerCatalogForPage(canonicalPath, serviceType, areaServed, servicePages);
  if (offerCatalog) {
    schema.hasOfferCatalog = offerCatalog;
  }

  return schema;
}

function insertServiceScript(html, scripts, schema) {
  const faqScript = scripts.find((script) => script.data && directType(script.data) === 'FAQPage');
  const breadcrumbScript = scripts.find((script) => script.data && directType(script.data) === 'BreadcrumbList');
  const insertBefore = faqScript || breadcrumbScript;
  const inserted = `${scriptTagForSchema(schema)}\n`;

  if (insertBefore) {
    return `${html.slice(0, insertBefore.index)}${inserted}${html.slice(insertBefore.index)}`;
  }

  return html.replace('</head>', `${inserted}</head>`);
}

function collectServicePages(files) {
  const servicePages = [];

  for (const filePath of files) {
    const html = fs.readFileSync(filePath, 'utf8');
    const canonical = extractCanonical(html);
    const canonicalPath = pathFromCanonical(canonical);
    const segments = canonicalPath.split('/').filter(Boolean);
    const last = segments.at(-1);

    if (!MAIN_SERVICE_SLUGS.has(last) || segments.length !== 2) {
      continue;
    }

    const schemas = directSchemas(html);
    const areaServed = areaServedForPage(html, schemas, null);
    servicePages.push({
      url: canonical,
      serviceSlug: last,
      depth: segments.length,
      cityName: areaServed?.name || segments[0],
      areaServed,
    });
  }

  return servicePages;
}

function syncFile(filePath, servicePages) {
  const html = fs.readFileSync(filePath, 'utf8');
  const canonical = extractCanonical(html);
  const canonicalPath = pathFromCanonical(canonical);
  const scripts = schemaScripts(html);
  const parseError = scripts.find((script) => script.error)?.error;
  const serviceScript = findDirectServiceScript(scripts);
  const isTarget = Boolean(serviceScript) || isTargetWithoutExistingService(canonicalPath);

  if (!isTarget) {
    return null;
  }

  if (parseError) {
    return { filePath, status: 'invalid-json', message: parseError.message };
  }

  let nextSchema;
  try {
    nextSchema = serviceSchemaFrom(serviceScript?.data || null, html, scripts, servicePages);
  } catch (error) {
    return { filePath, status: 'invalid', message: error.message };
  }

  if (serviceScript && JSON.stringify(serviceScript.data) === JSON.stringify(nextSchema)) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: serviceScript ? 'update-needed' : 'missing' };
  }

  const nextHtml = serviceScript
    ? html.replace(serviceScript.fullMatch, () => scriptTagForSchema(nextSchema))
    : insertServiceScript(html, scripts, nextSchema);
  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: serviceScript ? 'updated' : 'added' };
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const files = listHtmlFiles(rootDir);
const servicePages = collectServicePages(files);
const results = files.map((filePath) => syncFile(filePath, servicePages)).filter(Boolean);
const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] || 0) + 1;
  return acc;
}, {});
const failures = results.filter((result) => !['ok', 'updated', 'added'].includes(result.status));

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.status}: ${relative(failure.filePath)}${failure.message ? ` - ${failure.message}` : ''}`);
  }
}

const summary = Object.entries(counts)
  .map(([status, count]) => `${status}: ${count}`)
  .join(', ');

if (mode === 'write') {
  console.log(`Service schema sync complete. Target pages: ${results.length}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`Service schema validation passed. Target pages: ${results.length}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
