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
  throw new Error('Could not read base styles from roofing-costs/index.html');
}

const extraStyle = `.language-note{margin-top:22px;border:1px solid rgba(0,200,240,.34);background:#eafaff;color:#075b70;border-radius:8px;padding:18px;line-height:1.7;font-weight:800}.service-grid.es{grid-template-columns:repeat(4,minmax(0,1fr))}.service-card .mini{display:block;margin-top:12px;color:var(--cyan-dark);font-weight:900}.content-columns{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:28px}.content-box{background:#fff;border:1px solid var(--line);border-radius:8px;padding:22px;box-shadow:0 12px 30px rgba(17,24,39,.05)}.content-box h3{margin:0 0 10px;font-family:var(--font-display);font-size:22px;color:var(--ink);letter-spacing:0}.content-box p,.content-box li{color:var(--muted);line-height:1.7}.content-box ul{padding-left:18px}.source-path{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:24px}.source-path a{display:flex;align-items:center;justify-content:space-between;min-height:54px;background:#fff;border:1px solid var(--line);border-radius:8px;padding:13px 15px;font-weight:900;color:var(--ink)}.source-path a::after{content:'>';color:var(--cyan-dark);margin-left:10px}.dark .content-box,.dark .source-path a{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14)}.dark .content-box h3,.dark .source-path a{color:#fff}.dark .content-box p,.dark .content-box li{color:rgba(255,255,255,.72)}@media(max-width:980px){.service-grid.es{grid-template-columns:repeat(2,minmax(0,1fr))}.content-columns{grid-template-columns:1fr}}@media(max-width:620px){.service-grid.es,.source-path{grid-template-columns:1fr}}`;
const style = baseStyle.replace('</style>', `${extraStyle}</style>`);

const cities = [
  {
    slug: 'dfw',
    name: 'Dallas-Fort Worth',
    stateCode: 'TX',
    stateName: 'Texas',
    county: 'North Texas',
    region: 'Dallas, Fort Worth, Arlington, Plano, Frisco, Irving, Grapevine y comunidades cercanas',
    weather: 'granizo del norte de Texas, ciclos largos de calor, lluvia con viento, techos de urbanizaciones nuevas y drenaje en techos comerciales de baja pendiente',
    neighborhoods: ['Dallas', 'Fort Worth', 'Arlington', 'Plano', 'Frisco', 'Irving', 'Grapevine', 'McKinney']
  },
  {
    slug: 'fort-worth',
    name: 'Fort Worth',
    stateCode: 'TX',
    stateName: 'Texas',
    county: 'Tarrant County',
    region: 'Fort Worth, Arlington, Keller, Burleson, Weatherford, Benbrook, Saginaw y comunidades cercanas',
    weather: 'granizo en Tarrant County, calor intenso, lluvia impulsada por viento, vecindarios antiguos y superficies comerciales grandes',
    neighborhoods: ['Westover Hills', 'Arlington', 'Keller', 'Burleson', 'Weatherford', 'Benbrook', 'Saginaw', 'North Richland Hills']
  },
  {
    slug: 'houston',
    name: 'Houston',
    stateCode: 'TX',
    stateName: 'Texas',
    county: 'Harris County',
    region: 'Houston, Harris County y comunidades cercanas de la Costa del Golfo',
    weather: 'lluvia tropical, humedad, viento, ramas caídas, drenaje de techos planos y documentación después de tormentas de la Costa del Golfo',
    neighborhoods: ['Katy', 'Sugar Land', 'The Woodlands', 'Spring', 'Pasadena', 'Pearland', 'Cypress', 'Baytown']
  },
  {
    slug: 'san-antonio',
    name: 'San Antonio',
    stateCode: 'TX',
    stateName: 'Texas',
    county: 'Bexar County',
    region: 'San Antonio, Bexar County, New Braunfels, Schertz, Cibolo y comunidades cercanas de Hill Country',
    weather: 'granizo, calor, lluvia con viento, techos de teja, adiciones de baja pendiente y subdivisiones de crecimiento rápido',
    neighborhoods: ['Stone Oak', 'Alamo Heights', 'Medical Center', 'Shavano Park', 'Helotes', 'Converse', 'Leon Valley', 'New Braunfels']
  }
];

