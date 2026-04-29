import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteUrl = 'https://smiroof.com';
const today = '2026-04-29';
const phone = '(501) 464-5139';
const phoneHref = 'tel:+15014645139';
const bookingUrl = 'https://clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb';
const spcReportUrl = 'https://www.spc.noaa.gov/climo/reports/260428_prt_rpts.html';
const spcMapUrl = 'https://www.spc.noaa.gov/climo/reports/260428_rpts.html';
const mapAsset = '/assets/storm-maps/hail-damage-2026-04-28-arkansas.svg';

const basePage = readFileSync(join(root, 'roofing-costs', 'index.html'), 'utf8');
const baseStyle = basePage.match(/<style>[\s\S]*?<\/style>/)?.[0];
const pixelCode = basePage.match(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/)?.[0] || '';

if (!baseStyle) {
  throw new Error('Could not read base styles from roofing-costs/index.html');
}

const extraStyle = `.storm-alert{margin-top:24px;border:1px solid rgba(0,200,240,.34);background:#eafaff;color:#075b70;border-radius:8px;padding:18px;line-height:1.7;font-weight:800}.report-table{width:100%;border-collapse:collapse;margin-top:28px;background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}.report-table th{background:#eef8fb;color:#075b70;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.08em;padding:13px}.report-table td{padding:13px;border-top:1px solid var(--line);color:var(--muted);font-size:14px;line-height:1.5}.report-table strong{color:var(--ink)}.map-frame{margin-top:28px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px;box-shadow:0 12px 30px rgba(17,24,39,.05)}.map-frame img{width:100%;height:auto;border-radius:6px}.photo-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:28px}.photo-card{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,.05)}.photo-card img{width:100%;aspect-ratio:4/3;object-fit:cover}.photo-card div{padding:16px}.photo-card h3{margin:0;font-family:var(--font-display);font-size:20px;letter-spacing:0;color:var(--ink)}.photo-card p{margin:8px 0 0;color:var(--muted);line-height:1.6;font-size:14px}.source-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}.source-list a{display:flex;align-items:center;justify-content:space-between;min-height:54px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:13px 15px;font-weight:900;color:var(--ink)}.source-list a::after{content:'>';color:var(--cyan-dark);margin-left:10px}.dark .report-table,.dark .photo-card,.dark .map-frame{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14)}.dark .report-table th{background:rgba(0,200,240,.14);color:#8beaff}.dark .report-table td{border-color:rgba(255,255,255,.12);color:rgba(255,255,255,.72)}.dark .report-table strong,.dark .photo-card h3{color:#fff}.dark .photo-card p{color:rgba(255,255,255,.72)}@media(max-width:780px){.report-table{display:block;overflow-x:auto}.photo-grid,.source-list{grid-template-columns:1fr}}`;
const style = baseStyle.replace('</style>', `${extraStyle}</style>`);

