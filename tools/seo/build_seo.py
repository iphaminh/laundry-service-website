"""Rebuild SEO head tags, JSON-LD, robots.txt, sitemap.xml and llms.txt from the page content."""
import html, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # repo root
SITE = 'https://sscoinlaundry.vercel.app/'
MAPS = 'https://maps.app.goo.gl/hLKiNmSBhVdrMN4HA'
NAME = 'Southern Star Coin Laundry'
OG_IMAGE = SITE + 'img/og-cover.jpg'  # 1200×630
OG_ALT = 'Laundry tumbling behind the glass door of a front-load washer'

def text(fragment):
    """Visible text of an HTML fragment: drop tags, decode entities, collapse whitespace (incl. nbsp)."""
    t = re.sub(r'<svg\b.*?</svg>', '', fragment, flags=re.S)
    t = re.sub(r'<[^>]+>', '', t)
    t = html.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()

def read(name): return (ROOT / name).read_text(encoding='utf-8')
def write(name, s): (ROOT / name).write_text(s, encoding='utf-8')

PAGES = {
    'index.html': dict(
        url=SITE,
        title='Coin Laundry in North York | Southern Star Coin Laundry',
        desc='Coin laundry & dry cleaner at 3685 Keele Street, North York. Open daily 5 AM–11 PM. Wash & fold $1.80/lb, ready in 1 day. Free delivery within 2 km (20 lbs+).'),
    'pricing.html': dict(
        url=SITE + 'pricing.html',
        title='Laundry & Dry Cleaning Prices | Southern Star Coin Laundry',
        desc='Wash & fold $1.80/lb, fold only $1.00/lb (min. 10 lbs) and dry cleaning from $3.45 per item at Southern Star Coin Laundry, North York. HST applies.'),
    'contact.html': dict(
        url=SITE + 'contact.html',
        title='Hours, Directions & Pickup | Southern Star Coin Laundry',
        desc='Southern Star Coin Laundry, Unit 10, 3685 Keele Street, North York. Open daily 5 AM–11 PM. Attendant hours, directions and pickup requests: 437-423-3962.'),
}

# ---------- facts pulled from the pages themselves ----------
index = read('index.html')
pricing = read('pricing.html')

summary = text(re.search(r'<p class="hero__lead">(.*?)</p>', index, re.S).group(1))

faqs = []
for m in re.finditer(r'<details class="faq">\s*<summary>(.*?)</summary>\s*<div class="faq__body">(.*?)</div>\s*</details>', index, re.S):
    faqs.append((text(m.group(1)), text(m.group(2))))
assert len(faqs) >= 8, len(faqs)

panels = []
for m in re.finditer(r'<section class="tabs__panel"[^>]*>\s*<h3 class="tabs__panel-title">(.*?)</h3>(.*?)</section>', pricing, re.S):
    title, body = text(m.group(1)), m.group(2)
    group = None
    items = []
    for li in re.finditer(r'<li class="(price-list__group|price-row[^"]*)">(.*?)</li>', body, re.S):
        cls, inner = li.group(1), li.group(2)
        if cls == 'price-list__group':
            group = text(inner); continue
        name_html = re.search(r'<span class="price-row__name">(.*)</span><span class="price-row__price">', inner, re.S).group(1)
        note = re.search(r'<span class="price-row__note">(.*?)</span></span>', name_html, re.S)
        note = text(note.group(1)) if note else ''
        special = 'class="tag"' in name_html
        name = re.sub(r'<span class="price-row__note">.*', '', name_html, flags=re.S)
        name = re.sub(r'<span class="tag">.*?</span>', '', name, flags=re.S)
        name = text(name)
        price_html = re.search(r'<span class="price-row__price">(.*)</span>$', inner.strip(), re.S).group(1)
        multi = re.search(r'<span class="price-row__multi">(.*?)</span>', price_html)
        multi = text(multi.group(1)) if multi else ''
        price = text(re.sub(r'<span class="price-row__multi">.*?</span>', '', price_html))
        items.append(dict(cat=title, group=group, name=name, note=note, multi=multi, price=price, special=special))
    panels.append((title, items))
all_items = [i for _, its in panels for i in its]
assert len(panels) == 5 and len(all_items) > 40, (len(panels), len(all_items))

