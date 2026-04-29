#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const REVIEW_URL = 'https://www.google.com/search?q=SMI+Roofing+Russellville+AR+reviews';

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

const REVIEW_TEXTS = REVIEWS.map((review) => review.reviewBody);

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
    if (data['@type'].includes('RoofingContractor')) return 'RoofingContractor';
    if (data['@type'].includes('Organization')) return 'Organization';
    return data['@type'][0];
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

function scriptTagForSchema(schema, existingJson = '') {
  const compact = !existingJson.trim().includes('\n');
  const json = compact ? JSON.stringify(schema) : JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">${compact ? json : `\n${json}\n`}</script>`;
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim() || '';
}

function textContent(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPageCityName(html, schema) {
  const areaName = schema?.areaServed?.name || '';
  const canonicalPath = extractCanonical(html).replace(/^https:\/\/smiroof\.com\/?/, '').replace(/\/$/, '');
  const crumb = textContent(html.match(/<span[^>]*class="current"[^>]*>([\s\S]*?)<\/span>/i)?.[1] || '');

  if (crumb) return crumb.replace(/,\s*AR$/, '').replace(/,\s*TX$/, '').replace(/,\s*TN$/, '');
  if (areaName === 'Dallas-Fort Worth Metroplex') return 'DFW';
  if (areaName) return areaName;

  return canonicalPath
    .split('/')[0]
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeReviews(value) {
  return JSON.stringify(value || []);
}

function withReviewData(schema) {
  return {
    ...schema,
    aggregateRating: AGGREGATE_RATING,
    review: REVIEWS,
  };
}

function reviewSection(cityName) {
  return `<section class="trust section" id="reviews"><div class="container trust-grid"><div><div class="eyebrow">Customer proof</div><h2 class="section-title">SMI Roofing reviews for <span class="text-cyan">${cityName}</span> roof owners.</h2><p class="section-lede">These Google review excerpts are tied to SMI Roofing's 5.0 rating and 231 customer reviews. They show the repair-first guidance, insurance communication, and cleanup standards customers can expect before booking.</p><div class="hero-actions"><a href="${REVIEW_URL}" target="_blank" rel="noopener" class="btn btn-dark">View all Google reviews</a></div></div><div class="trust-list"><article class="trust-card"><b>5.0</b><span>Average Google rating from 231 customer reviews tied to SMI Roofing.</span></article><article class="trust-card"><b>Lisa R.</b><span>"${REVIEWS[0].reviewBody}"<br><strong>Google review - Fayetteville, AR</strong></span></article><article class="trust-card"><b>Marcus T.</b><span>"${REVIEWS[1].reviewBody}"<br><strong>Google review - Russellville, AR</strong></span></article><article class="trust-card"><b>Ashley C.</b><span>"${REVIEWS[2].reviewBody}"<br><strong>Google review - Cabot, AR</strong></span></article></div></div></section>`;
}

function hasVisibleReviews(html) {
  return REVIEW_TEXTS.every((reviewText) => textContent(html).includes(reviewText));
}

function isCityHub(html) {
  return /<title>[^<]*\bCity Hub\b/i.test(html) && html.includes('#local-roofing-contractor');
}

function syncHomepage(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const scripts = findJsonLdScripts(html);
  let graphScript = null;

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.jsonText.trim());
      if (Array.isArray(data?.['@graph'])) {
        graphScript = { ...script, data };
        break;
      }
    } catch {
      continue;
    }
  }

  if (!graphScript) {
    return { filePath, status: 'missing', message: 'Missing homepage @graph schema' };
  }

  const orgIndex = graphScript.data['@graph'].findIndex((item) => directType(item) === 'RoofingContractor');
  if (orgIndex === -1) {
    return { filePath, status: 'missing', message: 'Missing Organization/RoofingContractor node' };
  }

  if (!hasVisibleReviews(html)) {
    return { filePath, status: 'missing-visible-reviews', message: 'Homepage visible reviews are missing' };
  }

  const nextData = {
    ...graphScript.data,
    '@graph': graphScript.data['@graph'].map((item, index) => (index === orgIndex ? withReviewData(item) : item)),
  };

  const currentOrg = graphScript.data['@graph'][orgIndex];
  const nextOrg = nextData['@graph'][orgIndex];
  if (
    JSON.stringify(currentOrg.aggregateRating) === JSON.stringify(nextOrg.aggregateRating) &&
    normalizeReviews(currentOrg.review) === normalizeReviews(nextOrg.review)
  ) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: 'update-needed' };
  }

  fs.writeFileSync(filePath, html.replace(graphScript.fullMatch, () => scriptTagForSchema(nextData, graphScript.jsonText)));
  return { filePath, status: 'updated' };
}

function syncCityHub(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
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

  const cityName = extractPageCityName(html, schemaScript.data);
  const nextSchema = withReviewData(schemaScript.data);
  let nextHtml = html;
  let changed = false;

  if (
    JSON.stringify(schemaScript.data.aggregateRating) !== JSON.stringify(nextSchema.aggregateRating) ||
    normalizeReviews(schemaScript.data.review) !== normalizeReviews(nextSchema.review)
  ) {
    changed = true;
    nextHtml = nextHtml.replace(schemaScript.fullMatch, () => scriptTagForSchema(nextSchema, schemaScript.jsonText));
  }

  if (!hasVisibleReviews(nextHtml)) {
    const section = reviewSection(cityName);
    if (nextHtml.includes('<section class="faq section"')) {
      nextHtml = nextHtml.replace('<section class="faq section"', `${section}<section class="faq section"`);
    } else if (nextHtml.includes('<section class="section faq"')) {
      nextHtml = nextHtml.replace('<section class="section faq"', `${section}<section class="section faq"`);
    } else {
      return { filePath, status: 'missing', message: 'Missing FAQ anchor for visible review section' };
    }
    changed = true;
  }

  if (!hasVisibleReviews(nextHtml)) {
    return { filePath, status: 'missing-visible-reviews', message: 'Visible review section did not render expected review text' };
  }

  if (!changed) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: 'update-needed' };
  }

  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: 'updated' };
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const homepageResult = syncHomepage(path.join(rootDir, 'index.html'));
const cityResults = listHtmlFiles(rootDir).map(syncCityHub).filter(Boolean);
const results = [homepageResult, ...cityResults];
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

const summary = Object.entries(counts)
  .map(([status, count]) => `${status}: ${count}`)
  .join(', ');

if (mode === 'write') {
  console.log(`Review schema sync complete. Pages: ${results.length}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`Review schema validation passed. Pages: ${results.length}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