const reports = [
  { time: '1507 UTC', size: '1.00 in', place: 'Siloam Springs', county: 'Benton', state: 'AR', lat: 36.19, lon: -94.54, note: 'mPING quarter-size hail; time estimated from radar.' },
  { time: '1525 UTC', size: '1.75 in', place: 'Highfill', county: 'Benton', state: 'AR', lat: 36.26, lon: -94.35, note: 'Photo shared by broadcast media; time estimated by radar.' },
  { time: '1530 UTC', size: '2.00 in', place: '2 N Cave Springs', county: 'Benton', state: 'AR', lat: 36.29, lon: -94.23, note: 'Significant hail report.' },
  { time: '1533 UTC', size: '2.75 in', place: '3 NE Tontitown', county: 'Washington', state: 'AR', lat: 36.18, lon: -94.22, note: 'Significant hail report.' },
  { time: '1533 UTC', size: '1.00 in', place: '1 NE Elm Springs', county: 'Benton', state: 'AR', lat: 36.21, lon: -94.22, note: 'mPING quarter-size hail.' },
  { time: '1540 UTC', size: '3.00 in', place: 'Cave Springs', county: 'Benton', state: 'AR', lat: 36.26, lon: -94.23, note: 'Photo of hail next to a tape measure sent via social media.' },
  { time: '1542 UTC', size: '1.50 in', place: '2 W Lowell', county: 'Benton', state: 'AR', lat: 36.25, lon: -94.17, note: 'Ping-pong-ball-size hail report.' },
  { time: '1544 UTC', size: '2.00 in', place: '2 S Cave Springs', county: 'Benton', state: 'AR', lat: 36.24, lon: -94.23, note: 'Significant hail report.' },
  { time: '1546 UTC', size: '2.25 in', place: '1 NE Elm Springs', county: 'Benton', state: 'AR', lat: 36.21, lon: -94.22, note: 'Significant hail report.' },
  { time: '1550 UTC', size: '2.00 in', place: '2 W Lowell', county: 'Benton', state: 'AR', lat: 36.25, lon: -94.17, note: 'mPING hen-egg-size hail.' },
  { time: '1610 UTC', size: '2.50 in', place: 'Goshen', county: 'Washington', state: 'AR', lat: 36.10, lon: -93.99, note: 'Photo relayed by broadcast media.' },
  { time: '1614 UTC', size: '1.50 in', place: '4 E Fayetteville', county: 'Washington', state: 'AR', lat: 36.05, lon: -94.08, note: 'Ping-pong-ball-size hail report.' },
  { time: '2154 UTC', size: '1.25 in', place: 'Lincoln', county: 'Washington', state: 'AR', lat: 35.95, lon: -94.42, note: 'mPING half-dollar-size hail.' },
  { time: '2202 UTC', size: '1.75 in', place: 'Farmington', county: 'Washington', state: 'AR', lat: 36.04, lon: -94.25, note: 'Golf-ball-size hail report.' },
  { time: '2204 UTC', size: '1.75 in', place: 'Walnut Grove', county: 'Washington', state: 'AR', lat: 36.01, lon: -94.28, note: 'Golf-ball-size hail report.' },
  { time: '2214 UTC', size: '1.00 in', place: 'Greenland', county: 'Washington', state: 'AR', lat: 36.00, lon: -94.17, note: 'Quarter-size hail report.' },
  { time: '2230 UTC', size: '1.00 in', place: 'Hackett', county: 'Sebastian', state: 'AR', lat: 35.19, lon: -94.41, note: 'Quarter-size hail report near the Fort Smith service area.' }
];

const stormEvents = [
  {
    slug: 'siloam-springs',
    localFocus: 'Siloam Springs, Benton County, Highway 412, and nearby west Benton County neighborhoods',
    reports: [0, 1, 2, 5, 12]
  },
  {
    slug: 'bentonville',
    localFocus: 'Bentonville, Highfill, Cave Springs, Lowell, and central Benton County roof addresses',
    reports: [1, 2, 5, 7, 8, 9]
  },
  {
    slug: 'rogers',
    localFocus: 'Rogers, Cave Springs, Lowell, Elm Springs, and nearby Benton County subdivisions',
    reports: [2, 5, 6, 7, 8, 9]
  },
  {
    slug: 'springdale',
    localFocus: 'Springdale, Tontitown, Elm Springs, Lowell, and the Benton-Washington county line',
    reports: [3, 4, 6, 8, 9, 13]
  },
  {
    slug: 'fayetteville',
    localFocus: 'Fayetteville, Goshen, Farmington, Greenland, Walnut Grove, and Washington County roof addresses',
    reports: [10, 11, 13, 14, 15]
  },
  {
    slug: 'fort-smith',
    localFocus: 'Fort Smith, Hackett, Sebastian County, and nearby River Valley roof addresses',
    reports: [16]
  }
];

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

function matchValue(html, regex) {
  return html.match(regex)?.[1]?.trim() || '';
}

