#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const SITE_URL = 'https://smiroof.com';
const PUBLISHER = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'SMI Roofing',
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/assets/logo.png`,
    width: 192,
    height: 192,
  },
};

function listBlogPostFiles() {
  const blogDir = path.join(rootDir, 'blog');
  return fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(blogDir, entry.name, 'index.html'))
    .filter((filePath) => fs.existsSync(filePath))
    .sort();
}

function findJsonLdScripts(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => ({
    fullMatch: match[0],
    jsonText: match[1],
    index: match.index,
  }));
}

function directType(data) {
  if (Array.isArray(data?.['@type'])) {
    if (data['@type'].includes('BlogPosting')) return 'BlogPosting';
    if (data['@type'].includes('Article')) return 'Article';
    if (data['@type'].includes('NewsArticle')) return 'NewsArticle';
    return data['@type'][0];
  }

  return data?.['@type'];
}

function isArticleType(data) {
  return ['Article', 'BlogPosting', 'NewsArticle'].includes(directType(data));
}

function scriptTagForSchema(schema, existingJson = '') {
  const compact = !existingJson.trim().includes('\n');
  const json = compact ? JSON.stringify(schema) : JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">${compact ? json : `\n${json}\n`}</script>`;
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, '-')
    .replace(/&mdash;/g, '-')
    .replace(/&nbsp;/g, ' ');
}

function textContent(value) {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractMeta(html, propertyOrName) {
  const escaped = propertyOrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const property = html.match(new RegExp(`<meta\\s+property="${escaped}"\\s+content="([^"]*)"`, 'i'))?.[1];
  const name = html.match(new RegExp(`<meta\\s+name="${escaped}"\\s+content="([^"]*)"`, 'i'))?.[1];
  return decodeEntities((property || name || '').trim());
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)">/i)?.[1]?.trim() || '';
}

function extractTitle(html) {
  return textContent(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').replace(/\s+\|\s+SMI Roofing$/, '');
}

function extractH1(html) {
  return textContent(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
}

function absoluteUrl(url) {
  if (!url) return '';
  return new URL(url, SITE_URL).href;
}

function centralTimeOffset(date) {
  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(new Date(`${date}T12:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value;
  const offset = timeZoneName?.replace('GMT', '') || '-6';
  const sign = offset.startsWith('-') ? '-' : '+';
  const [hours, minutes = '00'] = offset.replace(/^[+-]/, '').split(':');
  return `${sign}${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function isoDate(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  const date = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (date) {
    return `${date}T08:00:00${centralTimeOffset(date)}`;
  }

  return trimmed;
}

function schemaFromPage(existingSchema, html) {
  const canonical = absoluteUrl(extractCanonical(html));
  if (!canonical) {
    throw new Error('Missing canonical URL');
  }

  const headline = existingSchema?.headline || extractH1(html) || extractMeta(html, 'og:title') || extractTitle(html);
  const image = absoluteUrl(extractMeta(html, 'og:image'));
  const description = extractMeta(html, 'description') || extractMeta(html, 'og:description');
  const datePublished = isoDate(existingSchema?.datePublished);
  const dateModified = isoDate(existingSchema?.dateModified || existingSchema?.datePublished);

  if (!headline) throw new Error('Missing headline');
  if (!image) throw new Error('Missing representative image');
  if (!datePublished) throw new Error('Missing datePublished');
  if (!dateModified) throw new Error('Missing dateModified');

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${canonical}#blogposting`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    headline,
    description,
    image: [image],
    datePublished,
    dateModified,
    author: {
      '@type': 'Organization',
      name: 'SMI Roofing',
      url: `${SITE_URL}/`,
    },
    publisher: PUBLISHER,
    url: canonical,
    inLanguage: 'en-US',
  };
}

function validateSchema(schema) {
  const required = [
    ['@type', 'BlogPosting'],
    ['headline'],
    ['image'],
    ['datePublished'],
    ['dateModified'],
    ['author.name'],
    ['publisher.logo.url'],
    ['mainEntityOfPage.@id'],
  ];

  for (const [pathName, expected] of required) {
    const value = pathName.split('.').reduce((current, key) => current?.[key], schema);
    if (!value) return `Missing ${pathName}`;
    if (expected && value !== expected) return `Expected ${pathName} to be ${expected}`;
  }

  if (!Array.isArray(schema.image) || schema.image.length === 0) {
    return 'Missing image array';
  }

  return '';
}

function syncFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const scripts = findJsonLdScripts(html);
  let articleScript = null;
  let parseError = null;

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.jsonText.trim());
      if (isArticleType(data)) {
        articleScript = { ...script, data };
        break;
      }
    } catch (error) {
      parseError = error;
    }
  }

  if (!articleScript) {
    return {
      filePath,
      status: 'missing',
      message: parseError ? parseError.message : 'Missing Article or BlogPosting JSON-LD',
    };
  }

  let nextSchema;
  try {
    nextSchema = schemaFromPage(articleScript.data, html);
  } catch (error) {
    return { filePath, status: 'invalid', message: error.message };
  }

  const validationError = validateSchema(nextSchema);
  if (validationError) {
    return { filePath, status: 'invalid', message: validationError };
  }

  if (JSON.stringify(articleScript.data) === JSON.stringify(nextSchema)) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: 'update-needed' };
  }

  const nextHtml = html.replace(articleScript.fullMatch, () => scriptTagForSchema(nextSchema, articleScript.jsonText));
  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: 'updated' };
}

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const results = listBlogPostFiles().map(syncFile);
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
  console.log(`BlogPosting schema sync complete. Blog posts: ${results.length}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`BlogPosting schema validation passed. Blog posts: ${results.length}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
