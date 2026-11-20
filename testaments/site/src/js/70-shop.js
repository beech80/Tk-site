  /* ===== museum shop =====
     A calm independent bookstore: the lit statement wall (north), three illuminated edition plinths,
     a long marble display table with stacks, face-out wall shelving (east) and the wrap counter (west).
     Prices and availability come from CHAPTERS[].edition only. */
  function shopPrice(c){var e=c.edition;return e.price!=null?money(e):'Price to be announced'}
  function buildShop(){
    var Sh=RM.shop,M=libMats(),cx=(Sh.x1+Sh.x2)/2;

    /* --- statement wall: a halo-lit sign across the north wall --- */
    var sw=12.4,shh=2.9,sz=Sh.z2+.3,sy=3.75,wz=Sh.z2+.16;
    var hal=glow(sw*1.35,shh*2.1,0xfff0dc,.22);hal.position.set(cx,sy,wz);scene.add(hal);
    var sign=libSign(sw,shh,function(c,W,H){c.fillStyle='#0a0a0b';c.fillRect(0,0,W,H);c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=3;c.strokeRect(24,24,W-48,H-48);
      c.fillStyle='#cfccc5';c.font='600 '+Math.round(H*.07)+'px Inter';sp(c,'THE MUSEUM SHOP',W/2,H*.3,Math.round(H*.035));
      c.fillStyle='#f8f5ef';c.font='400 '+Math.round(H*.25)+'px "Bodoni Moda"';sp(c,'A STORY YOU CAN HOLD.',W/2,H*.62,Math.round(H*.03));
      c.fillStyle='#b49be0';c.fillRect(W/2-40,H*.72,80,5);
      c.fillStyle='#bdbab3';c.font='500 '+Math.round(H*.058)+'px Inter';sp(c,'PRINT EDITIONS OF EVERY CHAPTER',W/2,H*.84,Math.round(H*.022))},330);
    sign.position.set(cx,sy,sz);scene.add(sign);
    var cove=box(sw+.4,.03,.03,MAT.lamp,cx,5.9,sz+.05);
    var wash=spot(sw*1.3,5.6,.45);wash.position.set(cx,sy-.1,wz+.01);scene.add(wash);

    /* --- three illuminated plinths, one per edition --- */
    var pz=-51.2,n=CH.length,ped=[],tops=[],ease=[],xs=CH.map(function(c,i){return n===1?cx:Sh.x1+4.5+i*(Sh.x2-Sh.x1-9)/(n-1)});
    CH.forEach(function(c,i){var x=xs[i];
      libB(ped,1.25,.98,1.25,x,.49,pz);libB(tops,1.13,.012,1.13,x,.986,pz);
      libB(ease,.92,1.2,.04,x,1.66,pz-.12,0,-.14);libB(ease,.92,.04,.12,x,1.07,pz+.02);
      var cv=plane(.88,1.15,coverTex(c,i%2===1),true);cv.position.set(x,1.67,pz-.093);cv.rotation.x=-.14;scene.add(cv);
      var ha=glow(2.2,2.6,0xfff1dc,.16);ha.position.set(x,1.7,pz-.2);scene.add(ha);
      var pl=libSign(1.15,.62,function(t,W,H){t.fillStyle='#0b0b0c';t.fillRect(0,0,W,H);t.fillStyle='#d4d0c9';t.font='600 '+Math.round(H*.1)+'px Inter';sp(t,'CHAPTER '+c.num,W/2,H*.2,Math.round(H*.03));
        t.fillStyle='#f8f5ef';t.font='400 '+Math.round(H*.24)+'px "Bodoni Moda"';sp(t,c.title.toUpperCase(),W/2,H*.47,Math.round(H*.02));
        t.fillStyle='#c9c6bf';t.font='italic 400 '+Math.round(H*.11)+'px "Bodoni Moda"';t.textAlign='center';t.fillText(who(c),W/2,H*.64);
        t.fillStyle='#b49be0';t.fillRect(W/2-24,H*.7,48,3);
        t.fillStyle='#f0ede7';t.font='600 '+Math.round(H*.075)+'px Inter';sp(t,shopPrice(c).toUpperCase(),W/2,H*.83,Math.round(H*.016));t.fillStyle='#b8b5ae';t.font='500 '+Math.round(H*.06)+'px Inter';sp(t,edState(c).toUpperCase(),W/2,H*.94,Math.round(H*.016))},700);
      pl.position.set(x,.56,pz+.632);scene.add(pl);
      floorGlow(x,pz,3.2,3.2,0xfff0dc,.2);floorGlow(x,pz,2,2,0x6e42a3,.14);
      var pin=new T.Mesh(new T.CircleGeometry(.14,16),MAT.lamp);pin.rotation.x=Math.PI/2;pin.position.set(x,Sh.h-.02,pz-.2);scene.add(pin);
      col(x-.68,x+.68,pz-.68,pz+.68);
      addInter(x,pz+.66,'pz',3.4,'View','View edition · '+c.title,function(){openProduct(c)});
    });
    libMerge(ped,MAT.ped);libMerge(tops,MAT.lamp);libMerge(ease,MAT.frame);

    /* --- long marble display table with stacks of each edition --- */
    var tz=-44.6,tx1=12.6,tx2=21.9,tw=1.2,tcx=(tx1+tx2)/2,tl=tx2-tx1,tb=[],stk=[],tcov={};
    var tt=box(tl,.07,tw,M.marble,tcx,.865,tz);
    libB(tb,.5,.83,.9,tx1+.9,.415,tz);libB(tb,.5,.83,.9,tx2-.9,.415,tz);libMerge(tb,MAT.ped);
    var slots=[];CH.forEach(function(c){slots.push([c,false],[c,true])});
    slots.forEach(function(s,i){var x=tx1+.7+i*(tl-1.4)/(slots.length-1),k=(i*37)%5,cnt=12+k*2,hgt=cnt*.007,ry=((i%3)-1)*.06;
      libB(stk,.3,hgt,.39,x,.9+hgt/2,tz+.04,ry);
      var key=s[0].slug+(s[1]?'L':'D');(tcov[key]=tcov[key]||{c:s[0],l:s[1],p:[]}).p.push({g:new T.PlaneGeometry(.3,.39).rotateX(-Math.PI/2).rotateY(ry),x:x,y:.9+hgt+.002,z:tz+.04});
    });
    libMerge(stk,M.page);
    /* one edition of each chapter propped face-out on a small stand at the back of the table */
    var stand=[];CH.forEach(function(c,i){var x=tcx+(i-(CH.length-1)/2)*2.6,z=tz-.32;
      libB(stand,.46,.6,.02,x,1.19,z-.03,0,-.2);libB(stand,.46,.03,.08,x,.915,z+.05);
      var cv=plane(.42,.55,coverTex(c,i%2===1),true);cv.position.set(x,1.2,z-.012);cv.rotation.x=-.2;scene.add(cv)});
    libMerge(stand,MAT.frame);
    Object.keys(tcov).forEach(function(k){var f=tcov[k];libMerge(f.p,new T.MeshBasicMaterial({map:coverTex(f.c,f.l)}))});
    var tgl=glow(tl*1.15,tw*2.4,0xfff0dc,.08);tgl.rotation.x=-Math.PI/2;tgl.position.set(tcx,.905,tz);scene.add(tgl);
    var lab=libSign(3.6,.14,function(t,W,H){t.fillStyle='#0b0b0c';t.fillRect(0,0,W,H);t.fillStyle='#e9e6e0';t.font='600 '+Math.round(H*.34)+'px Inter';sp(t,'EDITIONS OPEN FOR ORDERING WHEN EACH CHAPTER IS PUBLISHED',W/2,H*.64,Math.round(H*.05))},900);
    lab.position.set(tcx,.86,tz+tw/2+.006);scene.add(lab);
    col(tx1-.05,tx2+.05,tz-tw/2-.05,tz+tw/2+.05);
    floorGlow(tcx,tz,tl+2,3.2,0xfff0dc,.12);

    /* --- face-out wall shelving on the east wall --- */
    var ex=Sh.x2-.16,sz0=-41.2,sz1=-49.2,sl=sz0-sz1,sc=(sz0+sz1)/2,ledges=[1.05,1.85,2.65],sh=[],fo={};
    libB(sh,.05,2.6,sl+.3,ex-.02,1.95,sc);libMerge(sh,M.oak);
    var led=[];ledges.forEach(function(y){libB(led,.24,.04,sl+.3,ex-.12,y,sc);libB(led,.03,.07,sl+.3,ex-.235,y+.035,sc)});libMerge(led,M.oak);
    ledges.forEach(function(y,r){for(var i=0;i<6;i++){var c=CH[(i+r)%CH.length],l=(i+r)%2===1,key=c.slug+(l?'L':'D');
      (fo[key]=fo[key]||{c:c,l:l,p:[]}).p.push({g:new T.PlaneGeometry(.5,.65),x:ex-.08,y:y+.36,z:sz1+.15+sl*(i+.5)/6,ry:-Math.PI/2,rx:0})}});
    Object.keys(fo).forEach(function(k){libMerge(fo[k].p.map(function(p){p.g.rotateX(-.08);return p}),new T.MeshBasicMaterial({map:coverTex(fo[k].c,fo[k].l)}))});
    var ew=spot(sl*1.1,4.2,.4);place(ew,ex+.02,2.2,sc,'nx');
    col(ex-.3,Sh.x2,sz1-.2,sz0+.2);
    libPlaque(Sh,'e',-55.6,2.6,2.6,1.3,'PRINT EDITIONS','Every Chapter Matters.','About 24 pages · limited first run');

    /* --- cash & wrap counter on the west wall --- */
    var kx=8.75,kz=-45.2,kl=4.2,kd=1.0,kb=[];
    libB(kb,kd,.98,kl,kx,.49,kz);libMerge(kb,MAT.ped);
    var ktop=box(kd+.08,.05,kl+.08,M.oak,kx,1.005,kz);
    box(.02,.02,kl-.2,MAT.warm,kx+kd/2+.012,.06,kz);floorGlow(kx+kd/2+.4,kz,1.2,kl+.6,0xfff0dc,.14);
    /* a wrapped edition with a purple band, and a short stack */
    var pk=[];libB(pk,.3,.05,.4,kx-.05,1.055,kz-1.1,.12);libMerge(pk,new T.MeshStandardMaterial({color:0x101010,roughness:.7}));
    var bd=[];libB(bd,.31,.052,.05,kx-.05,1.056,kz-1.1,.12);libMerge(bd,new T.MeshStandardMaterial({color:0x6e42a3,roughness:.6,emissive:0x2a1840}));
    var ks=[];libB(ks,.3,.05,.39,kx-.05,1.055,kz+1.05);libMerge(ks,M.page);
    var kc=plane(.3,.39,coverTex(CH[0],false),true);kc.rotation.x=-Math.PI/2;kc.position.set(kx-.05,1.082,kz+1.05);scene.add(kc);
    libLamp(kx-.2,1.03,kz,.38);
    col(Sh.x1,kx+kd/2+.06,kz-kl/2-.05,kz+kl/2+.05);
    libPlaque(Sh,'w',kz,2.55,2.4,1.1,'THE COUNTER','Your cart','Shipping & returns');
    addInter(kx+kd/2+.05,kz,'px',3.2,'Cart','Your cart',openCart);

    /* one soft, even fill for the room */
    var shl=new T.PointLight(0xfff0dc,.8,22,2);shl.position.set(cx,5,-47.5);scene.add(shl);
  }
