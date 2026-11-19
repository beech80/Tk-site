  /* ===== a chapter gallery ===== */
  function buildChapter(r){
    var c=r.c;if(!c){/* no chapter: seal the doorway */return}
    var opp={e:'w',w:'e',s:'n'}[r.entry],cx=(r.x1+r.x2)/2,cz=(r.z1+r.z2)/2;
    var wallW=(opp==='n'?r.x2-r.x1:r.z1-r.z2)-2,along=opp==='n'?cx:cz,W=Math.min(11,wallW);
    panel(r,opp,along,3.3,W,W*.5,function(x,Wd){var s=Wd/2200;x.fillStyle='#bdbbb6';x.font='500 '+(40*s|0)+'px Inter';sp(x,'CHAPTER '+c.num,140*s,210*s,14*s,'left');x.fillStyle='#f6f3ee';x.font='400 '+(230*s|0)+'px "Bodoni Moda"';sp(x,c.title.toUpperCase(),132*s,460*s,28*s,'left');x.fillStyle='#e7e5e0';x.font='italic 400 '+(92*s|0)+'px "Bodoni Moda"';x.fillText(who(c),140*s,600*s);
      x.fillStyle='#bdbbb6';x.font='400 '+(42*s|0)+'px Inter';var y=wrap(x,c.intro||'The introduction to this chapter is being written. It will appear here once it has been approved.',140*s,720*s,1400*s,62*s);
      x.fillStyle='#b49be0';x.font='500 '+(32*s|0)+'px Inter';sp(x,(STATUS[c.status]||'').toUpperCase()+'  ·  '+c.progress.toUpperCase(),140*s,y+120*s,7*s,'left')},{act:function(){openChapter(c)},verb:'Explore',label:'Explore '+c.title,r:14});
    floorGlow(opp==='w'?r.x1+1:opp==='e'?r.x2-1:cx,opp==='n'?r.z2+1:cz,opp==='n'?W:2.4,opp==='n'?2.4:W,0x6e42a3,.55);
    var mine=PHOTOS.filter(function(p){return p.chapter===c.slug}),slots;
    if(r.entry==='s')slots=[['w',r.z2+(r.z1-r.z2)*.62],['w',r.z2+(r.z1-r.z2)*.3],['e',r.z2+(r.z1-r.z2)*.62],['e',r.z2+(r.z1-r.z2)*.3]];
    else slots=[['n',r.x1+(r.x2-r.x1)*.35],['n',r.x1+(r.x2-r.x1)*.65],['s',r.x1+(r.x2-r.x1)*.35],['s',r.x1+(r.x2-r.x1)*.65]];
    slots.forEach(function(s,k){var p=mine[k];if(p)hang(p.id,r,s[0],s[1],2.3,p.h>p.w?2.6:2.1);else emptyFrame(r,s[0],s[1],2.3,2.8,1.9,c)});
    if(r.entry==='s'){box(.7,.46,3,MAT.bench,cx,.23,cz-2);col(cx-.4,cx+.4,cz-3.5,cz-.5)}else{box(3,.46,.7,MAT.bench,cx,.23,cz);col(cx-1.5,cx+1.5,cz-.4,cz+.4)}
    var kx=r.entry==='e'?r.x2-3.4:r.entry==='w'?r.x1+3.4:cx+3.2,kz=r.entry==='s'?r.z1-3.4:cz+3.4;
    box(.8,1.1,.8,MAT.ped,kx,.55,kz);col(kx-.45,kx+.45,kz-.45,kz+.45);
    var kt=plane(.7,.7,ctex(350,350,function(x,W){x.fillStyle='#111';x.fillRect(0,0,W,W);x.fillStyle='#b49be0';x.font='500 20px Inter';sp(x,'EXPLORE',W/2,120,6);sp(x,'THE CHAPTER',W/2,150,6);x.fillStyle='#f4f1ea';x.font='400 46px "Bodoni Moda"';x.textAlign='center';x.fillText(c.title,W/2,230)}),true);
    var kg=new T.Group();kt.rotation.x=-Math.PI/2+.5;kt.position.y=1.13;kg.add(kt);kg.position.set(kx,0,kz);kg.rotation.y=r.entry==='e'?Math.PI/2:r.entry==='w'?-Math.PI/2:0;scene.add(kg);floorGlow(kx,kz,2.4,2.4,0x6e42a3,.45);
    addInter(kx,kz,null,2.8,'Explore','Read · View · Watch · Own',function(){openChapter(c)});
  }

