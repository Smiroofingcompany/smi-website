import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteUrl = 'https://smiroof.com';
const today = '2026-04-29';
const phone = '(501) 464-5139';
const phoneHref = 'tel:+15014645139';
const bookingUrl = 'https://clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb';

const excludedTopLevelDirs = new Set([
  'api',
  'assets',
  'blog',
  'commercial-roofing',
  'industries',
  'privacy-policy',
  'sms-terms',
  'site-map',
  'service-areas',
  'areas-we-serve',
  'residential-roofing',
  'metal-roofing',
  'metal-roofs',
  'roof-repair',
  'roof-inspections',
  'storm-damage',
  'insurance-claims',
  'roofing-costs',
  'roof-replacement-cost',
  'roof-repair-cost',
  'metal-roof-cost',
  'commercial-roofing-cost',
  'storm-damage-roof-repair-cost',
  'roof-inspection-cost',
  'roof-insurance-claim-cost',
  'metal-roof-vs-shingles',
  'roof-repair-vs-replacement',
  'roof-coating-vs-replacement',
  'tile-roof-vs-shingles'
]);

const stateCodeByName = new Map([
  ['Arkansas', 'AR'],
  ['Texas', 'TX'],
  ['Tennessee', 'TN']
]);

const fallbackMetroContext = new Map([
  ['dfw', 'North Texas hail, long heat cycles, fast subdivision growth, low-slope commercial drainage, and claim-ready photos across Dallas, Fort Worth, Arlington, Plano, Frisco, Irving, Grapevine, and nearby communities.'],
  ['fort-worth', 'Tarrant County hail, long heat cycles, wind-driven rain, older neighborhoods, and large commercial roof areas around Fort Worth, Arlington, Keller, Burleson, Weatherford, Benbrook, and Saginaw.'],
  ['houston', 'tropical rain, wind, humidity, tree debris, low-slope commercial drainage, and storm documentation across Harris County and nearby Gulf Coast communities.'],
  ['san-antonio', 'hail, heat, wind-driven rain, older neighborhood roof systems, and storm documentation across Bexar County and nearby Hill Country communities.'],
  ['nashville-tn', 'hail, high winds, humidity, tree cover, steep roof access, and mixed residential and commercial roof types around Nashville, Brentwood, Franklin, Hendersonville, and Mount Juliet.']
]);

const fallbackMetroAreas = new Map([
  ['dfw', 'Dallas, Fort Worth, Arlington, Plano, Frisco, Irving, Grapevine, and nearby North Texas communities'],
  ['fort-worth', 'Fort Worth, Arlington, Keller, Burleson, Weatherford, Benbrook, Saginaw, and nearby Tarrant County communities'],
  ['houston', 'Houston, Harris County, and nearby Gulf Coast communities'],
  ['san-antonio', 'San Antonio, Bexar County, and nearby Hill Country communities'],
  ['nashville-tn', 'Nashville, Brentwood, Franklin, Hendersonville, Mount Juliet, and nearby Middle Tennessee communities']
]);

const basePage = readFileSync(join(root, 'roofing-costs', 'index.html'), 'utf8');
const baseStyle = basePage.match(/<style>[\s\S]*?<\/style>/)?.[0];
const pixelCode = basePage.match(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/)?.[0] || '';

if (!baseStyle) {
  throw new Error('Could not read base styles from roofing-costs/index.html');
}

const extraStyle = `.notice{margin-top:24px;border:1px solid rgba(0,200,240,.34);background:#eafaff;color:#075b70;border-radius:8px;padding:18px;line-height:1.7;font-weight:800}.step-list{display:grid;gap:14px;margin-top:28px}.step-list li{list-style:none;background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px;color:var(--muted);line-height:1.7}.step-list strong{display:block;color:var(--ink);margin-bottom:5px}.resource-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:24px}.resource-list a{display:flex;align-items:center;justify-content:space-between;min-height:54px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:13px 15px;font-weight:900;color:var(--ink)}.resource-list a::after{content:'>';color:var(--cyan-dark);margin-left:10px}.card .label{display:inline-flex;margin-bottom:12px;padding:6px 10px;border-radius:999px;background:#eafaff;color:#075b70;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.dark .notice{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:rgba(255,255,255,.78)}@media(max-width:760px){.resource-list{grid-template-columns:1fr}}`;
const style = baseStyle.replace('</style>', `${extraStyle}</style>`);

