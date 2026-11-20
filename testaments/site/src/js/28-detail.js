  /* ===== architectural detailing applied to every room in ROOMS (after all rooms are built) =====
     skirting, bronze-lined door reveals with architraves, a light slot + soft wash at the top of every wall,
     track-light rails in the galleries, a linear ceiling light and panel joints in the corridors.
     Everything is merged into a handful of meshes (one per material). */
  HOOKS.afterBuild.push(function(){try{detailBuild()}catch(e){console.error('detail',e)}});
  function detailBuild(){
    var A=archMats(),WARM=0xffe3bf,th=.15;
    if(!A.trim){A.trim=new T.MeshStandardMaterial({color:0x1d1c1b,roughness:.55,metalness:.35});A.trimW=new T.MeshStandardMaterial({color:0xe2ddd4,roughness:.8});
      A.skirt=new T.MeshStandardMaterial({color:0x252423,roughness:.45,metalness:.5});A.jointW=new T.MeshBasicMaterial({color:0x8d887f})}
    var trim=new ArchB(),trimW=new ArchB(),skirt=new ArchB(),bronze=new ArchB(),lamp=new ArchB(),wash=new ArchB(),glowB=new ArchB(),joint=new ArchB(),jointW=new ArchB(),fixt=new ArchB();
    function find(x,z){for(var i=0;i<ROOMS.length;i++){var q=ROOMS[i];if(x>q.x1&&x<q.x2&&z<q.z1&&z>q.z2)return q}return null}
    /* a box given along-wall extents (a1..a2), height and offsets from the wall plane (o1..o2, + = into the room) */
    function wb(b,side,plane,a1,a2,y1,y2,o1,o2){var n=side==='s'||side==='e'?-1:1,f1=plane+n*o1,f2=plane+n*o2;if(side==='s'||side==='n')b.bx(a1,a2,y1,y2,f1,f2);else b.bx(f1,f2,y1,y2,a1,a2)}
    function wq(b,side,plane,along,y,w,h,off,col,rz){var n=side==='s'||side==='e'?-1:1,ry={s:Math.PI,n:0,w:Math.PI/2,e:-Math.PI/2}[side],p=plane+n*off;
      if(side==='s'||side==='n')b.quad(w,h,along,y,p,0,ry,col,rz);else b.quad(w,h,p,y,along,0,ry,col,rz)}

    ROOMS.forEach(function(r){
      var white=!!r.white,TR=white?trimW:trim,JN=white?jointW:joint,gallery=!!(r.chapter||r.id==='about'||r.id==='process'),lob=r.id==='lobby',ves=r.id==='vestibule';
      var sides={s:[r.z1,r.x1,r.x2],n:[r.z2,r.x1,r.x2],w:[r.x1,r.z2,r.z1],e:[r.x2,r.z2,r.z1]};
      Object.keys(sides).forEach(function(k){
        if(r.open&&r.open.indexOf(k)>=0)return;
        var sd=sides[k],wall=sd[0],a=sd[1],b=sd[2],len=b-a,mid=(a+b)/2,inner=wall+(k==='s'||k==='e'?-th:th);
        var gaps=(r.doors||[]).filter(function(d){return d.s===k}).map(function(d){var w=d.w||4;return {a:d.at-w/2,b:d.at+w/2,h:d.h||4,at:d.at,w:w}}).sort(function(p,q){return p.a-q.a});
        /* wall segments between doorways: skirting + panel joints */
        var cur=a;gaps.concat([{a:b,b:b}]).forEach(function(g){
          if(g.a-cur>.01){wb(skirt,k,inner,cur,g.a,0,.1,0,.02);
            if(false){var step=r.cor?1.6:3.5,n0=Math.ceil((cur+.4)/step);for(var t=n0*step;t<g.a-.4;t+=step)wq(JN,k,inner,t,(r.cor?r.h:lob?6:r.h)/2,.014,(r.cor?r.h:lob?6:r.h)-.02,.004)}}
          cur=Math.max(cur,g.b)});
        /* doorways (the lobby builds its own portals) */
        if(!lob)gaps.forEach(function(g){var hw=g.w/2,tw=.2,tp=.06,dh=Math.min(g.h,r.h);
          /* bronze-lined reveal through the wall + a thin light line in the head */
          wb(bronze,k,wall,g.a,g.a+.03,0,dh,-th,th);wb(bronze,k,wall,g.b-.03,g.b,0,dh,-th,th);
          if(r.h>g.h){wb(bronze,k,wall,g.a,g.b,dh-.03,dh,-th,th)}
          /* architrave on the room face, and on the far face when it opens into a room (not a corridor) */
          var faces=[[inner,0]];var n=k==='s'||k==='e'?1:-1,px=k==='w'||k==='e'?wall+n*.8:g.at,pz=k==='n'||k==='s'?wall+n*.8:g.at,o=find(px,pz);
          if(o&&!o.cor&&o.id!=='vestibule'&&o.id!=='lobby')faces.push([wall+n*th,1]);
          faces.forEach(function(f){var s2=f[1]?{s:'n',n:'s',w:'e',e:'w'}[k]:k,M=f[1]&&o&&!o.white?trim:TR;
            wb(M,s2,f[0],g.a-tw,g.a,0,dh+tw,0,tp);wb(M,s2,f[0],g.b,g.b+tw,0,dh+tw,0,tp);if(r.h>g.h)wb(M,s2,f[0],g.a-tw,g.b+tw,dh,dh+tw,0,tp)});
        });
        /* light slot at the top of the wall and a soft wash down it */
        if(!lob){var wh=Math.min(r.cor?1.6:2.4,r.h-Math.max.apply(null,gaps.map(function(g){return g.h}).concat([0]))-.05);
          if(!r.cor)wb(lamp,k,inner,a,b,r.h-.05,r.h-.02,0,.04);
          if(wh>.3)wq(wash,k,inner,mid,r.h-wh/2-.02,len,wh,.006,archCol(WARM,white?.08:r.cor?.1:.14))}
      });

      var cx=(r.x1+r.x2)/2,cz=(r.z1+r.z2)/2,W=r.x2-r.x1,D=r.z1-r.z2;
      /* corridors: a linear light in the ceiling and a soft pool on the floor */
      if(r.cor){var alongX=W>D,L2=(alongX?W:D)-.6;
        if(alongX){lamp.bx(cx-L2/2,cx+L2/2,r.h-.03,r.h-.01,cz-.04,cz+.04)}else lamp.bx(cx-.04,cx+.04,r.h-.03,r.h-.01,cz-L2/2,cz+L2/2);
        glowB.quad(alongX?W:2.6,alongX?2.6:D,cx,.02,cz,-Math.PI/2,0,archCol(WARM,.22))}
      /* galleries: two track-light rails parallel to the long walls, fixtures aimed at the walls */
      if(gallery){var longX=W>=D,len2=(longX?W:D)-2.4,off=1.7,yR=r.h-.08;
        [-1,1].forEach(function(s){var rc=longX?(s<0?r.z2+off:r.z1-off):(s<0?r.x1+off:r.x2-off);
          if(longX)trim.bx(cx-len2/2,cx+len2/2,yR-.02,yR+.02,rc-.03,rc+.03);else trim.bx(rc-.03,rc+.03,yR-.02,yR+.02,cz-len2/2,cz+len2/2);
          var nf=Math.max(2,Math.round(len2/2.2));
          for(var i=0;i<nf;i++){var t=-len2/2+(i+.5)*len2/nf,fx=longX?cx+t:rc,fz=longX?rc:cz+t;
            /* aim: towards the wall (s<0 -> towards x1/z2) and down 40 degrees */
            var dir=longX?new T.Vector3(0,0,s):new T.Vector3(s,0,0),aim=dir.clone().multiplyScalar(Math.cos(.7)).add(new T.Vector3(0,-Math.sin(.7),0)).normalize();
            var q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),aim),c=new T.Vector3(fx,yR-.17,fz).add(aim.clone().multiplyScalar(.05));
            fixt.add(new T.CylinderGeometry(.055,.045,.2,12),new T.Matrix4().compose(c,q,new T.Vector3(1,1,1)));
            fixt.add(new T.BoxGeometry(.02,.12,.02),new T.Matrix4().setPosition(fx,yR-.07,fz));
            var lc=c.clone().add(aim.clone().multiplyScalar(.101));lamp.add(new T.CircleGeometry(.04,10),new T.Matrix4().compose(lc,new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),aim),new T.Vector3(1,1,1)))}
        })}
    });
    trim.mesh(A.trim);trimW.mesh(A.trimW);skirt.mesh(A.skirt);bronze.mesh(A.bronze);lamp.mesh(MAT.lamp);fixt.mesh(A.trim);
    joint.mesh(A.dark);jointW.mesh(A.jointW);wash.mesh(A.washV);glowB.mesh(A.glowV);
  }
