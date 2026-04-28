import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const sitemapPath = join(root, 'sitemap.xml');
const outputPath = join(root, 'site-map', 'index.html');
const siteUrl = 'https://smiroof.com';
const generatedDate = '2026-04-28';

const xml = readFileSync(sitemapPath, 'utf8');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseUrls(source) {
  return [...source.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/g)].map((match) => {
    const block = match[1];
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.trim();
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim() || generatedDate;
    const priority = block.match(/<priority>([^<]+)<\/priority>/)?.[1]?.trim() || '';

    if (!loc) return null;

    const url = new URL(loc);
    return {
      loc,
      path: url.pathname,
      label: labelForPath(url.pathname),
      lastmod,
      priority
    };
  }).filter(Boolean);
}

function titleCaseSegment(segment) {
  const known = new Map([
    ['acv', 'ACV'],
    ['ar', 'AR'],
    ['epdm', 'EPDM'],
    ['faq', 'FAQ'],
    ['gaf', 'GAF'],
    ['hdz', 'HDZ'],
    ['rcv', 'RCV'],
    ['sms', 'SMS'],
    ['tpo', 'TPO']
  ]);

  return segment
    .split('-')
    .map((part) => known.get(part) || part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelForPath(pathname) {
  if (pathname === '/') return 'Home';

  return pathname
    .replace(/^\/|\/$/g, '')
    .split('/')
    .map(titleCaseSegment)
    .join(' / ');
}

const urls = parseUrls(xml);
const urlList = urls.map((entry, index) => {
  return `<li data-sitemap-item><a href="${escapeHtml(entry.path)}"><span class="url-index">${index + 1}</span><span class="url-text"><strong>${escapeHtml(entry.label)}</strong><em>${escapeHtml(entry.path)}</em></span></a></li>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Site Map | All SMI Roofing URLs</title>
<meta name="description" content="Browse every public SMI Roofing page in one flat HTML sitemap, including service hubs, Arkansas city hubs, city-service pages, commercial roofing pages, and blog articles.">
<meta property="og:title" content="Site Map | SMI Roofing">
<meta property="og:description" content="A flat HTML sitemap listing every public SMI Roofing URL for customers and search crawlers.">
<meta property="og:image" content="/assets/og-image.jpg">
<meta property="og:url" content="${siteUrl}/site-map/">
<meta property="og:type" content="website">
<link rel="canonical" href="${siteUrl}/site-map/">
<meta name="geo.region" content="US-AR">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--cyan:#00C8F0;--cyan-dark:#00a5c7;--navy:#0a1628;--navy-light:#111f36;--navy-mid:#162440;--ink:#111827;--muted:#59677a;--line:#dce3eb;--soft:#f6f8fb;--white:#fff;--font-display:'Outfit',sans-serif;--font-body:'Plus Jakarta Sans',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);color:var(--ink);background:var(--soft);overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.topbar{background:var(--navy);color:#d9e7f2;font-size:13px;font-weight:800}
.topbar-inner{max-width:1200px;margin:0 auto;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.topbar a{color:#8beaff}
.nav{position:sticky;top:0;z-index:1000;background:rgba(255,255,255,.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--line);box-shadow:0 10px 30px rgba(17,24,39,.04)}
.nav-inner{max-width:1200px;margin:0 auto;padding:0 24px;height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}
.brand{display:flex;align-items:center;gap:12px}
.brand img{width:44px;height:44px;border-radius:10px;object-fit:contain;background:#fff}
.brand-text{font-family:var(--font-display);font-weight:900;font-size:22px;letter-spacing:0;color:var(--ink)}
.brand-text span{color:var(--cyan-dark)}
.nav-links{display:flex;align-items:center;gap:22px;list-style:none}
.nav-links a{font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;color:#314155}
.nav-links a:hover,.nav-links a.active{color:var(--cyan-dark)}
.nav-phone{color:var(--cyan-dark)!important}
.nav-cta{display:inline-flex!important;align-items:center;justify-content:center;min-height:42px;padding:0 20px!important;background:var(--cyan)!important;color:#06131d!important;border-radius:7px;font-weight:900!important;box-shadow:0 12px 30px rgba(0,200,240,.2)}
.nav-toggle{display:none;flex-direction:column;gap:5px;padding:8px;background:none;border:none;cursor:pointer}
.nav-toggle span{display:block;width:24px;height:2px;background:var(--ink);border-radius:2px}
.mobile-menu{display:none;position:fixed;left:0;right:0;top:112px;z-index:25;background:#fff;border-bottom:1px solid var(--line);padding:12px 20px 22px;box-shadow:0 24px 50px rgba(17,24,39,.12)}
.mobile-menu.open{display:block}
.mobile-menu a{display:block;padding:15px 0;color:var(--ink);font-weight:900;border-bottom:1px solid var(--line)}
.mobile-menu .mobile-cta{margin-top:16px;padding:16px;text-align:center;background:var(--cyan);border-radius:7px;color:#06131d;border-bottom:none}
.hero{position:relative;overflow:hidden;background:#fff;border-bottom:1px solid var(--line)}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center 36%;opacity:.2}
.hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 46%,rgba(255,255,255,.78) 72%,rgba(255,255,255,.4) 100%)}
.hero-inner{position:relative;z-index:2;padding:78px 24px 70px}
.breadcrumb{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:20px;color:var(--muted);font-size:13px;font-weight:800}
.breadcrumb a{color:var(--muted)}
.breadcrumb span:last-child{color:var(--cyan-dark)}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:42px;align-items:end}
.eyebrow{display:inline-flex;align-items:center;gap:9px;margin-bottom:16px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.13em;color:var(--cyan-dark)}
.eyebrow::before{content:'';width:30px;height:2px;background:var(--cyan)}
h1{font-family:var(--font-display);font-size:clamp(38px,5vw,64px);line-height:1.02;letter-spacing:0;color:var(--ink);max-width:840px}
h1 strong{color:var(--cyan-dark);font-weight:900}
.hero p{max-width:720px;margin-top:20px;color:var(--muted);font-size:18px;line-height:1.7}
.stat-panel{background:#fff;border:1px solid var(--line);border-radius:8px;padding:24px;box-shadow:0 24px 70px rgba(17,24,39,.12)}
.stat-panel b{display:block;font-family:var(--font-display);font-size:46px;line-height:1;color:var(--cyan-dark)}
.stat-panel span{display:block;margin-top:8px;color:var(--muted);font-weight:900}
.section{padding:56px 0 80px}
.section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:20px}
.section-title{font-family:var(--font-display);font-size:clamp(28px,3vw,40px);line-height:1.08;color:var(--ink)}
.section-lede{max-width:660px;margin-top:10px;color:var(--muted);line-height:1.7}
.search-box{width:min(420px,100%);display:flex;align-items:center;background:#fff;border:1px solid var(--line);border-radius:8px;padding:6px;box-shadow:0 12px 32px rgba(17,24,39,.05)}
.search-box input{width:100%;min-height:44px;border:none;background:transparent;padding:0 12px;font:inherit;font-weight:800;color:var(--ink)}
.search-box input:focus{outline:none}
.url-list{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.url-list li{min-width:0}
.url-list a{min-height:76px;height:100%;display:grid;grid-template-columns:42px minmax(0,1fr);gap:12px;align-items:center;padding:14px;background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:0 10px 24px rgba(17,24,39,.04);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease,background .18s ease}
.url-list a:hover{transform:translateY(-2px);border-color:var(--cyan);background:#eafaff;box-shadow:0 14px 30px rgba(0,200,240,.12)}
.url-index{display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:7px;background:var(--soft);color:var(--muted);font-size:12px;font-weight:900}
.url-text{min-width:0}
.url-text strong{display:block;color:var(--ink);font-size:14px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.url-text em{display:block;margin-top:5px;color:var(--muted);font-style:normal;font-size:12px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.no-match{display:none;margin-top:18px;padding:16px;background:#fff;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-weight:900}
.no-match.show{display:block}
.cta{background:#fff;border-top:1px solid var(--line);padding:62px 0}
.cta-wrap{display:flex;align-items:center;justify-content:space-between;gap:24px}
.cta h2{font-family:var(--font-display);font-size:clamp(26px,3vw,38px);line-height:1.08;color:var(--ink)}
.cta p{margin-top:10px;color:var(--muted);line-height:1.65;max-width:620px}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 24px;border-radius:7px;background:var(--cyan);color:#06131d;font-weight:900;box-shadow:0 12px 30px rgba(0,200,240,.2)}
.footer{background:#091322;color:#fff;padding:62px 0 34px}
.footer-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:38px}
.footer p{margin:16px 0 0;color:rgba(255,255,255,.62);line-height:1.7}
.footer h3{margin:0 0 16px;font-family:var(--font-display);font-size:14px;text-transform:uppercase;letter-spacing:.12em}
.footer a{display:block;color:rgba(255,255,255,.68);font-size:14px;font-weight:700;margin:9px 0}
.footer a:hover{color:#8beaff}
.footer .brand-text{color:#fff}
.footer-bottom{display:flex;justify-content:space-between;gap:20px;margin-top:46px;padding-top:28px;border-top:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.52);font-size:13px}
@media(max-width:980px){.nav-links{display:none}.nav-toggle{display:flex}.hero-grid{grid-template-columns:1fr}.stat-panel{max-width:420px}.section-head,.cta-wrap{display:block}.search-box{margin-top:18px}.url-list{grid-template-columns:repeat(2,minmax(0,1fr))}.footer-grid{grid-template-columns:1fr 1fr}}
@media(max-width:620px){.topbar-inner{display:block}.topbar a{display:block;margin-top:6px}.hero-inner{padding-top:54px}.mobile-menu{top:118px}.url-list{grid-template-columns:1fr}.footer-grid{grid-template-columns:1fr}.footer-bottom{display:block}.footer-bottom span{display:block;margin-top:10px}}
</style>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"RoofingContractor","@id":"${siteUrl}/#organization","name":"SMI Roofing","url":"${siteUrl}","telephone":"+1-501-464-5139","email":"info@smiroof.com","address":{"@type":"PostalAddress","streetAddress":"302 East Parkway Drive, Suite C","addressLocality":"Russellville","addressRegion":"AR","postalCode":"72801","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":35.2784,"longitude":-93.1338},"aggregateRating":{"@type":"AggregateRating","ratingValue":"5.0","bestRating":"5","worstRating":"1","ratingCount":"231","reviewCount":"231"}}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is included in the SMI Roofing HTML sitemap?","acceptedAnswer":{"@type":"Answer","text":"The HTML sitemap lists every public canonical SMI Roofing URL from the XML sitemap, including service hubs, city hubs, city-service pages, commercial roofing pages, blog articles, and policy pages."}},{"@type":"Question","name":"Why does SMI Roofing have an HTML sitemap?","acceptedAnswer":{"@type":"Answer","text":"The HTML sitemap gives customers and search crawlers a direct flat list of pages so important service and local pages are easier to discover."}},{"@type":"Question","name":"How often is the SMI Roofing HTML sitemap updated?","acceptedAnswer":{"@type":"Answer","text":"The HTML sitemap is generated from the XML sitemap whenever public URLs are added or removed."}}]}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${siteUrl}/"},{"@type":"ListItem","position":2,"name":"Site Map","item":"${siteUrl}/site-map/"}]}</script>
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2124552908380703');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=2124552908380703&ev=PageView&noscript=1"></noscript>
<!-- End Meta Pixel Code -->
</head>
<body>
<div class="topbar"><div class="topbar-inner"><div>Arkansas roofing pages in one place. <strong>${urls.length} public URLs listed.</strong></div><a href="tel:+15014645139">(501) 464-5139</a></div></div>
<nav class="nav" id="siteNav">
<div class="nav-inner">
<a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a>
<ul class="nav-links">
<li><a href="/">Home</a></li>
<li><a href="/commercial-roofing/">Commercial</a></li>
<li><a href="/storm-damage/">Storm Damage</a></li>
<li><a href="/areas-we-serve/">Service Areas</a></li>
<li><a href="/site-map/" class="active">Site Map</a></li>
<li><a href="tel:+15014645139" class="nav-phone">(501) 464-5139</a></li>
<li><a href="https://clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb" class="nav-cta">Free Inspection</a></li>
</ul>
<button class="nav-toggle" type="button" aria-label="Open menu" onclick="toggleMenu()"><span></span><span></span><span></span></button>
</div>
</nav>
<div class="mobile-menu" id="mobileMenu">
<a href="/" onclick="closeMenu()">Home</a>
<a href="/commercial-roofing/" onclick="closeMenu()">Commercial Roofing</a>
<a href="/storm-damage/" onclick="closeMenu()">Storm Damage</a>
<a href="/areas-we-serve/" onclick="closeMenu()">Service Areas</a>
<a href="/site-map/" onclick="closeMenu()">Site Map</a>
<a href="tel:+15014645139" class="mobile-cta" onclick="closeMenu()">Call (501) 464-5139</a>
</div>
<main>
<section class="hero">
<div class="hero-bg"><img src="/assets/smi-active-roof-documentation-aerial.jpg" alt="SMI Roofing crew documenting an Arkansas roof"></div>
<div class="container hero-inner">
<div class="breadcrumb"><a href="/">Home</a><span>/</span><span>Site Map</span></div>
<div class="hero-grid">
<div>
<div class="eyebrow">HTML Sitemap</div>
<h1>Every public SMI Roofing URL in <strong>one flat list.</strong></h1>
<p>This page mirrors the canonical XML sitemap in plain HTML, giving customers and crawlers a direct path into the full service, city, commercial, and blog page matrix.</p>
</div>
<div class="stat-panel"><b data-url-count>${urls.length}</b><span>Public URLs linked below</span></div>
</div>
</div>
</section>
<section class="section">
<div class="container">
<div class="section-head">
<div>
<div class="eyebrow">Public URLs</div>
<h2 class="section-title">SMI Roofing Site Map</h2>
<p class="section-lede">All links below are canonical public pages currently listed in the XML sitemap.</p>
</div>
<label class="search-box" for="sitemapSearch"><input id="sitemapSearch" type="search" placeholder="Search URLs" autocomplete="off"></label>
</div>
<ul class="url-list" data-sitemap-list>
${urlList}
</ul>
<p class="no-match" id="noMatch">No matching public URLs found.</p>
</div>
</section>
<section class="cta">
<div class="container">
<div class="cta-wrap">
<div><h2>Need roof help in Arkansas?</h2><p>Call SMI Roofing or book a free inspection. We will inspect the roof, show you the photos, and explain the next best step.</p></div>
<a class="btn" href="https://clienthub.getjobber.com/booking/31b1fe0c-4da6-49e9-ad15-2e9a8cefa5fb">Book Free Inspection</a>
</div>
</div>
</section>
</main>
<footer class="footer">
<div class="container">
<div class="footer-grid">
<div>
<a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a>
<p>Arkansas roofing help built around straight answers, photo documentation, and local accountability.</p>
<p>302 East Parkway Drive, Suite C<br>Russellville, Arkansas 72801<br>(501) 464-5139</p>
</div>
<div><h3>Services</h3><a href="/residential-roofing/">Residential Roofing</a><a href="/commercial-roofing/">Commercial Roofing</a><a href="/metal-roofs/">Metal Roofing</a><a href="/storm-damage/">Storm Damage</a></div>
<div><h3>Help</h3><a href="/roof-repair/">Roof Repair</a><a href="/roof-inspections/">Roof Inspections</a><a href="/insurance-claims/">Insurance Claims</a><a href="/areas-we-serve/">Service Areas</a></div>
<div><h3>Company</h3><a href="/#reviews">Reviews</a><a href="/blog/">Blog</a><a href="/site-map/">Site Map</a><a href="/privacy-policy/">Privacy Policy</a><a href="/sms-terms/">SMS Terms</a></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 CAS Management Inc. dba SMI Roofing. All rights reserved.</span><span>Licensed &amp; Insured | Russellville, AR</span></div>
</div>
</footer>
<script>
function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}
function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}
const search=document.getElementById('sitemapSearch');
const noMatch=document.getElementById('noMatch');
if(search){
  search.addEventListener('input',()=>{
    const query=search.value.trim().toLowerCase();
    let matches=0;
    document.querySelectorAll('[data-sitemap-item]').forEach(item=>{
      const isMatch=item.textContent.toLowerCase().includes(query);
      item.style.display=isMatch?'block':'none';
      if(isMatch) matches++;
    });
    noMatch.classList.toggle('show',matches===0);
  });
}
</script>
</body>
</html>
`;

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, html.replace(/\n+$/, '\n'));
console.log(`Generated site-map/index.html with ${urls.length} URLs.`);
