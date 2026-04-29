#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const SITE_URL = 'https://smiroof.com';
const COMPANY_PHONE = '+1-501-464-5139';
const COMPANY_EMAIL = 'info@smiroof.com';
const COMPANY_PRICE_RANGE = '$$';
const COMPANY_ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: '302 East Parkway Drive, Suite C',
  addressLocality: 'Russellville',
  addressRegion: 'AR',
  postalCode: '72801',
  addressCountry: 'US',
};

const SAME_AS = [
  'https://smiroof.com/',
  'https://www.google.com/search?q=SMI+Roofing+Russellville+AR+reviews',
];

const AGGREGATE_RATING = {
  '@type': 'AggregateRating',
  ratingValue: '5.0',
  bestRating: '5',
  worstRating: '1',
  ratingCount: '231',
  reviewCount: '231',
};

const REVIEWS = [
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Lisa R.',
    },
    reviewBody:
      'Two other roofers told me I needed a full replacement. SMI inspected it and said I just needed a repair. I trust these guys completely.',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Google',
    },
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Marcus T.',
    },
    reviewBody:
      'SMI handled every part of the insurance claim after hail hit our roof. They met the adjuster, filed supplements, and kept us updated.',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Google',
    },
  },
  {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: 'Ashley C.',
    },
    reviewBody:
      'The crew showed up on time, protected the landscaping, and cleaned up every nail. Professional from first call to final walkthrough.',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Google',
    },
  },
];

const OPENING_HOURS = [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '07:00',
    closes: '18:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: 'Saturday',
    opens: '08:00',
    closes: '14:00',
  },
];

const STATE_ABBR = new Map([
  ['Arkansas', 'AR'],
  ['Texas', 'TX'],
  ['Tennessee', 'TN'],
]);

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
    return data['@type'].includes('RoofingContractor') ? 'RoofingContractor' : data['@type'][0];
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

function extractGeoPlacename(html) {
  return html.match(/<meta name="geo\.placename" content="([^"]+)">/)?.[1]?.trim() || '';
}

function extractCityAndState(html, schema) {
  const existingCity = schema?.areaServed?.name || schema?.serviceArea?.addressLocality || '';
  const existingState = schema?.areaServed?.containedInPlace?.name || '';
  const geoPlacename = extractGeoPlacename(html);
  const [geoCity, geoState] = geoPlacename.split(',').map((part) => part.trim());

  return {
    city: existingCity || geoCity || 'Russellville',
    stateFull: existingState || geoState || 'Arkansas',
  };
}

function cityHubSchemaFrom(existingSchema, html) {
  const canonical = extractCanonical(html);
  if (!canonical) {
    throw new Error('Missing canonical URL');
  }

  const { city, stateFull } = extractCityAndState(html, existingSchema);
  const stateAbbr =
    existingSchema?.serviceArea?.addressRegion ||
    existingSchema?.address?.addressRegion ||
    STATE_ABBR.get(stateFull) ||
    stateFull;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${canonical}#local-roofing-contractor`,
    name: existingSchema?.name || `SMI Roofing - ${city} Roofing Contractor`,
    url: canonical,
    image: existingSchema?.image || `${SITE_URL}/assets/og-image.jpg`,
    telephone: COMPANY_PHONE,
    email: COMPANY_EMAIL,
    priceRange: COMPANY_PRICE_RANGE,
    address: COMPANY_ADDRESS,
    areaServed: {
      '@type': existingSchema?.areaServed?.['@type'] || 'City',
      name: city,
      containedInPlace: {
        '@type': 'State',
        name: stateFull,
      },
    },
    serviceArea: {
      '@type': 'PostalAddress',
      addressLocality: existingSchema?.serviceArea?.addressLocality || city,
      addressRegion: stateAbbr,
      addressCountry: 'US',
    },
    openingHoursSpecification: OPENING_HOURS,
    sameAs: SAME_AS,
    aggregateRating: AGGREGATE_RATING,
    review: REVIEWS,
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
    hasOfferCatalog: existingSchema?.hasOfferCatalog,
  };

  if (existingSchema?.serviceArea?.postalCode) {
    schema.serviceArea.postalCode = existingSchema.serviceArea.postalCode;
  }

  return schema;
}

function isCityHub(html) {
  return /<title>[^<]*\bCity Hub\b/i.test(html) && html.includes('#local-roofing-contractor');
}

function syncFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  if (!isCityHub(html)) {
    return null;
  }

  const scripts = findJsonLdScripts(html);
  let schemaScript = null;
  let parseError = null;

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.jsonText.trim());
      if (directType(data) === 'RoofingContractor' && String(data['@id'] || '').endsWith('#local-roofing-contractor')) {
        schemaScript = { ...script, data };
        break;
      }
    } catch (error) {
      parseError = error;
    }
  }

  if (!schemaScript) {
    return {
      filePath,
      status: 'missing',
      message: parseError ? parseError.message : 'Missing city RoofingContractor JSON-LD',
    };
  }

  let nextSchema;
  try {
    nextSchema = cityHubSchemaFrom(schemaScript.data, html);
  } catch (error) {
    return { filePath, status: 'invalid', message: error.message };
  }

  const current = JSON.stringify(schemaScript.data);
  const next = JSON.stringify(nextSchema);
  if (current === next) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: 'update-needed' };
  }

  const nextHtml = html.replace(schemaScript.fullMatch, () => scriptTagForSchema(nextSchema));
  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: 'updated' };
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const results = listHtmlFiles(rootDir).map(syncFile).filter(Boolean);
const counts = results.reduce((acc, result) => {
  acc[result.status] = (acc[result.status] || 0) + 1;
  return acc;
}, {});
const failures = results.filter((result) => !['ok', 'updated'].includes(result.status));

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`${failure.status}: ${relative(failure.filePath)}${failure.message ? ` - ${failure.message}` : ''}`);
  }
}

const checked = results.length;
const summary = Object.entries(counts)
  .map(([status, count]) => `${status}: ${count}`)
  .join(', ');

if (mode === 'write') {
  console.log(`City RoofingContractor schema sync complete. City hubs: ${checked}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`City RoofingContractor schema validation passed. City hubs: ${checked}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