function titleCaseSegment(segment) {
  const known = new Map([
    ['dfw', 'DFW'],
    ['tn', 'TN'],
    ['ar', 'AR']
  ]);

  return segment
    .split('-')
    .map((part) => known.get(part) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(value) {
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanSentence(value) {
  return stripTags(value).replace(/\s+/g, ' ').replace(/[.!?]+$/g, '').trim();
}

function matchValue(html, regex) {
  return html.match(regex)?.[1]?.trim() || '';
}

function getCityData(slug) {
  const html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  const placename = matchValue(html, /<meta name="geo\.placename" content="([^"]+)"/);
  const region = matchValue(html, /<meta name="geo\.region" content="US-([A-Z]{2})"/);
  const [rawCity, rawStateName] = placename.split(',').map((part) => part.trim());
  const stateCode = region || stateCodeByName.get(rawStateName) || 'AR';
  const cityName = rawCity || titleCaseSegment(slug);
  const displayPlace = `${cityName}, ${stateCode}`;
  const county = matchValue(html, /<div class="trust-card"><b>([^<]*County)<\/b>/) || (stateCode === 'AR' ? 'Arkansas' : stateCode === 'TX' ? 'Texas' : 'Tennessee');
  const zipText = matchValue(html, new RegExp(`Serving\\s+${cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^<]*?\\s+([0-9][0-9,\\s]*)`, 'i'));
  const localServiceMatch = html.match(/The local roof concerns are specific:\s*([^<]+?)\s*SMI plans visits around\s*([^<]+?)\s*(?:, with nearby routing through\s*([^<]+?)\.|<\/p>)/i);
  const localConcerns = cleanSentence(localServiceMatch?.[1] || fallbackMetroContext.get(slug) || 'hail, wind-driven rain, summer heat, tree exposure, and roof leak documentation');
  const localAreas = cleanSentence(localServiceMatch?.[2] || fallbackMetroAreas.get(slug) || `${displayPlace} roof addresses and nearby neighborhoods`);
  const nearby = cleanSentence(localServiceMatch?.[3] || '');
  const heroSummary = stripTags(matchValue(html, /<section class="hero"[\s\S]*?<p>([\s\S]*?)<\/p>/));

  return {
    slug,
    cityName,
    stateCode,
    stateName: rawStateName || (stateCode === 'AR' ? 'Arkansas' : stateCode === 'TX' ? 'Texas' : 'Tennessee'),
    displayPlace,
    county,
    zipText,
    localConcerns,
    localAreas,
    nearby,
    heroSummary
  };
}

const citySlugs = readTopLevelCitySlugs();
const cities = citySlugs.map(getCityData);

function readTopLevelCitySlugs() {
  return readFileSync(join(root, 'sitemap.xml'), 'utf8')
    .match(/<loc>https:\/\/smiroof\.com\/[^/]+\/<\/loc>/g)
    ?.map((loc) => loc.replace('<loc>https://smiroof.com/', '').replace('/</loc>', ''))
    .filter((slug) => slug && !excludedTopLevelDirs.has(slug) && fileExists(join(root, slug, 'index.html')))
    .sort() || [];
}

function fileExists(file) {
  try {
    readFileSync(file);
    return true;
  } catch {
    return false;
  }
}

function schemaScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function orgSchema(city) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${siteUrl}/#organization`,
    name: 'SMI Roofing',
    url: siteUrl,
    telephone: '+1-501-464-5139',
    email: 'info@smiroof.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '302 East Parkway Drive, Suite C',
      addressLocality: 'Russellville',
      addressRegion: 'AR',
      postalCode: '72801',
      addressCountry: 'US'
    },
    areaServed: {
      '@type': 'City',
      name: city.cityName,
      containedInPlace: {
        '@type': 'State',
        name: city.stateName
      }
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '231',
      reviewCount: '231'
    }
  };
}