def offer(i):
    o = {'@type': 'Offer', 'name': i['name'], 'category': i['cat'] + (' – ' + i['group'] if i['group'] else ''),
         'priceCurrency': 'CAD', 'validFrom': '2026-06-01'}
    m1 = re.fullmatch(r'\$(\d+\.\d\d) each', i['price'])
    m2 = re.fullmatch(r'\$(\d+\.\d\d) / 2pcs', i['price'])
    m3 = re.fullmatch(r'\$(\d+\.\d\d) / \$(\d+\.\d\d)', i['price'])
    extra = []
    if m1: o['price'] = m1.group(1)
    elif m2: o['price'] = m2.group(1); extra.append(i['price'])
    elif m3:
        o['priceSpecification'] = {'@type': 'PriceSpecification', 'minPrice': m3.group(1), 'maxPrice': m3.group(2),
                                   'priceCurrency': 'CAD', 'valueAddedTaxIncluded': False}
        extra.append(i['price'])
    else: sys.exit('unparsed price ' + i['price'])
    if 'price' in o:
        o['priceSpecification'] = {'@type': 'UnitPriceSpecification', 'price': o['price'], 'priceCurrency': 'CAD',
                                   'valueAddedTaxIncluded': False}
    extra += [x for x in (i['multi'], i['note']) if x]
    if extra: o['description'] = ' · '.join(extra)
    o['itemOffered'] = {'@type': 'Service', 'name': 'Dry cleaning: ' + i['name']}
    return o

def find(name):
    hits = [i for i in all_items if i['name'] == name]
    assert len(hits) == 1, name
    return hits[0]

REP = [('Dress Shirt - Laundered (Cotton/Polyester Blend)', '3.45'),
       ("Men's Suit – 2 Pieces (Jacket & Trouser)", '16.45'),
       ('Women\'s Dress – Knee Length', '20.95'),
       ('Comforter – Queen / King', '36.95')]
rep_offers = []
for n, p in REP:
    o = offer(find(n)); assert o['price'] == p, (n, o['price']); rep_offers.append(o)

def per_lb(name, price, desc):
    return {'@type': 'Offer', 'name': name, 'description': desc, 'price': price, 'priceCurrency': 'CAD',
            'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': price, 'priceCurrency': 'CAD',
                                   'unitCode': 'LBR', 'unitText': 'lb', 'valueAddedTaxIncluded': False},
            'itemOffered': {'@type': 'Service', 'name': name}}

def no_price(name, desc):
    return {'@type': 'Offer', 'name': name, 'description': desc, 'itemOffered': {'@type': 'Service', 'name': name}}

BIZ_ID = SITE + '#business'
ADDRESS = {'@type': 'PostalAddress', 'streetAddress': 'Unit 10, 3685 Keele Street', 'addressLocality': 'North York',
           'addressRegion': 'ON', 'postalCode': 'M3J 3H6', 'addressCountry': 'CA'}
