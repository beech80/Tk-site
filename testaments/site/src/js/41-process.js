  /* ===== process =====
     Five installations, 01–05, each a physical scene in front of its wall: photograph + one wall text.
     North wall 01–03, south wall 04–05, the east wall carries the title (first view on entering). */
  var PROC=[['01','The Meeting','Getting to know the person beyond a surface-level introduction.','mural-portrait'],['02','The Conversation','Exploring experiences, memories, turning points, and reflections.','mural-walk'],['03','The Portrait','Photographing the subject in a way that reflects their personality and environment.','resonator'],['04','The Chapter','Bringing together dialogue, photography, and editorial design.','guitar-tree'],['05','The Testament','Preserving the story as a publication readers can experience and revisit.','reach']];
  function prMesh(g,geo,mat,x,y,z,rx,ry,rz){var m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);g.add(m);return m}
  var PRM=null;
  function prMats(){if(PRM)return PRM;var S=function(c,r,m){return new T.MeshStandardMaterial({color:c,roughness:r,metalness:m||0})};
    PRM={wood:S(0x2b221c,.5),oak:S(0x6b5440,.55),fab:S(0x34302d,.95),cer:S(0xefebe3,.3),blk:S(0x111112,.4,.2),steel:S(0x9a958c,.35,.8),
      glass:new T.MeshStandardMaterial({color:0xdfe6ea,roughness:.04,metalness:.3,transparent:true,opacity:.14,depthWrite:false})};return PRM}
  var prUp=null;
  function prLeg(g,ax,ay,az,bx,by,bz,r1,r2,mat,seg){var v=new T.Vector3(bx-ax,by-ay,bz-az),L=v.length(),m=new T.Mesh(new T.CylinderGeometry(r2,r1,L,seg||8),mat);
    m.position.set((ax+bx)/2,(ay+by)/2,(az+bz)/2);m.quaternion.setFromUnitVectors(prUp||(prUp=new T.Vector3(0,1,0)),v.normalize());g.add(m);return m}
  /* upholstered side chair: tapered splayed legs, seat frame + cushion, slightly reclined back. Sitter faces local -z. */
  function prChair(g,x,z,ry){var M=prMats(),c=new T.Group();prMesh(c,new T.BoxGeometry(.48,.035,.46),M.wood,0,.43,0);prMesh(c,new T.BoxGeometry(.45,.06,.43),M.fab,0,.476,-.005);
    [[-.2,-.19],[.2,-.19],[-.2,.19],[.2,.19]].forEach(function(l){prLeg(c,l[0]*1.12,0,l[1]*1.12,l[0],.42,l[1],.011,.019,M.wood)});
    prLeg(c,-.2,.43,.2,-.21,.86,.25,.016,.014,M.wood);prLeg(c,.2,.43,.2,.21,.86,.25,.016,.014,M.wood);
    var bk=prMesh(c,new T.BoxGeometry(.44,.26,.05),M.fab,0,.7,.235);bk.rotation.x=-.12;prMesh(c,new T.BoxGeometry(.46,.03,.05),M.wood,0,.85,.25,-.12);
    c.position.set(x,0,z);c.rotation.y=ry;g.add(c);return c}
  /* pedestal table: chamfered top, tapered column, weighted disc base */
  function prTable(g,x,z,r,h){var M=prMats();prMesh(g,new T.CylinderGeometry(r,r*.94,.03,40),M.oak,x,h-.015,z);prMesh(g,new T.CylinderGeometry(r*.94,r*.9,.012,40),M.wood,x,h-.036,z);
    prMesh(g,new T.CylinderGeometry(.024,.04,h-.06,12),M.blk,x,(h-.04)/2+.02,z);prMesh(g,new T.CylinderGeometry(r*.5,r*.56,.025,32),M.blk,x,.0125,z)}
  function prCup(g,x,y,z){var M=prMats();prMesh(g,new T.CylinderGeometry(.068,.06,.01,24),M.cer,x,y+.005,z);prMesh(g,new T.CylinderGeometry(.04,.03,.07,20),M.cer,x,y+.045,z);
    prMesh(g,new T.CylinderGeometry(.035,.035,.004,20),M.wood,x,y+.074,z);var hd=prMesh(g,new T.TorusGeometry(.018,.005,6,12,Math.PI),M.cer,x+.045,y+.045,z,0,0,-Math.PI/2)}
  function buildProcess(){
    var Pr=RM.process,st=[['n',22.6],['n',29],['n',35.4],['s',25.6],['s',32.4]];
    PROC.forEach(function(s,i){var a=st[i],side=a[0],at=a[1],dir=side==='n'?1:-1,wz=side==='n'?Pr.z2:Pr.z1,p=photo(s[3]),h=p.h>p.w?1.9:1.4;
      /* photograph left, wall text right (as seen facing the wall) */
      var off=dir===1?-1:1,pw=h*p.w/p.h;hang(s[3],Pr,side,at+off*(.5+pw/2),2.55,h);
      exOnWall(Pr,side,at-off*1.8,2.45,2.6,1.8,function(x,W,H){exBg(x,W,H);var L=W*.09;exT(x,s[0],L,H*.27,H*.17,EX.vio);exT(x,s[1],L,H*.5,H*.14);exRule(x,L,H*.58,H*.07,H*.008,'#6b6760');
        exW(x,s[2],L,H*.72,W*.84,H*.074,H*.1,'400 '+Math.round(H*.074)+'px Inter','#ebe7df')},{act:function(){openProcess(i)},label:s[0]+' · '+s[1],r:4.5});
      /* the installation, 2 m out from the wall */
      var g=new T.Group(),cz=wz+dir*2.3,cx=at;g.position.set(0,0,0);
      var M=prMats(),face=dir===1?Math.PI:0;
      if(i===0){prTable(g,cx,cz,.38,.74);prChair(g,cx-.7,cz+.15*dir,Math.PI/2+.35*dir+(dir===1?0:Math.PI)*0);prChair(g,cx+.7,cz+.15*dir,-Math.PI/2-.35*dir);
        prCup(g,cx-.14,.74,cz+.02);prCup(g,cx+.15,.74,cz+.08*dir);
        col(cx-1,cx+1,cz-.5,cz+.6)}
      if(i===1){prChair(g,cx-.95,cz,Math.PI/2+.2*dir);prChair(g,cx+.95,cz,-Math.PI/2-.2*dir);prTable(g,cx,cz-.5*dir,.2,.55);
        var rx=cx,rz=cz-.5*dir;prMesh(g,new T.BoxGeometry(.06,.022,.15),M.blk,rx,.561,rz);prMesh(g,new T.BoxGeometry(.05,.004,.06),M.steel,rx,.574,rz-.03);
        prMesh(g,new T.CylinderGeometry(.016,.016,.05,12),M.steel,rx-.012,.561,rz+.08,Math.PI/2);prMesh(g,new T.CylinderGeometry(.016,.016,.05,12),M.steel,rx+.012,.561,rz+.08,Math.PI/2);
        prMesh(g,new T.BoxGeometry(.008,.004,.008),new T.MeshBasicMaterial({color:0xff4a3a}),rx+.018,.574,rz+.03);
        col(cx-1.3,cx+1.3,cz-.6,cz+.4)}
      if(i===2){var tx=cx-.6,hy=1.35;[0,2.09,4.19].forEach(function(t){prLeg(g,tx+Math.cos(t)*.42,0,cz+Math.sin(t)*.42,tx,hy-.06,cz,.012,.02,M.blk)});
        prMesh(g,new T.CylinderGeometry(.03,.035,.12,12),M.blk,tx,hy,cz);
        var cam=new T.Group();prMesh(cam,new T.BoxGeometry(.15,.1,.08),M.blk,0,.07,0);prMesh(cam,new T.BoxGeometry(.05,.04,.06),M.blk,-.04,.135,0);
        prMesh(cam,new T.CylinderGeometry(.036,.04,.11,20),M.blk,.01,.07,-.09,Math.PI/2);prMesh(cam,new T.CylinderGeometry(.03,.03,.003,20),M.glass,.01,.07,-.146,Math.PI/2);
        prMesh(cam,new T.CylinderGeometry(.041,.041,.012,20),M.steel,.01,.07,-.06,Math.PI/2);cam.position.set(tx,hy+.06,cz);cam.rotation.y=face+.25*dir;g.add(cam);
        var lx=cx+.9;[0,2.09,4.19].forEach(function(t){prLeg(g,lx+Math.cos(t)*.38,0,cz+Math.sin(t)*.38,lx,.45,cz,.01,.012,M.steel)});
        prMesh(g,new T.CylinderGeometry(.013,.016,.8,8),M.steel,lx,.84,cz);
        var sb=new T.Group(),sg=new T.CylinderGeometry(.09,.48,.38,4,1,true);sg.rotateY(Math.PI/4);sg.rotateX(Math.PI/2);var shell=new T.Mesh(sg,M.blk);shell.material=M.blk;sb.add(shell);
        var diff=prMesh(sb,new T.PlaneGeometry(.67,.67),MAT.lamp,0,0,-.19,0,Math.PI,0);diff.rotation.y=Math.PI;prMesh(sb,new T.BoxGeometry(.06,.06,.08),M.blk,0,0,.22);
        sb.position.set(lx,1.28,cz);sb.rotation.y=face+1.25*dir;g.add(sb);
        col(cx-1.1,cx+1.35,cz-.5,cz+.5)}
      if(i===3){prMesh(g,new T.BoxGeometry(2.6,.045,1.2),M.oak,cx,.9,cz);prMesh(g,new T.BoxGeometry(2.5,.02,1.1),M.wood,cx,.867,cz);
        [[-1.15,-.48],[1.15,-.48],[-1.15,.48],[1.15,.48]].forEach(function(l){prLeg(g,cx+l[0]*1.02,0,cz+l[1]*1.04,cx+l[0],.86,cz+l[1],.016,.028,M.wood)});
        prMesh(g,new T.BoxGeometry(2.3,.025,.035),M.wood,cx,.25,cz);
        var spr=exSign(2.4,1.0,function(x,W,H){x.fillStyle='#141414';x.fillRect(0,0,W,H);for(var k=0;k<3;k++){var px=W*(.03+k*.33),pw=W*.3,ph=H*.8,py=H*.1;x.fillStyle='#ece8e0';x.fillRect(px,py,pw,ph);x.fillStyle='rgba(0,0,0,.15)';x.fillRect(px+pw/2-1,py,2,ph);
          x.fillStyle=k===1?'#2a2725':'#cfc9be';x.fillRect(px+pw*.06,py+ph*.08,pw*.4,ph*.75);x.fillStyle='#3a3733';for(var ln=0;ln<6;ln++)x.fillRect(px+pw*.56,py+ph*(.2+ln*.09),pw*.36*(ln%3===2?.6:1),3)}},300);
        spr.rotation.x=-Math.PI/2;spr.position.set(cx,.925,cz);g.add(spr);prMesh(g,new T.BoxGeometry(.5,.004,.03),M.steel,cx+.4,.925,cz-.45*dir,0,.15,0);
        col(cx-1.35,cx+1.35,cz-.65,cz+.65)}
      if(i===4){prMesh(g,new T.BoxGeometry(.8,.94,.8),MAT.ped,cx,.53,cz);prMesh(g,new T.BoxGeometry(.74,.06,.74),M.blk,cx,.03,cz);
        var cv=exSign(.36,.48,function(x,W,H){exBg(x,W,H,'#0b0b0c');exK(x,'TESTAMENTS',W/2,H*.13,H*.045,'#e9e5dd','center');exT(x,'001',W/2,H*.52,H*.2,EX.ink,'center');exRule(x,W*.44,H*.58,W*.12,3);exK(x,'Every Chapter Matters.',W/2,H*.88,H*.03,'#a9a49b','center')},600);
        prMesh(g,new T.BoxGeometry(.3,.05,.1),M.blk,cx,1.015,cz-.06*dir);
        cv.rotation.set(-Math.PI/2+.35,dir===1?0:Math.PI,0,'YXZ');cv.position.set(cx,1.1,cz);g.add(cv);
        prMesh(g,new T.BoxGeometry(.7,.5,.7),M.glass,cx,1.25,cz);
        [[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]].forEach(function(e){prMesh(g,new T.BoxGeometry(.012,.5,.012),M.steel,cx+e[0],1.25,cz+e[1])});
        prMesh(g,new T.BoxGeometry(.712,.012,.712),M.steel,cx,1.5,cz);prMesh(g,new T.BoxGeometry(.7,.006,.7),M.glass,cx,1.505,cz);
        col(cx-.45,cx+.45,cz-.45,cz+.45)}
      scene.add(g);floorGlow(cx,cz,3.2,2.4,0xfff1dc,.22);
      /* stage lighting: a beam over the installation, a wash on its wall text, a numbered floor disc */
      apBeam(cx,cz,Pr.h,.16,1.5,0xfff1dc,.06);apWash(Pr,side,at-off*1.8,2.9,4.2,4,.34);
      var nd=exSign(.7,.7,function(c,W,H){c.fillStyle='#141313';c.beginPath();c.arc(W/2,H/2,W*.48,0,7);c.fill();c.strokeStyle='#6e42a3';c.lineWidth=W*.02;c.beginPath();c.arc(W/2,H/2,W*.44,0,7);c.stroke();exT(c,s[0],W/2,H*.62,H*.32,'#ebe7df','center')},200);
      nd.rotation.set(-Math.PI/2,0,dir===1?0:Math.PI);nd.position.set(cx,.014,cz+dir*1.25);scene.add(nd);
      addInter(cx,cz,null,2.8,'Read',s[0]+' · '+s[1],function(){openProcess(i)},g);
    });
    exOnWall(Pr,'e',-13,3.1,10.4,3.6,function(x,W,H){exBg(x,W,H);var L=W*.07;exK(x,'The Process',L,H*.16,H*.05);
      exT(x,'BEFORE THE PAGE,',L-H*.01,H*.42,H*.135,null,'left',H*.015);exT(x,'THERE IS A CONVERSATION.',L-H*.01,H*.63,H*.135,null,'left',H*.015);
      exRule(x,L,H*.72,H*.08,H*.01);exK(x,'Five stages  ·  01 – 05',L,H*.86,H*.045,EX.vio)},{act:function(){openProcess(-1)},label:'How a chapter is made',r:9});
    /* room light: foot shadow, cove, title wash, and a purple inlaid route linking 01 to 05 */
    apDress(Pr,0xffe9d0,.12,['n','s','e']);apWash(Pr,'e',-13,3.6,14,6,.4);
    var rmat=new T.MeshBasicMaterial({color:0x7a4fb8});[[22.6,35.4,-15.9],[25.6,35.4,-10.1]].forEach(function(l){var m=new T.Mesh(new T.BoxGeometry(l[1]-l[0],.006,.04),rmat);m.position.set((l[0]+l[1])/2,.016,l[2]);scene.add(m)});
    var rv=new T.Mesh(new T.BoxGeometry(.04,.006,5.8),rmat);rv.position.set(35.4,.016,-13);scene.add(rv);
    box(3,.46,.7,MAT.bench,29,.23,-13);col(27.5,30.5,-13.4,-12.6);
  }
