# TESTAMENTS museum — engine guide

TESTAMENTS (testaments.press) is a magazine whose whole website is a first-person 3D museum. The visitor watches an intro film, presses Enter, stands outside the building at night, walks in, and every part of the site is a room. There is no 2D site.

## Build and run

- Source: `src/shell.html` (HTML + CSS for the gate, HUD and overlays) and `src/js/*.js`.
- `python3 build.py` assembles `src/site.html` (the published page) and `index.html` (deployable). Always rebuild after editing.
- `src/js/00-content.js` is global config (SITE, PHOTOS, CHAPTERS, STOCKISTS). Every other `src/js/NN-*.js` file is concatenated **in filename order inside one shared function scope**, so top-level `var`s and `function`s in any module are visible to all modules. Choose unique names for anything new (prefix with your module, e.g. `lookFoo`).
- Three.js **r128** (global `THREE`, aliased `T`), core build only, loaded from cdnjs. **No examples/addons** (no OrbitControls, EffectComposer, Reflector, RoomEnvironment, GLTFLoader...). Anything like that must be written by hand in our own code. No other external scripts. Fonts: "Bodoni Moda" (display) and "Inter" (UI) are loaded. Assets: `assets/photos/*.jpg`, `assets/intro.mp4`, `assets/intro-poster.jpg`. No new external assets: generate textures procedurally (canvas, DataTexture, shaders).
- Check your work headless: a static server runs at `http://localhost:8765` serving this folder. Run
  `THREE_JS=/tmp/claude-0/-home-user-Tk-site/5c1c4875-d1c1-5808-bceb-1a819dd39b4f/scratchpad/three/package/build/three.min.js node tools/check.js '[["name",x,z,yaw],...]' <outDir>`
  It enters the museum, teleports to each spot, saves `<outDir>/<name>.png`, prints state and any page errors. Rendering is software (SwiftShader), so it is slow and frame rate there means nothing; judge visuals, not speed. Use your own out dir (e.g. `/tmp/claude-0/-home-user-Tk-site/5c1c4875-d1c1-5808-bceb-1a819dd39b4f/scratchpad/<yourname>/`).
- Quick syntax check of the whole bundle: `python3 build.py && node -e "const s=require('fs').readFileSync('src/site.html','utf8');new Function(s.match(/<script>([\s\S]*?)<\/script>/)[1])"`. **Never leave the bundle broken**: other people are testing at the same time.

## World

Metres, y up, the entrance faces +z. Eye height `EYE=1.65`. The plaza is z>0; the facade is at z=0 with sliding glass doors at x -3..3. Indoors everything is a room from `ROOMS` (12-plan.js): `{id,name,x1,x2,z1 (south, larger),z2 (north, smaller),h,doors:[{s:'n'|'s'|'e'|'w',at,w?,h?}],open:[sides without walls],cor (corridor),white,chapter,entry,spawn:[x,z,yaw]}`. `buildRoom` builds walls with door gaps, lintels, colliders, ceiling and floor glow. `BOUNDS` is the indoor footprint (computed from ROOMS). `RM[id]` gets a room, `SPAWN[id]` a spawn point, `roomAt(x,z)` the room at a point.

Current plan: lobby x -14..14, z -6..-34 (h 10, skylight, monument at 0,-20). West: About (x -40..-18, z -6..-20) and Chapter 001 Flourish (x -42..-18, z -21..-37). East: Process (x 18..40, z -6..-20) and Chapter 003 Freedom (x 18..42, z -21..-37). North: Reading & Screening Room (x -27..-7.5, z -38..-58), Chapter 002 Becoming (x -6.5..6.5, z -38..-58), Shop (x 7.5..27, z -38..-58). Corridors 4 m wide connect them.

## Core API (shared scope)