function faqItems(city) {
  return [
    [
      `Does SMI Roofing work for State Farm in ${city.displayPlace}?`,
      `No. SMI Roofing is an independent roofing contractor and is not affiliated with, endorsed by, or an agent of State Farm. SMI can inspect the roof, document visible storm damage, prepare a roofing estimate, and support the homeowner's adjuster meeting when requested. State Farm and the policy decide coverage.`
    ],
    [
      `Can I choose SMI for a State Farm roof claim in ${city.displayPlace}?`,
      `Yes. State Farm's own roof-claims guidance says the contractor choice is yours. Homeowners should choose an established, insured roofer, request a detailed written estimate, and confirm warranty and scope details before work starts.`
    ],
    [
      `Should I file a State Farm claim before SMI inspects my roof?`,
      `If there is active leaking or obvious storm damage, contact State Farm or your agent promptly and take reasonable steps to prevent further damage. If you are unsure whether the damage is larger than your deductible, SMI can provide a free roof inspection and photos so you have clearer information before deciding your next step.`
    ],
    [
      `Can SMI meet the State Farm adjuster at my ${city.cityName} property?`,
      `Yes, when the homeowner asks us to be there. SMI can point out roof conditions, photos, storm evidence, repair details, and missing scope items from a roofing perspective. SMI does not act as a public adjuster, attorney, or State Farm representative.`
    ],
    [
      `Will State Farm pay for my roof replacement?`,
      `That depends on the policy, deductible, cause of loss, age and condition of the roof, and State Farm's claim investigation. SMI does not promise coverage or claim outcomes. We help document the roof clearly so the claim handler has the roofing facts needed to evaluate the claim.`
    ]
  ];
}

function faqSchema(city) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems(city).map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

function breadcrumbSchema(city) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${siteUrl}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Areas We Serve',
        item: `${siteUrl}/areas-we-serve/`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.displayPlace,
        item: `${siteUrl}/${city.slug}/`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'State Farm Roof Claim Help',
        item: `${siteUrl}/${city.slug}/state-farm-roof-claim/`
      }
    ]
  };
}

function nav() {
  return `<div class="topbar"><div class="topbar-inner"><div><strong>Independent State Farm roof claim documentation.</strong> SMI is not affiliated with State Farm.</div><a href="${phoneHref}">${phone}</a></div></div>
<nav class="nav" id="siteNav"><div class="nav-inner"><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><ul class="nav-links"><li><a href="/">Home</a></li><li><a href="/commercial-roofing/">Commercial</a></li><li><a href="/storm-damage/">Storm Damage</a></li><li><a href="/insurance-claims/">Insurance Claims</a></li><li><a href="/areas-we-serve/">Areas We Serve</a></li><li><a href="${phoneHref}">${phone}</a></li><li><a href="${bookingUrl}" class="nav-cta">Free Inspection</a></li></ul><button class="nav-toggle" type="button" aria-label="Open menu" onclick="toggleMenu()"><span></span><span></span><span></span></button></div></nav>
<div class="mobile-menu" id="mobileMenu"><a href="/" onclick="closeMenu()">Home</a><a href="/commercial-roofing/" onclick="closeMenu()">Commercial Roofing</a><a href="/storm-damage/" onclick="closeMenu()">Storm Damage</a><a href="/insurance-claims/" onclick="closeMenu()">Insurance Claims</a><a href="/areas-we-serve/" onclick="closeMenu()">Areas We Serve</a><a href="${phoneHref}" class="mobile-cta" onclick="closeMenu()">Call ${phone}</a></div>`;
}

