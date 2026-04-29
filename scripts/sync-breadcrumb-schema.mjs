#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';
const siteUrl = 'https://smiroof.com';

const entityMap = {
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

function decodeEntities(value) {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }

    if (entity.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }

    return Object.prototype.hasOwnProperty.call(entityMap, entity) ? entityMap[entity] : match;
  });
}

function textContent(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(href) {
  try {
    return new URL(href, siteUrl).href;
  } catch {
    return href;
  }
}

function extractCanonical(html) {
  return html.match(/<link rel="canonical" href="([^"]+)">/)?.[1]?.trim() || '';
}

function findVisibleBreadcrumb(html) {
  return html.match(/<(nav|div)\b(?=[^>]*(?:class="[^"]*breadcrumb[^"]*"|aria-label="Breadcrumb"))[^>]*>([\s\S]*?)<\/\1>/i);
}

function extractVisibleBreadcrumbItems(html) {
  const canonical = extractCanonical(html);
  const match = findVisibleBreadcrumb(html);
  if (!match || !canonical) {
    return [];
  }

  const items = [];
  const tokenPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>|<span\b([^>]*)>([\s\S]*?)<\/span>/gi;
  for (const token of match[2].matchAll(tokenPattern)) {
    const isLink = Boolean(token[1]);
    const attrs = isLink ? token[1] : token[3] || '';
    const name = textContent(isLink ? token[2] : token[4] || '');

    if (!name || ['/', '>', '›', '»', '|'].includes(name)) {
      continue;
    }

    const href = isLink ? attrs.match(/href="([^"]+)"/)?.[1] : '';
    items.push({
      name,
      item: isLink && href ? absoluteUrl(href) : canonical,
    });
  }

  return items;
}

function breadcrumbSchemaFromVisible(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

function directType(data) {
  if (Array.isArray(data?.['@type'])) {
    return data['@type'].includes('BreadcrumbList') ? 'BreadcrumbList' : data['@type'][0];
  }

  return data?.['@type'];
}

function normalizeBreadcrumbSchema(data) {
  if (!data || directType(data) !== 'BreadcrumbList' || !Array.isArray(data.itemListElement)) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.itemListElement.map((item, index) => ({
      '@type': 'ListItem',
      position: Number(item?.position || index + 1),
      name: String(item?.name || '').replace(/\s+/g, ' ').trim(),
      item: String(item?.item || '').trim(),
    })),
  };
}

function scriptTagForSchema(schema, existingJson = '') {
  const compact = !existingJson.trim().includes('\n');
  const json = compact ? JSON.stringify(schema) : JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">${compact ? json : `\n${json}\n`}</script>`;
}

function findJsonLdScripts(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => ({
    fullMatch: match[0],
    jsonText: match[1],
    index: match.index,
  }));
}

function syncFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const visibleItems = extractVisibleBreadcrumbItems(html);

  if (visibleItems.length < 2) {
    return null;
  }

  const scripts = findJsonLdScripts(html);
  let breadcrumbScript = null;
  let parseError = null;

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.jsonText.trim());
      if (directType(data) === 'BreadcrumbList') {
        breadcrumbScript = { ...script, data };
        break;
      }
    } catch (error) {
      parseError = error;
    }
  }

  if (!breadcrumbScript && parseError) {
    return { filePath, status: 'invalid-json', message: parseError.message };
  }

  const nextSchema = breadcrumbSchemaFromVisible(visibleItems);
  const existingSchema = breadcrumbScript ? normalizeBreadcrumbSchema(breadcrumbScript.data) : null;

  if (JSON.stringify(existingSchema) === JSON.stringify(nextSchema)) {
    return { filePath, status: 'ok' };
  }

  if (mode !== 'write') {
    return { filePath, status: breadcrumbScript ? 'mismatch' : 'missing' };
  }

  let nextHtml;
  if (breadcrumbScript) {
    nextHtml = html.replace(breadcrumbScript.fullMatch, () => scriptTagForSchema(nextSchema, breadcrumbScript.jsonText));
  } else {
    const firstSchema = scripts[0];
    const inserted = `${scriptTagForSchema(nextSchema)}\n`;
    nextHtml = firstSchema
      ? `${html.slice(0, firstSchema.index)}${inserted}${html.slice(firstSchema.index)}`
      : html.replace('</head>', `${inserted}</head>`);
  }

  fs.writeFileSync(filePath, nextHtml);
  return { filePath, status: breadcrumbScript ? 'updated' : 'added' };
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

function relative(filePath) {
  return path.relative(rootDir, filePath);
}

const results = listHtmlFiles(rootDir).map(syncFile).filter(Boolean);
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
  console.log(`Breadcrumb schema sync complete. Target pages: ${results.length}. ${summary}`);
} else if (failures.length === 0) {
  console.log(`Breadcrumb schema validation passed. Target pages: ${results.length}. ${summary}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
}
