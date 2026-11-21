  /* ===== set dressing helpers shared by About + Process (ap* prefix) =====
     All baked/fake light: additive gradient planes, emissive strips, open cones. Beams and extra
     washes only on medium/high; phones get the cheap foot shadow + cove only. */
  var AP_G=null,AP_FT=null,AP_PLANE=null;
  function apHi(){var q=S.quality==='auto'?(coarse?'low':'medium'):S.quality;return q!=='low'}
  function apGrad(){if(!AP_G)AP_G=ctex(16,256,function(c,W,H){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)});return AP_G}
  function apFootTex(){if(!AP_FT)AP_FT=ctex(16,128,function(c,W,H){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,.8)');c.fillStyle=g;c.fillRect(0,0,W,H)});return AP_FT}
  function apWallLen(r,side){return side==='n'||side==='s'?r.x2-r.x1:r.z1-r.z2}
  function apWallMid(r,side){return side==='n'||side==='s'?(r.x1+r.x2)/2:(r.z1+r.z2)/2}
  /* ambient-occlusion foot shadow + ceiling cove light along every wall without a door */
  function apDress(r,cove,coveOp,sides){(sides||['n','s','e','w']).forEach(function(sd){
    var L=apWallLen(r,sd)-.3,pos=onWall(r,sd,apWallMid(r,sd)),n=NV[pos.n];
    var f=new T.Mesh(new T.PlaneGeometry(L,.8),new T.MeshBasicMaterial({map:apFootTex(),transparent:true,depthWrite:false}));place(f,pos.x+n[0]*.01,.4,pos.z+n[1]*.01,pos.n);
    var strip=new T.Mesh(new T.BoxGeometry(L,.03,.05),new T.MeshBasicMaterial({color:cove}));place(strip,pos.x+n[0]*.2,r.h-.35,pos.z+n[1]*.2,pos.n);
    var w=new T.Mesh(new T.PlaneGeometry(L,2.2),new T.MeshBasicMaterial({map:apGrad(),color:cove,transparent:true,opacity:coveOp,blending:T.AdditiveBlending,depthWrite:false}));
    place(w,pos.x+n[0]*.02,r.h-.35-1.1,pos.z+n[1]*.02,pos.n)})}
  /* a soft volumetric beam: open cone from ceiling to floor, bright at the top (medium/high only) */
  function apBeam(x,z,top,rTop,rBot,col,op){if(!apHi())return null;var geo=new T.CylinderGeometry(rTop,rBot,top,28,1,true);
    var m=new T.Mesh(geo,new T.MeshBasicMaterial({map:apGrad(),color:col,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
    m.position.set(x,top/2,z);scene.add(m);var d=new T.Mesh(new T.CylinderGeometry(rTop*1.3,rTop*1.3,.04,20),new T.MeshBasicMaterial({color:0xfff6e8}));d.position.set(x,top-.02,z);scene.add(d);return m}
  /* wall wash above a sign / photo, every tier (single additive plane) */
  function apWash(r,side,along,y,w,h,op,col){var pos=onWall(r,side,along),n=NV[pos.n],s=spot(w,h,op,col);place(s,pos.x+n[0]*.012,y,pos.z+n[1]*.012,pos.n);return s}
  /* ===== about =====
     One idea per wall, set large. Entering from the lobby (facing west):
       west   the manifesto            north  the medium: photography · conversation · editorial
       south  the founder              east   mission and vision, flanking the door (read on the way out)
     Uses the ex* sign helpers from 50-chapters.js (shared scope). */
  function buildAbout(){
    var A=RM.about,dk=EX.dInk,md=EX.dKick,bg=EX.dBg,vio=EX.dVio;
    /* west: the manifesto */
    exOnWall(A,'w',-13,3.1,9.4,4.2,function(x,W,H){exBg(x,W,H,bg);var L=W*.07;
      exK(x,'About TESTAMENTS',L,H*.14,H*.05,md);
      exT(x,'THE STORY',L-H*.01,H*.38,H*.17,dk,'left',H*.02);exT(x,'BEHIND THE STORY.',L-H*.01,H*.58,H*.17,dk,'left',H*.02);
      exRule(x,L,H*.67,H*.08,H*.008,vio);
      exI(x,'A person is more than the moment in which we meet them.',L,H*.8,H*.082,'#24221f');
      exK(x,'Read the manifesto',L,H*.92,H*.042,vio)},{act:aboutManifesto,label:'Read the manifesto',r:9});
    /* north: the medium */
    [['01','Photography','Photography is not decoration.',-34.6],['02','Conversation','Built around genuine conversation rather than scripted answers.',-29],['03','Editorial','Shaping everything into a chapter that reads as one piece.',-23.4]].forEach(function(m){
      exOnWall(A,'n',m[3],2.7,4.6,2.8,function(x,W,H){exBg(x,W,H,bg);var L=W*.09;
        exK(x,'The medium · '+m[0],L,H*.17,H*.05,md);exT(x,m[1],L,H*.42,H*.15,dk);exRule(x,L,H*.52,H*.08,H*.01,vio);
        exW(x,m[2],L,H*.68,W*.82,H*.075,H*.1,'italic 400 '+Math.round(H*.075)+'px "Bodoni Moda"','#2b2926')},{act:aboutManifesto,label:'The medium · '+m[1],r:4.5})});
    /* south: the founder */
    var pos=onWall(A,'s',-25.6),g=new T.Group(),fr=new T.Mesh(new T.BoxGeometry(2,2.6,.06),MAT.frame);fr.position.z=.03;g.add(fr);
    var inner=exSign(1.86,2.46,function(c,W,H){c.fillStyle='#e4e0d8';c.fillRect(0,0,W,H);c.strokeStyle='#8e8a82';c.lineWidth=3;c.setLineDash([12,12]);c.strokeRect(W*.08,H*.06,W*.84,H*.88);exK(c,'Portrait',W/2,H*.47,H*.042,'#3f3c37','center');exK(c,'To be supplied',W/2,H*.56,H*.042,'#3f3c37','center')},300);
    inner.position.z=.065;g.add(inner);place(g,pos.x,2.5,pos.z,pos.n);var fs=spot(4.4,5.6,.25);place(fs,pos.x,3,pos.z-.01,'nz');
    addInter(pos.x,pos.z,'nz',4,'Read','The founder',aboutFounder,{y:2.5,w:2,h:2.6});
    exOnWall(A,'s',-32,2.5,5,2.6,function(x,W,H){exBg(x,W,H,bg);var L=W*.08;
      exK(x,'The founder',L,H*.18,H*.055,md);exT(x,'Matthew Beecher',L,H*.45,H*.16,dk);exRule(x,L,H*.56,H*.07,H*.01,vio);
      exK(x,'Photographer · Filmmaker · Storyteller',L,H*.71,H*.05,'#3a3733');exI(x,'Biography on approval.',L,H*.86,H*.065,'#55524c')},{act:aboutFounder,label:'The founder',r:5});
    /* east: mission and vision, flanking the door */
    [['The mission','To preserve personal stories through meaningful conversations, cinematic photography, and thoughtful editorial storytelling.',-8.5],['The vision','To build a lasting collection of human experiences that encourages understanding, reflection, and connection across different walks of life.',-17.5]].forEach(function(m){
      exOnWall(A,'e',m[2],2.9,4.6,3.4,function(x,W,H){exBg(x,W,H,bg);var L=W*.08;exK(x,m[0],L,H*.16,H*.05,md);exRule(x,L,H*.22,H*.07,H*.01,vio);
        exW(x,m[1],L,H*.36,W*.84,H*.07,H*.1,null,dk)},{act:aboutMission,label:m[0],r:5})});
    /* --- light and dressing --- */
    apDress(A,0xfff0dc,.16,['n','s','w']);
    apWash(A,'w',-13,3.6,13,6.4,.32);[-34.6,-29,-23.4].forEach(function(a){apWash(A,'n',a,3.2,6,5,.22)});
    apWash(A,'s',-32,3,6.5,4.6,.2);apWash(A,'e',-8.5,3.4,6,5,.18);apWash(A,'e',-17.5,3.4,6,5,.18);
    /* purple threshold light under the manifesto: a single restrained accent */
    var vs=new T.Mesh(new T.BoxGeometry(.05,.03,9.2),new T.MeshBasicMaterial({color:0x8a5cc8}));vs.position.set(A.x1+.25,.06,-13);scene.add(vs);
    var vg=floorGlow(A.x1+.9,-13,1.6,10,0x6e42a3,.35);
    /* a charcoal reading rug anchoring the bench */
    var rug=exSign(6,3.2,function(c,W,H){c.fillStyle='#2a2826';c.fillRect(0,0,W,H);c.strokeStyle='#4a4641';c.lineWidth=W*.006;c.strokeRect(W*.03,H*.06,W*.94,H*.88);
      for(var k=0;k<900;k++){c.fillStyle='rgba(255,255,255,'+(Math.random()*.03)+')';c.fillRect(Math.random()*W,Math.random()*H,2,2)}},120);
    rug.rotation.x=-Math.PI/2;rug.position.set(-29,.012,-13);scene.add(rug);
    apBeam(-29,-13,A.h,.18,1.6,0xfff1dc,.05);apBeam(-37.2,-13,A.h,.12,1.1,0xfff1dc,.035);
    box(3,.46,.7,MAT.bench,-29,.23,-13);col(-30.5,-27.5,-13.4,-12.6);
    var al=apHi()&&new T.PointLight(0xfff4e6,0.8,20,2);if(al){al.position.set(-29,5.2,-13);scene.add(al)}
  }
