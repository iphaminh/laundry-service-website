# SEO sync tools

Not part of the website (`.vercelignore` keeps `tools/` off the live site).

- `build_seo.py` rebuilds every page's SEO `<head>` tags, the JSON-LD blocks
  (business, prices, FAQ, breadcrumbs), `robots.txt`, `sitemap.xml` and
  `llms.txt` **from the visible page content**. Run it after changing the FAQ,
  any price, the hero summary or the site address, so the structured data never
  disagrees with what customers see:

      python3 tools/seo/build_seo.py

  Edit the `SITE` constant at the top when the primary domain changes.

- `verify_seo.js` checks the result in a browser (JSON-LD parses, NAP matches,
  FAQ and price markup match the page, one H1, title/description lengths, no
  sideways scroll). Start a local server first:

      python3 -m http.server 8000
      NODE_PATH=$(npm root -g) node tools/seo/verify_seo.js
