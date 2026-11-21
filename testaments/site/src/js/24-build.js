  /* ---------- BX: procedural PBR surface relief (desktop tiers only) ----------
     Screen-space bump from a world-space height field + anti-tiling roughness,
     layered on top of whatever onBeforeCompile a material already has (15-look). */
  function bxTier(){return S.quality==='auto'?(coarse?'low':'medium'):S.quality}
  var BX_GLSL=[
    'varying vec3 vBxW;varying vec3 vBxN;uniform sampler2D bxNoise;uniform vec4 bxK;',
    'vec4 bxS(vec2 p){vec4 a=texture2D(bxNoise,p);vec4 b=texture2D(bxNoise,mat2(.8,-.6,.6,.8)*p*1.618+.37);return (a+b)*.5;}',
    'vec3 bxPerturb(vec3 sp,vec3 sn,vec2 d){vec3 sx=dFdx(sp),sy=dFdy(sp);vec3 r1=cross(sy,sn),r2=cross(sn,sx);',
    ' float det=dot(sx,r1)*(gl_FrontFacing?1.0:-1.0);vec3 g=sign(det)*(d.x*r1+d.y*r2);return normalize(abs(det)*sn-g);}'
  ].join('\n');
  var BX_FRAG=[
    'vec3 bxA=abs(normalize(vBxN));vec2 bxU=bxA.y>max(bxA.x,bxA.z)?vBxW.xz:(bxA.x>bxA.z?vBxW.zy:vBxW.xy);',
    'float bxD=length(vBxW-cameraPosition);float bxNear=1.0-smoothstep(3.0,16.0,bxD);float bxH=0.0;float bxR=0.0;',
    '#ifdef BX_FLOOR',
    ' bxH=bxS(bxU*.06).r*1.2+bxS(bxU*.7).g*.25*bxNear+bxS(bxU*3.1).b*.05*bxNear;',
    ' bxR=(bxS(bxU*.023+.5).r-.5)*.34+(bxS(bxU*.21).g-.5)*.12;',
    '#endif',
    '#ifdef BX_STONE',
    ' bxH=bxS(bxU*.5).g*.7+bxS(bxU*2.6).b*.35*bxNear;',
    ' float bxCy=vBxW.y/.9;float bxHz=(vBxW.x+vBxW.z)/1.8+.5*mod(floor(bxCy),2.0);',
    ' float bxJ=max(1.0-smoothstep(0.0,.012,abs(fract(bxCy+.5)-.5)*.9),1.0-smoothstep(0.0,.012,abs(fract(bxHz+.5)-.5)*1.8));',
    ' bxJ*=1.0-step(.7,bxA.y);bxH-=bxJ*.6;bxR=(bxS(bxU*.11).r-.5)*.2+bxJ*.12;',
    '#endif',
    '#ifdef BX_PLASTER',
    ' vec2 bxP=bxU*.32;bxP+=vec2(bxS(bxP*.4).r,bxS(bxP*.4+.3).g)*1.4;',
    ' bxH=bxS(vec2(bxP.x*.55,bxP.y*1.5)).g*.9+bxS(bxU*1.9).b*.25*bxNear;',
    ' bxR=(bxS(bxU*.05).r-.5)*.14;',
    '#endif',
    '#ifdef BX_OAK',
    ' vec2 bxO=bxU;float bxWv=bxS(vec2(bxO.x*.12,bxO.y*.9)).r*9.0;',
    ' float bxG=sin(bxO.y*55.0+bxWv)*.5+.5;bxG=pow(bxG,3.0);',
    ' float bxPo=step(.62,bxS(vec2(bxO.x*1.2,bxO.y*14.0)).b);',
    ' bxH=bxG*.5-bxPo*.25*bxNear;bxR=bxG*.12+bxPo*.1-.04;',
    '#endif',
    '#ifdef BX_METAL',
    ' float bxBr=bxS(vec2(bxU.x*.04,bxU.y*9.0)).b+bxS(vec2(bxU.x*.09+.2,bxU.y*23.0)).g*.5;',
    ' bxH=bxBr*.35*bxNear+bxS(bxU*.4).r*.3;bxR=(bxBr-.75)*.18+(bxS(bxU*.15).r-.5)*.14;',
    '#endif',
    '#ifdef BX_GLASS',
    ' bxH=bxS(bxU*.09).r+bxS(vec2(bxU.x*.05,bxU.y*.4)).g*.4;bxR=0.0;',
    '#endif',
    'roughnessFactor=clamp(roughnessFactor+bxR*bxK.z,.03,1.0);'
  ].join('\n');
  function bxPatch(m,kind,amp,scale,rough){
    if(!m||!m.isMeshStandardMaterial||m.userData.bx)return;m.userData.bx=kind;
    var prev=m.onBeforeCompile,prevKey=m.customProgramCacheKey,K=new T.Vector4(amp,scale,rough,0);
    m.defines=m.defines||{};m.defines['BX_'+kind]='';m.extensions=m.extensions||{};m.extensions.derivatives=true;
    m.onBeforeCompile=function(sh,r){
      if(prev&&prev!==T.Material.prototype.onBeforeCompile)prev.call(this,sh,r);
      sh.uniforms.bxNoise={value:LK.noise};sh.uniforms.bxK={value:K};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBxW;varying vec3 vBxN;')
        .replace('#include <project_vertex>','#include <project_vertex>\nvBxW=(modelMatrix*vec4(transformed,1.0)).xyz;vBxN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+BX_GLSL)
        .replace('#include <metalnessmap_fragment>',BX_FRAG+'\n#include <metalnessmap_fragment>')
        .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=bxPerturb(-vViewPosition,normal,vec2(dFdx(bxH),dFdy(bxH))*bxK.x);');
    };
    m.customProgramCacheKey=function(){return (prevKey&&prevKey!==T.Material.prototype.customProgramCacheKey?prevKey.call(this):'')+'|bx-'+kind};
    m.needsUpdate=true;
  }
  function bxMaterials(){
    if(bxTier()==='low'||!LK.noise)return;
    bxPatch(MAT.floor,'FLOOR',.03,1,.6);bxPatch(MAT.path,'FLOOR',.05,1,.4);
    bxPatch(MAT.stone,'STONE',.09,1,1);bxPatch(MAT.col,'STONE',.05,1,.6);bxPatch(MAT.mono,'GLASS',.012,1,0);
    bxPatch(MAT.wall,'PLASTER',.025,1,.5);bxPatch(MAT.whiteWall,'PLASTER',.022,1,.35);
    bxPatch(MAT.bench,'OAK',.012,1,.8);
    bxPatch(MAT.metal,'METAL',.02,1,1);bxPatch(MAT.frame,'METAL',.01,1,.6);
    bxPatch(MAT.glass,'GLASS',.006,1,0);
  }
  function bxAfterBuild(){
    if(bxTier()==='low'||!LK.noise||typeof PRM==='undefined'||!PRM)return;
    bxPatch(PRM.oak,'OAK',.02,1,1);bxPatch(PRM.wood,'OAK',.015,1,.8);bxPatch(PRM.steel,'METAL',.02,1,1);bxPatch(PRM.glass,'GLASS',.004,1,0);
  }
  /* ---------- build ---------- */
  function build(){
    T=window.THREE;
    R=new T.WebGLRenderer({canvas:canvas,antialias:!coarse,powerPreference:'high-performance'});
    R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.1;quality();
    scene=new T.Scene();scene.background=new T.Color(0x050507);scene.fog=new T.Fog(0x050507,16,75);
    cam=new T.PerspectiveCamera(68,1,.05,220);cam.rotation.order='YXZ';clock=new T.Clock();
    var mgr=new T.LoadingManager();loader=new T.TextureLoader(mgr);
    mgr.onProgress=function(u,l,t){loadTxt('Hanging photographs · '+l+' of '+t);$('loadBar').style.width=(l/t*100)+'%'};
    mgr.onError=function(u){loadTxt('A photograph could not load: '+u.split('/').pop())};
    mgr.onLoad=function(){if(ready)return;ready=true;$('load').hidden=true;resize();start();if(gateDone)afterGate()};
    GLOW=ctex(256,256,function(c){var g=c.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.45)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,256,256)});
    SPOT=ctex(256,256,function(c){c.save();c.translate(128,0);c.scale(.62,1);var g=c.createRadialGradient(0,10,0,0,10,250);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.45,'rgba(255,255,255,.22)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(-300,0,600,256);c.restore();c.globalCompositeOperation='destination-in';var fd=c.createLinearGradient(0,0,0,256);fd.addColorStop(0,'rgba(0,0,0,0)');fd.addColorStop(.18,'rgba(0,0,0,1)');fd.addColorStop(.8,'rgba(0,0,0,1)');fd.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=fd;c.fillRect(0,0,256,256);c.globalCompositeOperation='source-over'});
    MAT.stone=new T.MeshStandardMaterial({color:0x1d1c1b,roughness:.92});
    MAT.wall=new T.MeshStandardMaterial({color:0x121212,roughness:.95});
    MAT.whiteWall=new T.MeshStandardMaterial({color:0xcfcac1,roughness:.95});
    MAT.floor=new T.MeshStandardMaterial({color:0x101011,roughness:.3,metalness:.25});
    MAT.ground=new T.MeshStandardMaterial({color:0x0b0b0c,roughness:.95});
    MAT.path=new T.MeshStandardMaterial({color:0x232220,roughness:.8});
    MAT.ceil=new T.MeshStandardMaterial({color:0x0a0a0a,roughness:1,side:T.DoubleSide});
    MAT.col=new T.MeshStandardMaterial({color:0x232220,roughness:.7});
    MAT.frame=new T.MeshStandardMaterial({color:0x0b0b0b,roughness:.6});
    MAT.bench=new T.MeshStandardMaterial({color:0x1a1918,roughness:.55});
    MAT.ped=new T.MeshStandardMaterial({color:0x0d0d0d,roughness:.4,metalness:.3});
    MAT.glass=new T.MeshStandardMaterial({color:0x2a2a33,roughness:.08,metalness:.6,transparent:true,opacity:.42});
    MAT.mono=new T.MeshStandardMaterial({color:0x34322f,roughness:.96,flatShading:true});
    MAT.tree=new T.MeshStandardMaterial({color:0x1f1529,emissive:0x5a3590,emissiveIntensity:.2,roughness:1,flatShading:true});
    MAT.trunk=new T.MeshStandardMaterial({color:0x0e0d0c,roughness:1});
    MAT.warm=new T.MeshBasicMaterial({color:0xffe9c8});MAT.lamp=new T.MeshBasicMaterial({color:0xfff1dc});
    MAT.metal=new T.MeshStandardMaterial({color:0x2b2a28,metalness:.6,roughness:.4});
    scene.add(new T.HemisphereLight(0xcfd2e6,0x0b0b0b,.36));
    HOOKS.afterMaterials.push(function(){try{bxMaterials()}catch(e){console.warn('bx: materials',e)}});
    HOOKS.afterBuild.push(function(){try{bxAfterBuild()}catch(e){console.warn('bx: build',e)}});
    HOOKS.afterMaterials.forEach(function(f){f()});

    try{buildExterior()}catch(e){console.error('build exterior',e)}

    /* ===== interior ===== */
    slab(BOUNDS.x1,0,BOUNDS.x2,BOUNDS.z2,.001,MAT.floor);
    ROOMS.forEach(buildRoom);
    var vl=new T.PointLight(0xfff0dc,0.6,9,2);vl.position.set(0,4.4,-3);scene.add(vl);
    function safe(n,f){try{f()}catch(e){console.error('build '+n,e)}}
    safe('lobby',buildLobby);safe('about',buildAbout);safe('process',buildProcess);safe('library',buildLibrary);safe('shop',buildShop);
    ROOMS.forEach(function(r){if(r.chapter)safe(r.id,function(){buildChapter(r)})});
    HOOKS.afterBuild.forEach(function(f,i){safe('hook '+i,f)});
    resize();bindInput();
  }

