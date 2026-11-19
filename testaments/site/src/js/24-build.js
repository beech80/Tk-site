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
    HOOKS.afterMaterials.forEach(function(f){f()});

    buildExterior();

    /* ===== interior ===== */
    slab(BOUNDS.x1,0,BOUNDS.x2,BOUNDS.z2,.001,MAT.floor);
    ROOMS.forEach(buildRoom);
    var vl=new T.PointLight(0xfff0dc,1.1,12,2);vl.position.set(0,4.4,-3);scene.add(vl);
    buildLobby();buildAbout();buildProcess();buildLibrary();buildShop();
    ROOMS.forEach(function(r){if(r.chapter)buildChapter(r)});
    HOOKS.afterBuild.forEach(function(f){f()});
    resize();bindInput();
  }

