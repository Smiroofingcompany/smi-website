#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const refreshPath = path.join(rootDir, '_data', 'paa-refresh-log.json');
const faqLibraryPath = path.join(rootDir, '_data', 'faq-answer-library.json');

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function parseDate(value, label) {
  const date = new Date(`${value}T00:00:00Z`);
  if (!value || Number.isNaN(date.valueOf())) {
    fail(`${label} must be a YYYY-MM-DD date.`);
    return null;
  }
  return date;
}

function daysBetween(start, end) {
  return Math.floor((end.valueOf() - start.valueOf()) / 86400000);
}

function getToday() {
  if (process.env.PAA_REFRESH_TODAY) {
    return parseDate(process.env.PAA_REFRESH_TODAY, 'PAA_REFRESH_TODAY');
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

const refresh = JSON.parse(fs.readFileSync(refreshPath, 'utf8'));
const faqLibrary = JSON.parse(fs.readFileSync(faqLibraryPath, 'utf8'));
const libraryDraftIds = new Set();

for (const category of faqLibrary.categories || []) {
  for (const draft of category.drafts || []) {
    libraryDraftIds.add(`${category.id}/${draft.id}`);
  }
}

if (!refresh.version) fail('PAA refresh log is missing version.');
if (!refresh.last_refreshed) fail('PAA refresh log is missing last_refreshed.');
if (!refresh.refresh_rule) fail('PAA refresh log is missing refresh_rule.');
if (!Array.isArray(refresh.priority_markets) || refresh.priority_markets.length === 0) {
  fail('PAA refresh log must include priority_markets.');
}
if (!Array.isArray(refresh.acceptable_sources) || refresh.acceptable_sources.length === 0) {
  fail('PAA refresh log must include acceptable_sources.');
}
if (!Array.isArray(refresh.source_notes) || refresh.source_notes.length === 0) {
  fail('PAA refresh log must include source_notes.');
}

const validForDays = Number(refresh.valid_for_days);
if (!Number.isInteger(validForDays) || validForDays <= 0) {
  fail('valid_for_days must be a positive integer.');
}

const today = getToday();
const lastRefreshed = parseDate(refresh.last_refreshed, 'last_refreshed');
if (today && lastRefreshed) {
  const age = daysBetween(lastRefreshed, today);
  if (age > validForDays) {
    fail(`PAA refresh is stale: ${age} days old, valid for ${validForDays} days.`);
  }
}

for (const source of refresh.source_notes || []) {
  if (!source.id) fail('Every source note needs an id.');
  if (!source.source_type) fail(`Source note ${source.id || '(missing id)'} needs source_type.`);
  if (!source.url || !/^https?:\/\//.test(source.url)) fail(`Source note ${source.id || '(missing id)'} needs an http(s) url.`);
  if (!Array.isArray(source.used_for) || source.used_for.length === 0) fail(`Source note ${source.id || '(missing id)'} needs used_for.`);
}

const batches = Array.isArray(refresh.batches) ? refresh.batches : [];
if (batches.length === 0) fail('PAA refresh log must include at least one batch.');

for (const batch of batches) {
  if (!batch.id) fail('Every batch needs an id.');
  if (!batch.refreshed_at) fail(`Batch ${batch.id || '(missing id)'} needs refreshed_at.`);
  if (!batch.source_method) fail(`Batch ${batch.id || '(missing id)'} needs source_method.`);
  if (!Array.isArray(batch.markets) || batch.markets.length === 0) fail(`Batch ${batch.id || '(missing id)'} needs markets.`);
  if (!Array.isArray(batch.service_focus) || batch.service_focus.length === 0) fail(`Batch ${batch.id || '(missing id)'} needs service_focus.`);
  if (!Array.isArray(batch.source_queries) || batch.source_queries.length === 0) fail(`Batch ${batch.id || '(missing id)'} needs source_queries.`);
  if (!Array.isArray(batch.question_sets) || batch.question_sets.length === 0) fail(`Batch ${batch.id || '(missing id)'} needs question_sets.`);

  const refreshedAt = parseDate(batch.refreshed_at, `batch ${batch.id} refreshed_at`);
  if (today && refreshedAt) {
    const age = daysBetween(refreshedAt, today);
    if (age > validForDays) {
      fail(`Batch ${batch.id} is stale: ${age} days old, valid for ${validForDays} days.`);
    }
  }

  for (const set of batch.question_sets || []) {
    const setLabel = `${batch.id}/${set.id || '(missing set id)'}`;
    if (!set.id) fail(`${setLabel} needs id.`);
    if (!set.service) fail(`${setLabel} needs service.`);
    if (!Array.isArray(set.paa_questions) || set.paa_questions.length < 4) {
      fail(`${setLabel} needs at least 4 PAA questions.`);
    }
    if (!Array.isArray(set.recommended_library_ids) || set.recommended_library_ids.length === 0) {
      fail(`${setLabel} needs recommended_library_ids.`);
    }
    if (!set.publishing_notes) fail(`${setLabel} needs publishing_notes.`);

    for (const question of set.paa_questions || []) {
      if (!question.includes('?')) fail(`${setLabel} has a non-question entry: ${question}`);
      if (question.length > 140) fail(`${setLabel} question is too long: ${question}`);
    }

    for (const id of set.recommended_library_ids || []) {
      if (!libraryDraftIds.has(id)) {
        fail(`${setLabel} references missing FAQ library draft: ${id}`);
      }
    }
  }

  if (!Array.isArray(batch.publishing_checklist) || batch.publishing_checklist.length < 4) {
    fail(`Batch ${batch.id || '(missing id)'} needs a publishing_checklist with at least 4 items.`);
  }
}

if (!process.exitCode) {
  const questionCount = batches.reduce(
    (total, batch) => total + batch.question_sets.reduce((setTotal, set) => setTotal + set.paa_questions.length, 0),
    0,
  );
  console.log(`OK: PAA refresh log has ${batches.length} current batch(es), ${questionCount} questions, and ${refresh.priority_markets.length} priority markets.`);
}
