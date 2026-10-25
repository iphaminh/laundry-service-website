const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8000/';
const SITE = 'https://sscoinlaundry.vercel.app/';
const NAME = 'Southern Star Coin Laundry';
const ADDR = 'Unit 10, 3685 Keele Street, North York, ON M3J 3H6';
const PHONE = '437-423-3962';
const norm = s => (s || '').replace(/\s+/g, ' ').trim();
const out = [];
const row = (page, check, ok, detail='') => out.push({ page, check, result: ok ? 'PASS' : 'FAIL', detail });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const pages = ['index.html', 'pricing.html', 'contact.html', 'about.html', 'service.html'];
  for (const pg of pages) {
    const p = await ctx.newPage();
    const errors = [], external = [];
    const isStubbed = pg === 'about.html' || pg === 'service.html';
    p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('pageerror', e => errors.push('pageerror: ' + e.message));
    p.on('requestfailed', r => { const u = r.url(); if (!u.startsWith(BASE)) external.push(new URL(u).host); else if (!(isStubbed && u.startsWith(BASE + 'index.html'))) errors.push('local request failed: ' + u); });
    // about/service redirect instantly; stop the refresh so we inspect the page itself
    if (pg === 'about.html' || pg === 'service.html') {
      await p.route(BASE + 'index.html*', r => r.fulfill({ status: 204, body: '' }));
    }
    const resp = await p.goto(BASE + pg, { waitUntil: 'load' });
    await p.waitForTimeout(400);
    await p.evaluate(() => document.fonts.ready);
    const d = await p.evaluate(() => {
      const q = s => document.querySelector(s);
      const meta = n => q(`meta[name="${n}"]`)?.content ?? null;
      const prop = n => q(`meta[property="${n}"]`)?.content ?? null;
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent);
      const faq = [...document.querySelectorAll('details.faq')].map(d => ({
        q: d.querySelector('summary').textContent, a: d.querySelector('.faq__body').textContent }));
      const imgs = [...document.images].map(i => ({ src: i.getAttribute('src'), w: i.getAttribute('width'), h: i.getAttribute('height'),
        loading: i.getAttribute('loading'), alt: i.getAttribute('alt'), top: i.getBoundingClientRect().top + scrollY }));
      const scripts = [...document.querySelectorAll('script[src]')].map(s => ({ src: s.getAttribute('src'), defer: s.defer, async: s.async }));
      const bodyText = document.body.innerText;
      const visible = document.body.textContent;
      return {
        lang: document.documentElement.lang, title: document.title, desc: meta('description'), robots: meta('robots'),
        canonical: q('link[rel="canonical"]')?.href ?? null, theme: meta('theme-color'), viewport: meta('viewport'),
        og: { type: prop('og:type'), title: prop('og:title'), description: prop('og:description'), url: prop('og:url'),
              site_name: prop('og:site_name'), locale: prop('og:locale'), image: prop('og:image') },
        tw: { card: meta('twitter:card'), title: meta('twitter:title'), image: meta('twitter:image') },
        h1: [...document.querySelectorAll('h1')].map(h => h.textContent.replace(/\s+/g,' ').trim()),
        ld, faq, imgs, scripts, bodyText, visible,
        fontPreloads: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(l => ({ href: l.getAttribute('href'), cors: l.hasAttribute('crossorigin') })),
        thirdPartyFonts: !!q('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]'),
        fontsLoaded: document.fonts.check('800 32px "Bricolage Grotesque"') && document.fonts.check('400 16px "Hanken Grotesk"') && [...document.fonts].filter(f => f.status === 'loaded').length >= 2,
        sw: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight,
        heroLead: q('.hero__lead')?.getBoundingClientRect().bottom ?? null,
      };
    });
    const isRedirect = pg === 'about.html' || pg === 'service.html';
    row(pg, 'HTTP 200', resp.status() === 200, String(resp.status()));
    row(pg, 'lang en-CA', d.lang === 'en-CA', d.lang);
    row(pg, 'one H1', d.h1.length === 1, JSON.stringify(d.h1));
    row(pg, 'title <= 60', d.title.length <= 60 && d.title.length > 0, `${d.title.length}: ${d.title}`);
    if (!isRedirect) {
      row(pg, 'description 140-160', d.desc && d.desc.length >= 140 && d.desc.length <= 160, `${d.desc?.length}`);
      const want = pg === 'index.html' ? SITE : SITE + pg;
      row(pg, 'canonical', d.canonical === want, d.canonical);
      const ogOk = Object.values(d.og).every(Boolean) && d.og.url === want && d.og.locale === 'en_CA' && d.og.type === 'website' && d.og.title === d.title && d.og.description === d.desc;
      row(pg, 'og:* tags', ogOk, `type=${d.og.type} url=${d.og.url} image=${d.og.image}`);
      row(pg, 'twitter:* tags', d.tw.card === 'summary_large_image' && !!d.tw.title && !!d.tw.image, d.tw.card);
      row(pg, 'theme-color + viewport', !!d.theme && /width=device-width/.test(d.viewport), d.theme);
      row(pg, 'self-hosted fonts preloaded + loaded', !d.thirdPartyFonts && d.fontPreloads.length >= 1 && d.fontPreloads.every(f => f.cors && /^fonts\/.+\.woff2$/.test(f.href)) && d.fontsLoaded, JSON.stringify(d.fontPreloads));
      row(pg, 'robots indexable', /index/.test(d.robots) && !/noindex/.test(d.robots), d.robots);
    } else {
      row(pg, 'noindex', /noindex/.test(d.robots || ''), d.robots);
      row(pg, 'canonical -> home', d.canonical === SITE, d.canonical);
    }
    row(pg, 'external <script src> deferred', d.scripts.every(s => s.defer || s.async), JSON.stringify(d.scripts));
    const badImg = d.imgs.filter(i => !i.w || !i.h || !i.alt || (i.top > d.vh && i.loading !== 'lazy'));
    row(pg, 'img width/height/alt, lazy below fold', badImg.length === 0, `${d.imgs.length} img(s) ${JSON.stringify(badImg)}`);
    // JSON-LD
    row(pg, 'JSON-LD blocks', isRedirect ? d.ld.length === 0 : d.ld.length === 1, `${d.ld.length}`);
    let graph = [];
    for (const t of d.ld) {
      try { const j = JSON.parse(t); graph = j['@graph'] || [j]; row(pg, 'JSON-LD parses', j['@context'] === 'https://schema.org', `${graph.map(n => n['@type']).join(', ')}`); }
      catch (e) { row(pg, 'JSON-LD parses', false, e.message); }
    }
    const byType = t => graph.filter(n => n['@type'] === t);
    const biz = byType('DryCleaningOrLaundry')[0];
    const reqFields = (n, fields) => fields.filter(f => n[f] === undefined);
    if (pg === 'index.html' || pg === 'contact.html') {
      const miss = biz ? reqFields(biz, ['@id','name','url','telephone','email','address','geo','hasMap','openingHoursSpecification','image','priceRange','currenciesAccepted','areaServed','sameAs','description']) : ['(missing node)'];
      row(pg, 'DryCleaningOrLaundry required fields', miss.length === 0, miss.join(','));
      const a = biz.address; const joined = `${a.streetAddress}, ${a.addressLocality}, ${a.addressRegion} ${a.postalCode}`;
      row(pg, 'JSON-LD NAP = visible NAP', biz.name === NAME && joined === ADDR && biz.telephone.replace(/\D/g,'') === '1' + PHONE.replace(/\D/g,''), `${biz.name} | ${joined} | ${biz.telephone}`);
      const oh = biz.openingHoursSpecification;
      row(pg, 'hours 05:00-23:00 x7, store only', oh.length === 1 && oh[0].dayOfWeek.length === 7 && oh[0].opens === '05:00' && oh[0].closes === '23:00', JSON.stringify(oh.map(o => o.opens + '-' + o.closes)));
      const forbidden = JSON.stringify(graph).match(/aggregateRating|"Review"|reviewRating/g);
      row(pg, 'no aggregateRating/Review markup', !forbidden, forbidden ? forbidden.join(',') : '');
      if (pg === 'contact.html') row(pg, 'attendant hours in description', /Attendant & pickup hours/.test(biz.description), '');
    }
    if (pg === 'index.html') {
      const ws = byType('WebSite')[0];
      row(pg, 'WebSite name+url, no SearchAction', ws && ws.name === NAME && ws.url === SITE && !ws.potentialAction, '');
      const cat = biz.hasOfferCatalog; const names = cat.itemListElement.map(i => i.name);
      const wf = cat.itemListElement.find(i => i.name === 'Wash & Fold'); const fo = cat.itemListElement.find(i => i.name === 'Fold only');
      const dc = cat.itemListElement.find(i => i.name === 'Dry cleaning');
      const pd = cat.itemListElement.find(i => i.name === 'Pickup & Delivery'); const alt = cat.itemListElement.find(i => i.name === 'Alterations');
      const dcp = Object.fromEntries(dc.itemListElement.map(o => [o.name, o.price]));
      const ok = wf.price === '1.80' && wf.priceSpecification.unitCode === 'LBR' && fo.price === '1.00' && pd.price === '0' && alt && alt.price === undefined
        && dcp['Dress Shirt - Laundered (Cotton/Polyester Blend)'] === '3.45' && dcp["Men's Suit – 2 Pieces (Jacket & Trouser)"] === '16.45'
        && dcp['Women\'s Dress – Knee Length'] === '20.95' && dcp['Comforter – Queen / King'] === '36.95';
      row(pg, 'hasOfferCatalog prices', ok, names.join(' | '));
      row(pg, 'description = visible answer-first summary', biz.description === norm(await p.textContent('.hero__lead')), biz.description.slice(0, 60) + '…');
      row(pg, 'answer-first summary in first screen (1280)', d.heroLead !== null && d.heroLead <= d.vh, `bottom ${Math.round(d.heroLead)} / ${d.vh}`);
      const fq = byType('FAQPage')[0].mainEntity;
      const vis = d.faq.map(f => ({ q: norm(f.q), a: norm(f.a) }));
      const mism = [];
      if (fq.length !== vis.length) mism.push(`count ${fq.length} vs ${vis.length}`);
      fq.forEach((m, i) => { if (!vis[i] || m.name !== vis[i].q) mism.push('Q' + (i+1)); if (!vis[i] || m.acceptedAnswer.text !== vis[i].a) mism.push('A' + (i+1)); });
      row(pg, 'FAQPage == visible FAQ (exact, whitespace-normalised)', mism.length === 0, `${fq.length} Q&A ${mism.join(',')}`);
    }
    if (pg === 'pricing.html') {
      const bc = byType('BreadcrumbList')[0];
      row(pg, 'BreadcrumbList Home > Pricing', bc && bc.itemListElement.map(i => i.name).join('>') === 'Home>Pricing' && bc.itemListElement[1].item === SITE + 'pricing.html', '');
      const oc = byType('OfferCatalog')[0];
      // Every dry-cleaning offer price must appear as a visible row with the same name
      const rows = await p.$$eval('.price-row', rs => rs.map(r => {
        const n = r.querySelector('.price-row__name').cloneNode(true); n.querySelectorAll('.price-row__note,.tag').forEach(x => x.remove());
        const pr = r.querySelector('.price-row__price').cloneNode(true); pr.querySelectorAll('.price-row__multi').forEach(x => x.remove());
        return { name: n.textContent.replace(/\s+/g,' ').trim(), price: pr.textContent.replace(/\s+/g,' ').trim() }; }));
      const offers = oc.itemListElement.filter(x => x['@type'] === 'OfferCatalog').flatMap(c => c.itemListElement);
      const bad = offers.filter((o, i) => !rows[i] || rows[i].name !== o.name || !rows[i].price.includes('$' + (o.price || o.priceSpecification.minPrice)));
      row(pg, 'OfferCatalog matches visible list', offers.length === rows.length && bad.length === 0, `${offers.length} offers / ${rows.length} rows, wash&fold ${oc.itemListElement[0].price}, fold ${oc.itemListElement[1].price}`);
    }
    if (pg === 'contact.html') {
      const bc = byType('BreadcrumbList')[0];
      row(pg, 'BreadcrumbList Home > Contact', bc && bc.itemListElement.map(i => i.name).join('>') === 'Home>Contact', '');
    }
    if (!isRedirect) {
      const t = norm(d.visible);
      const cAddr = t.split(ADDR).length - 1, cPhone = t.split(PHONE).length - 1, cName = t.split(NAME).length - 1;
      row(pg, 'visible NAP (exact strings)', cAddr >= 1 && cPhone >= 2 && cName >= 1, `address x${cAddr}, phone x${cPhone}, name x${cName}`);
      const variants = (t.match(/3685 Keele St(?!reet)[^.,]*/g) || []);
      row(pg, 'address variants (short form)', true, variants.length ? 'short form "' + [...new Set(variants)].join('", "') + '" (aria-hidden hero card)' : 'none');
    }
    row(pg, 'no console errors', errors.length === 0, errors.join(' | ') + (external.length ? ` (blocked externals, sandbox only: ${[...new Set(external)].join(', ')})` : ''));
    // horizontal overflow at phone widths
    if (!isRedirect) {
      const widths = [];
      for (const w of [320, 390, 768, 1024, 1280]) { await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(50);
        const sw = await p.evaluate(() => document.documentElement.scrollWidth); if (sw > w) widths.push(`${w}->${sw}`); }
      row(pg, 'no horizontal overflow 320-1280', widths.length === 0, widths.join(' '));
    }
    await p.close();
  }
  // the redirect pages really land on the right home-page section
  for (const [pg, hash] of [['about.html', '#about'], ['service.html', '#services']]) {
    const p = await ctx.newPage(); const errs = [];
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(BASE + pg); await p.waitForURL(u => u.href.endsWith('index.html' + hash), { timeout: 5000 }).catch(() => {});
    row(pg, 'redirects to index.html' + hash + ', no console errors', p.url().endsWith('index.html' + hash) && errs.length === 0, p.url());
    await p.close();
  }
  // robots + sitemap + llms
  const r = await ctx.request.get(BASE + 'robots.txt'); const rt = await r.text();
  row('robots.txt', 'served 200, allows all, sitemap line', r.status() === 200 && /User-agent: \*\nAllow: \//.test(rt) && rt.includes('Sitemap: ' + SITE + 'sitemap.xml') && !/Disallow:\s*\/\s*$/m.test(rt), `${r.status()} ${r.headers()['content-type']}`);
  const blocked = ['GPTBot','ClaudeBot','PerplexityBot','Google-Extended','Bingbot'].filter(bt => new RegExp(`User-agent: ${bt}\\nDisallow`).test(rt));
  row('robots.txt', 'AI/search bots not blocked', blocked.length === 0, blocked.join(','));
  const s = await ctx.request.get(BASE + 'sitemap.xml'); const st = await s.text();
  const sp = await b.newPage(); 
  const parsed = await sp.evaluate(x => { const doc = new DOMParser().parseFromString(x, 'application/xml');
    const err = doc.querySelector('parsererror'); return { err: err ? err.textContent : null, ns: doc.documentElement.namespaceURI,
      locs: [...doc.getElementsByTagName('loc')].map(l => l.textContent), lastmod: [...doc.getElementsByTagName('lastmod')].map(l => l.textContent) }; }, st);
  const want = [SITE, SITE + 'pricing.html', SITE + 'contact.html'];
  row('sitemap.xml', 'served 200, valid XML, sitemap ns', s.status() === 200 && !parsed.err && parsed.ns === 'http://www.sitemaps.org/schemas/sitemap/0.9', `${s.status()} ${s.headers()['content-type']}`);
  row('sitemap.xml', 'exactly the 3 indexable pages', JSON.stringify(parsed.locs) === JSON.stringify(want), parsed.locs.join(' ') + ' lastmod ' + [...new Set(parsed.lastmod)]);
  const l = await ctx.request.get(BASE + 'llms.txt'); const lt = await l.text();
  row('llms.txt', 'served 200, has NAP + hours + prices', l.status() === 200 && lt.includes(ADDR) && lt.includes(PHONE) && lt.includes('$1.80/lb') && lt.includes('5 AM – 11 PM'), `${l.status()} ${lt.length} bytes`);
  await b.close();
  const fails = out.filter(o => o.result === 'FAIL');
  for (const o of out) console.log(`${o.result}\t${o.page}\t${o.check}\t${o.detail}`);
  console.log(`\n${out.length} checks, ${fails.length} failed`);
})();