function footer(city) {
  return `<footer class="footer"><div class="container"><div class="footer-grid"><div><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><p>Independent roof inspection, storm documentation, and claim-scope support for ${city.displayPlace} property owners.</p><p>302 East Parkway Drive, Suite C<br>Russellville, Arkansas 72801<br><a href="${phoneHref}">${phone}</a></p></div><div><h3>Claim Help</h3><a href="/insurance-claims/">Insurance Claims</a><a href="/roof-insurance-claim-cost/">Claim Cost Guide</a><a href="/storm-damage/">Storm Damage</a><a href="/${city.slug}/state-farm-roof-claim/">State Farm Claim Help</a></div><div><h3>Services</h3><a href="/residential-roofing/">Residential Roofing</a><a href="/roof-repair/">Roof Repair</a><a href="/roof-inspections/">Roof Inspections</a><a href="/commercial-roofing/">Commercial Roofing</a></div><div><h3>Company</h3><a href="/${city.slug}/">${city.displayPlace}</a><a href="/areas-we-serve/">Areas We Serve</a><a href="/site-map/">Site Map</a><a href="/privacy-policy/">Privacy Policy</a></div></div><div class="footer-bottom"><span>&copy; 2026 CAS Management Inc. dba SMI Roofing. All rights reserved.</span><span>Independent contractor | Not affiliated with State Farm</span></div></div></footer>`;
}

function resourceLinks(city) {
  const fourthLink = city.stateCode === 'AR'
    ? '<a href="https://insurance.arkansas.gov/insurance-commissioner-provides-post-storm-tips-to-consumers/" rel="noopener">Arkansas post-storm tips</a>'
    : '<a href="/insurance-claims/">SMI insurance claim help</a>';

  return `<div class="resource-list"><a href="https://www.statefarm.com/claims/home-and-property/roof-claims" rel="noopener">State Farm roof claims</a><a href="https://www.statefarm.com/claims/home-and-property" rel="noopener">State Farm home claims</a><a href="https://www.statefarm.com/claims/home-and-property/contractor-locator" rel="noopener">State Farm contractor guidance</a>${fourthLink}</div>`;
}