HOURS = [{'@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'opens': '05:00', 'closes': '23:00'}]
ATTENDANT = ('Attendant & pickup hours (staff on site for wash & fold, dry cleaning and pickups): '
             'Mon, Wed, Thu and Fri 10 AM – 5 PM and 7 – 11 PM; Tue 7 – 11 PM; Sat 9 AM – 11 PM; '
             'Sun 10 AM – 11 PM. Holiday hours may differ.')

def business(description, catalog=True):
    b = {'@type': 'DryCleaningOrLaundry', '@id': BIZ_ID, 'name': NAME, 'description': description,
         'url': SITE, 'telephone': '+1-437-423-3962', 'email': 'southernstarcoinlaundry@gmail.com',
         'image': OG_IMAGE, 'priceRange': '$', 'currenciesAccepted': 'CAD', 'address': ADDRESS,
         'geo': {'@type': 'GeoCoordinates', 'latitude': 43.7545952, 'longitude': -79.4872762},
         'hasMap': MAPS, 'sameAs': [MAPS],
         'areaServed': [{'@type': 'City', 'name': 'North York'}, {'@type': 'City', 'name': 'Toronto'}],
         'openingHoursSpecification': HOURS,
         'amenityFeature': [
             {'@type': 'LocationFeatureSpecification', 'name': 'Self-serve coin-operated washers and dryers', 'value': True},
             {'@type': 'LocationFeatureSpecification', 'name': 'ATM on site', 'value': True}]}
    if catalog:
        b['hasOfferCatalog'] = {
            '@type': 'OfferCatalog', 'name': 'Laundry and dry cleaning services', 'url': SITE + 'pricing.html',
            'itemListElement': [
                per_lb('Wash & Fold', '1.80', 'Washed, dried and folded. Minimum 10 lbs. Ready in 1 day. Same-day fast service available as an add-on; ask for the price. HST applies.'),
                per_lb('Fold only', '1.00', 'Folding only, by the pound. Minimum 10 lbs. Ready in 1 day. HST applies.'),
                {'@type': 'OfferCatalog', 'name': 'Dry cleaning',
                 'description': 'Priced per item, from $3.45 for a laundered dress shirt. Effective Jun 01, 2026. HST applies to all prices.',
                 'url': SITE + 'pricing.html', 'itemListElement': rep_offers},
                {'@type': 'Offer', 'name': 'Pickup & Delivery', 'price': '0', 'priceCurrency': 'CAD',
                 'description': 'Free within 2 km of the store for orders of 20 lbs or more. Book by phone or email during attendant hours.',
                 'itemOffered': {'@type': 'Service', 'name': 'Pickup & Delivery'}},
                no_price('Alterations', 'Ask in store for pricing.'),
                no_price('Self-serve washers & dryers', 'Coin-operated washers and dryers, open every day 5 AM – 11 PM. Ask in store for machine prices.'),
            ]}
    return b

def crumbs(name, url):
    return {'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE},
        {'@type': 'ListItem', 'position': 2, 'name': name, 'item': url}]}

graphs = {
    'index.html': [
        {'@type': 'WebSite', '@id': SITE + '#website', 'name': NAME, 'url': SITE, 'inLanguage': 'en-CA',
         'publisher': {'@id': BIZ_ID}},
        business(summary),
        {'@type': 'FAQPage', '@id': SITE + '#faq', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]},
    ],
    'pricing.html': [
        crumbs('Pricing', SITE + 'pricing.html'),
        {'@type': 'DryCleaningOrLaundry', '@id': BIZ_ID, 'name': NAME, 'url': SITE, 'telephone': '+1-437-423-3962',
         'address': ADDRESS, 'priceRange': '$', 'image': OG_IMAGE,
         'hasOfferCatalog': {'@id': SITE + 'pricing.html#price-list'}},
        {'@type': 'OfferCatalog', '@id': SITE + 'pricing.html#price-list',
         'name': 'Southern Star Coin Laundry price list',
         'description': 'Wash & fold by the pound, dry cleaning by the item. Effective Jun 01, 2026. HST applies to all prices.',
         'url': SITE + 'pricing.html',
         'itemListElement': [
             per_lb('Wash & Fold', '1.80', 'Washed, dried and folded. Minimum 10 lbs. Ready in 1 day. Same-day fast service available as an add-on; ask for the price. HST applies.'),
             per_lb('Fold only', '1.00', 'Folding only, by the pound. Minimum 10 lbs. Ready in 1 day. HST applies.'),
         ] + [{'@type': 'OfferCatalog', 'name': 'Dry cleaning – ' + t, 'itemListElement': [offer(i) for i in its]}
              for t, its in panels]},
    ],
    'contact.html': [
        crumbs('Contact', SITE + 'contact.html'),
        business(summary + ' ' + ATTENDANT, catalog=False),
    ],
}

def head_block(page, cfg):
    e = lambda s: html.escape(s, quote=True)
    t, d, u = cfg['title'], cfg['desc'], cfg['url']
    return '\n'.join([
        f'<title>{e(t)}</title>',
        f'  <meta name="description" content="{e(d)}">',
        '  <meta name="robots" content="index, follow, max-image-preview:large">',
        f'  <link rel="canonical" href="{u}">',
        '  <meta name="theme-color" content="#F7F3EB">',
        '  <meta property="og:type" content="website">',
        f'  <meta property="og:site_name" content="{NAME}">',
        '  <meta property="og:locale" content="en_CA">',
        f'  <meta property="og:title" content="{e(t)}">',
        f'  <meta property="og:description" content="{e(d)}">',
        f'  <meta property="og:url" content="{u}">',
        f'  <meta property="og:image" content="{OG_IMAGE}">',
        '  <meta property="og:image:width" content="1200">',
        '  <meta property="og:image:height" content="630">',
        f'  <meta property="og:image:alt" content="{e(OG_ALT)}">',
        '  <meta name="twitter:card" content="summary_large_image">',
        f'  <meta name="twitter:title" content="{e(t)}">',
        f'  <meta name="twitter:description" content="{e(d)}">',
        f'  <meta name="twitter:image" content="{OG_IMAGE}">',
        f'  <meta name="twitter:image:alt" content="{e(OG_ALT)}">',
    ])

