  /* ===== central lobby ===== */
  function buildLobby(){
    var L=RM.lobby;
    slab(-14,-6,14,-34,10,MAT.ceil,true);
    var sky=new T.Mesh(new T.CircleGeometry(4.2,64),new T.MeshBasicMaterial({color:0x6f7f9f,fog:false}));sky.rotation.x=Math.PI/2;sky.position.set(0,9.98,-20);scene.add(sky);
    var ring=new T.Mesh(new T.RingGeometry(4.2,4.6,64),new T.MeshBasicMaterial({color:0x222226,side:T.DoubleSide}));ring.rotation.x=Math.PI/2;ring.position.set(0,9.97,-20);scene.add(ring);
    var shaft=new T.Mesh(new T.CylinderGeometry(4.1,5.2,10,48,1,true),new T.MeshBasicMaterial({color:0x9fb0d0,transparent:true,opacity:.02,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));shaft.position.set(0,5,-20);scene.add(shaft);
    var sl=new T.PointLight(0xc9d4f0,1.3,26,2);sl.position.set(0,8.5,-20);scene.add(sl);floorGlow(0,-20,11,11,0x9fb0d0,.22);
    [[-9,-10],[9,-10],[-9,-30],[9,-30]].forEach(function(c){var m=new T.Mesh(new T.CylinderGeometry(.5,.5,10,32),MAT.col);m.position.set(c[0],5,c[1]);scene.add(m);col(c[0]-.5,c[0]+.5,c[1]-.5,c[1]+.5)});
    var g=new T.BoxGeometry(2.5,5.4,1.3,4,8,2),pa=g.attributes.position;
    for(var j=0;j<pa.count;j++){var vz=pa.getZ(j);if(vz>.6)continue;pa.setX(j,pa.getX(j)+(Math.random()-.5)*.5);pa.setY(j,pa.getY(j)+(Math.random()-.5)*.3);pa.setZ(j,vz+(Math.random()-.5)*.45)}
    g.computeVertexNormals();var mono=new T.Mesh(g,MAT.mono);mono.position.set(0,2.75,-20.2);scene.add(mono);
    box(3.6,.18,1.9,MAT.bench,0,.09,-20.2);
    var eng=plane(2.2,1.7,ctex(1000,760,function(c,W){c.fillStyle='rgba(235,232,226,.92)';c.font='400 112px "Bodoni Moda"';sp(c,'EVERY',W/2,210,26);sp(c,'CHAPTER',W/2,400,26);sp(c,'MATTERS.',W/2,590,26)}));eng.position.set(0,3.6,-19.53);scene.add(eng);
    var ml=new T.PointLight(0x7d4fc4,1.7,7,2);ml.position.set(0,.15,-18.1);scene.add(ml);floorGlow(0,-19.6,5.5,3.4,0x7a4cc0,.6);
    col(-1.8,1.8,-21.2,-19.2);
    box(2.6,.46,.6,MAT.bench,-5.5,.23,-20);col(-6.8,-4.2,-20.3,-19.7);box(2.6,.46,.6,MAT.bench,5.5,.23,-20);col(4.2,6.8,-20.3,-19.7);
    hang('wall-upward',L,'w',-20,2.2,2.6);hang('railroad',L,'e',-20,2.3,2.8);
    hang('mural-wide',L,'n',-5.5,2.4,2.5);hang('glasses-closeup',L,'n',5.5,2.4,2.5);
    function over(side,at,top,big){var pos=onWall(L,side,at);var s=plane(4.4,1.1,ctex(1320,330,function(c,W){c.fillStyle='#a3a29e';c.font='500 40px Inter';sp(c,top,W/2,95,14);c.fillStyle='#f4f1ea';c.font='400 128px "Bodoni Moda"';sp(c,big,W/2,250,18)}));place(s,pos.x+NV[pos.n][0]*.01,5,pos.z+NV[pos.n][1]*.01,pos.n)}
    over('w',-13,'ROOM','ABOUT');over('e',-13,'ROOM','PROCESS');over('n',-11,'READING ROOM','LIBRARY');over('n',11,'THE MUSEUM','SHOP');
    ['flourish','becoming','freedom'].forEach(function(s){var c=chap(s);if(!c)return;var pos=s==='flourish'?['w',-27]:s==='freedom'?['e',-27]:['n',0];over(pos[0],pos[1],'CHAPTER '+c.num,c.title.toUpperCase());
      var dp=onWall(L,pos[0],pos[1]);floorGlow(dp.x+NV[dp.n][0]*.6,dp.z+NV[dp.n][1]*.6,pos[0]==='n'?4.6:2.2,pos[0]==='n'?2.2:4.6,0x6e42a3,.5)});
    panel(L,'s',-8.6,2.7,4.4,2.6,function(c){c.fillStyle='#f4f1ea';c.font='400 74px "Bodoni Moda"';sp(c,'START A',40,130,10,'left');sp(c,'CONVERSATION.',40,225,10,'left');c.fillStyle='#bdbbb6';c.font='400 30px Inter';['General inquiries','Retail partnerships','Press and media','Collaborations','Order support'].forEach(function(t,i){c.fillText('—  '+t,44,310+i*42)})},{act:openContact,verb:'Write',label:'Start a conversation'});
    panel(L,'s',8.6,3.2,4.2,1.3,function(c,W){c.fillStyle='#a3a29e';c.font='500 34px Inter';sp(c,'VISITOR',W/2,80,14);c.fillStyle='#f4f1ea';c.font='400 104px "Bodoni Moda"';sp(c,'INFORMATION',W/2,210,12)});
    box(4,1.05,1,MAT.ped,8.6,.52,-8.2);box(4.1,.05,1.1,MAT.frame,8.6,1.07,-8.2);col(6.6,10.6,-8.7,-7.7);floorGlow(8.6,-9,4,2,0x6e42a3,.35);
    addInter(8.6,-8.7,'nz',3.4,'Ask','Information · FAQ · Newsletter',function(){openInfo('faq')});
  }

