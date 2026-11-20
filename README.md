# Talking Through Twenties

Brand website for Talking Through Twenties (@bloomwithquadia): Home, About, Explore, Collaborate and Contact.

- `src/page.html` is the source of the site (styles, content and script in one file).
- `index.html` is the full page, built from the source with `./build.sh`. Open it in a browser or host it on GitHub Pages.
- `assets/` holds the photos.

Before going live, replace the placeholder email (`hello@talkingthroughtwenties.com`) and check the TikTok and Pinterest links in `src/page.html`, then run `./build.sh`.

## TESTAMENTS — design system (Phase I)

`testaments/` holds the visual identity proposal for TESTAMENTS magazine: identity, three cover directions, the five signature spreads drawn at print scale (230 × 300 mm), the 24-page flatplan, and type, grid, print and digital specifications. Edit `testaments/src/identity.html` and run `testaments/build.sh` to rebuild `testaments/index.html`. All names, quotations and photographs in it are placeholders.

## TESTAMENTS — website (testaments.press)

`testaments/site/` is the TESTAMENTS website: a first-person 3D museum. After the intro film you stand outside the building, walk in, and every part of the site is a room: the Central Lobby (monument, contact wall, information desk), About, The Process, the three chapter galleries, the Reading & Screening Room and the Museum Shop.

- Edit `testaments/site/src/site.html` and run `testaments/site/build.sh` to rebuild `index.html`. Deploy the whole `testaments/site/` folder.
- Chapters, statuses, prices, photos per chapter, the launch date, contact email and form endpoints are in the CONTENT block at the top of the script.
- Not yet connected: form delivery (`SITE.forms`), payments and an admin dashboard.