const services = [
  {
    slug: 'reparacion-de-techo',
    englishUrl: '/roof-repair/',
    label: 'Reparación de techo',
    titleLead: 'reparación de techo',
    h1: 'Reparación de techo',
    summary: 'goteras, tejas levantadas, tapajuntas, botas de tubería, ventilas, daños por viento y reparaciones urgentes',
    intent: 'Cuando hay una gotera, una teja faltante o una mancha nueva en el techo interior, el primer paso es una inspección con fotos antes de aceptar una reparación rápida sin revisar el sistema completo.',
    bullets: ['Goteras activas y manchas en cielo raso', 'Tejas faltantes, levantadas o quebradas', 'Tapajuntas, valles, ventilas y botas de tubería', 'Daño por viento y reparaciones antes de la próxima lluvia']
  },
  {
    slug: 'danos-por-tormenta',
    englishUrl: '/storm-damage/',
    label: 'Daños por tormenta',
    titleLead: 'daños por tormenta',
    h1: 'Daños por tormenta',
    summary: 'inspecciones después de granizo, viento fuerte, ramas caídas, goteras y daños que pueden necesitar documentación para seguro',
    intent: 'Después de granizo o viento fuerte, muchos daños no se ven desde el suelo. SMI revisa tejas, metales blandos, canaletas, ventilas, cumbreras, valles y señales de filtración.',
    bullets: ['Granizo, viento fuerte y ramas caídas', 'Fotos de daño en tejas y metales blandos', 'Protección temporal si el techo está abierto', 'Recomendación clara: reparar, monitorear o documentar para seguro']
  },
  {
    slug: 'reclamos-de-seguro',
    englishUrl: '/insurance-claims/',
    label: 'Reclamos de seguro',
    titleLead: 'ayuda con reclamos de seguro',
    h1: 'Ayuda con reclamos de seguro',
    summary: 'fotos, notas de inspección, estimado de techado, reunión con ajustador y revisión de alcance desde el punto de vista del contratista',
    intent: 'SMI puede documentar condiciones visibles del techo y explicar el alcance de reparación o reemplazo. La compañía de seguro decide cobertura, deducible, depreciación y pago final.',
    bullets: ['Fotos organizadas para el reclamo', 'Notas de inspección para el ajustador', 'Revisión de alcance y partidas faltantes', 'Sin prometer cobertura ni actuar como ajustador público']
  },
  {
    slug: 'techos-residenciales',
    englishUrl: '/residential-roofing/',
    label: 'Techos residenciales',
    titleLead: 'techos residenciales',
    h1: 'Techos residenciales',
    summary: 'reemplazo de techo, opciones de teja asfáltica, ventilación, tapajuntas, limpieza, garantía y plan de instalación',
    intent: 'Si el techo está envejecido, tiene varias reparaciones o muestra daño extendido, SMI compara reparación contra reemplazo con fotos, medidas y una explicación clara.',
    bullets: ['Reemplazo de techo residencial', 'Opciones de material y ventilación', 'Limpieza, protección de propiedad y garantía', 'Estimado basado en el techo real, no en adivinanzas']
  }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function schemaScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function nav() {
  return `<div class="topbar"><div class="topbar-inner"><div><strong>Servicio en español.</strong> Inspecciónes gratis y ayuda clara para techos en Texas.</div><a href="${phoneHref}">${phone}</a></div></div>
<nav class="nav" id="siteNav"><div class="nav-inner"><a href="/" class="brand" aria-label="Inicio de SMI Roofing"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><ul class="nav-links"><li><a href="/">Home</a></li><li><a href="/commercial-roofing/">Commercial</a></li><li><a href="/storm-damage/">Storm Damage</a></li><li><a href="/insurance-claims/">Insurance Claims</a></li><li><a href="/areas-we-serve/">Areas We Serve</a></li><li><a href="/es/">Español</a></li><li><a href="${phoneHref}">${phone}</a></li><li><a href="${bookingUrl}" class="nav-cta">Inspección Gratis</a></li></ul><button class="nav-toggle" type="button" aria-label="Abrir menu" onclick="toggleMenu()"><span></span><span></span><span></span></button></div></nav>
<div class="mobile-menu" id="mobileMenu"><a href="/" onclick="closeMenu()">Home</a><a href="/commercial-roofing/" onclick="closeMenu()">Commercial Roofing</a><a href="/storm-damage/" onclick="closeMenu()">Storm Damage</a><a href="/insurance-claims/" onclick="closeMenu()">Insurance Claims</a><a href="/areas-we-serve/" onclick="closeMenu()">Areas We Serve</a><a href="/es/" onclick="closeMenu()">Español</a><a href="${phoneHref}" class="mobile-cta" onclick="closeMenu()">Llamar ${phone}</a></div>`;
}

function footer(city = null) {
  const local = city ? `<a href="/es/${city.slug}/">${city.name}, ${city.stateCode}</a>` : '<a href="/es/">Español</a>';
  return `<footer class="footer"><div class="container"><div class="footer-grid"><div><a href="/" class="brand" aria-label="SMI Roofing home"><img src="/assets/logo.png" alt="SMI Roofing"><div class="brand-text">SMI <span>Roofing</span></div></a><p>Ayuda de techado en español para propietarios que necesitan inspección, reparación, reemplazo, documentación por tormenta o apoyo con seguro.</p><p>302 East Parkway Drive, Suite C<br>Russellville, Arkansas 72801<br><a href="${phoneHref}">${phone}</a></p></div><div><h3>Español</h3><a href="/es/">Inicio en español</a>${local}<a href="/areas-we-serve/">Areas We Serve</a><a href="/site-map/">Site Map</a></div><div><h3>Servicios</h3><a href="/roof-repair/">Roof Repair</a><a href="/storm-damage/">Storm Damage</a><a href="/insurance-claims/">Insurance Claims</a><a href="/residential-roofing/">Residential Roofing</a></div><div><h3>Texas</h3><a href="/es/dfw/">DFW</a><a href="/es/fort-worth/">Fort Worth</a><a href="/es/houston/">Houston</a><a href="/es/san-antonio/">San Antonio</a></div></div><div class="footer-bottom"><span>&copy; 2026 CAS Management Inc. dba SMI Roofing. All rights reserved.</span><span>Spanish-language roofing pages | Published ${today}</span></div></div></footer>`;
}

function orgSchema(city = null) {
  const schema = {
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      bestRating: '5',
      worstRating: '1',
      ratingCount: '231',
      reviewCount: '231'
    }
  };
  if (city) {
    schema.areaServed = {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'State',
        name: city.stateName
      }
    };
  }
  return schema;
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`
    }))
  };
}

function faqItems(city, service = null) {
  if (service) {
    return [
      [
        `¿SMI Roofing ofrece ${service.titleLead} en ${city.name}?`,
        `Sí. SMI ayuda a propietarios en ${city.name} con ${service.summary}. Puede llamar al ${phone} o pedir una inspección gratis.`
      ],
      [
        `¿Puedo hablar con alguien en español sobre mi techo en ${city.name}?`,
        `Sí. Esta página está escrita para propietarios que prefieren información clara en español. Cuando llame, diga que necesita ayuda en español para que el equipo pueda orientar la conversación correctamente.`
      ],
      [
        `¿La inspección de techo es gratis?`,
        `Sí. SMI empieza con una inspección gratis y fotos para explicar si el techo necesita reparación, reemplazo, documentación para seguro o seguimiento despues de la próxima lluvia.`
      ],
      [
        `¿SMI puede ayudar si hay seguro involucrado?`,
        `Sí. SMI puede documentar daños visibles, preparar notas y explicar el alcance de techado. La compañía de seguro decide cobertura, deducible y pago final.`
      ]
    ];
  }

  return [
    [
      `¿SMI Roofing atiende clientes de habla hispana en ${city.name}?`,
      `Sí. Esta página en español ayuda a propietarios en ${city.name} a encontrar inspección de techo, reparación, daños por tormenta, reclamos de seguro y reemplazo residencial.`
    ],
    [
      `¿Qué servicios de techado se ofrecen en ${city.name}?`,
      `SMI ayuda con reparación de techo, daños por tormenta, documentación para seguro, techos residenciales, inspecciones gratis y orientación para tomar la siguiente decisión.`
    ],
    [
      `¿Cuándo debo pedir una inspección de techo?`,
      `Pida una inspección despues de granizo, viento fuerte, una gotera, tejas faltantes, manchas interiores, granulos en canaletas o si el techo ya está cerca del final de su vida util.`
    ],
    [
      `¿Cuánto cuesta reemplazar un techo en ${city.name}?`,
      `El costo depende del tamaño, pendiente, acceso, retiro del techo viejo, madera dañada, ventilación, material, tapajuntas y si hay seguro involucrado. SMI empieza con una inspección gratis para estimar con base en el techo real.`
    ]
  ];
}

function faqSchema(city, service = null) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems(city, service).map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

function faqHtml(city, service = null) {
  return faqItems(city, service)
    .map(([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button">${escapeHtml(question)}<span>+</span></button><div class="faq-answer">${escapeHtml(answer)}</div></div>`)
    .join('');
}

