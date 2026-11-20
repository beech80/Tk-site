  /* ===== architecture helpers (shared by 26-exterior, 28-detail, 30-lobby; prefixed arch*) ===== */
  var ARCH={};
  function archRng(s){return function(){s=(s*16807)%2147483647;return (s-1)/2147483646}}
  /* geometry batch: many parts -> one mesh (one draw call). uvw = world-space UV tile size in metres */
  function ArchB(){this.p=[];this.n=[];this.u=[];this.c=[];this.i=[]}
  ArchB.prototype.add=function(g,m,col,uvw){
    var pa=g.attributes.position,na=g.attributes.normal,ua=g.attributes.uv,base=this.p.length/3,v=new T.Vector3(),nv=new T.Vector3(),nm=new T.Matrix3().getNormalMatrix(m);
    for(var k=0;k<pa.count;k++){v.fromBufferAttribute(pa,k).applyMatrix4(m);nv.fromBufferAttribute(na,k).applyMatrix3(nm).normalize();this.p.push(v.x,v.y,v.z);this.n.push(nv.x,nv.y,nv.z);
      if(uvw){var ax=Math.abs(nv.x),ay=Math.abs(nv.y),az=Math.abs(nv.z);if(ay>=ax&&ay>=az)this.u.push(v.x/uvw,v.z/uvw);else if(ax>az)this.u.push(v.z/uvw,v.y/uvw);else this.u.push(v.x/uvw,v.y/uvw)}
      else this.u.push(ua?ua.getX(k):0,ua?ua.getY(k):0);
      var c=typeof col==='function'?col(v.x,v.y,v.z):(col||[1,1,1]);this.c.push(c[0],c[1],c[2])}
    if(g.index){for(var j=0;j<g.index.count;j++)this.i.push(base+g.index.getX(j))}else for(var j2=0;j2<pa.count;j2++)this.i.push(base+j2);
    g.dispose();return this};
  ArchB.prototype.box=function(w,h,d,x,y,z,col,uvw,ry){return this.add(new T.BoxGeometry(w,h,d),new T.Matrix4().makeRotationY(ry||0).setPosition(x,y,z),col,uvw)};
  /* box from extents */
  ArchB.prototype.bx=function(x1,x2,y1,y2,z1,z2,col,uvw){return this.box(Math.abs(x2-x1),Math.abs(y2-y1),Math.abs(z2-z1),(x1+x2)/2,(y1+y2)/2,(z1+z2)/2,col,uvw)};
  ArchB.prototype.quad=function(w,h,x,y,z,rx,ry,col,rz){return this.add(new T.PlaneGeometry(w,h),new T.Matrix4().makeRotationFromEuler(new T.Euler(rx||0,ry||0,rz||0,'YXZ')).setPosition(x,y,z),col)};
  ArchB.prototype.mesh=function(mat,parent){if(!this.i.length)return null;var g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new T.Float32BufferAttribute(this.u,2));g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));
    g.setIndex(this.i);g.computeBoundingSphere();var m=new T.Mesh(g,mat);(parent||scene).add(m);return m};
  function archRep(t,r){t.wrapS=t.wrapT=T.RepeatWrapping;if(r)t.repeat.set(r,r);return t}
  /* shared materials and textures, created once (after MAT exists) */
  function archMats(){
    if(ARCH.ok)return ARCH;ARCH.ok=1;
    /* stone cladding: 3 x 1.5 m panels, stack bond, 6 m tile */
    var clad=archRep(ctex(1024,1024,function(c,W,H){var rn=archRng(11);c.fillStyle='#000';c.fillRect(0,0,W,H);
      for(var i=0;i<2;i++)for(var j=0;j<4;j++){var t=210+rn()*30|0;c.fillStyle='rgb('+t+','+(t-3)+','+(t-8)+')';c.fillRect(i*512+2,j*256+2,508,252);
        var g=c.createLinearGradient(0,j*256,0,j*256+256);g.addColorStop(0,'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(0,0,0,.07)');c.fillStyle=g;c.fillRect(i*512+2,j*256+2,508,252)}
      for(var k=0;k<9000;k++){c.fillStyle='rgba('+(rn()<.5?'0,0,0':'255,255,255')+','+(rn()*.07)+')';c.fillRect(rn()*W,rn()*H,1+rn()*2,1+rn()*2)}}));
    ARCH.clad=new T.MeshStandardMaterial({color:0x1f1d1b,map:clad,bumpMap:clad,bumpScale:.025,roughness:.82,envMapIntensity:.22});
    /* forecourt paving: 1.2 x 0.6 m pavers, running bond, 4.8 m tile */
    var pave=archRep(ctex(1024,1024,function(c,W,H){var rn=archRng(5);c.fillStyle='#000';c.fillRect(0,0,W,H);
      for(var j=0;j<8;j++)for(var i=-1;i<4;i++){var x=i*256+(j%2?128:0),t=150+rn()*50|0;c.fillStyle='rgb('+t+','+(t-2)+','+(t-6)+')';c.fillRect(x+2,j*128+2,252,124);if(x<0)c.fillRect(x+2+W,j*128+2,252,124)}
      for(var k=0;k<14000;k++){c.fillStyle='rgba('+(rn()<.5?'0,0,0':'255,255,255')+','+(rn()*.08)+')';c.fillRect(rn()*W,rn()*H,1+rn()*2,1+rn()*2)}}));
    ARCH.pave=new T.MeshStandardMaterial({color:0x1c1b1a,map:pave,bumpMap:pave,bumpScale:.02,roughness:.62,metalness:0,envMapIntensity:.1});
    /* lawn / gravel ground, 8 m tile */
    var gr=archRep(ctex(512,512,function(c,W,H){var rn=archRng(3);c.fillStyle='#808080';c.fillRect(0,0,W,H);for(var k=0;k<16000;k++){c.fillStyle='rgba('+(rn()<.5?'0,0,0':'255,255,255')+','+(rn()*.18)+')';c.fillRect(rn()*W,rn()*H,1+rn()*2,1+rn()*2)}}));
    ARCH.ground=new T.MeshStandardMaterial({color:0x111112,map:gr,roughness:.97,envMapIntensity:.05});
    ARCH.dark=new T.MeshStandardMaterial({color:0x09090a,roughness:.6,envMapIntensity:.15});
    ARCH.bronze=new T.MeshStandardMaterial({color:0x4a3b2c,roughness:.35,metalness:.85});
    ARCH.soffit=new T.MeshStandardMaterial({color:0x6a625a,roughness:.9,envMapIntensity:.3});
    ARCH.water=new T.MeshStandardMaterial({color:0x07080b,roughness:.06,metalness:.4,transparent:true,opacity:.42,depthWrite:false});
    /* tree canopy: vertex colour (brightness) also scales the purple emissive -> lit from below */
    ARCH.canopy=new T.MeshStandardMaterial({color:0x1c1824,emissive:0x6e42a3,emissiveIntensity:.2,roughness:1,flatShading:true,vertexColors:true,envMapIntensity:.08});
    ARCH.canopy.onBeforeCompile=function(s){s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_COLOR\ntotalEmissiveRadiance*=vColor*vColor;\n#endif')};
    /* additive light planes, coloured per vertex (colour x brightness) so one material serves many */
    function add(map){return new T.MeshBasicMaterial({map:map,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:true})}
    ARCH.glowV=add(GLOW);ARCH.spotV=add(SPOT);
    ARCH.washV=add(ctex(64,256,function(c,W,H){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.12,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}));
    ARCH.lineV=add(ctex(16,64,function(c,W,H){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H)}));
    return ARCH;
  }
  function archCol(hex,k){var c=new T.Color(hex);return [c.r*k,c.g*k,c.b*k]}
  /* crisp lettering (MeshBasic, unaffected by light); ppm = canvas pixels per metre */
  function archText(w,h,fn,ppm){ppm=ppm||300;var k=Math.min(1,4096/(w*ppm),4096/(h*ppm));var t=ctex(Math.round(w*ppm*k),Math.round(h*ppm*k),fn);t.generateMipmaps=true;return plane(w,h,t)}

  /* ===== the plaza and the building exterior ===== */
  function buildExterior(){
    var A=archMats(),rn=archRng(42),bx1=BOUNDS.x1,bx2=BOUNDS.x2,bz=BOUNDS.z2,PW=30,WY=.2,refl=[];
    var WARM=0xffe3bf,PUR=0x6e42a3;
    var stone=new ArchB(),pave=new ArchB(),dark=new ArchB(),bronze=new ArchB(),lamp=new ArchB(),glowB=new ArchB(),spotB=new ArchB(),gnd=new ArchB();

    /* ----- ground with two holes for the reflecting pools (the pools show a mirrored world below) ----- */
    var pools=[[-11,-5,13,29],[5,11,13,29]];
    function gq(x1,x2,z1,z2){gnd.quad(x2-x1,z2-z1,(x1+x2)/2,0,(z1+z2)/2,-Math.PI/2,0)}
    gq(-90,90,0,13);gq(-90,90,29,90);gq(-90,-11,13,29);gq(-5,5,13,29);gq(11,90,13,29);
    gq(-90,bx1-.5,-90,0);gq(bx2+.5,90,-90,0);gq(bx1-.5,bx2+.5,-90,bz-.5);
    var gm=gnd.mesh(A.ground);
    (function(){var u=gm.geometry.attributes.uv,p=gm.geometry.attributes.position;for(var i=0;i<u.count;i++)u.setXY(i,p.getX(i)/8,p.getZ(i)/8)})();

    /* ----- forecourt plinth (10 cm) with one step, and the axial path ----- */
    var PX=15,PZ=10;
    pave.bx(-PX,PX,0,.1,1.5,PZ,0,4.8);pave.bx(-4.5,4.5,0,.1,.5,1.5,0,4.8);
    pave.bx(-PX-.5,PX+.5,0,.05,1.5,PZ+.5,0,4.8);
    pave.bx(-3,3,0,.012,PZ+.5,33,0,4.8);
    /* lit step nosings */
    lamp.bx(-PX,PX,.085,.095,PZ+.01,PZ+.03);lamp.bx(-PX-.5,PX+.5,.035,.045,PZ+.51,PZ+.53);
    glowB.quad(2*PX+2,.9,0,.06,PZ+.7,-Math.PI/2,0,archCol(WARM,.35));
    /* linear path lights set into the ground */
    [-1,1].forEach(function(s){lamp.bx(s*3.12-.025,s*3.12+.025,.0,.018,PZ+1.2,32);glowB.quad(1.1,32-PZ,s*3.12,.02,(PZ+33)/2,-Math.PI/2,0,archCol(WARM,.16))});

    /* ----- reflecting pools ----- */
    pools.forEach(function(p){var c=.35,h=.3;
      stone.bx(p[0]-c,p[1]+c,0,h,p[2]-c,p[2],0,6);stone.bx(p[0]-c,p[1]+c,0,h,p[3],p[3]+c,0,6);
      stone.bx(p[0]-c,p[0],0,h,p[2],p[3],0,6);stone.bx(p[1],p[1]+c,0,h,p[2],p[3],0,6);
      var w=new T.Mesh(new T.PlaneGeometry(p[1]-p[0],p[3]-p[2]),A.water);w.rotation.x=-Math.PI/2;w.position.set((p[0]+p[1])/2,WY,(p[2]+p[3])/2);w.renderOrder=1;scene.add(w);
      /* a thin light line under the far coping lip */
      lamp.bx(p[0]+.05,p[1]-.05,WY+.03,WY+.045,p[2]+.02,p[2]+.04);
      col(p[0]-c,p[1]+c,p[2]-c,p[3]+c);
    });

    /* ----- the building: central volume (h14) with a tall portal, wings (h11), deep shadow reveals ----- */
    var HC=14,HW=11,FZ=1.5,WZ=1.2,PH=9.5,PO=4.5,FJ=5.7,CY=6.6,CT=.6;
    stone.bx(bx1,-16.6,0,HW,-.5,WZ,0,6);stone.bx(16.6,bx2,0,HW,-.5,WZ,0,6);
    dark.bx(-16.6,-16,0,HW+.6,-.5,.5);dark.bx(16,16.6,0,HW+.6,-.5,.5);
    /* central piers and the glazed bays under the canopy */
    stone.bx(-16,-PX,0,HC,-.5,FZ,0,6);stone.bx(PX,16,0,HC,-.5,FZ,0,6);
    stone.bx(-PX,-FJ,CY+CT,HC,-.5,FZ,0,6);stone.bx(FJ,PX,CY+CT,HC,-.5,FZ,0,6);
    dark.bx(-PX,-FJ,0,CY,-.5,FZ-.3);dark.bx(FJ,PX,0,CY,-.5,FZ-.3);
    /* portal: projecting stone frame, 1.8 m deep reveal, back wall with the doors */
    stone.bx(-FJ,-PO,0,PH+1.2,-.5,FZ+.8,0,6);stone.bx(PO,FJ,0,PH+1.2,-.5,FZ+.8,0,6);stone.bx(-FJ,FJ,PH,PH+1.2,-.5,FZ+.8,0,6);
    stone.bx(-PO,PO,PH+1.2,HC,-.5,FZ,0,6);
    stone.bx(-PO,-3,0,5.2,-.5,.5,0,6);stone.bx(3,PO,0,5.2,-.5,.5,0,6);stone.bx(-PO,PO,5.2,CY,-.5,.5,0,6);
    /* backlit bronze fin screen above the canopy inside the portal */
    var scr=new T.Mesh(new T.PlaneGeometry(2*PO,PH-CY-CT),new T.MeshBasicMaterial({color:0xd9b98f}));scr.position.set(0,(CY+CT+PH)/2,.45);scene.add(scr);refl.push(scr);
    for(var fx=-PO+.25;fx<PO;fx+=.3)bronze.bx(fx-.03,fx+.03,CY+CT,PH,.45,.75);
    col(bx1,-PO,-.5,WZ);col(PO,bx2,-.5,WZ);col(-16.6,-PO,-.5,FZ);col(PO,16.6,-.5,FZ);col(-FJ,-PO,FZ,FZ+.8);col(PO,FJ,FZ,FZ+.8);col(-PO,-3,-.5,.5);col(3,PO,-.5,.5);
    /* side and back walls at BOUNDS */
    stone.bx(bx1-.5,bx1+.5,0,HW,bz,-.5,0,6);stone.bx(bx2-.5,bx2+.5,0,HW,bz,-.5,0,6);stone.bx(bx1-.5,bx2+.5,0,HW,bz-.5,bz+.5,0,6);
    /* glazing: warm interior seen through glass, bronze mullions */
    var gt=ctex(1024,768,function(c,W,H){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5a4430');g.addColorStop(.1,'#2b2119');g.addColorStop(.75,'#17120e');g.addColorStop(1,'#241b14');c.fillStyle=g;c.fillRect(0,0,W,H);
      c.fillStyle='rgba(255,226,180,.9)';c.fillRect(0,H*.035,W,5);
      for(var i=0;i<6;i++){var x=(i+.5)*W/6,gg=c.createRadialGradient(x,H*.95,0,x,H*.95,W/7);gg.addColorStop(0,'rgba(255,214,160,.28)');gg.addColorStop(1,'rgba(255,214,160,0)');c.fillStyle=gg;c.fillRect(x-W/6,H*.6,W/3,H*.4)}});
    var gw=PX-FJ,gmat=new T.MeshBasicMaterial({map:gt});
    [-1,1].forEach(function(s){var gx=s*(FJ+gw/2),gp=new T.Mesh(new T.PlaneGeometry(gw,CY-.1),gmat);gp.position.set(gx,.1+(CY-.1)/2,FZ-.28);scene.add(gp);refl.push(gp);
      for(var i=0;i<=6;i++){var mx=s*(FJ+i*gw/6);bronze.bx(mx-.05,mx+.05,.1,CY,FZ-.3,FZ-.1)}
      bronze.bx(s*FJ,s*PX,.1,.2,FZ-.3,FZ-.1);
      var gl=new T.Mesh(new T.PlaneGeometry(gw,CY-.1),MAT.glass);gl.position.set(gx,.1+(CY-.1)/2,FZ-.2);scene.add(gl)});
    /* the cantilevered canopy (crosses the portal) with a lit soffit */
    var CZ=9.5;stone.bx(-PX,PX,CY,CY+CT,FZ,CZ,0,6);stone.bx(-PO,PO,CY,CY+CT,.5,FZ,0,6);
    bronze.bx(-PX-.02,PX+.02,CY+CT-.04,CY+CT+.02,CZ-.02,CZ+.02);
    var sof=new T.Mesh(new T.PlaneGeometry(2*PX,CZ-.5),A.soffit);sof.rotation.x=Math.PI/2;sof.position.set(0,CY-.005,(CZ+.5)/2);scene.add(sof);refl.push(sof);
    [2.6,4.9,7.2,9.1].forEach(function(z){lamp.bx(-PX+.4,PX-.4,CY-.03,CY-.01,z-.03,z+.03);glowB.quad(2*PX-.8,.9,0,CY-.04,z,Math.PI/2,0,archCol(WARM,.18));glowB.quad(2*PX,3.2,0,.115,z,-Math.PI/2,0,archCol(WARM,.07))});
    /* grazing light up the portal reveals and the piers */
    [-1,1].forEach(function(s){spotB.quad(1.6,6,s*(PO-.01),3,FZ-.1,0,-s*Math.PI/2,archCol(WARM,.35),Math.PI);
      for(var x=19.5;x<bx2-1;x+=6)spotB.quad(4.2,9,s*x,4.5,WZ+.01,0,0,archCol(WARM,.16),Math.PI)});
    /* door frame: bronze lining of the opening and threshold */
    bronze.bx(-3.06,-3,0,5.2,-.5,.5);bronze.bx(3,3.06,0,5.2,-.5,.5);bronze.bx(-3.06,3.06,5.14,5.24,-.5,.5);bronze.bx(-3.06,3.06,0,.1,-.5,.5);

    /* ----- lettering: TESTAMENTS above the portal (lit, with halo); tagline cut into the portal lintel ----- */
    var sign=archText(13.6,1.9,function(c,W,H){c.fillStyle='#fbf7ef';c.font='500 '+Math.round(H*.8)+'px "Bodoni Moda"';sp(c,'TESTAMENTS',W/2,H*.8,Math.round(H*.13))},300);
    bronze.bx(-6.4,6.4,11.02,11.06,FZ,FZ+.03);sign.position.set(0,12.15,FZ+.04);scene.add(sign);refl.push(sign);
    var halo=glow(15,2.6,0xfff0dc,.1);halo.position.set(0,12.1,FZ+.01);scene.add(halo);
    var sub=archText(8,.62,function(c,W,H){c.fillStyle='#e9e4da';c.font='500 '+Math.round(H*.56)+'px Inter';sp(c,'UNDERSTAND THE WHY.',W/2,H*.72,Math.round(H*.3))},500);
    sub.position.set(0,PH+.6,FZ+.81);scene.add(sub);refl.push(sub);

    /* ----- doors (slide into the wall; doorL/doorR/doorCol drive the core loop) ----- */
    doorL=box(3,5.2,.1,MAT.glass,-1.5,2.6,0);doorR=box(3,5.2,.1,MAT.glass,1.5,2.6,0);
    var dfr=new ArchB();dfr.bx(-1.5,1.5,2.5,2.6,-.07,.07);dfr.bx(-1.5,1.5,-2.6,-2.45,-.07,.07);dfr.bx(-1.5,-1.42,-2.6,2.6,-.07,.07);dfr.bx(1.42,1.5,-2.6,2.6,-.07,.07);
    var dfm=dfr.mesh(A.bronze,doorL);doorR.add(dfm.clone());
    [[doorL,1.25],[doorR,-1.25]].forEach(function(d){var h=new T.Mesh(new T.BoxGeometry(.04,1.6,.05),A.bronze);h.position.set(d[1],-.4,.1);d[0].add(h);var h2=h.clone();h2.position.z=-.1;d[0].add(h2)});
    doorCol=col(-3,3,-.1,.1);
    addInter(0,.6,'pz',6,'Enter','Enter TESTAMENTS',function(){auto={x:0,z:-11}});
    /* the vestibule behind the glass: a luminous ceiling and washed walls, visibly warm from the plaza */
    var lc=new T.Mesh(new T.PlaneGeometry(5.6,5.4),new T.MeshBasicMaterial({map:ctex(256,256,function(c,W,H){c.fillStyle='#3a3026';c.fillRect(0,0,W,H);var g=c.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.6);g.addColorStop(0,'#fff1dc');g.addColorStop(1,'#e8cfa8');c.fillStyle=g;c.fillRect(10,10,W-20,H-20);c.fillStyle='rgba(0,0,0,.35)';for(var i=1;i<4;i++){c.fillRect(i*W/4-1,10,2,H-20);c.fillRect(10,i*H/4-1,W-20,2)}})}));
    lc.rotation.x=Math.PI/2;lc.position.set(0,5.17,-3);scene.add(lc);
    glowB.quad(5.4,5.6,0,.02,-3,-Math.PI/2,0,archCol(WARM,.4));
    var fw=new T.PointLight(0xffe2c0,1.6,24,2);fw.position.set(0,5.6,5.5);scene.add(fw);

    /* ----- trees: natural low-poly canopies (merged), uplit in restrained purple ----- */
    var trunks=new ArchB(),cans=new ArchB();
    function tree(x,z,s){var ht=2.6*s,ry=rn()*6.28;
      trunks.add(new T.CylinderGeometry(.08*s,.17*s,ht+.6*s,7),new T.Matrix4().setPosition(x,(ht+.6*s)/2,z));
      [[.55,.5],[-.5,.62]].forEach(function(b,i){var a=ry+i*2.6,m=new T.Matrix4().makeRotationFromEuler(new T.Euler(Math.sin(a)*b[0],0,-Math.cos(a)*b[0]));m.setPosition(x+Math.cos(a)*.2*s,ht*.95,z+Math.sin(a)*.2*s);trunks.add(new T.CylinderGeometry(.03*s,.07*s,1.1*s,5),m)});
      var cy=ht+1.1*s,n=7;
      for(var i=0;i<n;i++){var a=ry+i/n*6.28,rr=i?.95*s:0,r=(i?.7+rn()*.3:1.15)*s,g=new T.IcosahedronGeometry(r,1),pa=g.attributes.position;
        for(var k=0;k<pa.count;k++){var vx=pa.getX(k),vy=pa.getY(k),vz=pa.getZ(k),nz=1+.16*Math.sin(vx*4.1+vz*2.7+i)*Math.cos(vy*3.3-vz*1.9);pa.setXYZ(k,vx*nz,vy*nz*.78,vz*nz)}
        var bx=x+Math.cos(a)*rr,by=cy+(i?(rn()-.35)*.8*s:.25*s),bz=z+Math.sin(a)*rr;
        cans.add(g,new T.Matrix4().setPosition(bx,by,bz),function(px,py){var b=Math.max(.18,Math.min(1,1.25-(py-ht)/(2.6*s)));return [b,b,b]})}
      glowB.quad(4*s,4*s,x,.03,z,-Math.PI/2,0,archCol(PUR,.3));lamp.bx(x+.45*s-.05,x+.45*s+.05,0,.03,z-.05,z+.05);
      col(x-.3,x+.3,z-.3,z+.3)}
    [[-14,15.5,1],[14,15.5,1],[-14,22,1.1],[14,22,1.1],[-14,28.5,.95],[14,28.5,.95],[-19,18.5,1.15],[19,18.5,1.15],[-19,26,1],[19,26,1],[-21,5.5,1.2],[21,5.5,1.2],[-26,11,1.1],[26,11,1.1],[-25,22,1.25],[25,22,1.25],[-28,30,1.1],[28,30,1.1]].forEach(function(t){tree(t[0],t[1],t[2])});
    trunks.mesh(MAT.trunk);var canM=cans.mesh(A.canopy);refl.push(canM);

    /* ----- planters (with clipped shrubs) on the plinth, stone benches beside the pools ----- */
    [-1,1].forEach(function(s){var x1=s*8.2,x2=s*13.6;stone.bx(x1,x2,0,.6,7.9,9.3,0,6);dark.bx(x1,x2,.6,.62,7.95,9.25);
      col(Math.min(x1,x2),Math.max(x1,x2),7.9,9.3);
      [17,25].forEach(function(z){stone.bx(s*12.6-.3,s*12.6+.3,.08,.46,z-1.2,z+1.2,0,6);dark.bx(s*12.6-.22,s*12.6+.22,0,.08,z-1.1,z+1.1);col(s*12.6-.3,s*12.6+.3,z-1.2,z+1.2)})});
    var shr=new ArchB();[-1,1].forEach(function(s){for(var i=0;i<6;i++){var g=new T.IcosahedronGeometry(.5,1);shr.add(g,new T.Matrix4().makeScale(1.15,.55,1.1).setPosition(s*(8.9+i*.85),.82,8.6),[.5,.5,.5])}
      glowB.quad(6,2.2,s*10.9,.12,8.6,-Math.PI/2,0,archCol(PUR,.18))});
    shr.mesh(A.canopy);

    /* ----- plaza edge: low stone wall that explains the boundary ----- */
    stone.bx(-PW-.5,-PW,0,.55,-.5,34,0,6);stone.bx(PW,PW+.5,0,.55,-.5,34,0,6);stone.bx(-PW-.5,PW+.5,0,.55,33.5,34,0,6);
    col(-PW-1,-PW,-1,34);col(PW,PW+1,-1,34);col(-PW-1,PW+1,33.5,34.5);

    var stM=stone.mesh(A.clad);refl.push(stM);pave.mesh(A.pave);dark.mesh(A.dark);var brM=bronze.mesh(A.bronze);var lmM=lamp.mesh(MAT.lamp);refl.push(lmM);
    glowB.mesh(A.glowV);var spM=spotB.mesh(A.spotV);

    /* ----- the mirrored world seen through the pools (planar reflection by geometry) ----- */
    var lowQ=(S.quality==='auto'?(coarse?'low':'medium'):S.quality)==='low';
    if(lowQ)A.water.opacity=.85;else{var mg=new T.Group();mg.scale.y=-1;mg.position.y=2*WY;refl.forEach(function(o){mg.add(o.clone())});mg.add(halo.clone());scene.add(mg)}

    /* ----- night sky ----- */
    var sg=new T.BufferGeometry(),pts=[];for(var i=0;i<600;i++){var a=rn()*Math.PI*2,rr=70+rn()*60;pts.push(Math.cos(a)*rr,25+rn()*60,Math.sin(a)*rr-20)}
    sg.setAttribute('position',new T.Float32BufferAttribute(pts,3));scene.add(new T.Points(sg,new T.PointsMaterial({color:0x8d8aa0,size:.25,fog:false})));
  }
