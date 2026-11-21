  /* ===== architectural detailing applied to every room in ROOMS (after all rooms are built) =====
     skirting, bronze-lined door reveals with architraves, a light slot + soft wash at the top of every wall,
     track-light rails in the galleries, a linear ceiling light and panel joints in the corridors.
     Everything is merged into a handful of meshes (one per material). */
  HOOKS.afterBuild.push(function(){try{detailBuild()}catch(e){console.error('detail',e)}});
  function detailBuild(){
    var A=archMats(),WARM=0xffe3bf,th=.15;
    if(!A.trim){A.trim=new T.MeshStandardMaterial({color:0x1d1c1b,roughness:.55,metalness:.35});A.trimW=new T.MeshStandardMaterial({color:0xe2ddd4,roughness:.8});
      A.skirt=new T.MeshStandardMaterial({color:0x252423,roughness:.45,metalness:.5});A.jointW=new T.MeshBasicMaterial({color:0x8d887f})}
    if(!A.gapD){A.gapD=new T.MeshBasicMaterial({color:0x070707});A.gapW=new T.MeshBasicMaterial({color:0x3a3733});A.thr=new T.MeshStandardMaterial({color:0x6a5236,roughness:.35,metalness:.85})}
    var hiQ=!(S.quality==='low'||(S.quality==='auto'&&coarse)),gapD=new ArchB(),gapW=new ArchB(),thr=new ArchB(),cove=new ArchB();
    var trim=new ArchB(),trimW=new ArchB(),skirt=new ArchB(),bronze=new ArchB(),lamp=new ArchB(),wash=new ArchB(),glowB=new ArchB(),fixt=new ArchB();
    function find(x,z){for(var i=0;i<ROOMS.length;i++){var q=ROOMS[i];if(x>q.x1&&x<q.x2&&z<q.z1&&z>q.z2)return q}return null}
    /* a box given along-wall extents (a1..a2), height and offsets from the wall plane (o1..o2, + = into the room) */
    function wb(b,side,plane,a1,a2,y1,y2,o1,o2){var n=side==='s'||side==='e'?-1:1,f1=plane+n*o1,f2=plane+n*o2;if(side==='s'||side==='n')b.bx(a1,a2,y1,y2,f1,f2);else b.bx(f1,f2,y1,y2,a1,a2)}
    function wq(b,side,plane,along,y,w,h,off,col,rz){var n=side==='s'||side==='e'?-1:1,ry={s:Math.PI,n:0,w:Math.PI/2,e:-Math.PI/2}[side],p=plane+n*off;
      if(side==='s'||side==='n')b.quad(w,h,along,y,p,0,ry,col,rz);else b.quad(w,h,p,y,along,0,ry,col,rz)}

    ROOMS.forEach(function(r){
      var white=!!r.white,TR=white?trimW:trim,GP=white?gapW:gapD,gallery=!!(r.chapter||r.id==='about'||r.id==='process'),lob=r.id==='lobby',ves=r.id==='vestibule';
      var sides={s:[r.z1,r.x1,r.x2],n:[r.z2,r.x1,r.x2],w:[r.x1,r.z2,r.z1],e:[r.x2,r.z2,r.z1]};
      Object.keys(sides).forEach(function(k){
        if(r.open&&r.open.indexOf(k)>=0)return;
        var sd=sides[k],wall=sd[0],a=sd[1],b=sd[2],len=b-a,mid=(a+b)/2,inner=wall+(k==='s'||k==='e'?-th:th);
        var gaps=(r.doors||[]).filter(function(d){return d.s===k}).map(function(d){var w=d.w||4;return {a:d.at-w/2,b:d.at+w/2,h:d.h||4,at:d.at,w:w}}).sort(function(p,q){return p.a-q.a});
        /* wall segments between doorways: skirting + panel joints */
        var cur=a;gaps.concat([{a:b,b:b}]).forEach(function(g){
          if(g.a-cur>.01){wb(skirt,k,inner,cur,g.a,0,.1,0,.02);wq(GP,k,inner,(cur+g.a)/2,.115,g.a-cur,.03,.003);
            /* vertical panel joints (galleries + corridors), kept off door edges */
            if((gallery||r.cor)&&!lob){var pj=r.cor?3:4.5,nj=Math.floor((g.a-cur)/pj);for(var j=1;j<nj;j++){var ja=cur+j*(g.a-cur)/nj;wq(GP,k,inner,ja,(r.h-.1)/2+.13,.012,r.h-.36,.002)}}}
          cur=Math.max(cur,g.b)});
        /* doorways (the lobby builds its own portals) */
        if(!lob)gaps.forEach(function(g){var hw=g.w/2,tw=.2,tp=.06,dh=Math.min(g.h,r.h);
          /* bronze-lined reveal through the wall + a thin light line in the head */
          wb(bronze,k,wall,g.a,g.a+.03,0,dh,-th,th);wb(bronze,k,wall,g.b-.03,g.b,0,dh,-th,th);
          if(r.h>g.h){wb(bronze,k,wall,g.a,g.b,dh-.03,dh,-th,th)}
          wb(thr,k,wall,g.a+.03,g.b-.03,0,.008,-th,th);
          /* architrave on the room face, and on the far face when it opens into a room (not a corridor) */
          var faces=[[inner,0]];var n=k==='s'||k==='e'?1:-1,px=k==='w'||k==='e'?wall+n*.8:g.at,pz=k==='n'||k==='s'?wall+n*.8:g.at,o=find(px,pz);
          if(o&&!o.cor&&o.id!=='vestibule'&&o.id!=='lobby')faces.push([wall+n*th,1]);
          faces.forEach(function(f){var s2=f[1]?{s:'n',n:'s',w:'e',e:'w'}[k]:k,M=f[1]&&o&&!o.white?trim:TR,top=Math.min(dh+tw,r.h-.002);
            var G2=f[1]&&o&&!o.white?gapD:GP,gw=.025,gt=Math.min(dh+tw+gw,r.h-.002);
            wq(G2,s2,f[0],g.a-tw-gw/2,gt/2,gw,gt,.002);wq(G2,s2,f[0],g.b+tw+gw/2,gt/2,gw,gt,.002);if(r.h>g.h+tw+gw)wq(G2,s2,f[0],g.at,dh+tw+gw/2,g.w+2*(tw+gw),gw,.002);
            wb(M,s2,f[0],g.a-tw,g.a,0,top,0,tp);wb(M,s2,f[0],g.b,g.b+tw,0,top,0,tp);if(r.h>g.h+tw)wb(M,s2,f[0],g.a-tw,g.b+tw,dh,dh+tw,0,tp)});
        });
        /* light slot at the top of the wall and a soft wash down it */
        if(!lob){var wh=Math.min(r.cor?1.6:2.4,r.h-Math.max.apply(null,gaps.map(function(g){return g.h}).concat([0]))-.05);
          if(!r.cor)wb(lamp,k,inner,a,b,r.h-.05,r.h-.02,0,.04);
          if(wh>.3)wq(wash,k,inner,mid,r.h-wh/2-.02,len,wh,.006,archCol(WARM,white?.08:r.cor?.1:.14))}
      });

      var cx=(r.x1+r.x2)/2,cz=(r.z1+r.z2)/2,W=r.x2-r.x1,D=r.z1-r.z2;
      /* ceiling shadow gap: a dark band where ceiling meets wall (reads as a floating ceiling plane) */
      if(!lob){var cg=.06,yc=r.h-.004,i1=r.x1+th,i2=r.x2-th,j1=r.z1-th,j2=r.z2+th;
        [[i1,i2,j2,j2+cg],[i1,i2,j1-cg,j1],[i1,i1+cg,j2,j1],[i2-cg,i2,j2,j1]].forEach(function(e,ix){
          if(r.open&&r.open.indexOf('nsew'[ix])>=0)return;GP.quad(e[1]-e[0],e[3]-e[2],(e[0]+e[1])/2,yc,(e[2]+e[3])/2,Math.PI/2,0)})}
      /* galleries (desktop): a central ceiling coffer, a dark reveal frame with a warm cove line inside */
      if(gallery&&hiQ&&W>8&&D>8){var ix2=W/2-3.4,iz2=D/2-3.4,yk=r.h-.006,bw=.12;
        [[cx-ix2,cx+ix2,cz-iz2-bw,cz-iz2],[cx-ix2,cx+ix2,cz+iz2,cz+iz2+bw],[cx-ix2-bw,cx-ix2,cz-iz2-bw,cz+iz2+bw],[cx+ix2,cx+ix2+bw,cz-iz2-bw,cz+iz2+bw]].forEach(function(e){
          GP.quad(e[1]-e[0],e[3]-e[2],(e[0]+e[1])/2,yk,(e[2]+e[3])/2,Math.PI/2,0)});
        var ci=.03;[[cx-ix2,cx+ix2,cz-iz2,cz-iz2+ci],[cx-ix2,cx+ix2,cz+iz2-ci,cz+iz2],[cx-ix2,cx-ix2+ci,cz-iz2,cz+iz2],[cx+ix2-ci,cx+ix2,cz-iz2,cz+iz2]].forEach(function(e){
          cove.quad(e[1]-e[0],e[3]-e[2],(e[0]+e[1])/2,yk-.001,(e[2]+e[3])/2,Math.PI/2,0)});
        glowB.quad(ix2*2,iz2*2,cx,yk-.002,cz,Math.PI/2,0,archCol(WARM,.05))}
      /* corridors: a linear light in the ceiling and a soft pool on the floor */
      if(r.cor){var alongX=W>D,L2=(alongX?W:D)-.6;
        if(alongX){lamp.bx(cx-L2/2,cx+L2/2,r.h-.025,r.h-.001,cz-.04,cz+.04)}else lamp.bx(cx-.04,cx+.04,r.h-.025,r.h-.001,cz-L2/2,cz+L2/2);
        glowB.quad(alongX?W:2.6,alongX?2.6:D,cx,.02,cz,-Math.PI/2,0,archCol(WARM,.22))}
      /* galleries: two track-light rails parallel to the long walls, fixtures aimed at the walls */
      if(gallery){var longX=W>=D,len2=(longX?W:D)-2.4,off=1.7,yR=r.h-.024,seg=S.quality==='low'||(S.quality==='auto'&&coarse)?8:12;
        [-1,1].forEach(function(s){var rc=longX?(s<0?r.z2+off:r.z1-off):(s<0?r.x1+off:r.x2-off);
          if(longX)trim.bx(cx-len2/2,cx+len2/2,yR-.022,yR+.022,rc-.03,rc+.03);else trim.bx(rc-.03,rc+.03,yR-.022,yR+.022,cz-len2/2,cz+len2/2);
          var nf=Math.max(2,Math.round(len2/2.2));
          for(var i=0;i<nf;i++){var t=-len2/2+(i+.5)*len2/nf,fx=longX?cx+t:rc,fz=longX?rc:cz+t;
            /* aim: towards the wall (s<0 -> towards x1/z2) and down 40 degrees */
            var dir=longX?new T.Vector3(0,0,s):new T.Vector3(s,0,0),aim=dir.clone().multiplyScalar(Math.cos(.7)).add(new T.Vector3(0,-Math.sin(.7),0)).normalize();
            var q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),aim),c=new T.Vector3(fx,yR-.14,fz).add(aim.clone().multiplyScalar(.05));
            fixt.add(new T.CylinderGeometry(.055,.045,.2,seg),new T.Matrix4().compose(c,q,new T.Vector3(1,1,1)));
            fixt.add(new T.BoxGeometry(.02,.1,.02),new T.Matrix4().setPosition(fx,yR-.07,fz));
            var lc=c.clone().add(aim.clone().multiplyScalar(.101));lamp.add(new T.CircleGeometry(.04,seg),new T.Matrix4().compose(lc,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),aim),new T.Vector3(1,1,1)))}
        })}
    });
    trim.mesh(A.trim);trimW.mesh(A.trimW);skirt.mesh(A.skirt);bronze.mesh(A.bronze);lamp.mesh(MAT.lamp);fixt.mesh(A.trim);
    wash.mesh(A.washV);glowB.mesh(A.glowV);
    gapD.mesh(A.gapD);gapW.mesh(A.gapW);thr.mesh(A.thr);cove.mesh(MAT.lamp);
  }
