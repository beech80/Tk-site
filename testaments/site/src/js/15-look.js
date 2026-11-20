  /* ======================================================================
     LOOK (lighting & rendering): procedural materials, environment
     reflections, gallery light, atmosphere, night sky and post-processing.
     Everything runs through HOOKS. HOOKS is declared in 20-engine.js, which
     is concatenated after this file, so registration waits one microtask
     (the engine itself only builds after three.js has loaded, much later).
     Tiers: 'low' = no post, cheap single-plane material detail;
            'medium' = HDR target + reduced-res bloom + vignette + dither;
            'high' = full-res-ish bloom (2 levels), monument shadows,
                     very light grain and edge chromatic aberration.
     ====================================================================== */
  var LK={tier:null,post:false,hdr:null,broken:false,t:0,noise:null,u:[],sky:null,moon:null,dust:null,vols:[],w:0,h:0,dbs:null};
  function lookTier(){return S.quality==='auto'?(coarse?'low':'medium'):S.quality}
  Promise.resolve().then(function(){
    HOOKS.afterMaterials.push(function(){try{lookMaterials()}catch(e){console.warn('look: materials',e)}});
    HOOKS.afterBuild.push(function(){try{lookAfterBuild()}catch(e){console.warn('look: build',e)}});
    HOOKS.frame.push(lookFrame);
    HOOKS.resize.push(function(){LK.w=0});
    HOOKS.render=lookRender;
  });

  /* ---------- shared tileable noise (RGBA: large blotch, mid cloud, fine grain, veins) ---------- */
  function lookNoiseTex(){
    var N=256,seed=7;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
    var lats={};function lat(p){if(!lats[p]){var a=new Float32Array(p*p);for(var i=0;i<p*p;i++)a[i]=rnd();lats[p]=a}return lats[p]}
    function vn(p,u,v){var a=lat(p),x=u*p,y=v*p,xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
      var x0=xi%p,y0=yi%p,x1=(x0+1)%p,y1=(y0+1)%p;var A=a[y0*p+x0],B=a[y0*p+x1],C=a[y1*p+x0],D=a[y1*p+x1];return A+(B-A)*fx+(C-A)*fy+(A-B-C+D)*fx*fy}
    function fbm(ps,ws,u,v){var s=0;for(var i=0;i<ps.length;i++)s+=vn(ps[i],u,v)*ws[i];return s}
    function st(v,k){return Math.max(0,Math.min(1,(v-.5)*k+.5))}
    var d=new Uint8Array(N*N*4);
    for(var y=0;y<N;y++)for(var x=0;x<N;x++){var u=x/N,v=y/N,i=(y*N+x)*4;
      d[i]=st(fbm([3,6,12,24],[.45,.28,.17,.1],u,v),2.2)*255;
      d[i+1]=st(fbm([8,16,32,64],[.4,.3,.2,.1],u,v),2.2)*255;
      d[i+2]=st(fbm([64,128,256],[.45,.35,.2],u,v),2.4)*255;
      var w=fbm([2,4,8,16],[.45,.3,.15,.1],u,v);d[i+3]=(1-Math.abs(Math.sin(Math.PI*2*(2*u+v)+w*7)))*255;
    }
    var t=new T.DataTexture(d,N,N,T.RGBAFormat);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;
    t.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;
  }

  /* ---------- world-space (triplanar) detail injected into MeshStandardMaterial ----------
     p = [scale (1/m), colour variation, roughness variation, accent amount]
     e = [accent r,g,b, vein sharpness]; kind adds a define (FLOOR, STONE, VEIN, PAVE) */
  function lookDetail(m,kind,p,e){
    var cheap=LK.tier==='low';m.defines=m.defines||{};if(kind)m.defines['LK_'+kind]='';if(cheap)m.defines.LK_CHEAP='';
    var P4=new T.Vector4(p[0],p[1],p[2],p[3]),E4=new T.Vector4(e?e[0]:0,e?e[1]:0,e?e[2]:0,e?e[3]:8);
    m.onBeforeCompile=function(sh){
      sh.uniforms.lkNoise={value:LK.noise};sh.uniforms.lkP={value:P4};sh.uniforms.lkE={value:E4};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLkW;\nvarying vec3 vLkN;')
        .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvLkW=(modelMatrix*vec4(transformed,1.0)).xyz;vLkN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLkW;\nvarying vec3 vLkN;\nuniform sampler2D lkNoise;uniform vec4 lkP;uniform vec4 lkE;\nfloat lkHash(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}')
        .replace('#include <map_fragment>',[
          '#include <map_fragment>',
          'vec3 lkB=abs(normalize(vLkN));float lkDist=length(vLkW-cameraPosition);float lkJ=0.0;',
          '#ifdef LK_CHEAP',
          ' vec2 lkUV=lkB.y>max(lkB.x,lkB.z)?vLkW.xz:(lkB.x>lkB.z?vLkW.zy:vLkW.xy);vec4 lkN=texture2D(lkNoise,lkUV*lkP.x);',
          '#else',
          ' lkB=lkB*lkB;lkB=lkB*lkB;lkB/=dot(lkB,vec3(1.0));vec3 lkQ=vLkW*lkP.x;',
          ' vec4 lkN=texture2D(lkNoise,lkQ.zy)*lkB.x+texture2D(lkNoise,lkQ.xz)*lkB.y+texture2D(lkNoise,lkQ.xy)*lkB.z;',
          '#endif',
          'float lkM=lkN.r*.65+lkN.g*.35-.5;diffuseColor.rgb*=1.0+lkP.y*2.0*lkM;float lkR=lkN.g-.5;',
          '#ifdef LK_VEIN',
          ' float lkV=pow(lkN.a,lkE.w)*(.55+.9*lkN.g);diffuseColor.rgb=mix(diffuseColor.rgb,lkE.rgb,clamp(lkV*lkP.w,0.0,1.0));lkR-=lkV*.3;',
          '#endif',
          '#ifdef LK_FLOOR',
          ' float lkChip=smoothstep(.8,.86,texture2D(lkNoise,vLkW.xz*1.1+.37).b)*(1.0-smoothstep(3.0,10.0,lkDist));',
          ' diffuseColor.rgb=mix(diffuseColor.rgb,lkE.rgb,lkChip*lkP.w);',
          ' vec2 lkG=abs(fract(vLkW.xz/3.0+.5)-.5)*3.0;',
          ' lkJ=(1.0-smoothstep(.004,.008+lkDist*.0016,min(lkG.x,lkG.y)))*(1.0-smoothstep(8.0,26.0,lkDist));diffuseColor.rgb*=1.0-.18*lkJ;',
          '#endif',
          '#ifdef LK_PAVE',
          ' vec2 lkG=vLkW.xz/vec2(1.2,.6);lkG.x+=.5*mod(floor(lkG.y),2.0);diffuseColor.rgb*=.94+.12*lkHash(floor(lkG));',
          ' vec2 lkF=abs(fract(lkG+.5)-.5)*vec2(1.2,.6);',
          ' lkJ=(1.0-smoothstep(.004,.008+lkDist*.0014,min(lkF.x,lkF.y)))*(1.0-smoothstep(10.0,34.0,lkDist));diffuseColor.rgb*=1.0-.45*lkJ;',
          '#endif',
          '#ifdef LK_STONE',
          ' float lkCy=vLkW.y/.9;float lkRow=floor(lkCy);float lkH=(vLkW.x+vLkW.z)/1.8+.5*mod(lkRow,2.0);',
          ' diffuseColor.rgb*=.95+.1*lkHash(vec2(floor(lkH),lkRow));',
          ' float lkW=.004+lkDist*.0007;',
          ' lkJ=max(1.0-smoothstep(0.0,lkW/.9,abs(fract(lkCy+.5)-.5)),1.0-smoothstep(0.0,lkW/1.8,abs(fract(lkH+.5)-.5)));',
          ' lkJ*=(1.0-step(.7,abs(normalize(vLkN).y)))*(1.0-smoothstep(28.0,70.0,lkDist));diffuseColor.rgb*=1.0-.3*lkJ;',
          '#endif'
        ].join('\n'))
        .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+lkP.z*2.0*lkR+lkJ*.5,.04,1.0);');
    };
    m.customProgramCacheKey=function(){return 'lk-'+(kind||'')+(cheap?'-c':'')};m.needsUpdate=true;return m;
  }

  /* ---------- materials ---------- */
  function lookMaterials(){
    LK.tier=lookTier();LK.noise=lookNoiseTex();
    function set(m,o){if(!m)return;for(var k in o){if(k==='color'||k==='emissive')m[k].set(o[k]);else m[k]=o[k]}m.needsUpdate=true}
    /* polished dark concrete / terrazzo floor */
    set(MAT.floor,{color:0x161616,roughness:.46,metalness:0,envMapIntensity:.65});lookDetail(MAT.floor,'FLOOR',[.12,.012,.03,0],[.22,.215,.2,8]);
    /* matte charcoal plaster */
    set(MAT.wall,{color:0x222223,roughness:.92,envMapIntensity:.55});lookDetail(MAT.wall,'',[.15,.008,.01,0]);
    set(MAT.whiteWall,{color:0xd3cec5,roughness:.93,envMapIntensity:.45});lookDetail(MAT.whiteWall,'',[.15,.005,.01,0]);
    set(MAT.ceil,{color:0x0e0e0f,roughness:.95,envMapIntensity:.3});lookDetail(MAT.ceil,'',[.15,.01,0,0]);
    /* warm limestone facade */
    set(MAT.stone,{color:0x5a5248,roughness:.82,envMapIntensity:.45});lookDetail(MAT.stone,'STONE',[.3,.06,.06,0]);
    /* plaza: dark granite pavers, honed stone path */
    set(MAT.ground,{color:0x111113,roughness:.7,envMapIntensity:.4});lookDetail(MAT.ground,'PAVE',[.3,.06,.1,0]);
    set(MAT.path,{color:0x2c2a27,roughness:.6,envMapIntensity:.45});lookDetail(MAT.path,'PAVE',[.4,.05,.08,0]);
    set(MAT.col,{color:0x2b2926,roughness:.6,envMapIntensity:.6});lookDetail(MAT.col,'',[.4,.05,.06,0]);
    /* veined dark marble monument */
    set(MAT.mono,{color:0x181716,roughness:.32,metalness:0,envMapIntensity:.8});lookDetail(MAT.mono,'VEIN',[.32,.05,.06,.22],[.3,.29,.27,26]);
    /* brushed dark metal, lacquer, anodised frames */
    set(MAT.metal,{color:0x3a3835,metalness:.85,roughness:.34,envMapIntensity:1.2});lookDetail(MAT.metal,'',[1.5,.04,.12,0]);
    set(MAT.ped,{color:0x101010,metalness:0,roughness:.28,envMapIntensity:1});
    set(MAT.frame,{color:0x0c0c0c,metalness:.5,roughness:.42,envMapIntensity:1});
    set(MAT.bench,{color:0x1c1a18,roughness:.5,envMapIntensity:.7});lookDetail(MAT.bench,'',[.8,.05,.08,0]);
    set(MAT.trunk,{envMapIntensity:.4});set(MAT.tree,{envMapIntensity:.3});
    /* glass: dark, reflective, tinted */
    set(MAT.glass,{color:0x7f8a9a,metalness:.95,roughness:.04,opacity:.34,envMapIntensity:1.5});
    /* emitters go slightly HDR so the post pass can bloom them (low tier just clips to white) */
    if(MAT.lamp)MAT.lamp.color.setRGB(1.6,1.5,1.35);if(MAT.warm)MAT.warm.color.setRGB(2.1,1.85,1.45);
    lookEnvironment();
  }

  /* ---------- environment map: a dark gallery with soft ceiling light, through PMREM ---------- */
  function lookEnvironment(){
    var es=new T.Scene(),geos=[],mats=[];
    function bm(r,g,b,side){var m=new T.MeshBasicMaterial({side:side||T.FrontSide});m.color.setRGB(r,g,b);mats.push(m);return m}
    function add(g,m,x,y,z,rx,ry){geos.push(g);var o=new T.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,0);es.add(o);return o}
    add(new T.BoxGeometry(26,7.2,26),bm(.032,.031,.03,T.BackSide),0,1.95,0);
    add(new T.PlaneGeometry(26,26),bm(.018,.018,.018),0,-1.6,0,-Math.PI/2);
    [-7.5,-2.5,2.5,7.5].forEach(function(x){add(new T.PlaneGeometry(.3,19),bm(3.2,3,2.65),x,5.5,0,Math.PI/2)});
    add(new T.CircleGeometry(2.4,32),bm(1.1,1.3,1.75),0,5.52,-5,Math.PI/2);
    [[0,1,-12.9,0],[0,1,12.9,Math.PI],[-12.9,1,0,Math.PI/2],[12.9,1,0,-Math.PI/2]].forEach(function(w){add(new T.PlaneGeometry(9,3.2),bm(.3,.27,.23),w[0],w[1],w[2],0,w[3])});
    add(new T.PlaneGeometry(5,.35),bm(.7,.32,1.15),12.85,-1.3,4,0,-Math.PI/2);
    var pm=new T.PMREMGenerator(R);var rt=pm.fromScene(es,.03,.1,60);scene.environment=rt.texture;pm.dispose();
    geos.forEach(function(g){g.dispose()});mats.forEach(function(m){m.dispose()});
  }

  /* ---------- generic additive volume shader (light shafts) ---------- */
  var LK_TONE='#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
  function lookVolMat(col,inten,streak){
    var m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,
      uniforms:{uCol:{value:new T.Color(col)},uI:{value:inten},uT:{value:0},uS:{value:streak||0}},
      vertexShader:'attribute float aF;varying float vF;varying vec3 vN;varying vec3 vV;varying vec2 vUv;void main(){vF=aF;vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vN=normalize(mat3(modelMatrix)*normal);vV=normalize(cameraPosition-wp.xyz);gl_Position=projectionMatrix*viewMatrix*wp;}',
      fragmentShader:'uniform vec3 uCol;uniform float uI;uniform float uT;uniform float uS;varying float vF;varying vec3 vN;varying vec3 vV;varying vec2 vUv;\nvoid main(){float f=abs(dot(normalize(vN),normalize(vV)));f=f*f;\nfloat s=1.0-uS+uS*(.6+.4*sin(vUv.x*56.5+uT*.11)*sin(vUv.x*25.1-uT*.07+1.3));\ngl_FragColor=vec4(uCol*uI*vF*f*s,1.0);\n'+LK_TONE+'}'});
    LK.vols.push(m);return m;
  }

  /* ---------- merged quad batches ---------- */
  function lookQuads(list){
    var pos=[],uv=[],colr=[],idx=[];
    list.forEach(function(q){var n=pos.length/3,c=q.c,u=q.u,v=q.v,hw=q.w/2,hh=q.h/2;
      [[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]].forEach(function(k){pos.push(c[0]+u[0]*hw*k[0]+v[0]*hh*k[1],c[1]+u[1]*hw*k[0]+v[1]*hh*k[1],c[2]+u[2]*hw*k[0]+v[2]*hh*k[1]);uv.push(k[2],k[3]);colr.push(q.k[0],q.k[1],q.k[2])});
      idx.push(n,n+1,n+2,n,n+2,n+3)});
    var g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(colr,3));g.setIndex(idx);return g;
  }
  function lookAddMat(tex){return new T.MeshBasicMaterial({map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false})}

  /* ---------- after build: fixtures, washes, shafts, dust, sky, key light ---------- */
  function lookAfterBuild(){
    var tier=LK.tier,glows=[],washes=[],bezels=[];
    function k(hex,s){var c=new T.Color(hex);return [c.r*s,c.g*s,c.b*s]}
    /* recessed downlights: dark bezel, ceiling halo, soft floor pool under each */
    var lamps=[];scene.traverse(function(o){if(o.isMesh&&o.material===MAT.lamp&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius>.1&&Math.abs(o.rotation.x-Math.PI/2)<.01)lamps.push(o)});
    var ring=new T.RingGeometry(.11,.17,20);ring.rotateX(Math.PI/2);var rp=ring.toNonIndexed().attributes.position.array,bp=[];
    lamps.forEach(function(o){var r=roomAt(o.position.x,o.position.z),wh=!!(r&&r.white),y=o.position.y;
      for(var i=0;i<rp.length;i+=3)bp.push(rp[i]+o.position.x,rp[i+1]+y-.002,rp[i+2]+o.position.z);
      glows.push({c:[o.position.x,y-.012,o.position.z],u:[1,0,0],v:[0,0,1],w:.95,h:.95,k:k(0xfff1dc,wh?.08:.14)});
      glows.push({c:[o.position.x,.03,o.position.z],u:[1,0,0],v:[0,0,1],w:3.2,h:3.2,k:k(0xffeedd,wh?.05:.1)});
    });
    if(bp.length){var bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(bp,3));scene.add(new T.Mesh(bg,new T.MeshBasicMaterial({color:0x1b1b1c,side:T.DoubleSide})))}
    ring.dispose();
    /* wall-washer scallops on every gallery wall (skip doors), so lettered walls read evenly */
    var SCAL=ctex(256,256,function(c,W,H){c.save();c.translate(W/2,-H*.08);c.scale(1.4,1.3);var g=c.createRadialGradient(0,0,0,0,0,H*.95);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.62)');g.addColorStop(.6,'rgba(255,255,255,.2)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-W*2,0,W*4,H*2);c.restore();
      var f=c.createLinearGradient(0,0,W,0);f.addColorStop(0,'rgba(0,0,0,1)');f.addColorStop(.18,'rgba(0,0,0,0)');f.addColorStop(.82,'rgba(0,0,0,0)');f.addColorStop(1,'rgba(0,0,0,1)');c.globalCompositeOperation='destination-out';c.fillStyle=f;c.fillRect(0,0,W,H)});
    SCAL.encoding=T.LinearEncoding;
    ROOMS.forEach(function(r){if(r.cor||r.id==='vestibule'||r.dark)return;var wh=!!r.white,H=Math.min(r.h*.8,r.id==='lobby'?6.5:4.6),sp=r.id==='lobby'?3.4:2.7,kk=k(0xffeedd,wh?.03:.06),o=.155;
      [['s',r.x1,r.x2],['n',r.x1,r.x2],['w',r.z2,r.z1],['e',r.z2,r.z1]].forEach(function(sd){var s=sd[0];if(r.open&&r.open.indexOf(s)>=0)return;
        var a=sd[1],b=sd[2],len=b-a,n=Math.max(1,Math.round(len/sp)),step=len/n;
        for(var i=0;i<n;i++){var at=a+step*(i+.5),bad=(r.doors||[]).some(function(d){return d.s===s&&Math.abs(d.at-at)<(d.w||4)/2+.9});if(bad)continue;
          var c,u;if(s==='w'){c=[r.x1+o,r.h-H/2-.02,at];u=[0,0,1]}else if(s==='e'){c=[r.x2-o,r.h-H/2-.02,at];u=[0,0,1]}else if(s==='s'){c=[at,r.h-H/2-.02,r.z1-o];u=[1,0,0]}else{c=[at,r.h-H/2-.02,r.z2+o];u=[1,0,0]}
          washes.push({c:c,u:u,v:[0,1,0],w:step*2.2,h:H*1.15,k:kk})}
      })});
    /* lobby: purple floor-slot uplight at the monument, cool skylight boost */
    var slot=new T.Mesh(new T.BoxGeometry(1.4,.012,.05),new T.MeshBasicMaterial({}));slot.material.color.setRGB(.55,.3,.9);slot.position.set(0,.006,-18.95);scene.add(slot);
    scene.traverse(function(o){if(o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius===4.2&&o.material&&o.material.isMeshBasicMaterial)o.material.color.setRGB(.75,.86,1.15)});
    /* the lobby's original constant-opacity shaft reads as a glass tube; the view-dependent shaft below replaces it */
    scene.traverse(function(o){if(o.isMesh&&o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.openEnded&&Math.abs(o.geometry.parameters.radiusTop-4.1)<.01&&o.material&&o.material.blending===T.AdditiveBlending)o.visible=false});
    /* calm the purple pool / uplight hotspot at the monument foot */
    scene.traverse(function(o){if(o.isMesh&&o.material&&o.material.blending===T.AdditiveBlending&&Math.abs(o.position.x)<.1&&Math.abs(o.position.z+19.6)<.3&&o.position.y<.1)o.material.opacity=Math.min(o.material.opacity,.3);if(o.isPointLight&&Math.abs(o.position.z+18.1)<.2&&o.position.y<.5)o.intensity=Math.min(o.intensity,1)});
    glows.push({c:[0,9.9,-20],u:[1,0,0],v:[0,0,1],w:12,h:12,k:k(0xb8c6e6,.18)});
    /* entrance: warm interior light spilling onto the plaza */
    glows.push({c:[0,.03,2.6],u:[1,0,0],v:[0,0,1],w:9,h:7,k:k(0xffe6c4,.32)});
    if(glows.length){var gm=new T.Mesh(lookQuads(glows),lookAddMat(GLOW));gm.renderOrder=2;scene.add(gm)}
    if(washes.length){var wm=new T.Mesh(lookQuads(washes),lookAddMat(SCAL));wm.renderOrder=1;scene.add(wm)}

    /* skylight shaft: open cylinder with view-dependent density, fading to the floor */
    var cg=new T.CylinderGeometry(4.15,4.7,9.9,48,8,true),cp=cg.attributes.position,af=new Float32Array(cp.count);
    for(var i=0;i<cp.count;i++){var hy=(cp.getY(i)+4.95)/9.9;af[i]=Math.pow(hy,2.2)}
    cg.setAttribute('aF',new T.BufferAttribute(af,1));var shaft=new T.Mesh(cg,lookVolMat(0xaebde0,.04,.6));shaft.position.set(0,5,-20);shaft.renderOrder=3;scene.add(shaft);
    /* entrance doors: a low wedge of warm light leaving the glass onto the plaza */
    var wg=new T.BoxGeometry(1,1,1,10,4,10),wp=wg.attributes.position,wf=new Float32Array(wp.count);
    for(i=0;i<wp.count;i++){var x=wp.getX(i),yy=wp.getY(i)+.5,t=wp.getZ(i)+.5;wp.setXYZ(i,x*(6+2.6*t),yy*(5.1*(1-t)+.06*t),.12+t*7.5);wf[i]=Math.pow(1-t,1.6)*(1-Math.pow(Math.abs(x*2),4))}
    wg.computeVertexNormals();wg.setAttribute('aF',new T.BufferAttribute(wf,1));var wedge=new T.Mesh(wg,lookVolMat(0xffe2bc,.09,0));wedge.renderOrder=3;scene.add(wedge);

    /* dust motes drifting in the skylight */
    var DN=tier==='low'?90:200,dp=new Float32Array(DN*3),ds=new Float32Array(DN);
    for(i=0;i<DN;i++){var a=Math.random()*Math.PI*2,rr=Math.sqrt(Math.random())*5.4;dp[i*3]=Math.cos(a)*rr;dp[i*3+1]=.4+Math.random()*9;dp[i*3+2]=-20+Math.sin(a)*rr;ds[i]=Math.random()}
    var dg=new T.BufferGeometry();dg.setAttribute('position',new T.BufferAttribute(dp,3));dg.setAttribute('aSeed',new T.BufferAttribute(ds,1));
    LK.dust=new T.Points(dg,new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,uniforms:{uT:{value:0},uPx:{value:600}},
      vertexShader:'attribute float aSeed;uniform float uT;uniform float uPx;varying float vA;void main(){vec3 p=position;float s=aSeed*6.2831;\np+=vec3(sin(uT*.07+s)*.45,sin(uT*.05+s*1.7)*.35,cos(uT*.06+s*2.3)*.45);\nvec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;float r=length(p.xz-vec2(0.0,-20.0));\nvA=(.02+.98*(1.0-smoothstep(3.4,4.6,r)))*(.4+.6*fract(aSeed*7.3))*smoothstep(.2,1.5,p.y)*smoothstep(-.5,-3.0,mv.z);\ngl_PointSize=clamp(.028*uPx/-mv.z,1.0,6.0);}',
      fragmentShader:'varying float vA;void main(){vec2 d=gl_PointCoord-.5;float a=smoothstep(.5,.1,length(d));gl_FragColor=vec4(vec3(1.0,.96,.9)*.32*a*vA,1.0);\n'+LK_TONE+'}'}));
    LK.dust.frustumCulled=false;LK.dust.renderOrder=4;scene.add(LK.dust);

    /* night sky dome: gradient, horizon glow, soft moon (drawn after opaque geometry so early-z skips covered pixels) */
    var md=new T.Vector3(-.52,.5,-.69).normalize();
    LK.sky=new T.Mesh(new T.SphereGeometry(150,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{uMoon:{value:md}},
      vertexShader:'varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=p.xyww;}',
      fragmentShader:'uniform vec3 uMoon;varying vec3 vD;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nvoid main(){vec3 d=normalize(vD);float y=d.y;\nvec3 zen=vec3(.0016,.0021,.0048),mid=vec3(.006,.0068,.0135),hor=vec3(.024,.02,.03);\nvec3 c=mix(hor,mid,smoothstep(-.02,.18,y));c=mix(c,zen,smoothstep(.15,.75,y));\nc+=vec3(.022,.014,.03)*exp(-abs(y)*14.0);\nfloat m=dot(d,uMoon);c+=vec3(.9,.95,1.05)*smoothstep(.99955,.9997,m)*2.2+vec3(.05,.058,.075)*pow(max(m,0.0),220.0)+vec3(.01,.012,.018)*pow(max(m,0.0),14.0);\nc+=(h(gl_FragCoord.xy)-.5)/900.0;gl_FragColor=vec4(max(c,0.0),1.0);\n'+LK_TONE+'}'}));
    LK.sky.frustumCulled=false;LK.sky.renderOrder=1000;scene.add(LK.sky);
    LK.moon=new T.DirectionalLight(0xa9b8dd,0);LK.moon.position.copy(md).multiplyScalar(60);scene.add(LK.moon);scene.add(LK.moon.target);

    /* key light on the monument (medium/high); shadows only on high */
    if(tier!=='low'){var mono=null;scene.traverse(function(o){if(o.isMesh&&o.material===MAT.mono)mono=o});
      if(mono){var kl=new T.SpotLight(0xfff0e0,.7,18,.3,.9,2);kl.position.set(0,9.6,-14.2);kl.target.position.set(0,2.4,-20.2);scene.add(kl);scene.add(kl.target);
        if(tier==='high'){R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;kl.castShadow=true;kl.shadow.mapSize.set(1024,1024);kl.shadow.camera.near=2;kl.shadow.camera.far=16;kl.shadow.bias=-.0006;kl.shadow.radius=3;mono.castShadow=true;
          scene.traverse(function(o){if(o.isMesh&&(o.material===MAT.floor||o.material===MAT.bench))o.receiveShadow=true})}}}
  }

  /* ---------- per frame ---------- */
  function lookFrame(dt,raw){
    LK.t+=S.reduced?0:raw;
    for(var i=0;i<LK.vols.length;i++)LK.vols[i].uniforms.uT.value=LK.t;
    if(LK.dust){LK.dust.visible=!S.reduced&&cam.position.z<-3;LK.dust.material.uniforms.uT.value=LK.t;LK.dust.material.uniforms.uPx.value=(LK.h||R.domElement.height)/(2*Math.tan(cam.fov*Math.PI/360))}
    if(LK.sky)LK.sky.position.copy(cam.position);
    if(LK.moon){var want=cam.position.z>-1?.32:0;LK.moon.intensity+=(want-LK.moon.intensity)*Math.min(1,raw*2)}
  }

  /* ---------- post-processing ---------- */
  var LK_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
  function lookPostInit(){
    var caps=R.capabilities,ex=R.extensions;
    LK.hdr=caps.isWebGL2?ex.has('EXT_color_buffer_float'):(ex.has('OES_texture_half_float')&&ex.has('OES_texture_half_float_linear')&&ex.has('EXT_color_buffer_half_float'));
    LK.pscene=new T.Scene();LK.pcam=new T.OrthographicCamera(-1,1,1,-1,0,1);LK.quad=new T.Mesh(new T.PlaneGeometry(2,2),null);LK.quad.frustumCulled=false;LK.pscene.add(LK.quad);
    function sm(fs,u){return new T.ShaderMaterial({uniforms:u,vertexShader:LK_VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false})}
    LK.mBright=sm('uniform sampler2D tSrc;uniform vec2 uTx;uniform float uThr;uniform float uKnee;varying vec2 vUv;\nvoid main(){vec3 c=(texture2D(tSrc,vUv+uTx*vec2(-.5,-.5)).rgb+texture2D(tSrc,vUv+uTx*vec2(.5,-.5)).rgb+texture2D(tSrc,vUv+uTx*vec2(-.5,.5)).rgb+texture2D(tSrc,vUv+uTx*vec2(.5,.5)).rgb)*.25;\nc=min(c,vec3(24.0));float l=max(c.r,max(c.g,c.b));float s=clamp(l-uThr+uKnee,0.0,2.0*uKnee);s=s*s/(4.0*uKnee+1e-4);float w=uThr<0.0?1.0:max(s,l-uThr)/max(l,1e-4);gl_FragColor=vec4(c*w,1.0);}',
      {tSrc:{value:null},uTx:{value:new T.Vector2()},uThr:{value:1.25},uKnee:{value:.25}});
    LK.mBlur=sm('uniform sampler2D tSrc;uniform vec2 uDir;varying vec2 vUv;\nvoid main(){vec3 c=texture2D(tSrc,vUv).rgb*.227027;c+=(texture2D(tSrc,vUv+uDir*1.3846).rgb+texture2D(tSrc,vUv-uDir*1.3846).rgb)*.316216;c+=(texture2D(tSrc,vUv+uDir*3.2308).rgb+texture2D(tSrc,vUv-uDir*3.2308).rgb)*.070270;gl_FragColor=vec4(c,1.0);}',
      {tSrc:{value:null},uDir:{value:new T.Vector2()}});
    LK.mFinal=sm(['uniform sampler2D tScene;uniform sampler2D tB1;uniform sampler2D tB2;uniform float uB1;uniform float uB2;uniform float uExp;uniform float uVig;uniform float uGrain;uniform float uCA;uniform float uT;uniform vec2 uAsp;varying vec2 vUv;',
      'vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}',
      'vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=uExp/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.0,1.0);}',
      'vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}',
      'float hs(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}',
      'void main(){vec2 d=vUv-.5;vec3 c;',
      ' if(uCA>0.0){vec2 o=d*dot(d,d)*uCA;c=vec3(texture2D(tScene,vUv-o).r,texture2D(tScene,vUv).g,texture2D(tScene,vUv+o).b);}else c=texture2D(tScene,vUv).rgb;',
      ' c+=texture2D(tB1,vUv).rgb*uB1;if(uB2>0.0)c+=texture2D(tB2,vUv).rgb*uB2;',
      ' float v=length(d*uAsp);c*=1.0-uVig*smoothstep(.35,1.0,v);',
      ' c=srgb(aces(c));',
      ' vec2 fc=gl_FragCoord.xy;float n1=hs(fc+fract(uT*7.13)*97.0),n2=hs(fc.yx+fract(uT*3.71)*61.0);',
      ' c+=(n1+n2-1.0)/255.0;',
      ' if(uGrain>0.0){float L=dot(c,vec3(.299,.587,.114));c+=(n1-.5)*uGrain*(1.0-L*.7);}',
      ' gl_FragColor=vec4(c,1.0);}'].join('\n'),
      {tScene:{value:null},tB1:{value:null},tB2:{value:null},uB1:{value:.3},uB2:{value:0},uExp:{value:1.1},uVig:{value:.22},uGrain:{value:0},uCA:{value:0},uT:{value:0},uAsp:{value:new T.Vector2(1,1)}});
  }
  function lookTargets(w,h){
    ['rt','b1','b1b','b2','b2b'].forEach(function(k){if(LK[k]){LK[k].dispose();LK[k]=null}});
    var hi=LK.tier==='high',o={type:T.HalfFloatType,format:T.RGBAFormat,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false,stencilBuffer:false,generateMipmaps:false};
    var mo={type:T.HalfFloatType,format:T.RGBAFormat,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:true,stencilBuffer:true,generateMipmaps:false};
    if(R.capabilities.isWebGL2&&T.WebGLMultisampleRenderTarget){LK.rt=new T.WebGLMultisampleRenderTarget(w,h,mo);LK.rt.samples=hi?4:(coarse?0:4)}else LK.rt=new T.WebGLRenderTarget(w,h,mo);
    var d1=hi?2:4,w1=Math.max(1,Math.round(w/d1)),h1=Math.max(1,Math.round(h/d1));
    LK.b1=new T.WebGLRenderTarget(w1,h1,o);LK.b1b=new T.WebGLRenderTarget(w1,h1,o);
    if(hi){var w2=Math.max(1,Math.round(w1/3)),h2=Math.max(1,Math.round(h1/3));LK.b2=new T.WebGLRenderTarget(w2,h2,o);LK.b2b=new T.WebGLRenderTarget(w2,h2,o)}
    LK.w=w;LK.h=h;
  }
  function lookPass(m,target){LK.quad.material=m;R.setRenderTarget(target);R.render(LK.pscene,LK.pcam)}
  function lookBlur(a,b,px){var u=LK.mBlur.uniforms;u.tSrc.value=a.texture;u.uDir.value.set(px/a.width,0);lookPass(LK.mBlur,b);u.tSrc.value=b.texture;u.uDir.value.set(0,px/b.height);lookPass(LK.mBlur,a)}
  function lookRender(){
    var tier=lookTier();
    LK.tier=tier;
    if(LK.hdr===null){try{lookPostInit()}catch(e){LK.broken=true}}
    var want=!LK.broken&&LK.hdr&&tier!=='low';
    if(want!==LK.post){LK.post=want;R.toneMapping=want?T.NoToneMapping:T.ACESFilmicToneMapping;LK.w=0}
    if(!LK.post){R.render(scene,cam);return}
    try{
      if(!LK.dbs)LK.dbs=new T.Vector2();R.getDrawingBufferSize(LK.dbs);var w=LK.dbs.x,h=LK.dbs.y;
      if(w!==LK.w||h!==LK.h||LK.builtFor!==tier){lookTargets(w,h);LK.builtFor=tier}
      var hi=tier==='high';
      R.setRenderTarget(LK.rt);R.render(scene,cam);
      var b=LK.mBright.uniforms;b.tSrc.value=LK.rt.texture;b.uTx.value.set(1/w,1/h);b.uThr.value=1.25;lookPass(LK.mBright,LK.b1);
      lookBlur(LK.b1,LK.b1b,1);if(!hi)lookBlur(LK.b1,LK.b1b,2);
      if(hi){b.tSrc.value=LK.b1.texture;b.uTx.value.set(1/LK.b1.width,1/LK.b1.height);b.uThr.value=-1;lookPass(LK.mBright,LK.b2);lookBlur(LK.b2,LK.b2b,1);lookBlur(LK.b2,LK.b2b,2)}
      var f=LK.mFinal.uniforms;f.tScene.value=LK.rt.texture;f.tB1.value=LK.b1.texture;f.tB2.value=hi?LK.b2.texture:null;
      f.uB1.value=hi?.22:.28;f.uB2.value=hi?.3:0;f.uExp.value=R.toneMappingExposure;f.uVig.value=hi?.26:.2;f.uGrain.value=hi&&!S.reduced?.012:0;f.uCA.value=hi?.006:0;f.uT.value=S.reduced?0:LK.t;
      var asp=w/h;f.uAsp.value.set(Math.sqrt(asp),1/Math.sqrt(asp));
      lookPass(LK.mFinal,null);
    }catch(e){console.warn('look: post disabled',e);LK.broken=true;LK.post=false;R.toneMapping=T.ACESFilmicToneMapping;R.setRenderTarget(null);R.render(scene,cam)}
  }
