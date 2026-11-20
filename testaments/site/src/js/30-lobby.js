  /* ===== central lobby: a grand hall with a coffered ceiling, an oculus with a deep lit reveal,
     a gallery-level balcony, columns, a bronze compass inlay and the carved monument ===== */
  function buildLobby(){
    var L=RM.lobby,A=archMats(),rn=archRng(7),X1=L.x1,X2=L.x2,Z1=L.z1,Z2=L.z2,H=L.h,OX=0,OZ=-20,RO=4.2,BD=.9,BW=.45;
    var WARM=0xffe3bf,PUR=0x6e42a3;
    var stoneB=new ArchB(),darkB=new ArchB(),bronzeB=new ArchB(),lampB=new ArchB(),glowB=new ArchB(),washB=new ArchB(),spotB=new ArchB(),inlay=new ArchB(),beams=new ArchB();
    if(!A.brass)A.brass=new T.MeshStandardMaterial({color:0x8a6a40,roughness:.3,metalness:.9,emissive:0x2a1d0e});
    if(!A.beam)A.beam=new T.MeshStandardMaterial({color:0x1b1a19,roughness:.9});

    /* ----- ceiling with the oculus opening ----- */
    var sh=new T.Shape();sh.moveTo(X1,Z1);sh.lineTo(X2,Z1);sh.lineTo(X2,Z2);sh.lineTo(X1,Z2);sh.lineTo(X1,Z1);
    var hole=new T.Path();hole.absarc(OX,OZ,RO,0,Math.PI*2,true);sh.holes.push(hole);
    var cg=new T.ShapeGeometry(sh,48);cg.rotateX(Math.PI/2);var ceil=new T.Mesh(cg,MAT.ceil);ceil.position.y=H;scene.add(ceil);
    /* the reveal: a deep drum, brighter towards the sky, a light ring at its base */
    var rv=new T.Mesh(new T.CylinderGeometry(RO,RO,3.4,64,1,true),new T.MeshBasicMaterial({side:T.BackSide,map:ctex(16,256,function(c,W,Hh){var g=c.createLinearGradient(0,0,0,Hh);g.addColorStop(0,'#a9b4cc');g.addColorStop(.25,'#59627a');g.addColorStop(1,'#1a1c22');c.fillStyle=g;c.fillRect(0,0,W,Hh)})}));
    rv.position.set(OX,H-BD+1.7,OZ);scene.add(rv);
    var sky=new T.Mesh(new T.CircleGeometry(RO,64),new T.MeshBasicMaterial({fog:false,map:ctex(512,512,function(c,W){var g=c.createRadialGradient(W/2,W/2,0,W/2,W/2,W/2);g.addColorStop(0,'#33405e');g.addColorStop(1,'#1c2236');c.fillStyle=g;c.fillRect(0,0,W,W);var r2=archRng(9);for(var i=0;i<70;i++){c.fillStyle='rgba(230,232,255,'+(.3+r2()*.6)+')';c.fillRect(r2()*W,r2()*W,1.5,1.5)}})}));
    sky.rotation.x=Math.PI/2;sky.position.set(OX,H-BD+3.4,OZ);scene.add(sky);
    var rb=new T.Mesh(new T.RingGeometry(RO,RO+.6,64),A.beam);rb.rotation.x=Math.PI/2;rb.position.set(OX,H-BD,OZ);scene.add(rb);
    var rbo=new T.Mesh(new T.CylinderGeometry(RO+.6,RO+.6,BD,64,1,true),A.beam);rbo.position.set(OX,H-BD/2,OZ);scene.add(rbo);
    var ring=new T.Mesh(new T.RingGeometry(RO+.02,RO+.09,64),MAT.lamp);ring.rotation.x=Math.PI/2;ring.position.set(OX,H-BD-.01,OZ);scene.add(ring);
    var shaft=new T.Mesh(new T.CylinderGeometry(RO-.1,RO+.9,H-BD,48,1,true),new T.MeshBasicMaterial({color:0x9fb0d0,transparent:true,opacity:.025,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));shaft.position.set(OX,(H-BD)/2,OZ);scene.add(shaft);
    var sl=new T.PointLight(0xc9d4f0,1.3,26,2);sl.position.set(OX,8.5,OZ);scene.add(sl);
    glowB.quad(12,12,OX,.02,OZ,-Math.PI/2,0,archCol(0x9fb0d0,.22));

    /* ----- coffered ceiling: beams on the column grid, clipped at the oculus ring beam ----- */
    var GX=[-9,-4.5,0,4.5,9],GZ=[-10,-15,-20,-25,-30],RC=RO+.6,yb=H-BD/2;
    function seg(a,b,fixed,alongX){
      var d=alongX?Math.abs(fixed-OZ):Math.abs(fixed-OX),parts=[[a,b]];
      if(d<RC){var h=Math.sqrt(RC*RC-d*d),c=alongX?OX:OZ;parts=[[a,c-h],[c+h,b]]}
      parts.forEach(function(p){if(p[1]-p[0]<.05)return;if(alongX)beams.bx(p[0],p[1],H-BD,H,fixed-BW/2,fixed+BW/2);else beams.bx(fixed-BW/2,fixed+BW/2,H-BD,H,p[0],p[1])})}
    GZ.forEach(function(z){seg(X1,X2,z,true)});GX.forEach(function(x){seg(Z2,Z1,x,false)});
    /* a small warm downlight in every coffer outside the oculus */
    var cx=[X1].concat(GX,[X2]),cz=[Z2].concat(GZ.slice().reverse(),[Z1]);
    for(var i=0;i<cx.length-1;i++)for(var j=0;j<cz.length-1;j++){var mx=(cx[i]+cx[i+1])/2,mz=(cz[j]+cz[j+1])/2;if(Math.hypot(mx-OX,mz-OZ)<RC+1)continue;
      lampB.add(new T.CircleGeometry(.12,16),new T.Matrix4().makeRotationX(Math.PI/2).setPosition(mx,H-.02,mz))}
    /* perimeter light slot washing the upper walls */
    [[X1+.16,'x',1],[X2-.16,'x',-1],[Z1-.16,'z',-1],[Z2+.16,'z',1]].forEach(function(w){var len=w[1]==='x'?Z1-Z2:X2-X1,mid=w[1]==='x'?(Z1+Z2)/2:(X1+X2)/2;
      if(w[1]==='x'){lampB.bx(w[0]-.02,w[0]+.02,H-.06,H-.02,Z2,Z1);washB.quad(len,3.6,w[0]+w[2]*.005,H-1.8,mid,0,w[2]*Math.PI/2,archCol(WARM,.12))}
      else{lampB.bx(X1,X2,H-.06,H-.02,w[0]-.02,w[0]+.02);washB.quad(len,3.6,mid,H-1.8,w[0]+w[2]*.005,0,w[2]>0?0:Math.PI,archCol(WARM,.12))}});

    /* ----- gallery-level balcony on all four walls (visual only) ----- */
    var BY=6,BP=1.4,bt=.4;
    [['n'],['s'],['w'],['e']].forEach(function(s){s=s[0];var a,b;
      if(s==='n'||s==='s'){var zf=s==='n'?Z2+BP:Z1-BP,zw=s==='n'?Z2:Z1;a=Math.min(zf,zw);b=Math.max(zf,zw);
        stoneB.bx(X1,X2,BY,BY+bt,a,b,0,6);bronzeB.bx(X1,X2,BY+bt+1.05,BY+bt+1.1,zf-.05,zf+.05);
        var gl=new T.Mesh(new T.PlaneGeometry(X2-X1,1.05),MAT.glass);gl.position.set(0,BY+bt+.525,zf);scene.add(gl);
        lampB.bx(X1,X2,BY-.02,BY-.005,zf+(s==='n'?-.12:.08),zf+(s==='n'?-.08:.12));
}
      else{var xf=s==='w'?X1+BP:X2-BP,xw=s==='w'?X1:X2;a=Math.min(xf,xw);b=Math.max(xf,xw);
        stoneB.bx(a,b,BY,BY+bt,Z2+BP,Z1-BP,0,6);bronzeB.bx(xf-.05,xf+.05,BY+bt+1.05,BY+bt+1.1,Z2+BP,Z1-BP);
        var gl2=new T.Mesh(new T.PlaneGeometry(Z1-Z2-2*BP,1.05),MAT.glass);gl2.rotation.y=Math.PI/2;gl2.position.set(xf,BY+bt+.525,(Z1+Z2)/2);scene.add(gl2);
        lampB.bx(xf+(s==='w'?-.12:.08),xf+(s==='w'?-.08:.12),BY-.02,BY-.005,Z2+BP,Z1-BP)}});

    /* ----- columns: square stone base, bronze collar, shaft, square capital under the beams ----- */
    [[-9,-10],[9,-10],[-9,-30],[9,-30]].forEach(function(c){
      stoneB.bx(c[0]-.7,c[0]+.7,0,.42,c[1]-.7,c[1]+.7,0,6);bronzeB.add(new T.CylinderGeometry(.6,.6,.08,32),new T.Matrix4().setPosition(c[0],.46,c[1]));
      var m=new T.Mesh(new T.CylinderGeometry(.5,.52,H-BD-.92,40),MAT.col);m.position.set(c[0],.5+(H-BD-.92)/2,c[1]);scene.add(m);
      stoneB.bx(c[0]-.75,c[0]+.75,H-BD-.42,H-BD,c[1]-.75,c[1]+.75,0,6);bronzeB.bx(c[0]-.62,c[0]+.62,H-BD-.48,H-BD-.42,c[1]-.62,c[1]+.62);
      spotB.quad(1.6,6,c[0],3.4,c[1]+.53,0,0,archCol(WARM,.16),Math.PI);
      col(c[0]-.7,c[0]+.7,c[1]-.7,c[1]+.7)});

    /* ----- floor: bronze compass inlay around the monument, processional line from the entrance ----- */
    function ringI(r,w){inlay.add(new T.RingGeometry(r-w/2,r+w/2,96),new T.Matrix4().makeRotationX(-Math.PI/2).setPosition(OX,.004,OZ))}
    ringI(5.6,.07);ringI(7.2,.035);
    for(var k=0;k<16;k++){var an=k/16*Math.PI*2,l=.6,r0=5.6+.04;inlay.add(new T.PlaneGeometry(.03,l),new T.Matrix4().makeRotationFromEuler(new T.Euler(-Math.PI/2,0,-an,'YXZ')).setPosition(OX+Math.sin(an)*(r0+l/2),.004,OZ+Math.cos(an)*(r0+l/2)))}
    glowB.quad(15,15,OX,.015,OZ,-Math.PI/2,0,archCol(PUR,.08));

    /* ----- the monument: a rough-hewn stone with a dressed, engraved face, on a low plinth ----- */
    var MZ=-20.2,PY=.45;
    darkB.bx(-1.95,1.95,0,.25,MZ-1.35,MZ+1.35);stoneB.bx(-1.6,1.6,.25,PY,MZ-1.05,MZ+1.05,0,6);
    var g=new T.BoxGeometry(2.4,5.2,1.2,6,14,4),pa=g.attributes.position;
    for(var j2=0;j2<pa.count;j2++){var vx=pa.getX(j2),vy=pa.getY(j2),vz=pa.getZ(j2),t=(vy+2.6)/5.2;
      var nz=Math.sin(vx*5.3+vy*2.1)*Math.cos(vy*3.7-vz*4.1),taper=1-t*.08;vx*=taper;vz*=taper;
      if(vz>.55*taper&&Math.abs(vx)<1.0&&vy<2.4&&vy>-2.3){/* dressed front face stays flat */}
      else{vx+=Math.sign(vx)*Math.abs(nz)*.05+(rn()-.5)*.025;vz+=(vz>0?.015:-.05)*Math.abs(nz)+(rn()-.5)*.025;if(vy>2.5)vy+=nz*.18+(rn()-.5)*.06}
      pa.setXYZ(j2,vx,vy,vz)}
    g.computeVertexNormals();var mono=new T.Mesh(g,MAT.mono);mono.position.set(0,PY+2.6,MZ);scene.add(mono);
    var eng=archText(1.9,1.75,function(c,W,Hh){c.font='500 '+Math.round(Hh*.175)+'px "Bodoni Moda"';var gap=Math.round(Hh*.022);
      ['EVERY','CHAPTER','MATTERS.'].forEach(function(w,i){var y=Hh*(.3+i*.25);
        c.fillStyle='rgba(0,0,0,.75)';sp(c,w,W/2-3,y-3,gap);c.fillStyle='rgba(255,255,255,.22)';sp(c,w,W/2+2,y+2,gap);c.fillStyle='#ece8e0';sp(c,w,W/2,y,gap)})},500);
    eng.position.set(0,PY+3.35,MZ+.6*(1-(3.35/5.2)*.08)+.012);scene.add(eng);
    var ml=new T.PointLight(0x7d4fc4,.8,12,2);ml.position.set(0,.6,MZ+6);scene.add(ml);
    spotB.quad(2.3,5,0,PY+2.5,MZ+.63,0,0,archCol(PUR,.12),Math.PI);
    glowB.quad(5.5,3.4,0,.02,MZ+1.6,-Math.PI/2,0,archCol(0x7a4cc0,.26));
    /* the tagline, cut small beneath a bronze rule */
    var tag=archText(1.8,.5,function(c,W,Hh){c.fillStyle='rgba(180,155,224,.85)';c.fillRect(W*.38,Hh*.08,W*.24,3);c.font='600 '+Math.round(Hh*.3)+'px Inter';c.fillStyle='rgba(0,0,0,.7)';sp(c,'UNDERSTAND THE WHY.',W/2-2,Hh*.7-2,Math.round(Hh*.06));c.fillStyle='#d9d4ca';sp(c,'UNDERSTAND THE WHY.',W/2,Hh*.7,Math.round(Hh*.06))},500);
    tag.position.set(0,PY+2.25,MZ+.6*(1-(2.25/5.2)*.08)+.012);scene.add(tag);
    col(-1.95,1.95,MZ-1.35,MZ+1.35);

    /* ----- benches facing the monument ----- */
    [-1,1].forEach(function(s){stoneB.bx(s*7.8-.35,s*7.8+.35,.08,.46,OZ-1.5,OZ+1.5,0,6);darkB.bx(s*7.8-.27,s*7.8+.27,0,.08,OZ-1.4,OZ+1.4);col(s*7.8-.35,s*7.8+.35,OZ-1.5,OZ+1.5)});

    /* ----- photographs ----- */
    hang('wall-upward',L,'w',-20,2.2,2.6);hang('railroad',L,'e',-20,2.3,2.8);
    hang('mural-wide',L,'n',-5.5,2.4,2.5);hang('glasses-closeup',L,'n',5.5,2.4,2.5);

    /* ----- doorway portals: bronze-lined openings, a stone surround and a large lit sign above each door ----- */
    var DH=4,SY=4.95,SW=5.0,SH=1.3;
    function portal(side,at,w,dh,top,big){
      var p=onWall(L,side,at),nx=NV[p.n][0],nz=NV[p.n][1],face=side==='w'?X1+.15:side==='e'?X2-.15:side==='s'?Z1-.15:Z2+.15,alongX=side==='n'||side==='s',hw=w/2,d=.25,sw=.45,topY=big?SY+SH/2+.22:dh+.45;
      function bxA(a1,a2,y1,y2,o1,o2,b){var f1=face+(alongX?nz:nx)*o1,f2=face+(alongX?nz:nx)*o2;if(alongX)b.bx(at+a1,at+a2,y1,y2,f1,f2,0,6);else b.bx(f1,f2,y1,y2,at+a1,at+a2,0,6)}
      bxA(-hw-sw,-hw,0,topY,0,d,stoneB);bxA(hw,hw+sw,0,topY,0,d,stoneB);bxA(-hw-sw,hw+sw,topY,topY+.3,0,d,stoneB);
      bxA(-hw,-hw+.05,0,dh,-.3,d,bronzeB);bxA(hw-.05,hw,0,dh,-.3,d,bronzeB);bxA(-hw,hw,dh-.05,dh,-.3,d,bronzeB);
      if(alongX){col(at-hw-sw,at-hw,face,face+nz*d);col(at+hw,at+hw+sw,face,face+nz*d)}else{col(face,face+nx*d,at-hw-sw,at-hw);col(face,face+nx*d,at+hw,at+hw+sw)}
      if(!big)return;
      bxA(-hw,hw,dh,topY,0,.08,darkB);
      var s=archText(w+.6,SH,function(c,W,Hh){c.fillStyle='#e4e0d8';c.font='600 '+Math.round(Hh*.15)+'px Inter';sp(c,top,W/2,Hh*.28,Math.round(Hh*.05));
        c.fillStyle='#fbf8f2';c.font='500 '+Math.round(Hh*.46)+'px "Bodoni Moda"';sp(c,big,W/2,Hh*.82,Math.round(Hh*.04))},420);
      var sx=alongX?at:face+nx*.09,sz=alongX?face+nz*.09:at;place(s,sx,SY,sz,p.n);
      var lx=alongX?at:face+nx*.12,lz=alongX?face+nz*.12:at;
      if(alongX)lampB.bx(at-hw+.1,at+hw-.1,topY-.03,topY,face+nz*.06,face+nz*.1);else lampB.bx(face+nx*.06,face+nx*.1,topY-.03,topY,at-hw+.1,at+hw-.1);
      washB.quad(w,1.8,lx,topY-.9,lz,0,ROT[p.n],archCol(WARM,.22));
    }
    portal('w',-13,4,DH,'ROOM','ABOUT');portal('e',-13,4,DH,'ROOM','PROCESS');portal('n',-11,4,DH,'READING ROOM','LIBRARY');portal('n',11,4,DH,'THE MUSEUM','SHOP');
    ['flourish','becoming','freedom'].forEach(function(s){var c=chap(s),pos=s==='flourish'?['w',-27]:s==='freedom'?['e',-27]:['n',0];
      if(!c){portal(pos[0],pos[1],4,DH);return}
      portal(pos[0],pos[1],4,DH,'CHAPTER '+c.num,c.title.toUpperCase());
      var dp=onWall(L,pos[0],pos[1]);glowB.quad(pos[0]==='n'?4.6:2.2,pos[0]==='n'?2.2:4.6,dp.x+NV[dp.n][0]*.6,.02,dp.z+NV[dp.n][1]*.6,-Math.PI/2,0,archCol(PUR,.45))});
    portal('s',0,6,5.2);

    /* ----- wayfinding totem near the entrance (derived from the plan) ----- */
    var dirs=[];(L.doors||[]).forEach(function(d){if(d.s==='s')return;var px=d.s==='w'?X1-6:d.s==='e'?X2+6:d.at,pz=d.s==='n'?Z2-6:d.at;
      var r=ROOMS.filter(function(q){return !q.cor&&px>=q.x1&&px<=q.x2&&pz<=q.z1&&pz>=q.z2})[0];if(r&&(!r.chapter||r.c))dirs.push([d.s,r.name])});
    var ord={w:0,n:1,e:2},arrow={w:'←',n:'↑',e:'→'};dirs.sort(function(a,b){return ord[a[0]]-ord[b[0]]});
    var TX=-5.2,TZ=-9.4,TH=2.4,TW=1.6;
    darkB.bx(TX-TW/2,TX+TW/2,0,TH,TZ-.14,TZ+.14);
    var tt=archText(TW-.12,TH-.2,function(c,W,Hh){c.fillStyle='#0c0c0d';c.fillRect(0,0,W,Hh);c.fillStyle='#b49be0';c.fillRect(W*.1,Hh*.07,W*.12,4);
      c.fillStyle='#d6d2ca';c.font='600 '+Math.round(W*.06)+'px Inter';sp(c,'GALLERIES',W*.1,Hh*.13,Math.round(W*.02),'left');
      function arw(dir,x,y,sz){c.save();c.translate(x+sz/2,y-sz*.36);c.rotate(dir==='w'?Math.PI:dir==='n'?-Math.PI/2:0);c.strokeStyle='#fbf8f2';c.lineWidth=Math.max(3,sz*.1);c.lineCap='round';c.lineJoin='round';
        c.beginPath();c.moveTo(-sz*.42,0);c.lineTo(sz*.42,0);c.moveTo(sz*.12,-sz*.3);c.lineTo(sz*.42,0);c.lineTo(sz*.12,sz*.3);c.stroke();c.restore()}
      dirs.forEach(function(d,i){var y=Hh*(.25+i*.1),nm=d[1].replace(' · ',' '),fs=Math.round(W*.075),mw=W*.66;
        arw(d[0],W*.1,y,W*.085);c.fillStyle='#fbf8f2';c.textAlign='left';c.font='500 '+fs+'px Inter';
        while(c.measureText(nm).width>mw&&fs>W*.045){fs--;c.font='500 '+fs+'px Inter'}c.fillText(nm,W*.24,y)})},400);
    tt.position.set(TX,TH/2+.05,TZ+.145);scene.add(tt);
    col(TX-TW/2,TX+TW/2,TZ-.14,TZ+.14);

    /* ----- start a conversation, visitor information and the desk ----- */
    panel(L,'s',-8.6,2.7,4.4,2.6,function(c){c.fillStyle='#f4f1ea';c.font='400 74px "Bodoni Moda"';sp(c,'START A',40,130,10,'left');sp(c,'CONVERSATION.',40,225,10,'left');c.fillStyle='#bdbbb6';c.font='400 30px Inter';['General inquiries','Retail partnerships','Press and media','Collaborations','Order support'].forEach(function(t,i){c.fillText('—  '+t,44,310+i*42)})},{act:openContact,verb:'Write',label:'Start a conversation'});
    panel(L,'s',8.6,3.2,4.2,1.3,function(c,W){c.fillStyle='#a3a29e';c.font='500 34px Inter';sp(c,'VISITOR',W/2,80,14);c.fillStyle='#f4f1ea';c.font='400 104px "Bodoni Moda"';sp(c,'INFORMATION',W/2,210,12)});
    darkB.bx(6.6,10.6,0,1.05,-8.7,-7.7);stoneB.bx(6.55,10.65,1.05,1.1,-8.75,-7.65,0,6);lampB.bx(6.7,10.5,.06,.08,-8.72,-8.7);
    col(6.6,10.6,-8.7,-7.7);glowB.quad(4,2,8.6,.02,-9,-Math.PI/2,0,archCol(PUR,.3));
    addInter(8.6,-8.7,'nz',3.4,'Ask','Information · FAQ · Newsletter',function(){openInfo('faq')});

    beams.mesh(A.beam);stoneB.mesh(A.clad);darkB.mesh(A.dark);bronzeB.mesh(A.bronze);lampB.mesh(MAT.lamp);inlay.mesh(A.brass);
    glowB.mesh(A.glowV);washB.mesh(A.washV);spotB.mesh(A.spotV);
  }
