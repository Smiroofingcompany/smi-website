#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');

const checks = [
  ['BlogPosting schema', ['npm', '--silent', 'run', 'validate:blogposting-schema']],
  ['City RoofingContractor schema', ['npm', '--silent', 'run', 'validate:city-schema']],
  ['Service schema', ['npm', '--silent', 'run', 'validate:service-schema']],
  ['Breadcrumb schema', ['npm', '--silent', 'run', 'validate:breadcrumb-schema']],
  ['Review schema', ['npm', '--silent', 'run', 'validate:review-schema']],
  ['FAQ schema', ['node', 'scripts/sync-faq-schema.mjs']],
];

const externalTestUrls = [
  'https://smiroof.com/',
  'https://smiroof.com/russellville/',
  'https://smiroof.com/russellville/roof-repair/',
  'https://smiroof.com/roof-repair/',
  'https://smiroof.com/reviews/',
  'https://smiroof.com/video-center/',
  'https://smiroof.com/blog/how-to-choose-roofing-contractor-arkansas/',
];

function runCheck(name, [command, ...args]) {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`${name} failed`);
  }
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

function directTypes(data) {
  const type = data?.['@type'];
  if (!type) return [];
  return Array.isArray(type) ? type : [type];
}

function countSchemaTypes() {
  const counts = new Map();
  let scriptCount = 0;

  for (const filePath of listHtmlFiles(rootDir)) {
    const html = fs.readFileSync(filePath, 'utf8');
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      let data;
      try {
        data = JSON.parse(match[1].trim());
      } catch (error) {
        throw new Error(`${path.relative(rootDir, filePath)} has invalid JSON-LD: ${error.message}`);
      }

      scriptCount += 1;
      const nodes = Array.isArray(data?.['@graph']) ? data['@graph'] : [data];
      for (const node of nodes) {
        for (const type of directTypes(node)) {
          counts.set(type, (counts.get(type) || 0) + 1);
        }
      }
    }
  }

  return { scriptCount, counts };
}

function ensureReleaseCoverage(counts) {
  const requiredMinimums = new Map([
    ['RoofingContractor', 1],
    ['FAQPage', 1],
    ['BreadcrumbList', 1],
    ['Service', 1],
    ['BlogPosting', 38],
    ['Organization', 1],
    ['WebSite', 1],
  ]);

  const failures = [];
  for (const [type, minimum] of requiredMinimums.entries()) {
    const actual = counts.get(type) || 0;
    if (actual < minimum) {
      failures.push(`${type}: expected at least ${minimum}, found ${actual}`);
    }
  }

  if (failures.length) {
    throw new Error(`Schema coverage failed:\n${failures.join('\n')}`);
  }
}

function richResultsUrl(url) {
  return `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
}

function schemaValidatorUrl(url) {
  return `https://validator.schema.org/#url=${encodeURIComponent(url)}`;
}

try {
  console.log('Schema release validation started.');
  for (const check of checks) {
    runCheck(...check);
  }

  console.log('\n== JSON-LD parse and release coverage ==');
  const { scriptCount, counts } = countSchemaTypes();
  ensureReleaseCoverage(counts);
  console.log(`Parsed JSON-LD scripts: ${scriptCount}`);
  for (const [type, count] of [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`${type}: ${count}`);
  }

  console.log('\n== Required manual checks before release ==');
  console.log('Run changed or representative URLs through:');
  for (const url of externalTestUrls) {
    console.log(`- ${url}`);
    console.log(`  Rich Results Test: ${richResultsUrl(url)}`);
    console.log(`  Schema.org Validator: ${schemaValidatorUrl(url)}`);
  }
  console.log('- Google Search Console: check Enhancements/Rich result reports for new errors after deployment.');
  console.log('\nSchema release validation passed.');
} catch (error) {
  console.error(`\nSchema release validation failed: ${error.message}`);
  process.exitCode = 1;
}
