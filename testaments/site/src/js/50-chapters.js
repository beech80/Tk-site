  /* ===== chapter wings =====
     One template, driven by CHAPTERS / PHOTOS. 12-plan.js generates the rooms of every wing in a local
     frame (u outward, v lateral) and tags each with r.part; this file furnishes each part:
       intro     A  title wall + hero image
       gallery   B  the photography (assigned photos, then plates "on release")
       story     C  the interview framework and the two signature questions
       film      D  the conversation: a screening alcove
       magazine  E  lectern, kiosk, and F the exit signs
     Wall text follows one system: few words, set large, high contrast, crisp canvas textures. */
  var EX_TONES={flourish:{acc:0x19140f,light:0xffd3a1},becoming:{acc:0x1a1213,light:0xffcdbd},freedom:{acc:0x11141a,light:0xd2dcf6}};
  var EX_FALLBACK=[{acc:0x161519,light:0xe4dcf6},{acc:0x141716,light:0xd8eadf},{acc:0x18161a,light:0xf1dcc8}];
  var EX={ink:'#f4f1ea',kick:'#b3afa7',vio:'#c3aef0',bg:'#0f0f10',dInk:'#151515',dKick:'#5a5650',dBg:'#ebe7df',dVio:'#5b3590'};
  function exTone(c){return EX_TONES[c.slug]||EX_FALLBACK[Math.max(0,CH.indexOf(c))%EX_FALLBACK.length]}
  function exPPM(){var q=S.quality==='auto'?(coarse?'low':'medium'):S.quality;return q==='low'?170:q==='high'?300:240}

  /* crisp lettered plane; fn(ctx,W,H) draws in pixels */
  function exSign(w,h,fn,ppm){ppm=ppm||exPPM();var k=Math.min(1,2048/(w*ppm),2048/(h*ppm));return plane(w,h,ctex(Math.round(w*ppm*k),Math.round(h*ppm*k),fn),true)}
  /* typographic helpers (sizes in px) */
  function exK(x,t,px,y,s,col,align){x.fillStyle=col||EX.kick;x.font='600 '+Math.round(s)+'px Inter';sp(x,t.toUpperCase(),px,y,s*.3,align||'left')}
  function exT(x,t,px,y,s,col,align,gap){x.fillStyle=col||EX.ink;x.font='400 '+Math.round(s)+'px "Bodoni Moda"';sp(x,t,px,y,gap==null?s*.04:gap,align||'left')}
  function exI(x,t,px,y,s,col,align){x.fillStyle=col||EX.ink;x.font='italic 400 '+Math.round(s)+'px "Bodoni Moda"';x.textAlign=align||'left';x.fillText(t,px,y);x.textAlign='left'}
  function exW(x,t,px,y,maxW,s,lh,font,col){x.fillStyle=col||EX.ink;x.font=font||('400 '+Math.round(s)+'px "Bodoni Moda"');return wrap(x,t,px,y,maxW,lh||s*1.25)}
  function exRule(x,px,y,w,h,col){x.fillStyle=col||EX.vio;x.fillRect(px,y,w,h)}
  function exBg(x,W,H,col){x.fillStyle=col||EX.bg;x.fillRect(0,0,W,H)}

  /* place a sign on a room wall (world side + along), with an optional tinted wash and interaction */
  function exOnWall(r,side,along,y,w,h,fn,o){
    o=o||{};var pos=onWall(r,side,along),n=NV[pos.n],m=exSign(w,h,fn);place(m,pos.x+n[0]*.045,y,pos.z+n[1]*.045,pos.n);
    if(o.wash){var s=spot(w*1.6,h*2,o.washOp||(r.white?.22:.42),o.tint);place(s,pos.x+n[0]*.006,y+h*.2,pos.z+n[1]*.006,pos.n)}
    if(o.act)m.inter=addInter(pos.x,pos.z,pos.n,o.r||4.5,o.verb||'Read',o.label||'Read',o.act,{y:y,w:w,h:h});
    return m}
  /* local-frame versions: w is 'u0','u1','v0','v1', a is the local coordinate along that wall */
  function exL(r,w,a){return {s:wingSide(r.wing,w),a:wingAlong(r.wing,w,a)}}
  function exSignL(r,w,a,y,W,H,fn,o){var p=exL(r,w,a);return exOnWall(r,p.s,p.a,y,W,H,fn,o)}
  function exHangL(id,r,w,a,y,h){var p=exL(r,w,a),ph=photo(id);hang(id,r,p.s,p.a,y,h);exDepth(r,p.s,p.a,y,h*ph.w/ph.h,h)}
  function exQ(){return S.quality==='auto'?(coarse?'low':'medium'):S.quality}
  /* museum presentation around a frame (w,h = image size): a cast shadow on the wall on every tier;
     on medium/high also a deep shadow-box reveal and a brass picture light with its warm cone */
  var EX_SH=null,EX_BRASS=null;
  function exShadowTex(){if(!EX_SH)EX_SH=ctex(128,128,function(x,W,H){var g=x.createRadialGradient(W/2,H/2,W*.18,W/2,H/2,W*.5);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,W,H)});return EX_SH}
  function exDepth(r,side,along,y,w,h){var pos=onWall(r,side,along),g=new T.Group(),hi=exQ()!=='low';
    var sh=new T.Mesh(new T.PlaneGeometry(w+.6,h+.7),new T.MeshBasicMaterial({map:exShadowTex(),transparent:true,opacity:r.white?.28:.6,depthWrite:false}));sh.position.set(.05,-.09,.004);g.add(sh);
    if(hi){if(!EX_BRASS)EX_BRASS=new T.MeshStandardMaterial({color:0x8a7148,metalness:.85,roughness:.32,emissive:0x2a1d0c});
      var bw=Math.min(w*.55,1.1),bar=new T.Mesh(new T.CylinderGeometry(.035,.035,bw,10),EX_BRASS);bar.rotation.z=Math.PI/2;bar.position.set(0,h/2+.2,.26);g.add(bar);
      var arm=new T.Mesh(new T.BoxGeometry(.03,.03,.24),EX_BRASS);arm.position.set(0,h/2+.2,.13);g.add(arm);
      var lip=new T.Mesh(new T.BoxGeometry(bw*.92,.012,.05),new T.MeshBasicMaterial({color:0xfff0d2}));lip.position.set(0,h/2+.17,.27);g.add(lip);
      var cone=glow(w*1.4,.9,0xffe2b8,r.white?.1:.18);cone.position.set(0,h/2+.12,.01);g.add(cone);
      /* shadow-box reveal: thin dark sides give the frame real thickness at grazing angles */
      var dm=new T.MeshBasicMaterial({color:0x050505});[[-1,0],[1,0]].forEach(function(d){var s=new T.Mesh(new T.BoxGeometry(.02,h+.14,.09),dm);s.position.set(d[0]*(w/2+.08),0,.045);g.add(s)})}
    place(g,pos.x,y,pos.z,pos.n);return g}
  function exPlateL(r,w,a,y,W,H,c){var p=exL(r,w,a),pos=onWall(r,p.s,p.a),g=new T.Group();
    /* a designed 'on release' plate: large, legible type in place of the photograph */
    var fr=new T.Mesh(new T.BoxGeometry(W+.14,H+.14,.06),MAT.frame);fr.position.z=.03;g.add(fr);
    var t=exSign(W,H,function(x,Wd,Hd){exBg(x,Wd,Hd,'#0d0d0e');var m=Math.min(Wd,Hd);x.strokeStyle='rgba(255,255,255,.16)';x.lineWidth=Math.max(2,m*.006);x.strokeRect(m*.06,m*.06,Wd-m*.12,Hd-m*.12);
      exK(x,'Chapter '+c.num,Wd/2,Hd*.36,m*.055,EX.vio,'center');exT(x,c.title,Wd/2,Hd*.52,m*.13,null,'center');
      exRule(x,Wd/2-m*.05,Hd*.58,m*.1,Math.max(2,m*.006),'#6b6760');exK(x,'Plate · on release',Wd/2,Hd*.68,m*.05,'#cfcac1','center')},Math.min(exPPM(),200));
    t.position.z=.065;g.add(t);var sl=spot(W*2.2,H*2.3,.45);sl.position.set(0,H*.4,.008);g.add(sl);place(g,pos.x,y,pos.z,pos.n);exDepth(r,p.s,p.a,y,W,H);
    addInter(pos.x,pos.z,pos.n,3.6,'View','Plate · on release',function(){toast('Photographs for '+c.title+' will hang here when the chapter is published.')},{y:y,w:W+.14,h:H+.14})}
  /* a box sized in the local frame (df along f, dl along l); solid adds a collider */
  function exBox(r,df,h,dl,mat,u,y,v,solid){var W=r.wing,p=wingPt(W,u,v),sx=Math.abs(W.f[0])*df+Math.abs(W.l[0])*dl,sz=Math.abs(W.f[1])*df+Math.abs(W.l[1])*dl;
    var m=box(sx,h,sz,mat,p.x,y,p.z);if(solid)col(p.x-sx/2-.04,p.x+sx/2+.04,p.z-sz/2-.04,p.z+sz/2+.04);return m}
  function exFace(o,d){o.rotation.y=Math.atan2(d[0],d[1]);return o}
  /* accent wall: a thin tinted skin over a stretch of a wall (local a1..a2) */
  function exAccent(r,w,a1,a2,tone){var W=r.wing,s=wingSide(W,w),b1=wingAlong(W,w,a1),b2=wingAlong(W,w,a2),len=Math.abs(b2-b1),mid=(b1+b2)/2,pos=onWall(r,s,mid),n=NV[pos.n];
    var m=new T.Mesh(new T.PlaneGeometry(len,r.h),new T.MeshStandardMaterial({color:tone.acc,roughness:.92}));place(m,pos.x-n[0]*.008,r.h/2,pos.z-n[1]*.008,pos.n);
    return m}
  function exHand(W){return W.f[0]*W.l[1]-W.f[1]*W.l[0]}   /* +1: v grows to the visitor's right when facing f */
  function exNext(c){var i=CH.indexOf(c);return CH[i+1]||null}
  function exPlateMsg(c){return function(){toast('This part of '+c.title+' opens when the chapter is published.')}}

  function buildChapter(r){
    var c=r.c;
    if(!c){if(r.part==='intro'){var pz=exL(r,'u1',0);exOnWall(r,pz.s,pz.a,2.6,4.4,1.6,function(x,W,H){exBg(x,W,H);exK(x,'Gallery',W/2,H*.38,H*.09,null,'center');exT(x,'In preparation',W/2,H*.7,H*.24,null,'center')})}return}
    if(!r.wing||!r.part)return;
    var tone=exTone(c);
    ({intro:exIntro,gallery:exGallery,story:exStory,film:exFilm,magazine:exMagazine})[r.part](r,c,tone);
    /* the wing's light temperature: a soft tinted pool in every room */
    exMood(r,tone);
    var m=wingPt(r.wing,(r.lu[0]+r.lu[1])/2,(r.lv[0]+r.lv[1])/2);floorGlow(m.x,m.z,(r.x2-r.x1)*.8,(r.z1-r.z2)*.8,tone.light,r.part==='film'?.03:.08);
  }

  /* title wall: the panel stands proud of the wall on a shadow, with a grazing wash from a ceiling slot */
  function exTitleLight(r,tp,w,h,y,tone){var g=new T.Group();
    var sh=new T.Mesh(new T.PlaneGeometry(w+.9,h+.9),new T.MeshBasicMaterial({map:exShadowTex(),transparent:true,opacity:.7,depthWrite:false}));sh.position.set(.06,-.12,.012);g.add(sh);
    var wash=spot(w*1.5,h*1.9,.32,tone.light);wash.position.set(0,h*.35,.02);g.add(wash);
    if(exQ()!=='low'){var slot=new T.Mesh(new T.BoxGeometry(w*.9,.02,.08),new T.MeshBasicMaterial({color:tone.light}));slot.position.set(0,r.h-y-.01,.5);g.add(slot);
      var gr=glow(w*1.2,1.4,tone.light,.18);gr.position.set(0,r.h-y-.6,.03);g.add(gr)}
    place(g,tp.x,y,tp.z,tp.n)}
  /* chapter mood: a coloured cove line at the ceiling and a low skirting glow along the long walls */
  function exMood(r,tone){if(r.part==='film')return;var W=r.wing,a=r.lu[0]+.6,b=r.lu[1]-.6,len=b-a,hi=exQ()!=='low';
    ['v0','v1'].forEach(function(w){var vv=w==='v0'?r.lv[0]:r.lv[1],p=wingPt(W,(a+b)/2,vv),n=wingN(W,w),m=new T.Mesh(new T.PlaneGeometry(len,hi?1.6:1.1),new T.MeshBasicMaterial({map:GLOW,color:tone.light,transparent:true,opacity:hi?.07:.05,blending:T.AdditiveBlending,depthWrite:false}));
      m.position.set(p.x-n[0]*.2,r.h-.35,p.z-n[1]*.2);m.rotation.y=Math.atan2(-n[0],-n[1]);scene.add(m)})}

  /* A · introduction */
  function exIntro(r,c,tone){
    exAccent(r,'u1',-6,1.2,tone);
    exSignL(r,'u1',-2.4,3.1,6.4,4.2,function(x,W,H){exBg(x,W,H,'#0e0d0d');var L=W*.08;
      exK(x,'Chapter '+c.num,L,H*.17,H*.042);
      var tt=c.title.toUpperCase(),ts=H*.24;x.font='400 '+Math.round(ts)+'px "Bodoni Moda"';var tw=x.measureText(tt).width+H*.03*(tt.length-1);if(tw>W*.84)ts*=W*.84/tw;exT(x,tt,L-H*.01,H*.43,ts,null,'left',ts*.125);
      exI(x,who(c),L,H*.57,H*.075,'#e6e1d8');
      exRule(x,L,H*.65,H*.09,H*.008);
      if(c.intro)exW(x,c.intro,L,H*.75,W*.82,H*.042,H*.062,'400 '+Math.round(H*.042)+'px Inter','#d9d5cd');
      else exI(x,'Introduction on release.',L,H*.76,H*.05,'#cdc8bf');
      exK(x,(STATUS[c.status]||'')+(c.release?'  ·  '+c.release:''),L,H*.9,H*.034,EX.vio)},
      {act:function(){openChapter(c)},verb:'Explore',label:'Chapter '+c.num+' · '+c.title,r:9,tint:tone.light});
    var t=exL(r,'u1',-2.4),tp=onWall(r,t.s,t.a);exTitleLight(r,tp,6.4,4.2,3.1,tone);floorGlow(tp.x+NV[tp.n][0]*1.1,tp.z+NV[tp.n][1]*1.1,r.wing.f[0]?2.2:6.4,r.wing.f[0]?6.4:2.2,0x6e42a3,.4);
    /* hero image: the first assigned photograph, or a designed plate */
    var mine=PHOTOS.filter(function(p){return p.chapter===c.slug});
    if(mine[0])exHangL(mine[0].id,r,'v0',5,2.6,mine[0].h>mine[0].w?3.3:2.6);else exPlateL(r,'v0',5,2.6,3.8,2.6,c);
    /* wayfinding: what the wing holds */
    exSignL(r,'v1',5.2,2.5,3.2,2.6,function(x,W,H){exBg(x,W,H);var L=W*.1;exK(x,'In this chapter',L,H*.16,H*.05);
      ['The Photography','The Story','The Conversation','The Magazine'].forEach(function(s,i){var y=H*(.36+i*.17);exK(x,['I','II','III','IV'][i],L,y,H*.045,EX.vio);exT(x,s,L+W*.14,y+H*.012,H*.085)})});
  }

  /* B · photography */
  function exGallery(r,c,tone){
    var mine=PHOTOS.filter(function(p){return p.chapter===c.slug}),k=0;
    function sz(p,big){return p.h>p.w?(big?3.1:2.6):(big?2.5:2.1)}
    function next(){return mine[k++]||null}
    exAccent(r,'u1',-6.5,1.2,tone);
    /* the focal wall, straight ahead on entering */
    var p=next();if(p)exHangL(p.id,r,'u1',-2.6,2.65,sz(p,true));else exPlateL(r,'u1',-2.6,2.65,2.4,3.1,c);
    /* a diptych on the long wall */
    var a=next(),b=next(),hd=a&&b?Math.min(sz(a),sz(b)):a?sz(a):b?sz(b):2.4,wa=a?hd*a.w/a.h:1.8,wb=b?hd*b.w/b.h:1.8,gap=1.1,tot=wa+wb+gap,c0=20.6,ua=c0-tot/2+wa/2,ub=c0+tot/2-wb/2;
    if(a)exHangL(a.id,r,'v0',ua,2.5,hd);else exPlateL(r,'v0',ua,2.5,1.8,hd,c);
    if(b)exHangL(b.id,r,'v0',ub,2.5,hd);else exPlateL(r,'v0',ub,2.5,1.8,hd,c);
    /* singles */
    [['v1',17],['v1',24.5],['v0',27.5]].forEach(function(s){var q=next();if(q)exHangL(q.id,r,s[0],s[1],2.5,sz(q));else exPlateL(r,s[0],s[1],2.5,1.8,2.4,c)});
    /* section title, beside the entrance */
    exSignL(r,'v0',13.9,2.5,3.6,1.6,function(x,W,H){exBg(x,W,H);var L=W*.09;exK(x,'I',L,H*.24,H*.07,EX.vio);exT(x,'The Photography',L,H*.56,H*.18);exK(x,'TESTAMENTS photography',L,H*.82,H*.06)});
    /* a bench facing the diptych */
    exBox(r,3,.46,.7,MAT.bench,20.5,.23,-.4,true);
  }

  /* C · the story */
  function exStory(r,c,tone){
    var parts=[['01','The Beginning','v1',35.4],['02','Turning Points','v1',41.6],['03','The Present','v0',34.6],['04','Reflection','v0',38.9]];
    parts.forEach(function(s){exSignL(r,s[2],s[3],2.5,3.6,2.4,function(x,W,H){exBg(x,W,H);var L=W*.1;
        exT(x,s[0],L,H*.3,H*.16,EX.vio);exT(x,s[1],L,H*.58,H*.15);exRule(x,L,H*.68,H*.07,H*.008,'#6b6760');exK(x,'On release',L,H*.84,H*.06)},
      {act:function(){toast(s[1]+': this part of the conversation is published with the chapter.')},label:s[0]+' · '+s[1],r:5.5})});
    exAccent(r,'u1',-9,7.5,tone);
    var hs=exHand(r.wing);
    [['17','What would you tell the world?',hs>0?-4.65:3.15],['18','What would you title your chapter?',hs>0?3.15:-4.65]].forEach(function(q){
      exSignL(r,'u1',q[2],2.9,7.0,3.9,function(x,W,H){exBg(x,W,H,'#0e0d0d');var L=W*.09;
        exK(x,'Signature Question '+q[0],L,H*.16,H*.036,EX.vio);
        exW(x,q[1],L,H*.37,W*.78,H*.12,H*.15);
        exRule(x,L,H*.72,H*.08,H*.008,'#6b6760');
        exI(x,'The answer, on release.',L,H*.86,H*.058,'#e2ddd4')},
        {act:function(){toast('Question '+q[0]+'. '+who(c)+'’s answer is published with the chapter.')},label:'Question '+q[0],r:7,tint:tone.light})});
    exSignL(r,'u0',-4.2,2.8,5,2.2,function(x,W,H){exBg(x,W,H);var L=W*.08;exK(x,'II',L,H*.22,H*.08,EX.vio);exT(x,'The Story',L,H*.5,H*.2);exI(x,'Eighteen questions in five parts.',L,H*.72,H*.075,'#d9d5cd');exK(x,'Answers on release',L,H*.88,H*.055)});
    exBox(r,3,.46,.7,MAT.bench,38.6,.23,-.8,true);
  }

  /* D · the conversation (screening alcove) */
  function exFilm(r,c,tone){
    var W=r.wing,sw=4.2,sh=2.36,p=exL(r,'v0',37),pos=onWall(r,p.s,p.a),n=NV[pos.n],g=new T.Group();
    var fr=new T.Mesh(new T.BoxGeometry(sw+.16,sh+.16,.08),MAT.frame);fr.position.z=.04;g.add(fr);
    var scr=exSign(sw,sh,function(x,Wd,H){var gr=x.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#0b0b0d');gr.addColorStop(1,'#060607');x.fillStyle=gr;x.fillRect(0,0,Wd,H);
      exK(x,'III · The Conversation',Wd/2,H*.24,H*.05,'#c9c4bb','center');
      if(c.video){x.strokeStyle=EX.ink;x.lineWidth=H*.008;x.beginPath();x.arc(Wd/2,H*.55,H*.11,0,Math.PI*2);x.stroke();x.fillStyle=EX.ink;x.beginPath();x.moveTo(Wd/2-H*.035,H*.49);x.lineTo(Wd/2-H*.035,H*.61);x.lineTo(Wd/2+H*.06,H*.55);x.fill();exK(x,'Press to play',Wd/2,H*.84,H*.05,null,'center')}
      else{exT(x,'Coming soon',Wd/2,H*.58,H*.2,null,'center');exK(x,c.title,Wd/2,H*.78,H*.05,EX.vio,'center')}});
    scr.position.z=.085;g.add(scr);var gl=glow(sw*1.6,sh*1.8,0x8f86b8,.08);gl.position.z=.02;g.add(gl);place(g,pos.x,1.95,pos.z,pos.n);
    addInter(pos.x,pos.z,pos.n,5.5,c.video?'Watch':'View','The conversation · '+(c.video?'watch':'coming soon'),function(){if(c.video)openFilm(c.video);else toast('The filmed conversation for '+c.title+' is coming soon.')},{y:1.95,w:sw,h:sh});
    exBox(r,2.6,.44,.6,MAT.bench,37,.22,-25.9,true);
    var f=wingPt(W,37,-28.6);floorGlow(f.x,f.z,5,1.6,0x8f86b8,.08);
  }

  /* E · the magazine, and F · the exit */
  function exMagazine(r,c,tone){
    var W=r.wing,up=W.l; /* furniture faces +l, toward the entrance wall */
    /* lectern with the open chapter */
    var lp=wingPt(W,39.2,-16.2);exBox(r,.5,1.02,.36,MAT.ped,39.2,.51,-16.2,false);col(lp.x-.42,lp.x+.42,lp.z-.42,lp.z+.42);
    var lg=new T.Group(),top=new T.Mesh(new T.BoxGeometry(.96,.04,.66),MAT.frame);lg.add(top);
    var spread=exSign(.9,.6,function(x,Wd,H){x.fillStyle='#f2efe8';x.fillRect(0,0,Wd,H);x.fillStyle='#0e0e0f';x.fillRect(0,0,Wd/2,H);x.fillStyle='rgba(0,0,0,.18)';x.fillRect(Wd/2-3,0,6,H);
      exK(x,'TESTAMENTS',Wd*.25,H*.2,H*.045,'#cfcac1','center');exT(x,c.num,Wd*.25,H*.6,H*.26,EX.ink,'center');
      exK(x,'Chapter '+c.num,Wd*.75,H*.24,H*.045,EX.dKick,'center');exT(x,c.title.toUpperCase(),Wd*.75,H*.5,H*.13,EX.dInk,'center');exI(x,who(c),Wd*.75,H*.66,H*.06,'#3a3733','center')},600);
    spread.rotation.x=-Math.PI/2;spread.position.y=.022;lg.add(spread);
    var wrapG=new T.Group();lg.rotation.x=.32;lg.position.y=1.08;wrapG.add(lg);wrapG.position.set(lp.x,0,lp.z);exFace(wrapG,up);scene.add(wrapG);
    var lgl=glow(1.8,1.8,0xfff1dc,.14);lgl.position.set(lp.x,1.5,lp.z);scene.add(lgl);floorGlow(lp.x,lp.z,2.6,2.6,0xfff1dc,.16);
    addInter(lp.x,lp.z,null,2.8,'Read','Read the magazine · '+c.title,function(){openReader(c)},wrapG);
    /* the Read · View · Watch · Own kiosk */
    var kp=wingPt(W,32.8,-16.2),kg=new T.Group(),ped=new T.Mesh(new T.BoxGeometry(.8,1.1,.8),MAT.ped);ped.position.y=.55;kg.add(ped);
    var kt=exSign(.7,.7,function(x,Wd,H){exBg(x,Wd,H,'#0d0d0e');exK(x,'Explore',Wd/2,H*.28,H*.06,EX.vio,'center');exT(x,c.title,Wd/2,H*.52,H*.15,null,'center');exK(x,'Read · Watch · Own',Wd/2,H*.76,H*.065,'#d9d4cb','center')},500);
    kt.rotation.x=-Math.PI/2+.5;kt.position.y=1.13;kg.add(kt);kg.position.set(kp.x,0,kp.z);exFace(kg,up);scene.add(kg);col(kp.x-.45,kp.x+.45,kp.z-.45,kp.z+.45);floorGlow(kp.x,kp.z,2.4,2.4,0x6e42a3,.35);
    addInter(kp.x,kp.z,null,2.8,'Explore','Read · View · Watch · Own',function(){openChapter(c)},kg);
    /* section title on the entrance wall */
    exSignL(r,'v1',34.4,2.5,5.6,2.4,function(x,Wd,H){exBg(x,Wd,H);var L=Wd*.09;exK(x,'IV',L,H*.22,H*.055,EX.vio);exT(x,'The Magazine',L,H*.52,H*.19);exK(x,'Read · View · Watch · Own',L,H*.8,H*.05)});
    /* the cover, large */
    exSignL(r,'v0',43,2.45,2.6,3.47,function(x,Wd,H){exBg(x,Wd,H,'#0b0b0c');x.strokeStyle='rgba(255,255,255,.14)';x.lineWidth=3;x.strokeRect(Wd*.05,H*.04,Wd*.9,H*.92);
      exK(x,'TESTAMENTS',Wd/2,H*.12,H*.038,'#e9e5dd','center');exI(x,'Understand the Why.',Wd/2,H*.175,H*.03,'#bdb8af','center');
      exT(x,c.num,Wd/2,H*.5,H*.2,EX.ink,'center');exRule(x,Wd/2-Wd*.06,H*.56,Wd*.12,H*.004);exT(x,c.title.toUpperCase(),Wd/2,H*.67,H*.075,null,'center',H*.012);exI(x,who(c),Wd/2,H*.73,H*.032,'#d6d1c8','center');
      exK(x,'Chapter '+c.num,Wd/2,H*.85,H*.026,'#bdb8af','center');exK(x,edState(c),Wd/2,H*.9,H*.026,'#bdb8af','center')},{act:function(){openProduct(c)},verb:'Own',label:'The print edition · '+edState(c),r:4});
    /* over the alcove */
    exSignL(r,'v0',37,3.9,3.2,.55,function(x,Wd,H){exBg(x,Wd,H);exK(x,'III · The Conversation',Wd/2,H*.64,H*.26,null,'center')});
    /* F · exit */
    var nx=exNext(c);
    exSignL(r,'u0',-18.8,2.3,3.8,1.9,function(x,Wd,H){exBg(x,Wd,H);var L=Wd*.09;exK(x,'Exit',L,H*.22,H*.075,EX.vio);exT(x,'The Lobby',L,H*.55,H*.22);exK(x,'Return  →',L,H*.8,H*.07)},
      {act:function(){travel('lobby')},verb:'Go',label:'Return to the lobby',r:5});
    exSignL(r,'u0',-13.4,2.3,3.8,1.9,function(x,Wd,H){exBg(x,Wd,H);var L=Wd*.09;exK(x,nx?'Next · Chapter '+nx.num:'All chapters',L,H*.22,H*.075,EX.vio);exT(x,nx?nx.title:'The Reading Room',L,H*.55,H*.22);exK(x,'Continue  →',L,H*.8,H*.07)},
      {act:function(){travel(nx?nx.slug:'library')},verb:'Go',label:nx?'Next: Chapter '+nx.num+' · '+nx.title:'The Reading Room',r:5});
    var ep=exL(r,'u0',-16.1),eo=onWall(r,ep.s,ep.a);floorGlow(eo.x+NV[eo.n][0]*1.2,eo.z+NV[eo.n][1]*1.2,W.f[0]?2:8,W.f[0]?8:2,0x6e42a3,.3);
  }
