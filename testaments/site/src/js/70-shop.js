  /* ===== museum shop ===== */
  function buildShop(){
    var Sh=RM.shop;
    panel(Sh,'n',17.25,4,9,1.8,function(c,W){c.fillStyle='#a3a29e';c.font='500 36px Inter';sp(c,'THE MUSEUM SHOP',W/2,90,14);c.fillStyle='#f4f1ea';c.font='400 120px "Bodoni Moda"';sp(c,'A STORY YOU CAN HOLD.',W/2,250,10)});
    CH.forEach(function(c,i){var x=11.5+i*5.75,z=-50;box(1.3,1.1,1.3,MAT.ped,x,.55,z);col(x-.75,x+.75,z-.75,z+.75);
      var bk=box(.88,1.14,.04,MAT.frame,x,1.72,z-.02);bk.rotation.x=-.12;
      var cv=plane(.84,1.1,coverTex(c,false),true);cv.position.set(x,1.72,z+.005);cv.rotation.x=-.12;scene.add(cv);
      var pl=plane(1.2,.36,ctex(600,180,function(t,W){t.fillStyle='#a3a29e';t.font='500 26px Inter';sp(t,'CHAPTER '+c.num,W/2,60,8);t.fillStyle='#f4f1ea';t.font='400 64px "Bodoni Moda"';sp(t,c.title.toUpperCase(),W/2,140,8)}),true);pl.position.set(x,.8,z+.66);scene.add(pl);
      var s2=spot(2.8,4,.5);s2.position.set(x,2.2,z-.7);scene.add(s2);floorGlow(x,z,3,3,0x6e42a3,.45);
      addInter(x,z+.66,'pz',3.2,'View','View edition · '+c.title,function(){openProduct(c)});
    });
    var shl=new T.PointLight(0xfff0dc,1.1,20,2);shl.position.set(17.25,5,-49);scene.add(shl);
    box(5,1,1.1,MAT.ped,17.25,.5,-41.5);col(14.75,19.75,-42.05,-40.95);
    addInter(17.25,-40.95,'pz',3,'Cart','Your cart',openCart);
  }
  function coverTex(c,light){return ctex(420,550,function(x,W){x.fillStyle=light?'#f5f3ef':'#090909';x.fillRect(0,0,W,550);var fg=light?'#090909':'#f5f3ef';x.fillStyle=fg;x.font='500 40px "Bodoni Moda"';sp(x,'TESTAMENTS',W/2,62,6);x.font='500 9px Inter';x.fillStyle=light?'#55534f':'#bdbbb6';sp(x,'UNDERSTAND THE WHY.',W/2,86,3);x.font='400 210px "Bodoni Moda"';x.strokeStyle=light?'rgba(8,8,8,.35)':'rgba(255,255,255,.45)';x.lineWidth=1.4;x.textAlign='center';x.strokeText(c.num,W/2,330);x.fillStyle=fg;x.font='italic 400 44px "Bodoni Moda"';x.fillText(c.title,W/2,430);x.fillStyle='#b49be0';x.fillRect(W/2-14,448,28,2);x.fillStyle=fg;x.font='500 12px Inter';sp(x,who(c).toUpperCase(),W/2,478,4)})}

