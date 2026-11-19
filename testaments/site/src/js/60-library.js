  /* ===== reading & screening room ===== */
  function buildLibrary(){
    var Lb=RM.library,sv=$('screenVid'),vt=null;try{vt=new T.VideoTexture(sv);vt.encoding=T.sRGBEncoding}catch(e){}
    screenTex=vt;var sw=10.5,sh=sw*822/1620;
    box(sw+.3,sh+.3,.1,MAT.frame,-17.25,3.1,-57.8);
    var scr=new T.Mesh(new T.PlaneGeometry(sw,sh),new T.MeshBasicMaterial(vt?{map:vt}:{color:0x222222}));scr.position.set(-17.25,3.1,-57.73);scene.add(scr);
    floorGlow(-17.25,-54,11,6,0xc9c2d8,.18);
    addInter(-17.25,-57.7,'pz',13,'Watch','Watch the TESTAMENTS film',function(){openFilm()});
    [-47,-50].forEach(function(z){box(7,.46,.7,MAT.bench,-17.25,.23,z);col(-20.75,-13.75,z-.4,z+.4)});
    var lec=new T.Group(),stand=new T.Mesh(new T.BoxGeometry(.6,1.05,.5),MAT.bench);stand.position.y=.52;lec.add(stand);
    var top=new T.Mesh(new T.BoxGeometry(1.1,.06,.8),MAT.frame);top.position.y=1.08;top.rotation.x=-.35;lec.add(top);
    var mag=plane(.95,.62,ctex(760,500,function(x,W,H){x.fillStyle='#f5f3ef';x.fillRect(0,0,W,H);x.fillStyle='#090909';x.fillRect(0,0,W/2,H);x.fillStyle='#f5f3ef';x.font='500 34px "Bodoni Moda"';sp(x,'TESTAMENTS',W/4,120,6);x.font='italic 400 40px "Bodoni Moda"';x.textAlign='center';x.fillText('Understand',W/4,290);x.fillText('the Why.',W/4,340);x.fillStyle='#090909';x.font='500 16px Inter';sp(x,'READ THE MAGAZINE',W*3/4,250,5);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(W/2-2,0,4,H)}),true);
    mag.rotation.x=-Math.PI/2+.35;mag.position.set(0,1.13,0);lec.add(mag);lec.position.set(-11,0,-43.5);scene.add(lec);col(-11.6,-10.4,-44,-43);floorGlow(-11,-43.5,2.8,2.8,0xfff0dc,.35);
    addInter(-11,-43.5,null,2.8,'Read','Read the magazine',function(){openReader()});
    function shelf(along){var pos=onWall(Lb,'w',along),g=new T.Group();[0,1,2].forEach(function(row){var b=new T.Mesh(new T.BoxGeometry(3.2,.06,.4),MAT.frame);b.position.set(0,.9+row*.9,.2);g.add(b);CH.forEach(function(c,i){var cv=plane(.42,.55,coverTex(c,row%2===1),true);cv.position.set(-1+i,1.2+row*.9,.08);g.add(cv)})});place(g,pos.x,0,pos.z,pos.n)}
    shelf(-44);shelf(-51);
    addInter(Lb.x1+.5,-47.5,'px',3.6,'Browse','The chapters',openChapterList);
    panel(Lb,'s',-21,3.6,6,1.5,function(c){c.fillStyle='#a3a29e';c.font='500 34px Inter';sp(c,'THE READING ROOM',30,90,12,'left');c.fillStyle='#f4f1ea';c.font='italic 400 80px "Bodoni Moda"';c.fillText('Read slowly. Come back often.',30,210)});
  }
