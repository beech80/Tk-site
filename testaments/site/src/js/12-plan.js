  /* ======================================================================
     WORLD PLAN (metres; y up; the entrance faces +z)
     ====================================================================== */
  var ROOMS=[
    {id:'vestibule',name:'Vestibule',x1:-3,x2:3,z1:0,z2:-6,h:5.2,open:['s','n']},
    {id:'lobby',name:'Central Lobby',x1:-14,x2:14,z1:-6,z2:-34,h:10,doors:[{s:'w',at:-13},{s:'w',at:-27},{s:'e',at:-13},{s:'e',at:-27},{s:'n',at:-11},{s:'n',at:0},{s:'n',at:11},{s:'s',at:0,w:6,h:5.2}],spawn:[0,-11,0]},
    {id:'c-about',x1:-18,x2:-14,z1:-11,z2:-15,h:4,open:['e','w'],cor:1},
    {id:'about',name:'About TESTAMENTS',x1:-40,x2:-18,z1:-6,z2:-20,h:6,doors:[{s:'e',at:-13}],white:1,spawn:[-21,-13,Math.PI/2]},
    {id:'c-flourish',x1:-18,x2:-14,z1:-25,z2:-29,h:4,open:['e','w'],cor:1},
    {id:'flourish',name:'Chapter 001',x1:-42,x2:-18,z1:-21,z2:-37,h:7,doors:[{s:'e',at:-27}],chapter:'flourish',entry:'e',spawn:[-21,-29,Math.PI/2]},
    {id:'c-process',x1:14,x2:18,z1:-11,z2:-15,h:4,open:['e','w'],cor:1},
    {id:'process',name:'The Process',x1:18,x2:40,z1:-6,z2:-20,h:6,doors:[{s:'w',at:-13}],spawn:[21,-13,-Math.PI/2]},
    {id:'c-freedom',x1:14,x2:18,z1:-25,z2:-29,h:4,open:['e','w'],cor:1},
    {id:'freedom',name:'Chapter 003',x1:18,x2:42,z1:-21,z2:-37,h:7,doors:[{s:'w',at:-27}],chapter:'freedom',entry:'w',spawn:[21,-29,-Math.PI/2]},
    {id:'c-library',x1:-13,x2:-9,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'library',name:'Reading & Screening Room',x1:-27,x2:-7.5,z1:-38,z2:-58,h:6,doors:[{s:'s',at:-11}],spawn:[-11,-41,0]},
    {id:'c-becoming',x1:-2,x2:2,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'becoming',name:'Chapter 002',x1:-6.5,x2:6.5,z1:-38,z2:-58,h:7,doors:[{s:'s',at:0}],chapter:'becoming',entry:'s',spawn:[0,-41,0]},
    {id:'c-shop',x1:9,x2:13,z1:-34,z2:-38,h:4,open:['n','s'],cor:1},
    {id:'shop',name:'The Museum Shop',x1:7.5,x2:27,z1:-38,z2:-58,h:6,doors:[{s:'s',at:11}],spawn:[11,-41,0]}
  ];
  ROOMS.forEach(function(r){if(r.chapter){var c=chap(r.chapter);r.c=c;if(c)r.name='Chapter '+c.num+' · '+c.title}});
  var RM={};ROOMS.forEach(function(r){RM[r.id]=r});
  var SPAWN={entrance:[0,22,0]};ROOMS.forEach(function(r){if(r.spawn&&(!r.chapter||r.c))SPAWN[r.id]=r.spawn});

  /* the building's footprint: everything indoors sits inside BOUNDS (computed from ROOMS) */
  var BOUNDS=(function(){var b={x1:-14,x2:14,z1:0,z2:-34};ROOMS.forEach(function(r){b.x1=Math.min(b.x1,r.x1);b.x2=Math.max(b.x2,r.x2);b.z2=Math.min(b.z2,r.z2)});b.x1-=4;b.x2+=4;b.z2-=4;return b})();
