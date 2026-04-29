import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteUrl = 'https://smiroof.com';
const today = '2026-04-29';
const phone = '(501) 464-5139';
const phoneHref = 'tel:+15014645139';
const bookingUrl = 'https://clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb';

const basePage = readFileSync(join(root, 'roofing-costs', 'index.html'), 'utf8');
const baseStyle = basePage.match(/<style>[\s\S]*?<\/style>/)?.[0];
const pixelCode = basePage.match(/<!-- Meta Pixel Code -->[\s\S]*?<!-- End Meta Pixel Code -->/)?.[0] || '';

if (!baseStyle) {
  throw new Error('Could not find base style in roofing-costs/index.html');
}

const extraStyle = `.decision-list{display:grid;gap:12px;margin-top:22px}.decision-list li{list-style:none;background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px;color:var(--muted);line-height:1.7}.decision-list strong{display:block;color:var(--ink);margin-bottom:5px}.callout{margin-top:28px;background:#eafaff;border:1px solid rgba(0,200,240,.35);border-radius:8px;padding:22px;color:#075b70;line-height:1.7;font-weight:800}.comparison-note{margin-top:16px;color:var(--muted);font-size:14px;line-height:1.7}.source-note{font-size:13px;color:rgba(255,255,255,.62);margin-top:18px;line-height:1.6}.price-table td:nth-child(2),.price-table td:nth-child(3){vertical-align:top}.card .label{display:inline-flex;margin-bottom:12px;padding:6px 10px;border-radius:999px;background:#eafaff;color:#075b70;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}`;
const style = baseStyle.replace('</style>', `${extraStyle}</style>`);

const nav = `<div class="topbar"><div class="topbar-inner"><div><strong>SMI Roofing comparison guide.</strong> Free inspection before every written scope.</div><a href="${phoneHref}">${phone}</a></div></div>
<nav class="nav" id="siteNav"><div class="nav-inner"><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><ul class="nav-links"><li><a href="/">Home</a></li><li><a href="/commercial-roofing/">Commercial</a></li><li><a href="/storm-damage/">Storm Damage</a></li><li><a href="/areas-we-serve/">Areas We Serve</a></li><li><a href="/roofing-costs/">Costs</a></li><li><a href="${phoneHref}">${phone}</a></li><li><a href="${bookingUrl}" class="nav-cta">Free Inspection</a></li></ul><button class="nav-toggle" type="button" aria-label="Open menu" onclick="toggleMenu()"><span></span><span></span><span></span></button></div></nav>
<div class="mobile-menu" id="mobileMenu"><a href="/" onclick="closeMenu()">Home</a><a href="/commercial-roofing/" onclick="closeMenu()">Commercial Roofing</a><a href="/storm-damage/" onclick="closeMenu()">Storm Damage</a><a href="/areas-we-serve/" onclick="closeMenu()">Areas We Serve</a><a href="/roofing-costs/" onclick="closeMenu()">Roofing Costs</a><a href="${phoneHref}" class="mobile-cta" onclick="closeMenu()">Call ${phone}</a></div>`;

const footer = `<footer class="footer"><div class="container"><div class="footer-grid"><div><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><p>Arkansas roofing comparison guidance backed by free inspections, photo documentation, and clear written scopes.</p><p>302 East Parkway Drive, Suite C<br>Russellville, Arkansas 72801<br><a href="${phoneHref}">${phone}</a></p></div><div><h3>Comparisons</h3><a href="/metal-roof-vs-shingles/">Metal vs Shingles</a><a href="/roof-repair-vs-replacement/">Repair vs Replacement</a><a href="/roof-coating-vs-replacement/">Coating vs Replacement</a><a href="/tile-roof-vs-shingles/">Tile vs Shingles</a></div><div><h3>Services</h3><a href="/residential-roofing/">Residential Roofing</a><a href="/metal-roofs/">Metal Roofing</a><a href="/roof-repair/">Roof Repair</a><a href="/commercial-roofing/">Commercial Roofing</a></div><div><h3>Company</h3><a href="/areas-we-serve/">Areas We Serve</a><a href="/roofing-costs/">Roofing Costs</a><a href="/site-map/">Site Map</a><a href="/privacy-policy/">Privacy Policy</a></div></div><div class="footer-bottom"><span>&copy; 2026 CAS Management Inc. dba SMI Roofing. All rights reserved.</span><span>Licensed &amp; Insured | Russellville, AR</span></div></div></footer>`;

const orgSchema = {
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
  areaServed: { '@type': 'State', name: 'Arkansas' },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    bestRating: '5',
    worstRating: '1',
    ratingCount: '231',
    reviewCount: '231'
  }
};

