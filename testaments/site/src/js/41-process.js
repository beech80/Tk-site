  /* ===== process =====
     Five installations, 01–05, each a physical scene in front of its wall: photograph + one wall text.
     North wall 01–03, south wall 04–05, the east wall carries the title (first view on entering). */
  var PROC=[['01','The Meeting','Getting to know the person beyond a surface-level introduction.','mural-portrait'],['02','The Conversation','Exploring experiences, memories, turning points, and reflections.','mural-walk'],['03','The Portrait','Photographing the subject in a way that reflects their personality and environment.','resonator'],['04','The Chapter','Bringing together dialogue, photography, and editorial design.','guitar-tree'],['05','The Testament','Preserving the story as a publication readers can experience and revisit.','reach']];
  function prMesh(g,geo,mat,x,y,z,rx,ry,rz){var m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m}
  function prChair(g,x,z,ry){var c=new T.Group();prMesh(c,new T.BoxGeometry(.5,.06,.5),MAT.bench,0,.46,0);prMesh(c,new T.BoxGeometry(.5,.5,.05),MAT.bench,0,.74,.23);
    [[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]].forEach(function(l){prMesh(c,new T.CylinderGeometry(.018,.018,.46,6),MAT.metal,l[0],.23,l[1])});c.position.set(x,0,z);c.rotation.y=ry;g.add(c);return c}
  function prTable(g,x,z,r,h){prMesh(g,new T.CylinderGeometry(r,r,.04,28),MAT.frame,x,h,z);prMesh(g,new T.CylinderGeometry(.03,.03,h,8),MAT.metal,x,h/2,z);prMesh(g,new T.CylinderGeometry(r*.55,r*.6,.03,20),MAT.metal,x,.015,z)}
  function buildProcess(){
    var Pr=RM.process,st=[['n',22.6],['n',29],['n',35.4],['s',25.6],['s',32.4]];
    PROC.forEach(function(s,i){var a=st[i],side=a[0],at=a[1],dir=side==='n'?1:-1,wz=side==='n'?Pr.z2:Pr.z1,p=photo(s[3]),h=p.h>p.w?1.9:1.4;
      /* photograph left, wall text right (as seen facing the wall) */
      var off=dir===1?-1:1,pw=h*p.w/p.h;hang(s[3],Pr,side,at+off*(.5+pw/2),2.55,h);
      exOnWall(Pr,side,at-off*1.8,2.45,2.6,1.8,function(x,W,H){exBg(x,W,H);var L=W*.09;exT(x,s[0],L,H*.27,H*.17,EX.vio);exT(x,s[1],L,H*.5,H*.14);exRule(x,L,H*.58,H*.07,H*.008,'#6b6760');
        exW(x,s[2],L,H*.72,W*.84,H*.074,H*.1,'400 '+Math.round(H*.074)+'px Inter','#ebe7df')},{act:function(){openProcess(i)},label:s[0]+' · '+s[1],r:4.5});
      /* the installation, 2 m out from the wall */
      var g=new T.Group(),cz=wz+dir*2.3,cx=at;g.position.set(0,0,0);
      if(i===0){prTable(g,cx,cz,.36,.74);prChair(g,cx-.62,cz+.25*dir,Math.PI/2+.5*dir);prChair(g,cx+.62,cz+.25*dir,-Math.PI/2-.5*dir);
        prMesh(g,new T.CylinderGeometry(.04,.035,.09,14),MAT.lamp,cx-.12,.8,cz);prMesh(g,new T.CylinderGeometry(.04,.035,.09,14),MAT.lamp,cx+.14,.8,cz+.06);
        col(cx-1,cx+1,cz-.5,cz+.6)}
      if(i===1){prChair(g,cx-.95,cz,Math.PI/2);prChair(g,cx+.95,cz,-Math.PI/2);prTable(g,cx,cz,.22,.55);
        prMesh(g,new T.BoxGeometry(.14,.03,.07),MAT.ped,cx,.585,cz);var led=prMesh(g,new T.BoxGeometry(.012,.006,.012),new T.MeshBasicMaterial({color:0xff4a3a}),cx+.05,.602,cz-.02);
        col(cx-1.3,cx+1.3,cz-.4,cz+.4)}
      if(i===2){[0,2.1,4.2].forEach(function(t){var leg=prMesh(g,new T.CylinderGeometry(.015,.015,1.5,6),MAT.metal,cx-.6+Math.cos(t)*.28,.72,cz+Math.sin(t)*.28);leg.rotation.z=Math.cos(t)*.2;leg.rotation.x=-Math.sin(t)*.2});
        prMesh(g,new T.BoxGeometry(.16,.12,.1),MAT.frame,cx-.6,1.5,cz);prMesh(g,new T.CylinderGeometry(.045,.05,.14,16),MAT.metal,cx-.6,1.5,cz-dir*.11,Math.PI/2);
        prMesh(g,new T.CylinderGeometry(.015,.015,2,6),MAT.metal,cx+.9,1,cz);[0,2.1,4.2].forEach(function(t){var f=prMesh(g,new T.CylinderGeometry(.012,.012,.5,6),MAT.metal,cx+.9+Math.cos(t)*.2,.12,cz+Math.sin(t)*.2);f.rotation.z=Math.PI/2.6*Math.cos(t);f.rotation.x=-Math.PI/2.6*Math.sin(t)});
        var sb=prMesh(g,new T.BoxGeometry(.75,.75,.35),MAT.frame,cx+.9,2.05,cz+dir*.05);sb.rotation.y=.5;
        var face=prMesh(g,new T.PlaneGeometry(.68,.68),MAT.lamp,0,0,0);face.position.set(cx+.9+Math.sin(.5)*-.18*dir,2.05,cz+dir*.05-.18*dir*Math.cos(.5));face.rotation.y=dir===1?Math.PI+.5:.5;
        col(cx-1,cx+1.2,cz-.45,cz+.45)}
      if(i===3){prMesh(g,new T.BoxGeometry(2.6,.06,1.2),MAT.frame,cx,.9,cz);[[-1.2,-.5],[1.2,-.5],[-1.2,.5],[1.2,.5]].forEach(function(l){prMesh(g,new T.BoxGeometry(.05,.87,.05),MAT.metal,cx+l[0],.45,cz+l[1])});
        var spr=exSign(2.4,1.0,function(x,W,H){x.fillStyle='#141414';x.fillRect(0,0,W,H);for(var k=0;k<3;k++){var px=W*(.03+k*.33),pw=W*.3,ph=H*.8,py=H*.1;x.fillStyle='#ece8e0';x.fillRect(px,py,pw,ph);x.fillStyle='rgba(0,0,0,.15)';x.fillRect(px+pw/2-1,py,2,ph);
          x.fillStyle=k===1?'#2a2725':'#cfc9be';x.fillRect(px+pw*.06,py+ph*.08,pw*.4,ph*.75);x.fillStyle='#3a3733';for(var ln=0;ln<6;ln++)x.fillRect(px+pw*.56,py+ph*(.2+ln*.09),pw*.36*(ln%3===2?.6:1),3)}},300);
        spr.rotation.x=-Math.PI/2;spr.position.set(cx,.935,cz);g.add(spr);col(cx-1.35,cx+1.35,cz-.65,cz+.65)}
      if(i===4){prMesh(g,new T.BoxGeometry(.8,1.0,.8),MAT.ped,cx,.5,cz);var cv=exSign(.36,.48,function(x,W,H){exBg(x,W,H,'#0b0b0c');exK(x,'TESTAMENTS',W/2,H*.13,H*.045,'#e9e5dd','center');exT(x,'001',W/2,H*.52,H*.2,EX.ink,'center');exRule(x,W*.44,H*.58,W*.12,3);exK(x,'Every Chapter Matters.',W/2,H*.88,H*.03,'#a9a49b','center')},600);
        cv.rotation.x=-Math.PI/2+.35;cv.rotation.y=dir===1?Math.PI:0;cv.position.set(cx,1.1,cz);g.add(cv);
        var vit=prMesh(g,new T.BoxGeometry(.7,.5,.7),new T.MeshStandardMaterial({color:0x222228,roughness:.05,metalness:.5,transparent:true,opacity:.18,depthWrite:false}),cx,1.25,cz);
        col(cx-.45,cx+.45,cz-.45,cz+.45)}
      scene.add(g);floorGlow(cx,cz,3.2,2.4,0xfff1dc,.16);
      addInter(cx,cz,null,2.8,'Read',s[0]+' · '+s[1],function(){openProcess(i)},g);
    });
    exOnWall(Pr,'e',-13,3.1,10.4,3.6,function(x,W,H){exBg(x,W,H);var L=W*.07;exK(x,'The Process',L,H*.16,H*.05);
      exT(x,'BEFORE THE PAGE,',L-H*.01,H*.42,H*.135,null,'left',H*.015);exT(x,'THERE IS A CONVERSATION.',L-H*.01,H*.63,H*.135,null,'left',H*.015);
      exRule(x,L,H*.72,H*.08,H*.01);exK(x,'Five stages  ·  01 – 05',L,H*.86,H*.045,EX.vio)},{act:function(){openProcess(-1)},label:'How a chapter is made',r:9});
    box(3,.46,.7,MAT.bench,29,.23,-13);col(27.5,30.5,-13.4,-12.6);
  }
