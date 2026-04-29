#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const commercialDir = path.join(rootDir, 'commercial-roofing');

const serviceHubDirs = new Set([
  'built-up-roofing',
  'commercial-roof-repair',
  'epdm-roofing',
  'metal-panel-systems',
  'modified-bitumen-roofing',
  'roof-coatings-restoration',
  'standing-seam-metal-roofing',
  'tpo-roofing',
]);

const displayOverrides = {
  'maumelle-sherwood-ar': 'Maumelle and Sherwood',
};

const hubFaqs = [
  {
    question: 'Which commercial roof system is best for my Arkansas building?',
    answer:
      'The right system depends on roof slope, drainage, insulation, deck condition, foot traffic, budget, and warranty goals. SMI commonly recommends TPO for many low-slope buildings, standing seam metal for long-term weather resistance, coatings when the existing roof is dry and restorable, and EPDM or modified bitumen when the building conditions fit those systems.',
  },
  {
    question: 'Does SMI offer emergency commercial roof repair and maintenance?',
    answer:
      'Yes. SMI handles urgent leak response, storm damage documentation, temporary dry-in, permanent repairs, and ongoing maintenance for Arkansas commercial properties. The same inspection can also identify whether repair, restoration coating, or replacement is the better next step.',
  },
];

function htmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function titleCaseSlug(slug) {
  return slug
    .replace(/-ar$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCityName(html, slug) {
  if (displayOverrides[slug]) {
    return displayOverrides[slug];
  }

  const h1Match = html.match(/Commercial Roofing in <span class="highlight">([^<]+), AR<\/span>/);
  if (h1Match) {
    return decodeEntities(h1Match[1]).trim();
  }

  const titleMatch = html.match(/<title>Commercial Roofing ([^|]+?) AR \|/);
  if (titleMatch) {
    return decodeEntities(titleMatch[1]).trim();
  }

  return titleCaseSlug(slug);
}

function getLocalOwnerPhrase(html) {
  const countyMatch = html.match(/\b([A-Z][A-Za-z]+(?:\s[A-Z][A-Za-z]+)?) County\b/);
  return countyMatch ? `${countyMatch[1]} County property owners` : 'local property owners';
}

function cityFaqs(html, slug) {
  const cityName = getCityName(html, slug);
  const ownerPhrase = getLocalOwnerPhrase(html);

  return [
    {
      question: `How often should a commercial roof in ${cityName} be inspected?`,
      answer: `Most ${cityName} commercial roofs should be inspected at least twice a year and after major hail, wind, or heavy rain. SMI checks seams, flashing, drains, penetrations, rooftop units, ponding water, and interior leak clues, then gives ${ownerPhrase} photo documentation before small issues interrupt operations.`,
    },
    {
      question: `Can SMI build a maintenance plan for ${cityName} commercial buildings?`,
      answer: `Yes. SMI can set up a maintenance plan for ${cityName} businesses, churches, schools, warehouses, apartments, medical offices, and retail properties. The plan can include documented inspections, minor repairs, sealant checks, drain clearing, priority leak response, and budget planning for coating, repair, or replacement.`,
    },
  ];
}

function updateFaqSchema(html, faqs, filePath) {
  let foundFaqSchema = false;
  let changed = false;

  const nextHtml = html.replace(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    (fullMatch, jsonText) => {
      let data;

      try {
        data = JSON.parse(jsonText.trim());
      } catch {
        return fullMatch;
      }

      if (data['@type'] !== 'FAQPage') {
        return fullMatch;
      }

      foundFaqSchema = true;
      data.mainEntity = Array.isArray(data.mainEntity) ? data.mainEntity : [];
      const existingQuestions = new Set(data.mainEntity.map((entry) => entry.name));

      for (const faq of faqs) {
        if (existingQuestions.has(faq.question)) {
          continue;
        }

        data.mainEntity.push({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        });
        existingQuestions.add(faq.question);
        changed = true;
      }

      return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
    },
  );

  if (!foundFaqSchema) {
    throw new Error(`No FAQPage schema found in ${filePath}`);
  }

  return { html: nextHtml, changed };
}

function faqItemHtml(faq) {
  return `<div class="faq-item"><button class="faq-question">${htmlEscape(faq.question)}<span class="faq-icon">+</span></button><div class="faq-answer"><div class="faq-answer-inner">${htmlEscape(faq.answer)}</div></div></div>`;
}

function insertVisibleFaqs(html, faqs, filePath) {
  const missingFaqs = faqs.filter((faq) => !html.includes(`>${htmlEscape(faq.question)}<span`));

  if (missingFaqs.length === 0) {
    return { html, changed: false };
  }

  const faqStart = html.indexOf('<section class="faq-section');
  if (faqStart === -1) {
    throw new Error(`No visible FAQ section found in ${filePath}`);
  }

  const nextSection = html.indexOf('\n<section', faqStart + 1);
  const faqEnd = nextSection === -1 ? html.length : nextSection;
  const sectionHtml = html.slice(faqStart, faqEnd);
  const cityCloseMatches = [...sectionHtml.matchAll(/<\/div>\s*<\/div><\/section>/g)];
  const hubCloseMatches = [...sectionHtml.matchAll(/<\/div>\s*<\/section>/g)];
  const markerMatch = cityCloseMatches.at(-1) || hubCloseMatches.at(-1);

  if (!markerMatch) {
    throw new Error(`Could not find FAQ section closing marker in ${filePath}`);
  }

  const absoluteInsertIndex = faqStart + markerMatch.index;
  const insertedItems = `\n${missingFaqs.map(faqItemHtml).join('\n')}`;

  return {
    html: `${html.slice(0, absoluteInsertIndex)}${insertedItems}${html.slice(absoluteInsertIndex)}`,
    changed: true,
  };
}

function updateFile(filePath, faqs, extraTransform = (html) => html) {
  const originalHtml = fs.readFileSync(filePath, 'utf8');
  const transformedHtml = extraTransform(originalHtml);
  const schemaResult = updateFaqSchema(transformedHtml, faqs, filePath);
  const visibleResult = insertVisibleFaqs(schemaResult.html, faqs, filePath);
  const nextHtml = visibleResult.html;

  if (nextHtml !== originalHtml) {
    fs.writeFileSync(filePath, nextHtml);
    return true;
  }

  return false;
}

const updatedFiles = [];
const commercialHub = path.join(commercialDir, 'index.html');

if (
  updateFile(commercialHub, hubFaqs, (html) =>
    html
      .replace('<div class="section-tag">Commercial Pricing FAQs</div>', '<div class="section-tag">Commercial FAQs</div>')
      .replace(
        '<h2 class="section-title" style="margin-bottom:40px">Commercial Roofing Cost <span class="text-cyan">Questions</span></h2>',
        '<h2 class="section-title" style="margin-bottom:40px">Commercial Roofing <span class="text-cyan">Questions</span></h2>',
      ),
  )
) {
  updatedFiles.push(path.relative(rootDir, commercialHub));
}

const cityFiles = fs
  .readdirSync(commercialDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .filter((entry) => !serviceHubDirs.has(entry.name))
  .map((entry) => ({
    slug: entry.name,
    filePath: path.join(commercialDir, entry.name, 'index.html'),
  }))
  .filter((entry) => fs.existsSync(entry.filePath))
  .sort((a, b) => a.slug.localeCompare(b.slug));

for (const entry of cityFiles) {
  const html = fs.readFileSync(entry.filePath, 'utf8');
  const faqs = cityFaqs(html, entry.slug);

  if (updateFile(entry.filePath, faqs)) {
    updatedFiles.push(path.relative(rootDir, entry.filePath));
  }
}

console.log(`Updated ${updatedFiles.length} commercial FAQ page(s).`);
for (const file of updatedFiles) {
  console.log(`- ${file}`);
}
