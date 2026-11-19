#!/bin/sh
# Wraps src/site.html in a full HTML document as index.html (deploy this folder to testaments.press)
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#080808">\n'
  printf '<link rel="canonical" href="https://testaments.press/">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="TESTAMENTS">\n<meta property="og:title" content="TESTAMENTS · Understand the Why.">\n<meta property="og:description" content="An independent magazine of personal interviews and cinematic photography. Every Chapter Matters.">\n<meta property="og:url" content="https://testaments.press/">\n<meta property="og:image" content="https://testaments.press/assets/photos/wall-upward.jpg">\n<meta name="twitter:card" content="summary_large_image">\n'
  printf '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Periodical","name":"TESTAMENTS","url":"https://testaments.press/","description":"An independent magazine of personal interviews and cinematic photography.","slogan":"Understand the Why."}</script>\n'
  printf '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>\n</head>\n<body>\n'
  cat src/site.html
  printf '\n</body>\n</html>\n'
} > index.html
printf 'User-agent: *\nAllow: /\nSitemap: https://testaments.press/sitemap.xml\n' > robots.txt
printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://testaments.press/</loc></url>\n</urlset>\n' > sitemap.xml
