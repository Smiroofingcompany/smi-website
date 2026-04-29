#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const libraryPath = path.join(rootDir, '_data', 'faq-answer-library.json');

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\{[a-z0-9_]+\}/g, '{token}')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenPattern(token) {
  return new RegExp(`\\{${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g');
}

const library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
const categories = Array.isArray(library.categories) ? library.categories : [];
const globalTokens = library.global_tokens || {};

if (!library.version) fail('Library is missing version.');
if (!library.publishing_rule) fail('Library is missing publishing_rule.');
if (categories.length === 0) fail('Library has no categories.');

const categoryIds = new Set();
const draftIds = new Set();
const normalizedQuestions = new Map();
const normalizedAnswers = new Map();
let draftCount = 0;

for (const category of categories) {
  if (!category.id) fail('Category is missing id.');
  if (categoryIds.has(category.id)) fail(`Duplicate category id: ${category.id}`);
  categoryIds.add(category.id);

  if (!category.service) fail(`Category ${category.id} is missing service.`);
  if (!Array.isArray(category.recommended_page_types) || category.recommended_page_types.length === 0) {
    fail(`Category ${category.id} is missing recommended_page_types.`);
  }
  if (!Array.isArray(category.drafts) || category.drafts.length < 4) {
    fail(`Category ${category.id} must have at least 4 drafts.`);
  }

  for (const draft of category.drafts || []) {
    draftCount += 1;
    const draftKey = `${category.id}/${draft.id}`;
    if (!draft.id) fail(`Draft in ${category.id} is missing id.`);
    if (draftIds.has(draftKey)) fail(`Duplicate draft id: ${draftKey}`);
    draftIds.add(draftKey);

    if (!draft.intent) fail(`${draftKey} is missing intent.`);
    if (!draft.question_template) fail(`${draftKey} is missing question_template.`);
    if (!draft.answer_template) fail(`${draftKey} is missing answer_template.`);
    if (!Array.isArray(draft.tokens) || draft.tokens.length === 0) fail(`${draftKey} is missing tokens.`);
    if (!draft.localization_notes) fail(`${draftKey} is missing localization_notes.`);

    const combined = `${draft.question_template}\n${draft.answer_template}`;
    for (const token of draft.tokens || []) {
      if (!Object.prototype.hasOwnProperty.call(globalTokens, token)) {
        fail(`${draftKey} uses token "${token}" but it is not defined in global_tokens.`);
      }
      if (!tokenPattern(token).test(combined)) {
        fail(`${draftKey} lists token "${token}" but does not use {${token}}.`);
      }
    }

    const normalizedQuestion = normalize(draft.question_template);
    const normalizedAnswer = normalize(draft.answer_template);
    if (normalizedQuestions.has(normalizedQuestion)) {
      fail(`${draftKey} duplicates question template from ${normalizedQuestions.get(normalizedQuestion)}.`);
    }
    if (normalizedAnswers.has(normalizedAnswer)) {
      fail(`${draftKey} duplicates answer template from ${normalizedAnswers.get(normalizedAnswer)}.`);
    }
    normalizedQuestions.set(normalizedQuestion, draftKey);
    normalizedAnswers.set(normalizedAnswer, draftKey);
  }
}

if (draftCount < 40) {
  fail(`Library should have at least 40 drafts; found ${draftCount}.`);
}

if (!process.exitCode) {
  console.log(`OK: FAQ answer library has ${categories.length} categories and ${draftCount} unique localized drafts.`);
}