function titleCaseSegment(segment) {
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getCityData(slug) {
  const html = readFileSync(join(root, slug, 'index.html'), 'utf8');
  const placename = matchValue(html, /<meta name="geo\.placename" content="([^"]+)"/);
  const region = matchValue(html, /<meta name="geo\.region" content="US-([A-Z]{2})"/);
  const [rawCity, rawStateName] = placename.split(',').map((part) => part.trim());
  const cityName = rawCity || titleCaseSegment(slug);
  const stateCode = region || 'AR';
  const stateName = rawStateName || 'Arkansas';
  const county = matchValue(html, /<div class="trust-card"><b>([^<]*County)<\/b>/) || `${stateName}`;
  const heroSummary = stripTags(matchValue(html, /<section class="hero"[\s\S]*?<p>([\s\S]*?)<\/p>/));

  return {
    slug,
    cityName,
    stateCode,
    stateName,
    displayPlace: `${cityName}, ${stateCode}`,
    county,
    heroSummary
  };
}

function sizeNumber(size) {
  return Number.parseFloat(size);
}

function maxHail(event) {
  return event.reports.map((index) => reports[index]).sort((a, b) => sizeNumber(b.size) - sizeNumber(a.size))[0];
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

function faqItems(city, event) {
  const peak = maxHail(event);
  return [
    [
      `Was hail reported near ${city.cityName} on April 28, 2026?`,
      `Yes. The NOAA Storm Prediction Center preliminary report for April 28, 2026 listed hail reports used on this page, including a ${peak.size} report near ${peak.place}. This page is not a parcel-level hail swath; it is a fast local response page built from preliminary public reports.`
    ],
    [
      `Should I request a roof inspection after the April 28 hail near ${city.cityName}?`,
      `If your property was under or near the storm path, a roof inspection is a smart next step. Hail damage can show up as bruised shingles, granule loss, dents on vents or gutters, lifted shingles, and later leaks that are not obvious from the ground.`
    ],
    [
      `Can SMI document storm damage for insurance after this hail event?`,
      `Yes. SMI can photograph visible roof conditions, soft-metal dents, gutters, vents, flashing, interior leak clues, and repair or replacement scope items. Your insurance carrier decides coverage, but clean documentation helps the claim conversation stay factual.`
    ],
    [
      `Do I need emergency roofing help after the April 28 storm?`,
      `If the roof is actively leaking, shingles are missing, decking is exposed, or a tree limb opened the roof, call SMI at ${phone}. After-hours urgent leak and storm calls route through the same number first.`
    ],
    [
      `Is this an official hail map for my exact address?`,
      `No. The map and table summarize preliminary public storm reports. Hail can vary street by street, so the only reliable way to know whether your exact roof was damaged is a close inspection with photos.`
    ]
  ];
}

function faqSchema(city, event) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems(city, event).map(([question, answer]) => ({
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Storm Damage', item: `${siteUrl}/storm-damage/` },
      { '@type': 'ListItem', position: 3, name: city.displayPlace, item: `${siteUrl}/${city.slug}/` },
      { '@type': 'ListItem', position: 4, name: 'April 28 Hail Damage', item: `${siteUrl}/${city.slug}/hail-damage-2026-04-28/` }
    ]
  };
}

function articleSchema(city, event) {
  const pageUrl = `${siteUrl}/${city.slug}/hail-damage-2026-04-28/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `April 28, 2026 Hail Damage Roof Inspections in ${city.displayPlace}`,
    description: `Local hail damage roof inspection page for ${city.displayPlace} after April 28, 2026 preliminary SPC hail reports.`,
    datePublished: today,
    dateModified: today,
    url: pageUrl,
    image: `${siteUrl}/assets/smi-storm-roof-inspection.jpg`,
    author: {
      '@type': 'Organization',
      name: 'SMI Roofing'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SMI Roofing',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/assets/logo.png`
      }
    },
    about: event.reports.map((index) => reports[index].place).join(', ')
  };
}