- Three: `T, R (renderer), scene, cam, clock, loader` (TextureLoader on the loading manager: textures loaded with it count toward the loading screen).
- Materials: `MAT.{stone,wall,whiteWall,floor,ground,path,ceil,col,frame,bench,ped,glass,mono,tree,trunk,warm,lamp,metal}`. Textures: `GLOW` (radial), `SPOT` (wall wash).
- Builders: `box(w,h,d,mat,x,y,z)`, `slab(x1,z1,x2,z2,y,mat,down)`, `col(x1,x2,z1,z2)` adds a collider (returns it; set `.off=true` to disable), `plane(w,h,tex,solid)`, `ctex(w,h,drawFn)` canvas texture, `sp(ctx,text,x,y,gap,align)` letter-spaced text, `wrap(ctx,text,x,y,maxW,lineH)`, `glow(...)`, `spot(w,h,opacity,color)`, `floorGlow(x,z,w,h,color,opacity)`, `onWall(room,side,along)` returns `{x,z,n}` on a wall's inner face, `place(obj,x,y,z,n)` orients to face n (`'px','nx','pz','nz'`), `hang(photoId,room,side,along,y,height)` hangs a framed, lit, interactive photograph, `emptyFrame(...)`, `panel(room,side,along,y,w,h,drawFn,{act,verb,label,r,light})` lettered wall panel.
- Interaction: `addInter(x,z,n,radius,verb,label,act)` registers something the visitor can use with E / the action button (n = facing direction or null). `near` is the current target. `toast(text)`.
- Player: `P={x,z,yaw,pitch,vx,vz}`, `mode` ('load','intro','anim','play','ui'), `keys`, `S` settings (`sens,speed,quality,reduced,skipIntro`), `coarse` (touch device), `curRoom`.
- Overlays (80-ui/82-media): `openOv(kind,html,cls)`, `closeOv()`, `openPhoto(id,set)`, `openReader(chapter)`, `openFilm(url)`, `openChapter(c)`, `openChapterList()`, `openProduct(c)`, `openCart()`, `openInfo(tab)`, `openContact()`, `openMap()`, `openMenu()`, `travel(roomId)`, `teleport(x,z,yaw)`.
- Data helpers: `CH` (visible chapters), `chap(slug)`, `who(c)`, `photo(id)`, `src(id)`, `PHOTOS`, `CHAPTERS`, `STATUS`, `edState(c)`.
- **Hooks** (use these instead of editing someone else's file): `HOOKS.afterMaterials.push(fn)` runs right after base materials exist (replace/upgrade `MAT.*` here), `HOOKS.afterBuild.push(fn)` after all rooms are built, `HOOKS.frame.push(fn(dt,raw))` every frame, `HOOKS.resize.push(fn(w,h))`, `HOOKS.roomChange.push(fn(room,prev))`, `HOOKS.render = fn` replaces `R.render(scene,cam)` (post-processing).

## Rules for everyone

- Content truth: never invent quotes, biographies, interview answers, people, prices, dates, reviews or partners. Real copy only from CHAPTERS/SITE and the approved brand copy already in the code (tagline "Understand the Why.", "Every Chapter Matters.", manifesto, mission, vision, process stages, the 18-question framework sections: The Beginning, Turning Points, The Present, Reflection, Signature Questions incl. Q17 "What would you tell the world?" and Q18 "What would you title your chapter?"). Missing material shows as a designed "on release" state.
- Look: luxury contemporary art museum at night. Black, charcoal, warm white, concrete; purple `#6E42A3` only as restrained light/accent. Cinematic, quiet, not a video game arcade.
- Performance: must run on phones. Respect `S.quality` ('auto'→ low on touch devices, medium on desktop; 'low','medium','high'). Keep real-time lights few (prefer baked/fake light: canvas lightmaps, additive glow planes, emissive). Merge or instance repeated geometry. Dispose nothing that is still used. Respect `S.reduced` (no camera bob, no big animations).
- Edit **only the files you own**. If you need a change elsewhere, use a hook; if impossible, describe the exact change in your final report.
- Do not commit or push. Do not change build.py, tools/, or assets/.
