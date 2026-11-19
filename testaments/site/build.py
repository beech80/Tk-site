#!/usr/bin/env python3
"""Assembles the museum: src/shell.html + src/js/*.js -> src/site.html (artifact page) and index.html (deployable)."""
import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
shell=open('src/shell.html').read()
files=sorted(glob.glob('src/js/*.js'))
content=open(files[0]).read()
mods=''.join('\n/* ---- '+os.path.basename(f)+' ---- */\n'+open(f).read() for f in files[1:])
script='<script>\n'+content+'\n/* ==========================================================================\n   THE MUSEUM\n   ========================================================================== */\n(function(){\n'+mods+'})();\n</script>\n'
page=shell.replace('<!--SCRIPTS-->',script)
open('src/site.html','w').write(page)
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050507">
<link rel="canonical" href="https://testaments.press/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="TESTAMENTS">
<meta property="og:title" content="TESTAMENTS · Understand the Why.">
<meta property="og:description" content="A museum you walk through. Personal interviews and cinematic photography, one chapter at a time.">
<meta property="og:url" content="https://testaments.press/">
<meta property="og:image" content="https://testaments.press/assets/intro-poster.jpg">
<meta name="twitter:card" content="summary_large_image">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}</style>
</head>
<body>
'''
open('index.html','w').write(head+page+'\n</body>\n</html>\n')
print('built',len(page)//1024,'KB from',len(files),'files')