function nav() {
  return `<div class="topbar"><div class="topbar-inner"><div><strong>April 28 hail response.</strong> Free storm inspections and photo documentation.</div><a href="${phoneHref}">${phone}</a></div></div>
<nav class="nav" id="siteNav"><div class="nav-inner"><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><ul class="nav-links"><li><a href="/">Home</a></li><li><a href="/commercial-roofing/">Commercial</a></li><li><a href="/storm-damage/">Storm Damage</a></li><li><a href="/insurance-claims/">Insurance Claims</a></li><li><a href="/areas-we-serve/">Areas We Serve</a></li><li><a href="${phoneHref}">${phone}</a></li><li><a href="${bookingUrl}" class="nav-cta">Free Inspection</a></li></ul><button class="nav-toggle" type="button" aria-label="Open menu" onclick="toggleMenu()"><span></span><span></span><span></span></button></div></nav>
<div class="mobile-menu" id="mobileMenu"><a href="/" onclick="closeMenu()">Home</a><a href="/commercial-roofing/" onclick="closeMenu()">Commercial Roofing</a><a href="/storm-damage/" onclick="closeMenu()">Storm Damage</a><a href="/insurance-claims/" onclick="closeMenu()">Insurance Claims</a><a href="/areas-we-serve/" onclick="closeMenu()">Areas We Serve</a><a href="${phoneHref}" class="mobile-cta" onclick="closeMenu()">Call ${phone}</a></div>`;
}

function footer(city) {
  return `<footer class="footer"><div class="container"><div class="footer-grid"><div><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><p>Storm damage roof inspection, emergency leak help, and insurance documentation for ${city.displayPlace} property owners.</p><p>302 East Parkway Drive, Suite C<br>Russellville, Arkansas 72801<br><a href="${phoneHref}">${phone}</a></p></div><div><h3>Storm Help</h3><a href="/storm-damage/">Storm Damage</a><a href="/insurance-claims/">Insurance Claims</a><a href="/roof-repair/">Roof Repair</a><a href="/roof-inspections/">Roof Inspections</a></div><div><h3>Services</h3><a href="/residential-roofing/">Residential Roofing</a><a href="/metal-roofs/">Metal Roofs</a><a href="/commercial-roofing/">Commercial Roofing</a><a href="/roofing-costs/">Roofing Costs</a></div><div><h3>Company</h3><a href="/${city.slug}/">${city.displayPlace}</a><a href="/areas-we-serve/">Areas We Serve</a><a href="/site-map/">Site Map</a><a href="/privacy-policy/">Privacy Policy</a></div></div><div class="footer-bottom"><span>&copy; 2026 CAS Management Inc. dba SMI Roofing. All rights reserved.</span><span>Storm response page | Published ${today}</span></div></div></footer>`;
}

function reportRows(event) {
  return event.reports
    .map((index) => reports[index])
    .map((report) => `<tr><td><strong>${escapeHtml(report.time)}</strong></td><td>${escapeHtml(report.size)}</td><td>${escapeHtml(report.place)}</td><td>${escapeHtml(report.county)} County</td><td>${escapeHtml(report.note)}</td></tr>`)
    .join('');
}

