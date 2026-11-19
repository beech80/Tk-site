  /* ===== the plaza and the building exterior ===== */
  function buildExterior(){
    /* ===== the plaza ===== */
    slab(-70,0,70,70,0,MAT.ground);slab(-3.2,0,3.2,32,.012,MAT.path);
    [-1,1].forEach(function(s){for(var z=3;z<=28;z+=5){box(.16,.9,.16,MAT.trunk,s*4,.45,z);box(.14,.06,.14,MAT.warm,s*4,.92,z);floorGlow(s*4,z,2.2,2.2,0xffe2b8,.5);col(s*4-.1,s*4+.1,z-.1,z+.1)}});
    function tree(x,z,s){box(.3,3.2*s,.3,MAT.trunk,x,1.6*s,z);var g=new T.Group();[[0,4.2,0,1.5],[.9,3.6,.3,1.1],[-.8,3.7,-.2,1.1],[.2,4.9,-.4,1],[-.3,3.2,.7,.9]].forEach(function(b){var m=new T.Mesh(new T.IcosahedronGeometry(b[3]*s,0),MAT.tree);m.position.set(b[0]*s,b[1]*s,b[2]*s);g.add(m)});g.position.set(x,0,z);scene.add(g);floorGlow(x,z,5*s,5*s,0x6e42a3,.55);col(x-.6,x+.6,z-.6,z+.6)}
    tree(-7.5,4,1);tree(7.5,4,1);tree(-12,10,1.15);tree(12,10,1.15);tree(-17,5,.9);tree(17,5,.9);tree(-24,8,1.1);tree(24,8,1.1);
    var l1=new T.PointLight(0x7a4cc0,2.2,14,2);l1.position.set(-7.5,1,5.5);scene.add(l1);
    var l2=new T.PointLight(0x7a4cc0,2.2,14,2);l2.position.set(7.5,1,5.5);scene.add(l2);
    var fw=new T.PointLight(0xffe2c0,1.4,22,2);fw.position.set(0,7,6);scene.add(fw);
    col(-31,-30,-1,34);col(30,31,-1,34);col(-31,31,33,34);
    var sg=new T.BufferGeometry(),pts=[];for(var i=0;i<600;i++){var a=Math.random()*Math.PI*2,rr=70+Math.random()*60;pts.push(Math.cos(a)*rr,25+Math.random()*60,Math.sin(a)*rr-20)}
    sg.setAttribute('position',new T.Float32BufferAttribute(pts,3));scene.add(new T.Points(sg,new T.PointsMaterial({color:0x8d8aa0,size:.25,fog:false})));

    /* ===== the building shell and facade ===== */
    var bx1=BOUNDS.x1,bx2=BOUNDS.x2,bz=BOUNDS.z2,lw=-3-bx1,rw=bx2-3;box(lw,12,1,MAT.stone,bx1+lw/2,6,0);box(rw,12,1,MAT.stone,3+rw/2,6,0);col(bx1,-3,-.5,.5);col(3,bx2,-.5,.5);
    box(6,6.8,1,MAT.stone,0,8.6,0);
    box(1,12,-bz,MAT.stone,bx1,6,bz/2);box(1,12,-bz,MAT.stone,bx2,6,bz/2);box(bx2-bx1+1,12,1,MAT.stone,(bx1+bx2)/2,6,bz);
    for(var fx=bx1+1.5;fx<bx2;fx+=3.8){if(Math.abs(fx)>3.4)box(.06,11.6,.08,MAT.trunk,fx,5.8,.52)}
    var sign=plane(15,2.3,ctex(2400,368,function(c,W){c.fillStyle='#f4f1ea';c.font='400 250px "Bodoni Moda"';sp(c,'TESTAMENTS',W/2,250,52)}));sign.position.set(0,9.4,.52);scene.add(sign);
    var sub=plane(7,.5,ctex(1400,100,function(c,W){c.fillStyle='#dcd9d2';c.font='500 50px Inter';sp(c,'UNDERSTAND THE WHY.',W/2,68,22)}));sub.position.set(0,7.75,.52);scene.add(sub);
    [-7.5,7.5,-18,18].forEach(function(x){var s=spot(6,9,.2);s.position.set(x,7.5,.51);scene.add(s)});var dg=spot(9,7,.35);dg.position.set(0,6,.505);scene.add(dg);
    box(6.3,.12,1.05,MAT.frame,0,5.2,0);
    doorL=box(3,5.2,.1,MAT.glass,-1.5,2.6,0);doorR=box(3,5.2,.1,MAT.glass,1.5,2.6,0);
    [doorL,doorR].forEach(function(d){d.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(3,5.2,.11)),new T.LineBasicMaterial({color:0x777777})))});
    doorCol=col(-3,3,-.1,.1);
    addInter(0,.6,'pz',6,'Enter','Enter TESTAMENTS',function(){auto={x:0,z:-11}});
  }
