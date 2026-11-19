  /* ======================================================================
     WORLD PLAN (metres; y up; the entrance faces +z)
     ====================================================================== */
  var ROOMS=[
    {id:'vestibule',name:'Vestibule',x1:-3,x2:3,z1:0,z2:-6,h:5.2,open:['s','n']},
    {id:'lobby',name:'Central Lobby',x1:-14,x2:14,z1:-6,z2:-34,h:10,doors:[{s:'w',at:-13},{s:'w',at:-27},{s:'e',at:-13},{s:'e',at:-27},{s:'n',at:-11},{s:'n',at:0},{s:'n',at:11},{s:'s',at:0,w:6,h:5.2}],spawn:[0,-11,0]},
    {id:'c-about',x1:-18,x2:-14,z1:-11,z2:-15,h:4,open:['e','w'],cor:1},
    {id:'about',name:'About TESTAMENTS',x1:-40,x2:-18,z1:-6,z2:-20,h:6,doors:[{s:'e',at:-13}],white:1,spawn:[-21,-13,Math.PI/2]},
    {id:'c-flourish',x1:-18,x2:-14,z1:-25,z2:-29,h:4,open:['e','w'],cor:1},
    {id:'c-process',x1:14,x2:18,z1:-11,z2:-15,h:4,open:['e','w'],cor:1},
    {id:'process',name:'The Process',x1:18,x2:40,z1:-6,z2:-20,h:6,doors:[{s:'w',at:-13}],spawn:[21,-13,-Math.PI/2]},
    {id:'c-freedom',x1:14,x2:18,z1:-25,z2:-29,h:4,open:['e','w'],cor:1},
    {id:'c-library',x1:-13,x2:-9,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'library',name:'Reading & Screening Room',x1:-27,x2:-7.5,z1:-38,z2:-58,h:6,doors:[{s:'s',at:-11}],spawn:[-11,-41,0]},
    {id:'c-becoming',x1:-2,x2:2,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'c-shop',x1:9,x2:13,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'shop',name:'The Museum Shop',x1:7.5,x2:27,z1:-38,z2:-58,h:6,doors:[{s:'s',at:11}],spawn:[11,-41,0]}
  ];

  /* ===== chapter wings =====
     Every chapter gets the same exhibition journey, generated from one template in a local frame:
     u = distance outward from the wing's anchor (along f), v = lateral offset (along l).
       A  intro         u 0..10        the chapter title wall and the hero image        (id = slug)
       B  gallery       u 11.2..30     the photography                                  (slug-gallery)
       C  story         u 31.2..46     the interview framework and signature questions  (slug-story)
       E  magazine      u 27..46, v -22..-10.2   lectern, kiosk, exit signs              (slug-magazine)
       D  conversation  alcove off E   the film screen                                  (slug-conversation)
     Thresholds between rooms are short 'cor' passages (slug-t1..t4).
     A slot binds a chapter to a place in the building. The first three sit on the lobby's chapter doors.
     A slot without a slug takes the next chapter that has none; 'via' cuts its entrance into an existing room. */
  var WING_SLOTS=[
    {slug:'flourish',ax:-18,az:-27,f:[-1,0],l:[0,1]},
    {slug:'becoming',ax:0,az:-38,f:[0,-1],l:[1,0]},
    {slug:'freedom',ax:18,az:-27,f:[1,0],l:[0,1]},
    {ax:-16.1,az:-85.2,f:[0,-1],l:[1,0],via:'becoming-magazine'}   /* spare: continues north from Chapter 002's magazine room */
  ];
  var WING_PARTS=[
    {k:'',part:'intro',name:'',u:[0,10],v:[-6,6],h:7,doors:[['u0',0,4],['u1',3,3.6]],spawn:[2.6,0,'f']},
    {k:'-t1',u:[10,11.2],v:[1.2,4.8],open:['u0','u1']},
    {k:'-gallery',part:'gallery',name:'The Photography',u:[11.2,30],v:[-6.5,6],h:6,doors:[['u0',3,3.6],['u1',3,3.6]],spawn:[13.2,3,'f']},
    {k:'-t2',u:[30,31.2],v:[1.2,4.8],open:['u0','u1']},
    {k:'-story',part:'story',name:'The Story',u:[31.2,46],v:[-9,7.5],h:6,doors:[['u0',3,3.6],['v0',43.5,3.6]],spawn:[33.4,3,'f']},
    {k:'-t3',u:[41.7,45.3],v:[-10.2,-9],open:['v0','v1']},
    {k:'-magazine',part:'magazine',name:'The Magazine',u:[27,46],v:[-22,-10.2],h:5,doors:[['v1',43.5,3.6],['v0',37,2.6,3.2]],spawn:[43.5,-12.4,'-l']},
    {k:'-t4',u:[35.7,38.3],v:[-23.2,-22],h:3.2,open:['v0','v1']},
    {k:'-conversation',part:'film',name:'The Conversation',u:[33,41],v:[-29.5,-23.2],h:4,doors:[['v1',37,2.6,3.2]],spawn:[37,-24.3,'-l']}
  ];
  /* local frame helpers (also used by 50-chapters.js) */
  function wingN(W,w){return w==='u0'?[-W.f[0],-W.f[1]]:w==='u1'?W.f:w==='v0'?[-W.l[0],-W.l[1]]:W.l}
  function wingSide(W,w){var n=wingN(W,w);return n[0]<0?'w':n[0]>0?'e':n[1]<0?'n':'s'}
  function wingAlong(W,w,a){var s=wingSide(W,w),d=w[0]==='u'?W.l:W.f;return (s==='n'||s==='s')?W.ax+a*d[0]:W.az+a*d[1]}
  function wingPt(W,u,v){return {x:W.ax+u*W.f[0]+v*W.l[0],z:W.az+u*W.f[1]+v*W.l[1]}}
  function wingRect(W,u,v){var a=wingPt(W,u[0],v[0]),b=wingPt(W,u[1],v[1]);return {x1:Math.min(a.x,b.x),x2:Math.max(a.x,b.x),z1:Math.max(a.z,b.z),z2:Math.min(a.z,b.z)}}
  (function(){
    var used={},out=[];
    WING_SLOTS.forEach(function(W){if(W.slug)used[W.slug]=1});
    WING_SLOTS.forEach(function(W){
      var slug=W.slug,c=slug?chap(slug):CH.filter(function(x){return !used[x.slug]})[0];
      if(!slug){if(!c)return;used[c.slug]=1;slug=c.slug}
      W.slug=slug;W.c=c;
      if(W.via&&RM0(W.via)){var vr=RM0(W.via),s=wingSide({f:[-W.f[0],-W.f[1]],l:W.l},'u0');
        (vr.doors=vr.doors||[]).push({s:s,at:(s==='n'||s==='s')?W.ax:W.az,w:3.6});
        var t=wingRect(W,[-1.2,0],[-1.8,1.8]);t.id=slug+'-t0';t.h=4;t.cor=1;t.chapter=slug;t.wing=W;t.open=[wingSide(W,'u0'),wingSide(W,'u1')];out.push(t)}
      WING_PARTS.forEach(function(P,i){
        if(!c&&i>0)return;                       /* a slot whose chapter is hidden keeps only its first room */
        var r=wingRect(W,P.u,P.v);r.id=slug+P.k;r.h=P.h||4;r.chapter=slug;r.wing=W;r.lu=P.u;r.lv=P.v;
        if(P.part){r.part=P.part;r.partName=P.name}else r.cor=1;
        if(P.open)r.open=P.open.map(function(w){return wingSide(W,w)});
        if(P.doors)r.doors=P.doors.map(function(d){return {s:wingSide(W,d[0]),at:wingAlong(W,d[0],d[1]),w:d[2],h:d[3]}});
        if(i===0&&W.via)r.doors[0].w=3.6;
        if(P.part==='intro')r.entry=wingSide(W,'u0');
        if(P.spawn){var p=wingPt(W,P.spawn[0],P.spawn[1]),dv=P.spawn[2]==='f'?W.f:[-W.l[0],-W.l[1]];r.spawn=[p.x,p.z,Math.atan2(-dv[0],-dv[1])]}
        out.push(r)});
    });
    function RM0(id){return ROOMS.concat(out).filter(function(r){return r.id===id})[0]}
    Array.prototype.push.apply(ROOMS,out);
  })();
  ROOMS.forEach(function(r){if(r.chapter){var c=chap(r.chapter);r.c=c;if(c)r.name='Chapter '+c.num+' · '+c.title+(r.partName?' · '+r.partName:'')}});
  var RM={};ROOMS.forEach(function(r){RM[r.id]=r});
  var SPAWN={entrance:[0,22,0]};ROOMS.forEach(function(r){if(r.spawn&&(!r.chapter||r.c))SPAWN[r.id]=r.spawn});

  /* the building's footprint: everything indoors sits inside BOUNDS (computed from ROOMS) */
  var BOUNDS=(function(){var b={x1:-14,x2:14,z1:0,z2:-34};ROOMS.forEach(function(r){b.x1=Math.min(b.x1,r.x1);b.x2=Math.max(b.x2,r.x2);b.z2=Math.min(b.z2,r.z2)});b.x1-=4;b.x2+=4;b.z2-=4;return b})();