function faqHtml(city, event) {
  return faqItems(city, event)
    .map(([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button">${escapeHtml(question)}<span>+</span></button><div class="faq-answer">${escapeHtml(answer)}</div></div>`)
    .join('');
}

function pageHtml(event) {
  const city = getCityData(event.slug);
  const peak = maxHail(event);
  const pageUrl = `${siteUrl}/${city.slug}/hail-damage-2026-04-28/`;
  const title = `April 28, 2026 Hail Damage in ${city.displayPlace} | SMI Roofing`;
  const description = `Hail damage roof inspections in ${city.displayPlace} after April 28, 2026 SPC hail reports. Photos, report map, insurance documentation, and free inspection CTA.`;

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
<meta property="og:image" content="/assets/smi-storm-roof-inspection.jpg">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${pageUrl}">
<meta name="geo.region" content="US-${city.stateCode}">
<meta name="geo.placename" content="${escapeHtml(city.cityName)}, ${escapeHtml(city.stateName)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema(city))}
${schemaScript(faqSchema(city, event))}
${schemaScript(breadcrumbSchema(city))}
${schemaScript(articleSchema(city, event))}
${pixelCode}
</head>
<body>
${nav()}
<main>
<section class="hero"><div class="hero-bg"><img src="/assets/smi-storm-roof-inspection.jpg" alt="SMI Roofing storm roof inspection after hail"></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/storm-damage/">Storm Damage</a><span>/</span><a href="/${city.slug}/">${escapeHtml(city.displayPlace)}</a><span>/</span><span>April 28 Hail Damage</span></div><div class="eyebrow">Storm Event Page</div><h1>Hail Damage Roof Inspections in <strong>${escapeHtml(city.displayPlace)}</strong> After April 28, 2026 Storms</h1><p>SMI Roofing is scheduling free roof inspections for ${escapeHtml(event.localFocus)} after preliminary NOAA Storm Prediction Center reports showed hail in the region on April 28, 2026. If your roof, gutters, vents, skylights, siding, or ceilings show damage, start with photos and a clear inspection.</p><div class="hero-actions"><a href="${phoneHref}" class="btn btn-primary">Call ${phone}</a><a href="${bookingUrl}" class="btn btn-secondary">Book free inspection</a></div><div class="proof"><div><b>${escapeHtml(peak.size)}</b><span>Highest nearby report</span></div><div><b>${event.reports.length}</b><span>Reports summarized</span></div><div><b>Apr 28</b><span>Storm date</span></div><div><b>Free</b><span>Inspection CTA</span></div></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Fast Local Response</div><h2 class="section-title">What this page is for.</h2><p class="section-lede">Storm-event pages are built for the short window after a hail storm when homeowners search for damage reports, maps, photos, and inspection help. This page uses preliminary public SPC reports and local roofing context. It is not an official claim decision, not a parcel-level hail swath, and not proof that every roof in ${escapeHtml(city.cityName)} was damaged.</p><div class="storm-alert">If you have active leaking, missing shingles, exposed decking, a tree impact, or ceiling stains, call ${phone} now. If the roof looks fine from the ground, a close inspection can still catch hail bruising, granule loss, soft-metal dents, and flashing damage before the next rain exposes the problem.</div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Official Reports</div><h2 class="section-title">April 28 hail reports near ${escapeHtml(city.cityName)}.</h2><p class="section-lede">The report table below summarizes relevant preliminary SPC hail reports for the April 28, 2026 storm day. Report times are shown in UTC as published by SPC.</p><table class="report-table"><thead><tr><th>Time</th><th>Hail</th><th>Location</th><th>County</th><th>Report note</th></tr></thead><tbody>${reportRows(event)}</tbody></table><div class="source-list"><a href="${spcReportUrl}" rel="noopener">SPC preliminary report table</a><a href="${spcMapUrl}" rel="noopener">SPC storm report map</a></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Report Map</div><h2 class="section-title">Arkansas hail report map.</h2><p class="section-lede">This self-hosted map plots the reported hail locations used for these April 28 storm pages. It is a report-location map, not a street-by-street hail-impact model.</p><div class="map-frame"><img src="${mapAsset}" alt="April 28 2026 Arkansas hail report map"></div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Roof Damage Checklist</div><h2 class="section-title">What to check before the next rain.</h2><div class="grid"><article class="card"><h3>Exterior signs</h3><p>Look for dented gutters, downspouts, ridge vents, flashing, window screens, fence caps, AC fins, and metal roof accessories. Soft-metal dents often show the hail path before roof damage is obvious from the ground.</p></article><article class="card"><h3>Roof symptoms</h3><p>Missing shingles, lifted tabs, bruised shingles, exposed mat, heavy granule loss, cracked ridge caps, damaged pipe boots, and debris in valleys all deserve closer inspection after a hail day.</p></article><article class="card"><h3>Interior clues</h3><p>New ceiling stains, attic dampness, musty smells, or water around roof penetrations can indicate a leak path that started during the storm or became visible after follow-up rainfall.</p></article></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Inspection Photos</div><h2 class="section-title">Photos SMI documents after hail.</h2><p class="section-lede">These are examples of the kinds of roof conditions and jobsite details SMI documents during a storm inspection. Your property photos should be specific to your roof, not copied from a generic claim packet.</p><div class="photo-grid"><article class="photo-card"><img src="/assets/smi-storm-roof-inspection.jpg" alt="Storm roof inspection photo documentation"><div><h3>Damage documentation</h3><p>Photos of shingles, soft metals, vents, flashing, and roof penetrations.</p></div></article><article class="photo-card"><img src="/assets/smi-aerial-roof-detail.jpg" alt="Aerial roof detail inspection photo"><div><h3>Roof planes</h3><p>Clear roof-plane photos help organize repair versus replacement scope.</p></div></article><article class="photo-card"><img src="/assets/smi-two-roofers-jobsite.jpg" alt="SMI roofing inspection team on a roof"><div><h3>On-roof review</h3><p>A close inspection catches damage that is not visible from the yard.</p></div></article></div></div></section>
<section class="section dark"><div class="container"><div class="eyebrow">Insurance Documentation</div><h2 class="section-title">Start with facts before filing or repairing.</h2><p class="section-lede">SMI can inspect the roof, photograph visible storm conditions, prepare a roofing estimate, and meet the adjuster when requested. Your insurance carrier decides coverage, deductible, depreciation, and final claim payment. SMI does not waive deductibles, act as a public adjuster, or promise claim outcomes.</p><div class="storm-alert">For ${escapeHtml(city.displayPlace)} storm claims, keep photos, dates, temporary repair receipts, claim numbers, and inspection notes together. That makes the conversation cleaner if a supplement or missing scope item comes up later.</div></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">April 28 Storm FAQs</div><h2 class="section-title">Questions ${escapeHtml(city.cityName)} property owners ask.</h2><div class="faq-list">${faqHtml(city, event)}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>Need a roof inspection after the April 28 hail?</h2><p>Call SMI Roofing or book a free inspection. We will document the roof, explain what we see, and help you decide whether the next step is repair, claim documentation, or simple monitoring.</p></div><a href="${bookingUrl}" class="btn btn-primary">Book free inspection</a></div></div></section>
</main>
${footer(city)}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Mobile quick actions"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Call SMI Roofing">Call</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Request a free roofing quote">Quote</a></nav>
</body>
</html>
`;
}

function addStormEventSection(events) {
  const file = join(root, 'storm-damage', 'index.html');
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\n<section class="content-section service-city-section" data-m030-storm-event-pages>[\s\S]*?<\/section>\n/, '\n');
  const links = events
    .map((event) => {
      const city = getCityData(event.slug);
      return `<a href="/${event.slug}/hail-damage-2026-04-28/" class="service-city-link">April 28 hail damage in ${escapeHtml(city.displayPlace)}</a>`;
    })
    .join('\n');
  const section = `<section class="content-section service-city-section" data-m030-storm-event-pages>
<div class="container">
<div class="section-tag">Recent Storm Event Pages</div>
<h2 class="section-title">April 28, 2026 Hail Damage <span class="text-cyan">Response Pages</span></h2>
<p class="service-city-intro">Fast-response storm pages summarize preliminary hail reports, show a local report map, and route homeowners to free inspection scheduling after documented hail events.</p>
<div class="service-city-grid">
${links}
</div>
</div>
</section>
`;
  html = html.replace(/\n<section class="content-section service-city-section" data-service-city-links="storm-damage">/, `\n${section}\n<section class="content-section service-city-section" data-service-city-links="storm-damage">`);
  writeFileSync(file, html);
}

function updateSitemap(events) {
  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = readFileSync(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/site-map\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/site-map/</loc>\n    <lastmod>${today}</lastmod>`);
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/storm-damage\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/storm-damage/</loc>\n    <lastmod>${today}</lastmod>`);
  for (const event of events) {
    const loc = `${siteUrl}/${event.slug}/hail-damage-2026-04-28/`;
    const existing = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\//g, '\\/')}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
    sitemap = sitemap.replace(existing, '');
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.78</priority>
  </url>
`;
    sitemap = sitemap.replace('</urlset>', `${block}</urlset>`);
  }
  writeFileSync(sitemapPath, sitemap);
}

function writeMapAsset() {
  const minLat = 35.10;
  const maxLat = 36.35;
  const minLon = -94.65;
  const maxLon = -93.85;
  const width = 1200;
  const height = 720;
  const pad = 96;
  const xFor = (lon) => pad + ((lon - minLon) / (maxLon - minLon)) * (width - pad * 2);
  const yFor = (lat) => pad + ((maxLat - lat) / (maxLat - minLat)) * (height - pad * 2);
  const uniqueReports = [...new Map(reports.map((report) => [`${report.place}-${report.size}`, report])).values()];
  const dots = uniqueReports.map((report) => {
    const size = Math.max(10, sizeNumber(report.size) * 7);
    const x = xFor(report.lon);
    const y = yFor(report.lat);
    return `<g><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="#00C8F0" fill-opacity="0.28" stroke="#007f99" stroke-width="3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#0a1628"/><text x="${(x + 14).toFixed(1)}" y="${(y - 10).toFixed(1)}" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#0a1628">${escapeHtml(report.place)}</text><text x="${(x + 14).toFixed(1)}" y="${(y + 18).toFixed(1)}" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#007f99">${escapeHtml(report.size)}</text></g>`;
  }).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">April 28, 2026 Arkansas Hail Report Map</title>
<desc id="desc">Self-hosted schematic map plotting preliminary SPC hail reports used by SMI Roofing storm event pages.</desc>
<rect width="1200" height="720" fill="#f6f8fb"/>
<rect x="56" y="56" width="1088" height="608" rx="28" fill="#ffffff" stroke="#dce3eb" stroke-width="3"/>
<path d="M110 580 C220 520 280 440 390 455 C500 470 560 385 675 405 C790 425 820 310 960 300 C1030 295 1070 250 1095 200" fill="none" stroke="#dce3eb" stroke-width="12" stroke-linecap="round"/>
<path d="M160 150 L1080 150 M160 265 L1080 265 M160 380 L1080 380 M160 495 L1080 495 M220 100 L220 610 M440 100 L440 610 M660 100 L660 610 M880 100 L880 610" stroke="#eef2f6" stroke-width="2"/>
<text x="96" y="112" font-family="Arial, sans-serif" font-size="30" font-weight="800" fill="#0a1628">April 28, 2026 Hail Reports</text>
<text x="96" y="150" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#59677a">Arkansas preliminary SPC report locations used by these pages. Circle size follows reported hail diameter.</text>
<text x="880" y="610" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#59677a">Source: NOAA SPC preliminary reports</text>
<text x="96" y="632" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#59677a">Schematic report-location map, not a parcel-level hail swath.</text>
${dots}
</svg>
`;
  const dir = join(root, 'assets', 'storm-maps');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'hail-damage-2026-04-28-arkansas.svg'), svg);
}

for (const event of stormEvents) {
  const dir = join(root, event.slug, 'hail-damage-2026-04-28');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), pageHtml(event));
}

writeMapAsset();
addStormEventSection(stormEvents);
updateSitemap(stormEvents);

console.log(`Generated ${stormEvents.length} storm event pages for April 28, 2026 hail reports.`);