const pages = [
  {
    slug: 'metal-roof-vs-shingles',
    label: 'Metal Roof vs Shingles',
    title: 'Metal Roof vs Shingles in Arkansas | SMI Roofing',
    description: 'Compare metal roofs vs asphalt shingles for Arkansas homes, including cost, storm performance, heat, maintenance, repairability, and when each roof makes sense.',
    eyebrow: 'Material Comparison',
    h1: 'Metal Roof vs <strong>Shingles</strong> in Arkansas',
    hero: 'Metal and architectural shingles can both work on Arkansas homes, but they solve different problems. Use this guide to compare upfront cost, storm performance, heat, maintenance, repairability, curb appeal, and long-term value before you choose a roof system.',
    proof: [['Metal', 'Long-term option'], ['Shingle', 'Best upfront value'], ['AR', 'Heat and storm context'], ['$0', 'SMI inspection']],
    introTitle: 'The short answer before the estimate.',
    introLede: 'Most Arkansas homeowners choose architectural shingles because they are cost-effective, familiar, easy to repair, and available in many colors. Metal roofing costs more up front, but can be a strong long-term fit when the home, budget, roof shape, and style goals line up.',
    rows: [
      ['Upfront cost', 'Usually lower. Architectural shingles often win when budget is the deciding factor.', 'Usually higher. Standing seam and heavier gauge systems cost more because panels, trim, underlayment, and labor are more specialized.'],
      ['Long-term value', 'Good value when installed correctly with proper ventilation and flashing.', 'Strong value for owners planning to stay long term or wanting a premium roof with fewer full replacements over time.'],
      ['Storm and wind', 'Modern shingles can perform well when installed as a full system, but hail and wind can still remove granules or lift tabs.', 'Metal sheds rain quickly and resists many wind events, but hail can dent some panels and exposed fasteners need maintenance.'],
      ['Heat and energy', 'Cool-colored shingles are available, but darker shingles hold more heat.', 'Factory-coated metal can reflect more solar heat when the color and coating are chosen correctly.'],
      ['Maintenance and repair', 'Individual shingles are usually easier to match and repair.', 'Repairs are more specialized. Trim, fasteners, penetrations, and panel profile matter.'],
      ['Best fit', 'Homeowners who want the best balance of cost, availability, repairability, and curb appeal.', 'Homeowners who want a premium look, long-term system, and are comfortable with the higher initial investment.']
    ],
    cards: [
      ['Choose shingles when', 'The roof is straightforward, budget matters, matching existing neighborhood style matters, or future spot repairs need to stay simple.'],
      ['Choose metal when', 'You want a premium look, plan to stay long term, have the budget for the right system, and want strong performance in heat, rain, and wind.'],
      ['Inspect before deciding', 'Pitch, ventilation, decking, valleys, chimneys, roof access, HOA rules, and existing storm damage can all change the best recommendation.']
    ],
    decisions: [
      ['Budget first', 'Shingles usually keep the project cost lower while still allowing a clean, warrantied roof system.'],
      ['Long-term ownership', 'Metal deserves a serious look if you expect to own the home for decades and want to avoid another full replacement cycle sooner.'],
      ['Arkansas heat', 'Factory-coated metal and cool-colored shingles can both help with solar heat, but color, attic ventilation, and insulation still matter.'],
      ['Storm reality', 'Neither material is magic against severe hail. The better question is which system fits your roof, claim situation, maintenance comfort, and budget.']
    ],
    localTitle: 'Arkansas homes need more than a material opinion.',
    localText: 'Homes around Russellville, Pottsville, Dardanelle, Clarksville, Ozark, and Conway see heat, wind-driven rain, hail risk, tree debris, and fast storm-season decisions. SMI looks at the roof shape, existing deck, ventilation, neighborhood style, and insurance documentation before recommending metal, shingles, repair, or replacement.',
    linksTitle: 'Compare related roofing guides.',
    links: [
      ['/metal-roofs/', 'Metal roofing'],
      ['/metal-roof-cost/', 'Metal roof cost'],
      ['/roof-replacement-cost/', 'Shingle replacement cost'],
      ['/residential-roofing/', 'Residential roofing'],
      ['/russellville/metal-roofs/', 'Russellville metal roofs'],
      ['/conway/metal-roofs/', 'Conway metal roofs']
    ],
    faqs: [
      ['Is a metal roof better than shingles in Arkansas?', 'Metal can be better for some Arkansas homes, especially when long-term ownership, premium appearance, and heat performance matter. Shingles are usually better for lower upfront cost, simpler repairs, and broad neighborhood fit. The best choice depends on the roof, budget, ventilation, style goals, and storm history.'],
      ['Are shingles cheaper than metal roofing?', 'Yes in most cases. Architectural shingles usually cost less up front than a properly installed metal system. Metal roofing can still make sense when the owner values long-term performance and is comfortable with a higher initial investment.'],
      ['Does metal roofing dent in hail?', 'Some metal roofs can dent from hail, especially with larger hail or softer panel profiles. Denting does not always mean the roof leaks, but appearance, insurance scope, panel type, and warranty details matter. SMI documents hail conditions before recommending repair or replacement.'],
      ['Can SMI compare metal and shingles during one inspection?', 'Yes. SMI can inspect the roof, explain whether shingles or metal fits the home, and provide written options so you can compare price, scope, warranty, and long-term value.']
    ]
  },
  {
    slug: 'roof-repair-vs-replacement',
    label: 'Roof Repair vs Replacement',
    title: 'Roof Repair vs Replacement in Arkansas | SMI Roofing',
    description: 'Decide whether roof repair or roof replacement makes more sense for leaks, storm damage, aging shingles, decking issues, and insurance claims in Arkansas.',
    eyebrow: 'Service Comparison',
    h1: 'Roof Repair vs <strong>Replacement</strong>',
    hero: 'A leak does not automatically mean you need a full roof replacement. At the same time, repeated repairs on an old or storm-damaged roof can waste money. This guide shows how SMI compares repair, replacement, and insurance-supported scopes.',
    proof: [['Repair', 'Isolated damage'], ['Replace', 'Widespread failure'], ['Photos', 'Documented scope'], ['$0', 'SMI inspection']],
    introTitle: 'The right answer depends on pattern, age, and risk.',
    introLede: 'Repair usually makes sense when damage is isolated and the rest of the roof is sound. Replacement starts to make more sense when wear is widespread, leaks keep returning, decking is compromised, storm damage affects multiple slopes, or the roof is near the end of its useful life.',
    rows: [
      ['Best use case', 'One leak source, missing shingles, pipe boot failure, small flashing issue, isolated storm damage.', 'Multiple leak points, widespread granule loss, old brittle shingles, recurring repairs, damaged decking, approved full claim scope.'],
      ['Upfront cost', 'Lower initial cost when the problem is limited.', 'Higher initial cost, but can be cheaper than repeated repairs when the roof is failing.'],
      ['Risk', 'A repair may not solve hidden problems on an aging roof.', 'Replacement reduces future leak risk but should be justified by inspection findings.'],
      ['Insurance', 'May apply when storm damage is limited to a repairable area.', 'May apply when covered storm damage affects enough of the roof to justify replacement under policy terms.'],
      ['Timing', 'Often faster, especially for active leaks or small storm repairs.', 'Requires material selection, scheduling, tear-off, deck inspection, and full cleanup.'],
      ['Best fit', 'Newer or mid-life roof with limited damage.', 'Older roof, brittle materials, repeated leaks, or broad storm damage.']
    ],
    cards: [
      ['Repair is usually smart when', 'The roof is younger, the leak source is obvious, shingles are still flexible, and the problem is limited to one area.'],
      ['Replacement is usually smart when', 'The roof has widespread wear, multiple slopes are damaged, repairs keep returning, or decking and ventilation need system-level work.'],
      ['Insurance changes the math', 'If covered storm damage exists, SMI documents the roof, meets the adjuster when needed, and explains deductible, upgrades, and claim scope.']
    ],
    decisions: [
      ['Age of the roof', 'A ten-year-old roof with one pipe boot leak is a different decision than a twenty-five-year-old roof with brittle shingles and multiple stains.'],
      ['Damage pattern', 'One torn shingle is a repair conversation. Missing shingles, bruising, creased tabs, and leaks on multiple slopes can become a replacement conversation.'],
      ['Decking and ventilation', 'Soft decking, poor intake, blocked exhaust, and chronic attic moisture can make a surface repair the wrong long-term answer.'],
      ['Cost over time', 'If repair cost keeps stacking up, a full replacement with warranty coverage may be the cleaner financial move.']
    ],
    localTitle: 'Storm-season decisions need documentation.',
    localText: 'Around Russellville, Ozark, Clarksville, Pottsville, Dardanelle, and Conway, the repair-versus-replacement decision often follows hail, wind, fallen limbs, or a leak after heavy rain. SMI photographs conditions, separates urgent temporary protection from permanent work, and explains whether repair or replacement is the stronger recommendation.',
    linksTitle: 'Compare repair, replacement, and storm pages.',
    links: [
      ['/roof-repair/', 'Roof repair'],
      ['/roof-repair-cost/', 'Roof repair cost'],
      ['/roof-replacement-cost/', 'Roof replacement cost'],
      ['/storm-damage/', 'Storm damage'],
      ['/storm-damage-roof-repair-cost/', 'Storm repair cost'],
      ['/russellville/roof-repair/', 'Russellville roof repair']
    ],
    faqs: [
      ['How do I know if I need roof repair or replacement?', 'Repair is more likely when the damage is isolated and the rest of the roof is healthy. Replacement is more likely when the roof is old, brittle, leaking in multiple places, missing granules widely, or has storm damage across several slopes.'],
      ['Should I repair a roof that is more than 20 years old?', 'Sometimes, but it depends on condition. A small flashing repair may still make sense. If shingles are brittle, decking is soft, or leaks keep returning, replacement may be the better investment.'],
      ['Can SMI inspect before I file an insurance claim?', 'Yes. SMI can document visible storm conditions, explain what appears repairable or replaceable, and help you understand whether the damage looks like an insurance conversation. The insurance carrier makes coverage decisions under your policy.'],
      ['Is roof repair always cheaper than replacement?', 'Repair is cheaper up front when the problem is small. It is not always cheaper over time if the roof is failing and repeated repairs keep stacking up.']
    ]
  },
  {
    slug: 'roof-coating-vs-replacement',
    label: 'Roof Coating vs Replacement',
    title: 'Roof Coating vs Replacement | Commercial Roofing | SMI Roofing',
    description: 'Compare commercial roof coating vs roof replacement for Arkansas buildings, including moisture, drainage, leaks, budget, disruption, and when restoration is viable.',
    eyebrow: 'Commercial Comparison',
    h1: 'Roof Coating vs <strong>Replacement</strong>',
    hero: 'Commercial roof coatings can save money and reduce disruption when the existing low-slope roof is still a good restoration candidate. Replacement is the better call when moisture, deck damage, drainage failure, or end-of-life conditions make coating a short-term patch.',
    proof: [['Coating', 'Restorable roof'], ['Replace', 'Failed system'], ['Low-slope', 'Commercial focus'], ['$0', 'Assessment']],
    introTitle: 'Coatings are powerful, but only on the right roof.',
    introLede: 'A coating system is not a shortcut around a failing commercial roof. SMI first checks drainage, seams, penetrations, wet insulation risk, deck condition, existing membrane condition, and warranty goals before recommending coating, repair, recovery, or full replacement.',
    rows: [
      ['Best use case', 'Structurally sound low-slope roof with limited repairs, dry substrate, workable drainage, and a membrane that can be cleaned and prepared.', 'Wet insulation, structural deck issues, major membrane failure, unresolved ponding, repeated leaks, or a roof beyond its service life.'],
      ['Budget', 'Often lower than full replacement because tear-off and disposal are reduced.', 'Higher cost, but resets more of the system when the roof cannot be reliably restored.'],
      ['Disruption', 'Usually less disruptive for tenants, inventory, production, and daily operations.', 'More disruptive because tear-off, staging, loading, and disposal are larger.'],
      ['Moisture', 'Only works after wet or damaged areas are identified and corrected.', 'Better when moisture is widespread or the assembly is compromised.'],
      ['Warranty path', 'Can carry coating-specific warranty options when prep and conditions qualify.', 'Can carry replacement system warranty options when a new membrane or metal system is installed.'],
      ['Best fit', 'Owners seeking service-life extension on a roof that still has a good base.', 'Owners needing a long-term reset for a roof that is no longer a restoration candidate.']
    ],
    cards: [
      ['Coating can make sense when', 'The roof drains reasonably, leaks can be repaired, moisture is limited, the substrate is sound, and the building owner wants less tear-off disruption.'],
      ['Replacement is safer when', 'Wet insulation, deteriorated decking, chronic ponding, split seams, repeated leaks, or old failed materials make restoration risky.'],
      ['Assessment comes first', 'SMI documents roof condition, repair needs, penetrations, access, drainage, and moisture concerns before putting coating on the table.']
    ],
    decisions: [
      ['Moisture survey and repairs', 'Wet insulation or moisture-saturated substrate must be addressed. Coating over trapped moisture can create bigger problems later.'],
      ['Drainage matters', 'Some roofs need drainage corrections before coating is appropriate. Chronic ponding can shorten performance if the wrong system is used.'],
      ['Operations matter', 'Coating can be attractive for retail, warehouse, church, office, and industrial properties because disruption and tear-off waste are lower.'],
      ['Do not field-coat shingles casually', 'This comparison is mainly for commercial low-slope roofs. Field coating asphalt shingles can create moisture and warranty problems, so SMI treats that as a separate conversation.']
    ],
    localTitle: 'Arkansas commercial roofs need practical recommendations.',
    localText: 'Flat and low-slope roofs in Russellville, Conway, Little Rock, Fort Smith, Clarksville, Ozark, and Dardanelle take heat, UV, storms, rooftop traffic, and drainage stress. SMI compares coating and replacement around the actual roof condition, building use, tenant disruption, and warranty goals.',
    linksTitle: 'Compare commercial roofing options.',
    links: [
      ['/commercial-roofing/', 'Commercial roofing'],
      ['/commercial-roofing/roof-coatings-restoration/', 'Roof coatings'],
      ['/commercial-roofing-cost/', 'Commercial roofing cost'],
      ['/commercial-roofing/tpo-roofing/', 'TPO roofing'],
      ['/commercial-roofing/commercial-roof-repair/', 'Commercial roof repair'],
      ['/commercial-roofing/russellville-ar/', 'Russellville commercial roofing']
    ],
    faqs: [
      ['Is roof coating cheaper than replacement?', 'When the existing commercial roof qualifies, coating is usually less expensive than full replacement because tear-off, disposal, and rebuild scope are reduced. If the roof has widespread moisture or structural problems, replacement may be the better financial decision.'],
      ['Can you coat a leaking commercial roof?', 'Leaks must be found and corrected before coating. A coating system can protect a prepared, sound roof surface, but it is not meant to hide saturated insulation, failed decking, or unresolved leak paths.'],
      ['When is commercial roof replacement better than coating?', 'Replacement is better when moisture is widespread, the deck is compromised, ponding cannot be corrected, leaks are persistent, or the existing roof is beyond a reliable restoration window.'],
      ['Does SMI inspect for coating eligibility?', 'Yes. SMI checks drainage, membrane condition, penetrations, seams, repair needs, moisture concerns, and access before recommending coating or replacement.']
    ]
  },
  {
    slug: 'tile-roof-vs-shingles',
    label: 'Tile Roof vs Shingles',
    title: 'Tile Roof vs Shingles in Arkansas | SMI Roofing',
    description: 'Compare tile roofing vs asphalt shingles for Arkansas homes, including weight, structure, cost, durability, repairability, storm risk, and practical local fit.',
    eyebrow: 'Material Comparison',
    h1: 'Tile Roof vs <strong>Shingles</strong>',
    hero: 'Tile roofing can create a premium look and long-lasting roof surface, but it is heavy, specialized, and not the practical default for most Arkansas homes. Shingles usually win on cost, repairability, availability, and fit with local roof styles.',
    proof: [['Tile', 'Premium material'], ['Shingle', 'Practical default'], ['Load', 'Structure matters'], ['$0', 'SMI inspection']],
    introTitle: 'Tile is beautiful, but structure decides first.',
    introLede: 'Clay and concrete tile can be durable, attractive, and energy-friendly in the right design. The big question is whether the home was built for the added roof load and specialty detailing. Architectural shingles are lighter, more common, easier to repair, and usually the practical fit for Arkansas replacement projects.',
    rows: [
      ['Upfront cost', 'Higher. Tile materials, specialty labor, structural review, underlayment, and detailing can raise the budget quickly.', 'Lower. Shingles are widely available and usually the most practical roof replacement choice.'],
      ['Weight', 'Heavy. The structure must be verified before replacing shingles with tile.', 'Light compared with tile and usually compatible with existing residential roof framing.'],
      ['Durability', 'Durable roof surface when properly designed and installed, but underlayment and flashing still matter.', 'Good durability when installed as a complete system with ventilation, flashing, and proper warranty coverage.'],
      ['Repairability', 'Individual tiles can break and matching profile/color can be specialized.', 'Individual shingles are usually easier to replace and match.'],
      ['Storm risk', 'Tile can resist sun and weather, but impact can crack tiles and repairs require care.', 'Hail and wind can damage shingles, but claims, repairs, and replacements are familiar in Arkansas.'],
      ['Best fit', 'Homes designed for tile, premium architecture, proper structure, and a budget for specialty work.', 'Most Arkansas homes needing a clean, reliable, cost-effective replacement.']
    ],
    cards: [
      ['Tile can make sense when', 'The home was designed for tile or a structural professional confirms the load path, the style fits the house, and the owner wants a premium material.'],
      ['Shingles make sense when', 'You want a reliable, attractive roof with lower cost, strong local availability, easier repair, and faster replacement scheduling.'],
      ['Consider metal too', 'If the goal is a premium roof without tile weight, metal roofing may be worth comparing alongside shingles.']
    ],
    decisions: [
      ['Structure comes before style', 'A tile conversion should not start with color. It starts with roof framing, deck condition, slope, underlayment, and load capacity.'],
      ['Underlayment is critical', 'Tile sheds water, but the underlayment and flashing details protect the structure. A tile roof is only as good as the system underneath it.'],
      ['Local repair support matters', 'Specialty tile repairs can be slower and more expensive than shingle repairs if matching material or experienced labor is limited.'],
      ['Arkansas practicality', 'For most River Valley and Central Arkansas homes, architectural shingles or metal are more practical than a new tile conversion.']
    ],
    localTitle: 'Most Arkansas replacements need practical durability.',
    localText: 'In Russellville, Conway, Dardanelle, Ozark, Clarksville, and Pottsville, most roof replacement calls are for architectural shingles, metal roofing, storm damage, or leak repair. SMI can still help homeowners compare tile, shingle, and metal from a practical standpoint before committing to a direction.',
    linksTitle: 'Compare material and replacement guides.',
    links: [
      ['/residential-roofing/', 'Residential roofing'],
      ['/roof-replacement-cost/', 'Roof replacement cost'],
      ['/metal-roof-vs-shingles/', 'Metal vs shingles'],
      ['/metal-roofs/', 'Metal roofing'],
      ['/russellville/residential-roofing/', 'Russellville residential roofing'],
      ['/conway/residential-roofing/', 'Conway residential roofing']
    ],
    faqs: [
      ['Is tile roofing better than shingles?', 'Tile can be better for certain homes designed for the added weight and premium style. Shingles are better for most Arkansas homes when cost, repairability, availability, and practical replacement scheduling matter.'],
      ['Can I replace shingles with tile?', 'Only after confirming the structure can support the added weight and the roof can be detailed correctly. A tile conversion may require structural review, deck work, underlayment upgrades, and specialty installation.'],
      ['Are tile roofs hard to repair?', 'Tile repairs can be more specialized than shingle repairs. Matching the profile and color, safely walking the roof, and protecting underlayment details all matter.'],
      ['What should I compare besides tile and shingles?', 'Many homeowners should also compare metal roofing. Metal can provide a premium look and long-term value without the same structural weight concerns as tile.']
    ]
  }
];

function schemaScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  };
}

function breadcrumbSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: page.label, item: `${siteUrl}/${page.slug}/` }
    ]
  };
}

function htmlRows(rows) {
  return rows.map(([factor, first, second]) => `<tr><td><strong>${factor}</strong></td><td>${first}</td><td>${second}</td></tr>`).join('');
}

function cards(cards) {
  return cards.map(([title, text]) => `<article class="card"><span class="label">Decision</span><h3>${title}</h3><p>${text}</p></article>`).join('');
}

function decisionList(items) {
  return items.map(([title, text]) => `<li><strong>${title}</strong>${text}</li>`).join('');
}

function linkGrid(links) {
  return links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('');
}

function faqHtml(faqs) {
  return faqs.map(([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button">${question}<span>+</span></button><div class="faq-answer">${answer}</div></div>`).join('');
}

function buildPage(page) {
  const pageUrl = `${siteUrl}/${page.slug}/`;
  const [tableFirst, tableSecond] = page.slug === 'roof-coating-vs-replacement'
    ? ['Coating', 'Replacement']
    : page.slug === 'roof-repair-vs-replacement'
      ? ['Repair', 'Replacement']
      : page.slug === 'tile-roof-vs-shingles'
        ? ['Tile', 'Shingles']
        : ['Shingles', 'Metal'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:image" content="/assets/og-image.jpg">
<meta property="og:url" content="${pageUrl}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${pageUrl}">
<meta name="geo.region" content="US-AR">
<meta name="geo.placename" content="Russellville, Arkansas">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema)}
${schemaScript(faqSchema(page.faqs))}
${schemaScript(breadcrumbSchema(page))}
${pixelCode}
</head>
<body>
${nav}
<main>
<section class="hero"><div class="hero-bg"><img src="/assets/smi-aerial-roof-detail.jpg" alt="SMI Roofing roof detail"></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><span>${page.label}</span></div><div class="eyebrow">${page.eyebrow}</div><h1>${page.h1}</h1><p>${page.hero}</p><div class="hero-actions"><a href="${phoneHref}" class="btn btn-primary">Call ${phone}</a><a href="${bookingUrl}" class="btn btn-secondary">Book free inspection</a></div><div class="proof">${page.proof.map(([value, label]) => `<div><b>${value}</b><span>${label}</span></div>`).join('')}</div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Quick Answer</div><h2 class="section-title">${page.introTitle}</h2><p class="section-lede">${page.introLede}</p><table class="price-table"><thead><tr><th>Factor</th><th>${tableFirst}</th><th>${tableSecond}</th></tr></thead><tbody>${htmlRows(page.rows)}</tbody></table><p class="comparison-note">Every roof still needs a real inspection. Roof size, pitch, access, decking, ventilation, flashing, materials, warranty, storm damage, and insurance scope can change the right recommendation.</p></div></section>
<section class="section"><div class="container"><div class="eyebrow">How to Choose</div><h2 class="section-title">Use the roof, not the sales pitch, to make the call.</h2><p class="section-lede">SMI compares the actual roof condition, long-term risk, and budget before recommending a direction. The goal is not to sell the most expensive option. The goal is to solve the roof correctly.</p><div class="grid">${cards(page.cards)}</div><ul class="decision-list">${decisionList(page.decisions)}</ul></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Local Context</div><h2 class="section-title">${page.localTitle}</h2><p class="section-lede">${page.localText}</p><div class="callout">The next step is a free SMI inspection with photos, scope notes, and a written recommendation. That gives you a practical comparison instead of a guess.</div></div></section>
<section class="section dark"><div class="container"><div class="eyebrow">Useful Links</div><h2 class="section-title">${page.linksTitle}</h2><p class="section-lede">Move between comparison pages, service hubs, cost guides, and local roofing pages without losing the decision context.</p><div class="link-grid">${linkGrid(page.links)}</div><p class="source-note">This guide is written for Arkansas roofing decisions and uses industry guidance from NRCA, DOE/EPA cool roof resources, and commercial coating manufacturer guidance as background context.</p></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">Comparison FAQs</div><h2 class="section-title">Questions customers ask before choosing.</h2><div class="faq-list">${faqHtml(page.faqs)}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>Get the right roof recommendation before spending money.</h2><p>Call SMI Roofing or book a free inspection. We will inspect the roof, document the conditions, and give you a written scope before work starts.</p></div><a href="${bookingUrl}" class="btn btn-primary">Book free inspection</a></div></div></section>
</main>
${footer}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Mobile quick actions"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Call SMI Roofing">Call</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Request a free roofing quote">Quote</a></nav>
</body>
</html>
`;
}

for (const page of pages) {
  const dir = join(root, page.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), buildPage(page));
}

function replaceSectionLinks(file, links) {
  const path = join(root, file);
  let html = readFileSync(path, 'utf8');
  const section = `<section class="section dark"><div class="container"><div class="eyebrow">Useful links</div><h2 class="section-title">Compare related roofing cost guides.</h2><p class="section-lede">Move between cost pages, service hubs, and local service pages without losing the pricing context.</p><div class="link-grid">${linkGrid(links)}</div></div></section>`;
  html = html.replace(/<section class="section dark"><div class="container"><div class="eyebrow">Useful links<\/div><h2 class="section-title">Compare related roofing cost guides\.<\/h2><p class="section-lede">Move between cost pages, service hubs, and local service pages without losing the pricing context\.<\/p><div class="link-grid">[\s\S]*?<\/div><\/div><\/section>/, section);
  writeFileSync(path, html);
}

replaceSectionLinks('roofing-costs/index.html', [
  ['/roof-replacement-cost/', 'Roof replacement cost'],
  ['/roof-repair-cost/', 'Roof repair cost'],
  ['/metal-roof-cost/', 'Metal roof cost'],
  ['/commercial-roofing-cost/', 'Commercial roofing cost'],
  ['/metal-roof-vs-shingles/', 'Metal vs shingles'],
  ['/roof-repair-vs-replacement/', 'Repair vs replacement'],
  ['/roof-coating-vs-replacement/', 'Coating vs replacement'],
  ['/tile-roof-vs-shingles/', 'Tile vs shingles'],
  ['/storm-damage-roof-repair-cost/', 'Storm repair cost'],
  ['/roof-insurance-claim-cost/', 'Insurance claim cost'],
  ['/residential-roofing/', 'Residential roofing'],
  ['/commercial-roofing/', 'Commercial roofing']
]);

replaceSectionLinks('roof-replacement-cost/index.html', [
  ['/residential-roofing/', 'Residential roofing'],
  ['/roofing-costs/', 'All roofing costs'],
  ['/roof-repair-vs-replacement/', 'Repair vs replacement'],
  ['/metal-roof-vs-shingles/', 'Metal vs shingles'],
  ['/tile-roof-vs-shingles/', 'Tile vs shingles'],
  ['/roof-insurance-claim-cost/', 'Insurance claim cost'],
  ['/russellville/residential-roofing/', 'Russellville replacement'],
  ['/conway/residential-roofing/', 'Conway replacement']
]);

replaceSectionLinks('roof-repair-cost/index.html', [
  ['/roof-repair/', 'Roof repair'],
  ['/roof-repair-vs-replacement/', 'Repair vs replacement'],
  ['/storm-damage-roof-repair-cost/', 'Storm repair cost'],
  ['/roofing-costs/', 'All roofing costs'],
  ['/russellville/roof-repair/', 'Russellville repair'],
  ['/ozark/roof-repair/', 'Ozark repair'],
  ['/clarksville/roof-repair/', 'Clarksville repair']
]);

replaceSectionLinks('metal-roof-cost/index.html', [
  ['/metal-roofs/', 'Metal roofing'],
  ['/metal-roof-vs-shingles/', 'Metal vs shingles'],
  ['/roof-replacement-cost/', 'Shingle replacement cost'],
  ['/roofing-costs/', 'All roofing costs'],
  ['/russellville/metal-roofs/', 'Russellville metal roofs'],
  ['/conway/metal-roofs/', 'Conway metal roofs'],
  ['/commercial-roofing/standing-seam-metal-roofing/', 'Commercial standing seam']
]);

replaceSectionLinks('commercial-roofing-cost/index.html', [
  ['/commercial-roofing/', 'Commercial roofing'],
  ['/roof-coating-vs-replacement/', 'Coating vs replacement'],
  ['/commercial-roofing/tpo-roofing/', 'TPO roofing'],
  ['/commercial-roofing/roof-coatings-restoration/', 'Roof coatings'],
  ['/commercial-roofing/russellville-ar/', 'Russellville commercial'],
  ['/commercial-roofing/conway-ar/', 'Conway commercial'],
  ['/roofing-costs/', 'All roofing costs']
]);

function addServiceComparisonLinks(file, anchors) {
  const path = join(root, file);
  let html = readFileSync(path, 'utf8');
  html = html.replace(/(<section class="content-section alt" data-m027-cost-guide>[\s\S]*?<div class="service-city-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>)/, (match, before, existing, after) => {
    const additions = anchors
      .filter(([href]) => !existing.includes(`href="${href}"`))
      .map(([href, label]) => `<a href="${href}" class="service-city-link">${label}</a>`)
      .join('\n');
    const links = [existing.trim(), additions].filter(Boolean).join('\n');
    return `${before}\n${links}\n${after}`;
  });
  writeFileSync(path, html);
}

addServiceComparisonLinks('residential-roofing/index.html', [
  ['/metal-roof-vs-shingles/', 'Metal roof vs shingles guide'],
  ['/roof-repair-vs-replacement/', 'Repair vs replacement guide'],
  ['/tile-roof-vs-shingles/', 'Tile roof vs shingles guide']
]);

addServiceComparisonLinks('roof-repair/index.html', [
  ['/roof-repair-vs-replacement/', 'Repair vs replacement guide']
]);

addServiceComparisonLinks('metal-roofs/index.html', [
  ['/metal-roof-vs-shingles/', 'Metal roof vs shingles guide']
]);

addServiceComparisonLinks('commercial-roofing/index.html', [
  ['/roof-coating-vs-replacement/', 'Roof coating vs replacement guide']
]);

const coatingPath = join(root, 'commercial-roofing', 'roof-coatings-restoration', 'index.html');
let coatingHtml = readFileSync(coatingPath, 'utf8');
if (!coatingHtml.includes('href="/roof-coating-vs-replacement/"')) {
  coatingHtml = coatingHtml.replace('<a href="/commercial-roofing/roof-coatings-restoration/" class="sidebar-link active">Roof Coatings & Restoration</a>', '<a href="/commercial-roofing/roof-coatings-restoration/" class="sidebar-link active">Roof Coatings & Restoration</a>\n<a href="/roof-coating-vs-replacement/" class="sidebar-link">Coating vs Replacement Guide</a>');
}
writeFileSync(coatingPath, coatingHtml);

const sitemapPath = join(root, 'sitemap.xml');
let sitemap = readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/site-map\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/site-map/</loc>\n    <lastmod>${today}</lastmod>`);
for (const page of pages) {
  const loc = `${siteUrl}/${page.slug}/`;
  const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.78</priority>
  </url>
`;
  const existing = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\//g, '\\/')}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
  sitemap = sitemap.replace(existing, '');
  sitemap = sitemap.replace('</urlset>', `${block}</urlset>`);
}
writeFileSync(sitemapPath, sitemap);

const sitemapGeneratorPath = join(root, 'scripts', 'generate-html-sitemap.mjs');
let sitemapGenerator = readFileSync(sitemapGeneratorPath, 'utf8');
sitemapGenerator = sitemapGenerator.replace(/const generatedDate = '[^']+';/, `const generatedDate = '${today}';`);
writeFileSync(sitemapGeneratorPath, sitemapGenerator);

console.log(`Generated ${pages.length} comparison pages and updated internal links.`);
