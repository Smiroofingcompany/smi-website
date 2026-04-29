#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const mode = process.argv.includes('--write') ? 'write' : 'check';

const entityMap = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201d',
  ldquo: '\u201c',
  ndash: '\u2013',
  mdash: '\u2014',
  hellip: '\u2026',
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
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function extractVisibleFaqs(html) {
  const faqs = [];
  const consumedRanges = [];
  const innerPattern =
    /<div class="faq-item\b[^"]*"[^>]*>\s*<button class="faq-question"[^>]*>([\s\S]*?)<\/button>\s*<div class="faq-answer\b[^"]*"[^>]*>\s*<div class="faq-answer-inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
  const plainPattern =
    /<div class="faq-item\b[^"]*"[^>]*>\s*<button class="faq-question"[^>]*>([\s\S]*?)<\/button>\s*<div class="faq-answer\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;

  for (const match of html.matchAll(innerPattern)) {
    const question = textContent(match[1].replace(/<span[\s\S]*?<\/span>/gi, ' '));
    const answer = textContent(match[2]);
    if (question && answer) {
      faqs.push({ question, answer, index: match.index });
      consumedRanges.push([match.index, match.index + match[0].length]);
    }
  }

  for (const match of html.matchAll(plainPattern)) {
    const overlapsInnerMatch = consumedRanges.some(([start, end]) => match.index >= start && match.index < end);
    if (overlapsInnerMatch) {
      continue;
    }

    const question = textContent(match[1].replace(/<span[\s\S]*?<\/span>/gi, ' '));
    const answer = textContent(match[2]);
    if (question && answer) {
      faqs.push({ question, answer, index: match.index });
    }
  }

  return faqs
    .sort((a, b) => a.index - b.index)
    .map(({ question, answer }) => ({ question, answer }));
}

function faqSchemaFromVisible(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

function directType(data) {
  if (Array.isArray(data['@type'])) {
    return data['@type'].includes('FAQPage') ? 'FAQPage' : data['@type'][0];
  }

  return data['@type'];
}

function normalizeSchemaFaqs(data) {
  if (!data || directType(data) !== 'FAQPage' || !Array.isArray(data.mainEntity)) {
    return null;
  }

  return data.mainEntity.map((entry) => ({
    question: String(entry?.name || '').replace(/\s+/g, ' ').trim(),
    answer: String(entry?.acceptedAnswer?.text || '').replace(/\s+/g, ' ').trim(),
  }));
}

function faqsMatch(visibleFaqs, schemaFaqs) {
  if (!schemaFaqs || visibleFaqs.length !== schemaFaqs.length) {
    return false;
  }

  return visibleFaqs.every(
    (faq, index) => faq.question === schemaFaqs[index].question && faq.answer === schemaFaqs[index].answer,
  );
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
  const visibleFaqs = extractVisibleFaqs(html);

  if (visibleFaqs.length === 0) {
    return null;
  }

  const scripts = findJsonLdScripts(html);
  let faqScript = null;
  let parseError = null;

  for (const script of scripts) {
    try {
      const data = JSON.parse(script.jsonText.trim());
      if (directType(data) === 'FAQPage') {
        faqScript = { ...script, data };
        break;
      }
    } catch (error) {
      parseError = error;
    }
  }

  if (!faqScript && parseError) {
    return { filePath, status: 'invalid-json', visibleFaqs, message: parseError.message };
  }

  const nextSchema = faqSchemaFromVisible(visibleFaqs);
  const existingFaqs = faqScript ? normalizeSchemaFaqs(faqScript.data) : null;
  const matches = faqsMatch(visibleFaqs, existingFaqs);

  if (matches) {
    return { filePath, status: 'ok', visibleFaqs };
  }

  if (mode !== 'write') {
    return {
      filePath,
      status: faqScript ? 'mismatch' : 'missing',
      visibleFaqs,
      schemaFaqs: existingFaqs,
    };
  }

  let nextHtml;
  if (faqScript) {
    nextHtml = html.replace(faqScript.fullMatch, scriptTagForSchema(nextSchema, faqScript.jsonText));
  } else {
    const breadcrumbScript = scripts.find((script) => {
      try {
        return directType(JSON.parse(script.jsonText.trim())) === 'BreadcrumbList';
      } catch {
        return false;
      }
    });
    const inserted = `${scriptTagForSchema(nextSchema)}\n`;
    if (breadcrumbScript) {
      nextHtml = `${html.slice(0, breadcrumbScript.index)}${inserted}${html.slice(breadcrumbScript.index)}`;
    } else {
      nextHtml = html.replace('</head>', `${inserted}</head>`);
    }
  }

  fs.writeFileSync(filePath, nextHtml);
  return {
    filePath,
    status: faqScript ? 'updated' : 'added',
    visibleFaqs,
    schemaFaqs: existingFaqs,
  };
}

function listHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vercel') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }

  return files;
}

const results = listHtmlFiles(rootDir)
  .map(syncFile)
  .filter(Boolean)
  .sort((a, b) => a.filePath.localeCompare(b.filePath));

const actionable = results.filter((result) => result.status !== 'ok');
const byStatus = results.reduce((counts, result) => {
  counts[result.status] = (counts[result.status] || 0) + 1;
  return counts;
}, {});

console.log(`FAQ pages checked: ${results.length}`);
for (const [status, count] of Object.entries(byStatus).sort()) {
  console.log(`${status}: ${count}`);
}

for (const result of actionable) {
  const relativePath = path.relative(rootDir, result.filePath);
  console.log(`- ${result.status}: ${relativePath} (${result.visibleFaqs.length} visible FAQs)`);
}

if (mode !== 'write' && actionable.length > 0) {
  process.exitCode = 1;
}