function indexFaqItems() {
  return [
    [
      '¿SMI Roofing tiene páginas en español?',
      'Sí. Este primer grupo de páginas en español cubre DFW, Fort Worth, Houston y San Antonio, con rutas para reparación de techo, daños por tormenta, reclamos de seguro y techos residenciales.'
    ],
    [
      '¿Por qué empezar con ciudades de Texas?',
      'Las ciudades principales de Texas tienen búsquedas de alta intención para techado, tormentas y seguro. Crear páginas en español ayuda a propietarios que prefieren leer o llamar en español.'
    ],
    [
      '¿La inspección de techo es gratis?',
      `Sí. Puede llamar al ${phone} o pedir una inspección gratis en línea. SMI revisa el techo, toma fotos y explica el siguiente paso.`
    ],
    [
      '¿Estas páginas reemplazan las páginas en inglés?',
      'No. Son páginas adicionales para búsquedas en español y para propietarios que quieren información mas clara antes de llamar.'
    ]
  ];
}

function indexFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: indexFaqItems().map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: answer
      }
    }))
  };
}

function indexFaqHtml() {
  return indexFaqItems()
    .map(([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}"><button class="faq-question" type="button">${escapeHtml(question)}<span>+</span></button><div class="faq-answer">${escapeHtml(answer)}</div></div>`)
    .join('');
}

function cityServiceLinks(city) {
  return services.map((service) => `<a class="service-card" href="/es/${city.slug}/${service.slug}/"><span>Servicio</span><h2>${escapeHtml(service.label)}</h2><p>${escapeHtml(service.summary)}.</p><strong class="mini">Ver página local</strong></a>`).join('');
}

function cityLinksGrid() {
  return cities.map((city) => `<a class="service-card" href="/es/${city.slug}/"><span>Texas</span><h2>${escapeHtml(city.name)}</h2><p>${escapeHtml(city.region)}.</p><strong class="mini">Ver página en español</strong></a>`).join('');
}

function cityPage(city) {
  const pageUrl = `${siteUrl}/es/${city.slug}/`;
  const title = `Techador en ${city.name}, TX | SMI Roofing en Español`;
  const description = `Página en español para techado en ${city.name}, Texas. Reparación de techo, daños por tormenta, reclamos de seguro, techos residenciales e inspección gratis.`;
  return `<!DOCTYPE html>
<html lang="es-US">
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
<link rel="alternate" hreflang="en-us" href="${siteUrl}/${city.slug}/">
<link rel="alternate" hreflang="es-us" href="${pageUrl}">
<meta name="geo.region" content="US-${city.stateCode}">
<meta name="geo.placename" content="${escapeHtml(city.name)}, ${escapeHtml(city.stateName)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema(city))}
${schemaScript(faqSchema(city))}
${schemaScript(breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Español', path: '/es/' }, { name: city.name, path: `/es/${city.slug}/` }]))}
${pixelCode}
</head>
<body>
${nav()}
<main>
<section class="hero"><div class="hero-bg"><video class="hero-video" autoplay muted loop playsinline preload="metadata"><source src="/assets/hero-video.mp4" type="video/mp4"></video></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/es/">Español</a><span>/</span><span>${escapeHtml(city.name)}</span></div><div class="hero-kicker"><span></span> Página en Español</div><h1>Techador en <strong>${escapeHtml(city.name)}, Texas</strong></h1><p>SMI Roofing ayuda a propietarios en ${escapeHtml(city.region)} con inspecciones gratis, reparación de techo, daños por tormenta, reclamos de seguro y reemplazo residencial. Esta página resume las opciones principales en español.</p><div class="hero-actions"><a class="btn btn-primary" href="${bookingUrl}">Pedir Inspección Gratis</a><a class="btn btn-secondary" href="${phoneHref}">Llamar ${phone}</a><a class="btn btn-secondary" href="/${city.slug}/">English</a></div><div class="hero-proof"><div class="proof-item"><div class="proof-value">5.0</div><div class="proof-label">Rated Service</div></div><div class="proof-item"><div class="proof-value">Gratis</div><div class="proof-label">Inspección</div></div><div class="proof-item"><div class="proof-value">Foto</div><div class="proof-label">Documentación</div></div><div class="proof-item"><div class="proof-value">TX</div><div class="proof-label">${escapeHtml(city.county)}</div></div></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Servicios de Techado</div><h2 class="section-title">Ayuda local para techos en ${escapeHtml(city.name)}.</h2><p class="section-lede">Las decisiónes de techado en ${escapeHtml(city.name)} suelen depender de ${escapeHtml(city.weather)}. SMI empieza con fotos y una explicacion clara para que usted sepa si conviene reparar, reemplazar, documentar para seguro o simplemente monitorear el techo.</p><div class="language-note">Si prefiere hablar en español, llame al ${phone} y diga que necesita ayuda en español para su techo. El objetivo es que la inspección, las fotos y la recomendacion sean faciles de entender antes de firmar cualquier trabajo.</div><div class="service-grid es">${cityServiceLinks(city)}</div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Contexto Local</div><h2 class="section-title">Barrios y comunidades que importan.</h2><p class="section-lede">Esta página conecta búsquedas en español con información local de ${escapeHtml(city.name)} y comunidades cercanas.</p><div class="content-columns"><article class="content-box"><h3>Areas cercanas</h3><ul>${city.neighborhoods.map((name) => `<li>${escapeHtml(name)}</li>`).join('')}</ul></article><article class="content-box"><h3>Que revisa SMI</h3><p>Tejas, cumbreras, valles, ventilas, canaletas, tapajuntas, penetraciones, manchas interiores, evidencia de granizo, daño por viento y señales de filtracion.</p></article></div></div></section>
<section class="section dark"><div class="container"><div class="eyebrow">Siguiente Paso</div><h2 class="section-title">No necesita saber exactamente que servicio pedir.</h2><p class="section-lede">Si ve una gotera, daño por tormenta, tejas faltantes, granulos en las canaletas o una carta del seguro, empiece con una inspección. SMI puede mostrar fotos, explicar lo que aparece en el techo y recomendar la ruta correcta.</p><div class="source-path"><a href="/es/${city.slug}/reparacion-de-techo/">Reparación de techo</a><a href="/es/${city.slug}/danos-por-tormenta/">Daños por tormenta</a><a href="/es/${city.slug}/reclamos-de-seguro/">Reclamos de seguro</a><a href="/es/${city.slug}/techos-residenciales/">Techos residenciales</a></div></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">Preguntas</div><h2 class="section-title">Preguntas frecuentes en ${escapeHtml(city.name)}.</h2><div class="faq-list">${faqHtml(city)}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>¿Necesita revisar su techo en ${escapeHtml(city.name)}?</h2><p>Llame a SMI Roofing o pida una inspección gratis. Revisamos el techo, tomamos fotos y explicamos la siguiente opcion en palabras claras.</p></div><a href="${bookingUrl}" class="btn btn-primary">Pedir inspección gratis</a></div></div></section>
</main>
${footer(city)}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});(function(){var v=document.querySelector('.hero-bg video');if(v){v.addEventListener('playing',function(){v.style.opacity='1'},{once:true});}})();</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Acciones rapidas moviles"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Llamar a SMI Roofing">Llamar</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Pedir inspección gratis">Cita</a></nav>
</body>
</html>
`;
}

function servicePage(city, service) {
  const pageUrl = `${siteUrl}/es/${city.slug}/${service.slug}/`;
  const title = `${service.h1} en ${city.name}, TX | SMI Roofing en Español`;
  const description = `${service.h1} en español para ${city.name}, Texas. ${service.summary}. Inspección gratis con SMI Roofing.`;
  return `<!DOCTYPE html>
<html lang="es-US">
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
<meta name="geo.placename" content="${escapeHtml(city.name)}, ${escapeHtml(city.stateName)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema(city))}
${schemaScript(faqSchema(city, service))}
${schemaScript(breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Español', path: '/es/' }, { name: city.name, path: `/es/${city.slug}/` }, { name: service.label, path: `/es/${city.slug}/${service.slug}/` }]))}
${schemaScript({ '@context': 'https://schema.org', '@type': 'Service', serviceType: service.label, provider: { '@id': `${siteUrl}/#organization` }, areaServed: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: city.stateName } }, description })}
${pixelCode}
</head>
<body>
${nav()}
<main>
<section class="hero"><div class="hero-bg"><img src="/assets/smi-storm-roof-inspection.jpg" alt="Inspección de techo de SMI Roofing"></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/es/">Español</a><span>/</span><a href="/es/${city.slug}/">${escapeHtml(city.name)}</a><span>/</span><span>${escapeHtml(service.label)}</span></div><div class="hero-kicker"><span></span> Servicio en Español</div><h1>${escapeHtml(service.h1)} en <strong>${escapeHtml(city.name)}, Texas</strong></h1><p>SMI Roofing ayuda con ${escapeHtml(service.summary)} en ${escapeHtml(city.region)}. La inspección empieza con fotos y una explicacion clara para que usted pueda decidir sin presion.</p><div class="hero-actions"><a class="btn btn-primary" href="${bookingUrl}">Pedir Inspección Gratis</a><a class="btn btn-secondary" href="${phoneHref}">Llamar ${phone}</a><a class="btn btn-secondary" href="${service.englishUrl}">English Service Page</a></div><div class="proof"><div><b>Gratis</b><span>Inspección</span></div><div><b>Foto</b><span>Documentación</span></div><div><b>TX</b><span>${escapeHtml(city.county)}</span></div><div><b>5.0</b><span>Rated service</span></div></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Servicio Local</div><h2 class="section-title">Cuando pedir ${escapeHtml(service.titleLead)}.</h2><p class="section-lede">${escapeHtml(service.intent)}</p><div class="content-columns"><article class="content-box"><h3>Señales comunes</h3><ul>${service.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article><article class="content-box"><h3>Como trabaja SMI</h3><p>Primero revisamos el techo, documentamos condiciones visibles, explicamos opciones y damos una recomendacion clara. Si hay seguro involucrado, SMI puede organizar fotos y notas para la conversación del reclamo.</p></article></div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Contexto de ${escapeHtml(city.name)}</div><h2 class="section-title">El clima local cambia la decisión.</h2><p class="section-lede">En ${escapeHtml(city.name)}, los techos pueden sufrir por ${escapeHtml(city.weather)}. Por eso una página en español no debe ser una simple traduccion: debe explicar los sintomas, el proceso y el siguiente paso con contexto local.</p><div class="service-grid es">${services.filter((item) => item.slug !== service.slug).map((item) => `<a class="service-card" href="/es/${city.slug}/${item.slug}/"><span>Tambien util</span><h2>${escapeHtml(item.label)}</h2><p>${escapeHtml(item.summary)}.</p></a>`).join('')}<a class="service-card" href="/es/${city.slug}/"><span>Ciudad</span><h2>${escapeHtml(city.name)}</h2><p>Volver al hub principal en español para ${escapeHtml(city.name)}.</p></a></div></div></section>
<section class="section dark"><div class="container"><div class="eyebrow">Seguro y Alcance</div><h2 class="section-title">Documentación clara antes de decidir.</h2><p class="section-lede">SMI puede documentar lo que se ve en el techo y explicar el alcance de techado. SMI no promete aprobaciones de seguro, no decide cobertura y no actua como ajustador público.</p><div class="language-note">Guarde fechas, fotos, recibos de reparaciones temporales, numero de reclamo y notas de inspección. Esa información ayuda si el ajustador pide detalles o si faltan partidas en el alcance.</div></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">Preguntas</div><h2 class="section-title">Preguntas sobre ${escapeHtml(service.titleLead)} en ${escapeHtml(city.name)}.</h2><div class="faq-list">${faqHtml(city, service)}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>¿Necesita ${escapeHtml(service.titleLead)} en ${escapeHtml(city.name)}?</h2><p>Llame a SMI Roofing o pida una inspección gratis. Revisamos el techo, tomamos fotos y explicamos las opciones en español claro.</p></div><a href="${bookingUrl}" class="btn btn-primary">Pedir inspección gratis</a></div></div></section>
</main>
${footer(city)}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Acciones rapidas moviles"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Llamar a SMI Roofing">Llamar</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Pedir inspección gratis">Cita</a></nav>
</body>
</html>
`;
}

function indexPage() {
  const pageUrl = `${siteUrl}/es/`;
  const title = 'SMI Roofing en Español | Texas Roofing Pages';
  const description = 'Páginas en español para techado en Texas: DFW, Fort Worth, Houston y San Antonio. Reparación, tormenta, reclamos de seguro e inspecciones gratis.';
  return `<!DOCTYPE html>
<html lang="es-US">
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
<link rel="canonical" href="${pageUrl}">
<meta name="geo.region" content="US-TX">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
${style}
${schemaScript(orgSchema())}
${schemaScript(indexFaqSchema())}
${schemaScript(breadcrumbSchema([{ name: 'Inicio', path: '/' }, { name: 'Español', path: '/es/' }]))}
${pixelCode}
</head>
<body>
${nav()}
<main>
<section class="hero"><div class="hero-bg"><img src="/assets/smi-roofing-project-aerial.jpg" alt="Proyecto de techo de SMI Roofing"></div><div class="container hero-inner"><div class="breadcrumb"><a href="/">Home</a><span>/</span><span>Español</span></div><div class="hero-kicker"><span></span> SMI Roofing en Español</div><h1>Páginas de techado en <strong>español para Texas</strong></h1><p>Empiece aqui si busca reparación de techo, daños por tormenta, ayuda con reclamos de seguro, techos residenciales o una inspección gratis en DFW, Fort Worth, Houston o San Antonio.</p><div class="hero-actions"><a class="btn btn-primary" href="${bookingUrl}">Pedir Inspección Gratis</a><a class="btn btn-secondary" href="${phoneHref}">Llamar ${phone}</a><a class="btn btn-secondary" href="/areas-we-serve/">English Areas</a></div></div></section>
<section class="section white"><div class="container"><div class="eyebrow">Ciudades en Texas</div><h2 class="section-title">Elija su ciudad.</h2><p class="section-lede">Este primer grupo apunta a mercados de Texas con alta intención de busqueda en español y páginas locales existentes en el sitio.</p><div class="service-grid es">${cityLinksGrid()}</div></div></section>
<section class="section"><div class="container"><div class="eyebrow">Servicios de Alta Intencion</div><h2 class="section-title">Lo que la gente busca cuando necesita ayuda ahora.</h2><div class="content-columns"><article class="content-box"><h3>Servicios incluidos</h3><ul>${services.map((service) => `<li>${escapeHtml(service.label)}</li>`).join('')}</ul></article><article class="content-box"><h3>Por que en español</h3><p>Muchas búsquedas de techado se hacen cuando hay una gotera, una tormenta reciente o una pregunta de seguro. Una página clara en español reduce fricción y ayuda a convertir llamadas que los competidores no están atendiendo.</p></article></div></div></section>
<section class="section white" id="faq"><div class="container"><div class="eyebrow">Preguntas</div><h2 class="section-title">Preguntas sobre SMI Roofing en español.</h2><div class="faq-list">${indexFaqHtml()}</div></div></section>
<section class="cta"><div class="container"><div class="cta-wrap"><div><h2>¿Prefiere ayuda en español?</h2><p>Llame a SMI Roofing o pida una inspección gratis. Diga que necesita ayuda en español y el equipo le guiara con el siguiente paso.</p></div><a href="${bookingUrl}" class="btn btn-primary">Pedir inspección gratis</a></div></div></section>
</main>
${footer()}
<script>function toggleMenu(){document.getElementById('mobileMenu').classList.toggle('open')}function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}document.querySelectorAll('.faq-question').forEach(btn=>{btn.addEventListener('click',()=>{btn.parentElement.classList.toggle('open')})});</script>
<script src="/assets/instant-inspection-widget.js" defer></script>
<nav class="mobile-sticky-cta" aria-label="Acciones rapidas moviles"><a class="mobile-sticky-cta-call" href="${phoneHref}" aria-label="Llamar a SMI Roofing">Llamar</a><a class="mobile-sticky-cta-quote" href="${bookingUrl}" aria-label="Pedir inspección gratis">Cita</a></nav>
</body>
</html>
`;
}

function addSpanishSectionToAreas() {
  const file = join(root, 'areas-we-serve', 'index.html');
  let html = readFileSync(file, 'utf8');
  html = html.replace(/\n<section class="content-section service-city-section" data-m031-spanish-texas-pages>[\s\S]*?<\/section>\n/, '\n');
  const links = cities.map((city) => `<a href="/es/${city.slug}/" class="area-card"><span class="area-card-name">Techos en español en ${escapeHtml(city.name)}, ${city.stateCode}</span><span class="area-card-arrow">→</span></a>`).join('\n');
  const section = `<section class="content-section service-city-section" data-m031-spanish-texas-pages>
<div class="container">
<div class="section-tag">Spanish Roofing Pages</div>
<h2 class="section-title">Texas Roofing Pages <span class="text-cyan">in Spanish</span></h2>
<p class="service-city-intro">Spanish-language city and service pages help homeowners in Texas find roof repair, storm damage, insurance claim help, and residential roofing without translation friction.</p>
<div class="areas-grid">
<a href="/es/" class="area-card"><span class="area-card-name">SMI Roofing en Español</span><span class="area-card-arrow">→</span></a>
${links}
</div>
</div>
</section>
`;
  if (html.includes('<section class="content-section service-city-section" data-service-city-links=')) {
    html = html.replace(/\n<section class="content-section service-city-section" data-service-city-links=/, `\n${section}\n<section class="content-section service-city-section" data-service-city-links=`);
  } else {
    html = html.replace(/\n<section class="cta-section">/, `\n${section}\n<section class="cta-section">`);
  }
  writeFileSync(file, html);
}

function updateSitemap() {
  const sitemapPath = join(root, 'sitemap.xml');
  let sitemap = readFileSync(sitemapPath, 'utf8');
  const pages = ['/es/'];
  for (const city of cities) {
    pages.push(`/es/${city.slug}/`);
    for (const service of services) {
      pages.push(`/es/${city.slug}/${service.slug}/`);
    }
  }
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/site-map\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/site-map/</loc>\n    <lastmod>${today}</lastmod>`);
  sitemap = sitemap.replace(/<loc>https:\/\/smiroof\.com\/areas-we-serve\/<\/loc>\s*<lastmod>[^<]+<\/lastmod>/, `<loc>https://smiroof.com/areas-we-serve/</loc>\n    <lastmod>${today}</lastmod>`);
  sitemap = sitemap.replace(/\s*<url>\s*<loc>https:\/\/smiroof\.com\/es\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
  for (const path of pages) {
    const loc = `${siteUrl}${path}`;
    const existing = new RegExp(`\\s*<url>\\s*<loc>${loc.replace(/\//g, '\\/')}<\\/loc>[\\s\\S]*?<\\/url>`, 'g');
    sitemap = sitemap.replace(existing, '');
    const priority = path === '/es/' ? '0.68' : path.split('/').filter(Boolean).length === 2 ? '0.72' : '0.70';
    const block = `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>
`;
    sitemap = sitemap.replace('</urlset>', `${block}</urlset>`);
  }
  writeFileSync(sitemapPath, sitemap);
}

mkdirSync(join(root, 'es'), { recursive: true });
writeFileSync(join(root, 'es', 'index.html'), indexPage());

for (const city of cities) {
  const cityDir = join(root, 'es', city.slug);
  mkdirSync(cityDir, { recursive: true });
  writeFileSync(join(cityDir, 'index.html'), cityPage(city));
  for (const service of services) {
    const serviceDir = join(cityDir, service.slug);
    mkdirSync(serviceDir, { recursive: true });
    writeFileSync(join(serviceDir, 'index.html'), servicePage(city, service));
  }
}

addSpanishSectionToAreas();
updateSitemap();

console.log(`Generated ${1 + cities.length + cities.length * services.length} Spanish Texas pages.`);