for page, cfg in PAGES.items():
    s = read(page)
    # Replace everything from <title> up to (not including) the favicon link.
    s, n = re.subn(r'<title>.*?(?=\n  <link rel="icon")', head_block(page, cfg), s, count=1, flags=re.S)
    assert n == 1, page
    # One JSON-LD script per page, right before </head>.
    s = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', s, flags=re.S)
    ld = json.dumps({'@context': 'https://schema.org', '@graph': graphs[page]}, ensure_ascii=False, indent=2)
    ld = ld.replace('</', '<\\/')
    s = s.replace('</head>', '  <script type="application/ld+json">\n' + ld + '\n  </script>\n</head>', 1)
    write(page, s)

# about/service: noindex redirect pages, canonical to the home page they redirect to.
for page in ('about.html', 'service.html'):
    s = read(page)
    if 'rel="canonical"' not in s:
        s = s.replace('<meta name="robots" content="noindex, follow">',
                      f'<meta name="robots" content="noindex, follow">\n  <link rel="canonical" href="{SITE}">', 1)
    write(page, s)

# ---------- robots.txt ----------
bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
        'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Googlebot', 'Bingbot', 'Applebot', 'Applebot-Extended']
robots = ['# Southern Star Coin Laundry: everything here is public. Search engines and AI assistants are welcome.',
          'User-agent: *', 'Allow: /', '']
for b in bots: robots += [f'User-agent: {b}', 'Allow: /', '']
robots.append(f'Sitemap: {SITE}sitemap.xml')
write('robots.txt', '\n'.join(robots) + '\n')

# ---------- sitemap.xml ----------
urls = [(SITE, '1.0'), (SITE + 'pricing.html', '0.8'), (SITE + 'contact.html', '0.8')]
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u, p in urls:
    sm += ['  <url>', f'    <loc>{u}</loc>', '    <lastmod>2026-10-23</lastmod>', f'    <priority>{p}</priority>', '  </url>']
sm.append('</urlset>')
write('sitemap.xml', '\n'.join(sm) + '\n')

# ---------- llms.txt ----------
L = [f'# {NAME}', '', f'> {summary}', '',
     'Coin laundromat and dry cleaner in North York, Toronto, Ontario, Canada. All prices are in Canadian dollars; HST applies to all prices.', '',
     '## Contact', '',
     '- Address: Unit 10, 3685 Keele Street, North York, ON M3J 3H6',
     '- Phone: 437-423-3962 (+1-437-423-3962)',
     '- Email: southernstarcoinlaundry@gmail.com',
     f'- Google Maps (directions and reviews): {MAPS}', '',
     '## Hours', '',
     '- Store (self-serve washers and dryers): open every day, 5 AM – 11 PM. Holiday hours may differ.',
     '- Attendant & pickup hours (staff on site for wash & fold, dry cleaning and pickups):',
     '  - Mon, Wed, Thu, Fri: 10 AM – 5 PM and 7 – 11 PM',
     '  - Tue: 7 – 11 PM',
     '  - Sat: 9 AM – 11 PM',
     '  - Sun: 10 AM – 11 PM', '',
     '## Services and prices', '',
     '- Self-serve coin-operated washers and dryers: ask in store for machine prices.',
     '- Wash & fold: $1.80/lb, minimum 10 lbs, ready in 1 day.',
     '- Fold only: $1.00/lb, minimum 10 lbs, ready in 1 day.',
     '- Same-day fast service: available as an add-on; ask for the price.',
     '- Pickup & delivery: free within 2 km of the store for orders of 20 lbs or more. Book by phone or email during attendant hours.',
     '- Dry cleaning: priced per item, from $3.45 (full list below, effective Jun 01, 2026).',
     '- Alterations: ask in store for pricing.',
     '- ATM on site.', '',
     '## Dry-cleaning price list (effective Jun 01, 2026; HST applies)', '']
for t, its in panels:
    L += [f'### {t}', '']
    for i in its:
        extra = [x for x in (i['multi'], i['note']) if x]
        L.append(f"- {i['name']}: {i['price']}" + (f" ({'; '.join(extra)})" if extra else ''))
    L.append('')
L += ['For items not listed, ask in store or call 437-423-3962.', '',
      '## Pages', '',
      f'- [Home]({SITE}): services, how pickup & delivery works, prices, reviews, FAQ',
      f'- [Pricing]({SITE}pricing.html): wash & fold and the full dry-cleaning price list',
      f'- [Contact & hours]({SITE}contact.html): address, map, store and attendant hours, pickup request',
      f'- [Google Maps listing]({MAPS}): directions and customer reviews', '']
write('llms.txt', '\n'.join(L))
print('faqs', len(faqs), 'items', len(all_items), 'summary:', summary)
