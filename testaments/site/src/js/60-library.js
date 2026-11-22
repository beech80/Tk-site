  /* ===== reading & screening room =====
     North half: a small cinema (screen, stepped upholstered rows, slatted acoustic walls, projector beam).
     South half: the reading lounge (tall bookcase with the editions face-out, marble reading table,
     lounge chairs, the lectern with the open magazine). Repeated parts are merged into a few meshes. */

  /* shared helpers for the library + shop (prefixed lib*) */
  function libMerge(parts,mat){
    var pos=[],nor=[],uv=[],m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),v=new T.Vector3(),one=new T.Vector3(1,1,1);
    parts.forEach(function(p){var g=p.g.index?p.g.toNonIndexed():p.g.clone();e.set(p.rx||0,p.ry||0,p.rz||0);q.setFromEuler(e);v.set(p.x||0,p.y||0,p.z||0);m.compose(v,q,one);g.applyMatrix4(m);
      Array.prototype.push.apply(pos,g.attributes.position.array);Array.prototype.push.apply(nor,g.attributes.normal.array);if(g.attributes.uv)Array.prototype.push.apply(uv,g.attributes.uv.array);g.dispose()});
    var bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(pos,3));bg.setAttribute('normal',new T.Float32BufferAttribute(nor,3));if(uv.length*3===pos.length*2)bg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    var mesh=new T.Mesh(bg,mat);scene.add(mesh);return mesh;
  }
  function libB(list,w,h,d,x,y,z,ry,rx){list.push({g:new T.BoxGeometry(w,h,d),x:x,y:y,z:z,ry:ry||0,rx:rx||0});return list}
  /* crisp, high-resolution sign plane (ppm = canvas pixels per metre) */
  function libSign(w,h,fn,ppm){ppm=ppm||420;var k=Math.min(1,4096/(w*ppm),4096/(h*ppm));return plane(w,h,ctex(Math.round(w*ppm*k),Math.round(h*ppm*k),fn),true)}
  var libMarbleT=null;
  function libMarble(){
    if(libMarbleT)return libMarbleT;
    libMarbleT=ctex(1024,512,function(x,W,H){x.fillStyle='#e9e5de';x.fillRect(0,0,W,H);var r=function(a){return Math.sin(a*12.9898)*43758.5453%1};
      for(var i=0;i<26;i++){var s=Math.abs(r(i+1)),yy=s*H,a=.04+Math.abs(r(i+7))*.18;x.strokeStyle='rgba(120,112,104,'+a+')';x.lineWidth=.6+Math.abs(r(i+3))*2.2;x.beginPath();x.moveTo(-20,yy);
        for(var px=0;px<=W+40;px+=40){yy+=Math.sin(px*.011+i)*9+(r(i*31+px)-.5)*14;x.lineTo(px,yy)}x.stroke()}
      var g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(0,0,0,.06)');x.fillStyle=g;x.fillRect(0,0,W,H)});
    return libMarbleT;
  }
  var LIBM={};
  function libMats(){
    if(LIBM.fabric)return LIBM;
    LIBM.fabric=new T.MeshStandardMaterial({color:0x2b2531,roughness:1});
    LIBM.fabricWarm=new T.MeshStandardMaterial({color:0x3a332d,roughness:.95});
    LIBM.oak=new T.MeshStandardMaterial({color:0x3b2c20,roughness:.62});
    LIBM.dark=new T.MeshStandardMaterial({color:0x0f0f10,roughness:.5,metalness:.2});
    LIBM.brass=new T.MeshStandardMaterial({color:0x8d7046,roughness:.35,metalness:.85});
    LIBM.marble=new T.MeshStandardMaterial({color:0xffffff,map:libMarble(),roughness:.22,metalness:.05});
    LIBM.shade=new T.MeshBasicMaterial({color:0xffe6c2,side:T.DoubleSide});
    LIBM.page=new T.MeshStandardMaterial({color:0xd9d4ca,roughness:.85});
    var slat=ctex(256,512,function(x,W,H){x.fillStyle='#141217';x.fillRect(0,0,W,H);for(var i=0;i<8;i++){var g=x.createLinearGradient(i*32,0,i*32+32,0);g.addColorStop(0,'#2a2119');g.addColorStop(.5,'#3a2d22');g.addColorStop(1,'#231b15');x.fillStyle=g;x.fillRect(i*32+5,0,22,H)}});
    LIBM.slat=new T.MeshStandardMaterial({map:slat,roughness:.8});
    return LIBM;
  }
  var libCovers={};
  function coverTex(c,light){
    var key=c.slug+(light?'L':'D');if(libCovers[key])return libCovers[key];
    return libCovers[key]=ctex(840,1100,function(x,W){x.fillStyle=light?'#f5f3ef':'#090909';x.fillRect(0,0,W,1100);var fg=light?'#090909':'#f5f3ef';x.fillStyle=fg;x.textBaseline='alphabetic';x.font='500 76px "Bodoni Moda"';sp(x,'TESTAMENTS',W/2,132,11);x.fillStyle=light?'#3d3b38':'#d2d0cb';x.font='600 22px Inter';sp(x,'UNDERSTAND THE WHY.',W/2,206,7);
      x.font='400 420px "Bodoni Moda"';x.strokeStyle=light?'rgba(8,8,8,.35)':'rgba(255,255,255,.45)';x.lineWidth=2.8;x.textAlign='center';x.strokeText(c.num,W/2,660);x.fillStyle=fg;x.font='italic 400 88px "Bodoni Moda"';x.fillText(c.title,W/2,860);x.fillStyle='#b49be0';x.fillRect(W/2-28,896,56,4);x.fillStyle=fg;x.font='500 24px Inter';sp(x,who(c).toUpperCase(),W/2,956,8)});
  }

  function buildLibrary(){
    var Lb=RM.library,M=libMats(),sv=$('screenVid'),vt=null;try{vt=new T.VideoTexture(sv);vt.encoding=T.sRGBEncoding;vt.minFilter=T.LinearMipmapLinearFilter;vt.magFilter=T.LinearFilter;vt.generateMipmaps=R.capabilities.isWebGL2;if(!vt.generateMipmaps)vt.minFilter=T.LinearFilter;vt.anisotropy=R.capabilities.getMaxAnisotropy()}catch(e){}
    screenTex=vt;
    var cx=-17.25,sw=9.2,sh=sw*822/1620,sy=3.25,sz=-57.7;

    /* --- cinema: screen in a black reveal, masking, soft spill on the floor --- */
    box(sw+.5,sh+.5,.12,MAT.frame,cx,sy,sz-.06);
    var scr=new T.Mesh(new T.PlaneGeometry(sw,sh),new T.MeshBasicMaterial(vt?{map:vt,toneMapped:false}:{color:0x222222}));scr.position.set(cx,sy,sz);scene.add(scr);
    var halo=glow(sw*1.7,sh*1.9,0x9fa6c8,.12);halo.position.set(cx,sy,sz-.04);scene.add(halo);
    floorGlow(cx,-55.5,10,4,0xb9c0dc,.16);
    addInter(cx,-57.7,'pz',13,'Watch','Watch the TESTAMENTS film',function(){openFilm()});

    /* --- stepped rows: three upholstered benches on rising risers (one solid block for collision) --- */
    var fab=[],base=[],arm=[],riser=[],rows=[{z:-52.6,y:0},{z:-50.4,y:.2},{z:-48.2,y:.4}],rw=8.2;
    rows.forEach(function(r){
      if(r.y)libB(riser,rw+.2,r.y,2.1,cx,r.y/2,r.z+.05);
      libB(base,rw-.3,.34,.46,cx,r.y+.17,r.z+.02);
      var ns=8,pw=rw/ns;
      for(var k=0;k<ns;k++){var sx=cx-rw/2+pw*(k+.5);
        libB(fab,pw-.1,.15,.6,sx,r.y+.43,r.z-.02);libB(fab,pw-.1,.06,.5,sx,r.y+.52,r.z-.04);
        libB(fab,pw-.08,.62,.13,sx,r.y+.8,r.z+.3,0,-.14);}
      for(var k2=0;k2<=ns;k2++){var ax=cx-rw/2+pw*k2;libB(arm,.07,.05,.56,ax,r.y+.66,r.z+.02);libB(base,.06,.3,.5,ax,r.y+.5,r.z+.02)}
    });
    libMerge(fab,M.fabric);libMerge(base,M.dark);libMerge(arm,M.brass);if(riser.length)libMerge(riser,MAT.stone);
    col(cx-rw/2-.25,cx+rw/2+.25,-53.05,-47.05);
    /* aisle step lights on both ends of each row (emissive strips, no real lights) */
    libScreenFx(cx,sy,sz,sw,sh,rows,rw);
    var stepL=[];rows.forEach(function(r){[-1,1].forEach(function(s){libB(stepL,.22,.025,.05,cx+s*(rw/2+.12),r.y+.06,r.z+1.06)})});
    libMerge(stepL,MAT.warm);
    rows.forEach(function(r){[-1,1].forEach(function(s){var g=glow(.9,.6,0xffd9a6,.22);g.rotation.x=-Math.PI/2;g.position.set(cx+s*(rw/2+.12),r.y+.012,r.z+1.2);scene.add(g)})});
    /* the cinema is dressed in black: carpet under the seating, dark fabric on the screen wall and side walls */
    var cz1=-47.4,cz2=Lb.z2+.24;
    var carpet=new T.Mesh(new T.PlaneGeometry(Lb.x2-Lb.x1-.4,cz1-cz2),new T.MeshStandardMaterial({color:0x121016,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));carpet.rotation.x=-Math.PI/2;carpet.position.set(cx,.03,(cz1+cz2)/2);scene.add(carpet);
    var drape=[];libB(drape,Lb.x2-Lb.x1-.4,5.2,.04,cx,2.6,cz2);libB(drape,.04,5.2,cz1-cz2,Lb.x1+.17,2.6,(cz1+cz2)/2);libB(drape,.04,5.2,cz1-cz2,Lb.x2-.17,2.6,(cz1+cz2)/2);
    libMerge(drape,new T.MeshStandardMaterial({color:0x0c0b0e,roughness:1}));

    /* --- slatted acoustic panels on both side walls of the cinema --- */
    var ac=[];[{x:Lb.x1+.2,n:1},{x:Lb.x2-.2,n:-1}].forEach(function(w){for(var i=0;i<6;i++){var z=-56.6+i*1.45;libB(ac,.1,3.8,1.25,w.x,2.4,z)}});
    libMerge(ac,M.slat);
    /* a low reveal light under the panels */
    [Lb.x1+.3,Lb.x2-.3].forEach(function(x){box(.02,.02,8.6,MAT.warm,x,.45,-53)});

    /* --- projector on the ceiling with a faint beam --- */
    var pj=[];libB(pj,.7,.36,.9,cx,5.55,-45.4);libB(pj,.08,.4,.08,cx,5.85,-45.4);libMerge(pj,MAT.metal);
    var lens=new T.Mesh(new T.CircleGeometry(.09,16),MAT.lamp);lens.position.set(cx,5.52,-45.86);lens.rotation.y=Math.PI;scene.add(lens);
    var ap=[cx,5.52,-45.88],hw=sw/2,hh=sh/2,cs=[[cx-hw,sy-hh],[cx+hw,sy-hh],[cx+hw,sy+hh],[cx-hw,sy+hh]],bp=[],bt=[];
    for(var i=0;i<4;i++){var a=cs[i],b=cs[(i+1)%4];bp.push(ap[0],ap[1],ap[2],a[0],a[1],sz+.02,b[0],b[1],sz+.02);bt.push(0,0,0,1,1,0,1,1,1)}
    var bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(bp,3));bg.setAttribute('aT',new T.Float32BufferAttribute(bt,3));
    var beamU={uT:{value:0}};
    var beam=new T.Mesh(bg,new T.ShaderMaterial({uniforms:beamU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
      vertexShader:'attribute vec3 aT;varying vec3 vT;varying vec3 vP;void main(){vT=aT;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform float uT;varying vec3 vT;varying vec3 vP;void main(){float t=vT.y;float e=min(min(vT.x,vT.z),1.-max(vT.x,vT.z));float a=.022*(1.-t*.8)*smoothstep(0.,.1,t);float d=.85+.15*sin(vP.x*7.+vP.y*5.+uT*.6)*sin(vP.z*3.-uT*.4);gl_FragColor=vec4(vec3(.78,.8,.95)*a*d,1.);}'}));
    beam.frustumCulled=false;scene.add(beam);
    if(!S.reduced)HOOKS.frame.push(function(dt){if(curRoom.id==='library')beamU.uT.value+=dt});

    libPlaque(Lb,'e',-46.1,2.3,3,1.5,'THE SCREENING ROOM','The film','TESTAMENTS · on loop');

    /* --- reading lounge --- */
    /* tall bookcase on the west wall: oak frame, spines, the editions face-out */
    var bx=Lb.x1+.3,bz0=-39.6,bz1=-47.2,bl=bz0-bz1,bc=(bz0+bz1)/2,bh=4.4,oak=[],shelvesY=[.12,1.05,1.95,2.85,3.75];
    libB(oak,.04,bh,bl,bx-.2,bh/2,bc);libB(oak,.44,bh,.06,bx,bh/2,bz0);libB(oak,.44,bh,.06,bx,bh/2,bz1);libB(oak,.44,bh,.06,bx,bh/2,bc);libB(oak,.44,.06,bl,bx,bh,bc);
    shelvesY.forEach(function(y){libB(oak,.44,.05,bl,bx,y,bc)});libMerge(oak,M.oak);
    var spineCols=[0x0d0d0d,0xe6e1d8,0x2c2a28,0x3a2d4c,0x8a8478],spines=spineCols.map(function(){return []}),seed=7,rnd=function(){seed=(seed*16807)%2147483647;return seed/2147483647};
    shelvesY.slice(0,4).forEach(function(y,row){
      [[bz1+.08,bc-.08],[bc+.08,bz0-.08]].forEach(function(seg,half){
        var faceOut=(row===1||row===2)&&half===(row===1?1:0);
        if(faceOut)return;
        var z=seg[0];while(z<seg[1]-.06){var th=.025+rnd()*.035,h=.55+rnd()*.25;if(z+th>seg[1])break;libB(spines[Math.floor(rnd()*spineCols.length)],.28+rnd()*.06,h,th,bx+.02,y+.025+h/2,z+th/2);z+=th+.004;if(rnd()<.06)z+=.18}
      });
    });
    spines.forEach(function(l,i){if(l.length)libMerge(l,new T.MeshStandardMaterial({color:spineCols[i],roughness:.8}))});
    /* face-out editions (one merged mesh per cover texture) */
    var faceGroups={};
    [[1,bc+.08,bz0-.08],[2,bz1+.08,bc-.08]].forEach(function(r){var y=shelvesY[r[0]]+.025+.36,n=CH.length,span=r[2]-r[1];
      CH.forEach(function(c,i){var key=c.slug+(r[0]===1?'L':'D');(faceGroups[key]=faceGroups[key]||{c:c,l:r[0]===1,p:[]}).p.push({g:new T.PlaneGeometry(.52,.68),x:bx+.08,y:y,z:r[1]+span*(i+.5)/n,ry:Math.PI/2,rx:0,rz:0});
      })});
    Object.keys(faceGroups).forEach(function(k){var f=faceGroups[k];libMerge(f.p,new T.MeshBasicMaterial({map:coverTex(f.c,f.l)}))});
    var bw=spot(bl*1.05,4.8,.42);place(bw,Lb.x1+.17,2.3,bc,'px');
    col(Lb.x1,Lb.x1+.6,bz1-.1,bz0+.1);
    addInter(Lb.x1+.6,bc,'px',3.8,'Browse','The chapters',openChapterList);

    /* marble reading table with four chairs and two low brass lamps */
    var tx=-21.2,tz=-42.9,tl=3.4,tw=1.15,tb=[];
    var top=box(tw,.07,tl,M.marble,tx,.755,tz);top.material=M.marble;
    libB(tb,.32,.72,.8,tx,.36,tz-tl/2+.75);libB(tb,.32,.72,.8,tx,.36,tz+tl/2-.75);libMerge(tb,M.marble);
    var chF=[],chL=[];
    [-1,1].forEach(function(s){[-0.8,0.8].forEach(function(dz){var x=tx+s*(tw/2+.42),z=tz+dz,ry=s>0?Math.PI/2:-Math.PI/2;
      libB(chF,.48,.08,.46,x,.47,z);libB(chF,.06,.5,.46,x+s*.23,.78,z);
      [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(function(o){libB(chL,.03,.45,.03,x+o[0],.225,z+o[1])})})});
    libMerge(chF,M.fabricWarm);libMerge(chL,M.brass);
    [tz-1.05,tz+1.05].forEach(function(z){libLamp(tx,.79,z,.42)});
    var tg=glow(tw*2.2,tl*1.2,0xffdcae,.22);tg.rotation.x=-Math.PI/2;tg.position.set(tx,.795,tz);scene.add(tg);
    col(tx-tw/2-.75,tx+tw/2+.75,tz-tl/2-.05,tz+tl/2+.05);

    /* lounge: rug, two club chairs and a side table with a lamp */
    var lx=-15.8,lz=-41.4;
    var rug=new T.Mesh(new T.PlaneGeometry(4.4,3),new T.MeshStandardMaterial({roughness:1,map:ctex(512,350,function(x,W,H){x.fillStyle='#1a171c';x.fillRect(0,0,W,H);x.strokeStyle='rgba(180,155,224,.28)';x.lineWidth=3;x.strokeRect(18,18,W-36,H-36);x.strokeStyle='rgba(255,255,255,.06)';x.lineWidth=1;x.strokeRect(30,30,W-60,H-60)})}));
    rug.rotation.x=-Math.PI/2;rug.position.set(lx,.012,lz);scene.add(rug);
    var cf=[],cb=[];
    [-1,1].forEach(function(s){var x=lx+s*1.15;
      libB(cb,.86,.2,.86,x,.16,lz);libB(cf,.84,.2,.84,x,.36,lz);libB(cf,.2,.6,.84,x+s*.34,.66,lz);libB(cf,.84,.42,.16,x,.56,lz-.36);libB(cf,.84,.42,.16,x,.56,lz+.36)});
    libMerge(cf,M.fabric);libMerge(cb,M.dark);
    var st=[];libB(st,.5,.5,.5,lx,.25,lz-.1);libMerge(st,M.marble);libLamp(lx,.5,lz-.1,.5);
    col(lx-1.65,lx+1.65,lz-.5,lz+.45);
    floorGlow(lx,lz,4.6,3.4,0xffe0b8,.16);
    /* one soft warm fill over the reading lounge (the only real-time light in the room) */
    var rl=new T.PointLight(0xffe6c8,.75,18,2);rl.position.set(-17,4.6,-42.5);scene.add(rl);

    /* the lectern with the open magazine */
    var lec=new T.Group(),lb=[];
    var ped=new T.Mesh(new T.BoxGeometry(.5,1.02,.42),M.marble);ped.position.y=.51;lec.add(ped);
    var bse=new T.Mesh(new T.BoxGeometry(.7,.06,.6),M.dark);bse.position.y=.03;lec.add(bse);
    var desk=new T.Mesh(new T.BoxGeometry(1.08,.05,.78),M.oak);desk.position.y=1.08;desk.rotation.x=.45;lec.add(desk);
    var lip=new T.Mesh(new T.BoxGeometry(1.08,.06,.03),M.brass);lip.position.set(0,.9,.4);lip.rotation.x=.45;lec.add(lip);
    var mag=plane(.98,.64,ctex(1520,1000,function(x,W,H){x.fillStyle='#f5f3ef';x.fillRect(0,0,W,H);x.fillStyle='#090909';x.fillRect(0,0,W/2,H);x.textAlign='center';
      x.fillStyle='#f5f3ef';x.font='500 96px "Bodoni Moda"';sp(x,'TESTAMENTS',W/4,470,8);x.fillStyle='#b49be0';x.fillRect(W/4-50,540,100,8);
      x.fillStyle='#090909';x.font='italic 400 120px "Bodoni Moda"';x.textAlign='center';x.fillText('Read the',W*3/4,400);x.fillText('magazine',W*3/4,530);x.font='700 64px Inter';sp(x,'PRESS E / TAP',W*3/4,720,6);
      var g=x.createLinearGradient(W/2-60,0,W/2+60,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(W/2-60,0,120,H)}),true);
    mag.rotation.x=-Math.PI/2+.45;mag.position.set(0,1.107,.012);lec.add(mag);lec.position.set(-11,0,-43.5);scene.add(lec);
    col(-11.4,-10.6,-43.85,-43.15);
    var rs=libSign(1.3,.42,function(c,W,H){c.fillStyle='#0b0b0c';c.fillRect(0,0,W,H);c.fillStyle='#f7f4ee';c.textAlign='center';c.font='600 '+Math.round(H*.3)+'px Inter';sp(c,'READ THE MAGAZINE',W/2,H*.48,Math.round(H*.04));c.fillStyle='#b49be0';c.fillRect(W/2-H*.12,H*.6,H*.24,Math.max(4,H*.02));c.fillStyle='#d8d5cf';c.font='500 '+Math.round(H*.2)+'px Inter';sp(c,'PRESS E / TAP',W/2,H*.87,Math.round(H*.03))},500);
    place(rs,-11,2.05,-43.82,'pz');var rsp=[];libB(rsp,.02,.75,.02,-11.5,1.6,-43.86);libB(rsp,.02,.75,.02,-10.5,1.6,-43.86);libMerge(rsp,M.brass);
    var lg=glow(1.4,1,0xfff0dc,.1);lg.rotation.x=-Math.PI/2+.45;lg.position.set(-11,1.13,-43.5);scene.add(lg);
    floorGlow(-11,-43.5,3,3,0xfff0dc,.3);
    addInter(-11,-43.5,null,2.8,'Read','Read the magazine',function(){openReader()});

    /* signage */
    libPlaque(Lb,'s',-20.5,2.8,6,1.8,'THE READING ROOM','Read slowly. Come back often.',null,true);
  }

  /* low brass table lamp with a glowing shade (no real-time light) */
  function libLamp(x,y,z,h){
    var stem=new T.Mesh(new T.CylinderGeometry(.012,.012,h,6),libMats().brass);stem.position.set(x,y+h/2,z);scene.add(stem);
    var ft=new T.Mesh(new T.CylinderGeometry(.08,.09,.025,16),libMats().brass);ft.position.set(x,y+.012,z);scene.add(ft);
    var sh=new T.Mesh(new T.CylinderGeometry(.11,.17,.17,20,1,true),libMats().shade);sh.position.set(x,y+h,z);scene.add(sh);
    var g=glow(.9,.9,0xffd9a6,.35);g.position.set(x,y+h,z);g.renderOrder=2;scene.add(g);
    var pool=glow(1.3,1.3,0xffd9a6,.3);pool.rotation.x=-Math.PI/2;pool.position.set(x,y+.006,z);scene.add(pool);
  }
  /* large, high-contrast wall plaque: kicker in caps, a big serif title, an optional small line */
  function libPlaque(r,side,along,y,w,h,kick,title,small,big){
    var pos=onWall(r,side,along),ppm=440;
    var m=libSign(w,h,function(c,W,H){c.fillStyle='#0b0b0c';c.fillRect(0,0,W,H);c.fillStyle='#b49be0';c.fillRect(W*.06,H*.13,Math.round(H*.12),Math.max(5,Math.round(H*.012)));
      c.fillStyle='#d8d5cf';c.font='600 '+Math.round(H*.1)+'px Inter';sp(c,kick,W*.06,H*.3,Math.round(H*.03),'left');
      c.fillStyle='#f7f4ee';c.font=(big?'italic ':'')+'400 '+Math.round(H*(big?.2:.25))+'px "Bodoni Moda"';c.textAlign='left';c.fillText(title,W*.06,H*(small?.6:.66));
      if(small){c.fillStyle='#bdbab3';c.font='500 '+Math.round(H*.09)+'px Inter';sp(c,small.toUpperCase(),W*.06,H*.82,Math.round(H*.022),'left')}},ppm);
    place(m,pos.x+NV[pos.n][0]*.1,y,pos.z+NV[pos.n][1]*.1,pos.n);
    var bk=new T.Mesh(new T.BoxGeometry(w+.06,h+.06,.08),MAT.frame);place(bk,pos.x+NV[pos.n][0]*.055,y,pos.z+NV[pos.n][1]*.055,pos.n);
    var s=spot(w*1.5,h*2.2,.35);place(s,pos.x+NV[pos.n][0]*.006,y+h*.35,pos.z+NV[pos.n][1]*.006,pos.n);
    return m;
  }

  /* cinema set-piece: the screen's light falling on the room (fake, additive). Seat-back rim glow + ceiling bounce;
     on medium/high one cool fill light breathes with the film. */
  function libScreenFx(cx,sy,sz,sw,sh,rows,rw){
    var hi=S.quality==='medium'||S.quality==='high';
    var edge=glow(sw*1.12,sh*1.2,0xc8d0f0,.18);edge.position.set(cx,sy,sz-.03);scene.add(edge);
    var ceil=glow(sw*1.4,6,0x9fa8d8,.07);ceil.rotation.x=Math.PI/2;ceil.position.set(cx,5.95,sz+3);scene.add(ceil);
    var rim=[];rows.forEach(function(r){var g=glow(rw*1.05,.5,0xb6bfe6,.09);g.position.set(cx,r.y+1.08,r.z+.22);rim.push(g);scene.add(g)});
    var stage=[];libB(stage,sw+1.2,.18,.9,cx,.09,sz+.6);libMerge(stage,libMats().dark);
    var lip=box(sw+1.2,.012,.012,MAT.warm,cx,.19,sz+1.05);
    floorGlow(cx,-51,9,9,0x6e42a3,.05);
    if(!hi)return;
    var fl=new T.PointLight(0xaab4e8,.55,14,2);fl.position.set(cx,sy,sz+3.2);scene.add(fl);
    var t=0;if(!S.reduced)HOOKS.frame.push(function(dt){if(curRoom.id!=='library')return;t+=dt;var k=.85+.1*Math.sin(t*1.7)*Math.sin(t*.53+1)+.05*Math.sin(t*4.1);fl.intensity=.55*k;edge.material.opacity=.18*k;rim.forEach(function(g){g.material.opacity=.09*k})});
  }
