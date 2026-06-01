/**
 * update-image-attrs.mjs
 * Adds loading="lazy", fetchpriority="high" (for LCP), and intrinsic width/height
 * to all known asset img tags sitewide.
 *
 * Run: node scripts/update-image-attrs.mjs [--dry-run]
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const DRY_RUN = process.argv.includes('--dry-run');

// Intrinsic pixel dimensions and LCP flag for every known asset image.
// lcp:true → fetchpriority="high", no lazy-load.
// lcp:false → loading="lazy".
const IMAGE_META = {
  '/assets/hero-poster.jpg':                      { w: 1600, h: 900,  lcp: true  },
  '/assets/smi-luxury-roof-finished.jpg':          { w: 1800, h: 1365, lcp: true  },
  '/assets/cory-owner-smi-roofing.jpg':            { w: 1086, h: 1449, lcp: false },
  '/assets/smi-two-roofers-jobsite.jpg':           { w: 2048, h: 1536, lcp: false },
  '/assets/smi-aerial-roof-detail.jpg':            { w: 1800, h: 1012, lcp: false },
  '/assets/smi-commercial-aerial-roof.jpg':        { w: 1800, h: 1012, lcp: false },
  '/assets/smi-commercial-steel-roofing.jpg':      { w: 1800, h: 1350, lcp: false },
  '/assets/smi-active-roof-documentation-aerial.jpg': { w: 1800, h: 1012, lcp: false },
  '/assets/smi-storm-roof-inspection.jpg':         { w: 1800, h: 1406, lcp: false },
  '/assets/smi-roofing-project-aerial.jpg':        { w: 1800, h: 1012, lcp: false },
};

const SKIP_DIRS = new Set(['node_modules', '.git', 'api', 'scripts', '_drafts', '_data', '.vercel', '.claude', 'docs']);

function getAllHtmlFiles(dir) {
  const files = [];
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { return files; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Process one <img ...> tag string.
 * Returns the modified tag (or the original if no change needed).
 */
function processImgTag(imgTag) {
  // Skip Facebook Pixel and other tracking pixels (tiny 1x1 imgs)
  if (imgTag.includes('facebook.com') || imgTag.includes('google.com/tr')) return imgTag;

  const srcMatch = imgTag.match(/\bsrc="([^"]+)"/);
  if (!srcMatch) return imgTag;
  const src = srcMatch[1];

  // Skip logo — always in nav/footer, above fold, no lazy needed
  if (src.endsWith('logo.png')) return imgTag;

  const meta = IMAGE_META[src];
  if (!meta) return imgTag; // unknown image — leave alone

  const hasLoading      = /\bloading=/.test(imgTag);
  const hasFetchpriority = /\bfetchpriority=/.test(imgTag);
  const hasWidth        = /\bwidth="/.test(imgTag);
  const hasHeight       = /\bheight="/.test(imgTag);

  const attrsToAdd = [];

  if (meta.lcp) {
    // LCP / above-fold image: needs fetchpriority="high", must NOT be lazy
    if (!hasFetchpriority) attrsToAdd.push('fetchpriority="high"');
    // Strip lazy if it was somehow added
    if (hasLoading) {
      imgTag = imgTag.replace(/\s+loading="[^"]*"/, '');
    }
  } else {
    // Below-fold image: needs lazy
    if (!hasLoading) attrsToAdd.push('loading="lazy"');
  }

  if (!hasWidth)  attrsToAdd.push(`width="${meta.w}"`);
  if (!hasHeight) attrsToAdd.push(`height="${meta.h}"`);

  if (attrsToAdd.length === 0) return imgTag;

  // Append new attributes before the closing >
  return imgTag.replace(/>$/, ` ${attrsToAdd.join(' ')}>`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = getAllHtmlFiles(ROOT);
let changedFiles = 0;
let changedImgs  = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');

  let fileImgChanges = 0;
  const updated = original.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const result = processImgTag(imgTag);
    if (result !== imgTag) fileImgChanges++;
    return result;
  });

  if (updated !== original) {
    if (!DRY_RUN) writeFileSync(file, updated, 'utf8');
    changedFiles++;
    changedImgs += fileImgChanges;
    const relPath = file.replace(ROOT + '/', '');
    console.log(`${DRY_RUN ? '[dry] ' : ''}✓ ${relPath} (${fileImgChanges} img${fileImgChanges !== 1 ? 's' : ''})`);
  }
}

console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done: ${changedFiles} files, ${changedImgs} image tags updated.`);