function faqHtml(city) {
  return faqItems(city)
    .map(([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button">${escapeHtml(question)}<span>+</span></button><div class="faq-answer">${escapeHtml(answer)}</div></div>`)
    .join('');
}

function pageHtml(city) {
  const pageUrl = `${siteUrl}/${city.slug}/state-farm-roof-claim/`;
  const title = `State Farm Roof Claim Help in ${city.displayPlace} | SMI Roofing`;
  const description = `Independent State Farm roof claim documentation for ${city.displayPlace}. SMI inspects storm damage, prepares roofing photos, and supports adjuster meetings.`;
  const localSentence = city.nearby
    ? `SMI focuses on ${city.localAreas}, with nearby routing through ${city.nearby}.`
    : `SMI focuses on ${city.localAreas}.`;
  const zipSentence = city.zipText ? ` SMI supports roof addresses in ${city.zipText}.` : '';
  const stateNotice = city.stateCode === 'AR'
    ? 'For Arkansas storm claims, the Arkansas Insurance Department tells consumers to document damage, contact the insurer or agent, make necessary temporary repairs to prevent further damage, save receipts, avoid blank contracts, and avoid contractors who offer to waive the deductible.'
    : 'For state-specific consumer insurance questions, contact State Farm, your agent, or your state insurance department. SMI can explain roofing scope and document visible roof conditions, but it does not decide coverage or interpret policy language.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:image" content="/assets/og-image.jpg">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${pageUrl}">
<meta name="geo.region" content="US-${city.stateCode}">
<meta name="geo.placename" content="${escapeHtml(city.cityName)}, ${escapeHtml(city.stateName)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema(city))}
${schemaScript(faqSchema(city))}
${schemaScript(breadcrumbSchema(city))}
${pixelCode}
</head>
<body>
${nav()}
<main>
<section class="hero"><div class="hero-bg"><img src="/assets/smi-storm-roof-inspection.jpg" alt="SMI Roofing storm roof inspection"></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/areas-we-serve/">Areas We Serve</a><span>/</span><a href="/${city.slug}/">${escapeHtml(city.displayPlace)}</a><span>/</span><span>State Farm Roof Claim Help</span></div><div class="eyebrow">Carrier-Specific Claim Guidance</div><h1>State Farm Roof Claim Help in <strong>${escapeHtml(city.displayPlace)}</strong></h1><p>SMI Roofing helps ${escapeHtml(city.displayPlace)} property owners document storm damage, prepare roof photos, review roofing scope details, and support adjuster meetings for State Farm roof claims. SMI is an independent contractor, not State Farm, not a public adjuster, and not a law firm.</p><div class="hero-actions"><a href="${phoneHref}" class="btn btn-primary">Call ${phone}</a><a href="${bookingUrl}" class="btn btn-secondary">Book free inspection</a></div><div class="proof"><div><b>Free</b><span>Roof inspection</span></div><div><b>Photo</b><span>Damage documentation</span></div><div><b>Local</b><span>${escapeHtml(city.county)}</span></div><div><b>Ind.</b><span>Not affiliated</span></div></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Important Compliance Note</div><h2 class="section-title">Independent help, not a State Farm endorsement.</h2><p class="section-lede">This page is for homeowners searching for State Farm roof claim guidance in ${escapeHtml(city.displayPlace)}. State Farm is named only to identify the insurance carrier. SMI Roofing is not affiliated with, endorsed by, sponsored by, or an agent of State Farm. Coverage decisions, claim payments, deductibles, depreciation, and denial letters come from State Farm and your policy.</p><div class="notice">SMI's role is roofing work: inspect the roof, photograph visible conditions, prepare a detailed roofing estimate, explain repair versus replacement from a contractor perspective, and complete approved roofing work. SMI does not interpret your policy, negotiate coverage as a public adjuster, or provide legal advice.</div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Local Claim Context</div><h2 class="section-title">What makes ${escapeHtml(city.cityName)} State Farm roof claims different?</h2><p class="section-lede">${escapeHtml(city.displayPlace)} roof claims are shaped by ${escapeHtml(city.localConcerns)}. ${escapeHtml(localSentence)}${escapeHtml(zipSentence)} A carrier-specific page matters because homeowners often search the insurer name after a hailstorm, wind event, leak, or claim letter and need a clear next step.</p><div class="grid"><article class="card"><span class="label">Before filing</span><h3>Document what you can see</h3><p>State Farm advises homeowners to document damage with photos, notes, and helpful details. SMI can inspect shingles, soft metals, vents, flashing, ridge, valleys, gutters, and interior leak clues so you have roof-specific photos before the scope conversation gets confusing.</p></article><article class="card"><span class="label">During claim</span><h3>Keep the contractor role clean</h3><p>SMI can meet the adjuster when you request it and point out roof conditions from a roofing standpoint. We do not claim to decide coverage, waive deductibles, or act as State Farm's representative.</p></article><article class="card"><span class="label">After scope</span><h3>Compare the estimate to the roof</h3><p>A good roofing estimate should identify materials, labor, work specifications, start and completion timing, payment procedure, permits if applicable, and warranty details. Missing roof items can be documented with photos and contractor notes.</p></article></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">State Farm Claim Steps</div><h2 class="section-title">A careful path from inspection to repair.</h2><p class="section-lede">Every claim is different, but this sequence keeps the homeowner in control and keeps SMI's role focused on roofing facts.</p><ul class="step-list"><li><strong>1. Protect the property.</strong>If wind, hail, or falling debris opened the roof, take reasonable steps to prevent further damage. Save receipts for temporary protection and do not throw away damaged items unless your insurer tells you to.</li><li><strong>2. Get roof photos.</strong>SMI documents visible storm indicators, leak paths, roof penetrations, flashing, metal accessories, and attic or ceiling clues when accessible. This helps you understand whether the issue looks isolated, repairable, or claim-worthy.</li><li><strong>3. File through State Farm when needed.</strong>State Farm lists online filing, the mobile app, your State Farm agent, and 800-SF-CLAIM (800-732-5246) as claim options. If you already have active leaking or obvious storm damage, report it promptly.</li><li><strong>4. Be available for questions.</strong>State Farm says the claim handler may ask for additional details during investigation. Keep inspection photos, dates, temporary repair receipts, and contractor notes organized.</li><li><strong>5. Review the written scope.</strong>Before work starts, SMI compares the roof conditions against the roofing scope and explains repair items, replacement items, ventilation, flashing, code or permit concerns, upgrades, and warranty details.</li></ul></div></section>
<section class="section dark"><div class="container"><div class="eyebrow">Helpful Links</div><h2 class="section-title">Use official claim resources when you need carrier details.</h2><p class="section-lede">SMI can explain roofing scope and document damage. For coverage questions, claim status, deductible, depreciation, or policy limits, use State Farm, your agent, or your state's insurance department.</p>${resourceLinks(city)}<div class="notice">${escapeHtml(stateNotice)}</div></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">State Farm Claim FAQs</div><h2 class="section-title">Questions ${escapeHtml(city.cityName)} homeowners ask.</h2><div class="faq-list">${faqHtml(city)}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>Need a roof inspection before or during a State Farm claim?</h2><p>Call SMI Roofing or book a free inspection. We will document the roof, explain the roofing scope, and help you understand the next practical step without pretending to be your insurer.</p></div><a href="${bookingUrl}" class="btn btn-primary">Book free inspection</a></div></div></section>
</main>
${footer(city)}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Mobile quick actions"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Call SMI Roofing">Call</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Request a free roofing quote">Quote</a></nav>
</body>
</html>
`;
}

for (const city of cities) {
  const dir = join(root, city.slug, 'state-farm-roof-claim');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), pageHtml(city));
}

addStateFarmSectionToInsuranceClaims(cities);
updateSitemap(cities);

console.log(`Generated ${cities.length} State Farm roof claim pages.`);

function addStateFarmSectionToInsuranceClaims(cityList) {
  const file = join(root, 'insurance-claims', 'index.html');
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\n<section class="content-section service-city-section" data-m029-state-farm-claim-pages>[\s\S]*?<\/section>\n/, '\n');
  const links = cityList
    .map((city) => `<a href="/${city.slug}/state-farm-roof-claim/" class="service-city-link">State Farm roof claims in ${escapeHtml(city.displayPlace)}</a>`)
    .join('\n');
  const section = `<section class="content-section service-city-section" data-m029-state-farm-claim-pages>
<div class="container">
<div class="section-tag">State Farm Claim Pages</div>
<h2 class="section-title">State Farm Roof Claim Help by <span class="text-cyan">City</span></h2>
<p class="service-city-intro">These carrier-specific city pages give homeowners a clean path for State Farm roof claim documentation, adjuster-meeting support, repair scope review, and compliant next steps.</p>
<div class="service-city-grid">
${links}
</div>
</div>
</section>
`;
  html = html.replace(/\n<section class="faq-section"/, `\n${section}\n<section class="faq-section"`);
  writeFileSync(file, html);
}

function updateSitemap(cityList) {
  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/site-map\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/site-map/</loc>\n    <lastmod>${today}</lastmod>`);
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/insurance-claims\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/insurance-claims/</loc>\n    <lastmod>${today}</lastmod>`);
  for (const city of cityList) {
    const loc = `${siteUrl}/${city.slug}/state-farm-roof-claim/`;
    const existing = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\//g, '\\/')}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
    sitemap = sitemap.replace(existing, '');
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.72</priority>
  </url>
`;
    sitemap = sitemap.replace('</urlset>', `${block}</urlset>`);
  }
  writeFileSync(sitemapPath, sitemap);
}
