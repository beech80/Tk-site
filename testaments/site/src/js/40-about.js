  /* ===== about =====
     One idea per wall, set large. Entering from the lobby (facing west):
       west   the manifesto            north  the medium: photography · conversation · editorial
       south  the founder              east   mission and vision, flanking the door (read on the way out)
     Uses the ex* sign helpers from 50-chapters.js (shared scope). */
  function buildAbout(){
    var A=RM.about,dk=EX.dInk,md=EX.dKick,bg=EX.dBg,vio=EX.dVio;
    /* west: the manifesto */
    exOnWall(A,'w',-13,3.1,9.4,4.2,function(x,W,H){exBg(x,W,H,bg);var L=W*.07;
      exK(x,'About TESTAMENTS',L,H*.14,H*.05,md);
      exT(x,'THE STORY',L-H*.01,H*.38,H*.17,dk,'left',H*.02);exT(x,'BEHIND THE STORY.',L-H*.01,H*.58,H*.17,dk,'left',H*.02);
      exRule(x,L,H*.67,H*.08,H*.008,vio);
      exI(x,'A person is more than the moment in which we meet them.',L,H*.8,H*.082,'#24221f');
      exK(x,'Read the manifesto',L,H*.92,H*.042,vio)},{act:aboutManifesto,label:'Read the manifesto',r:9});
    /* north: the medium */
    [['01','Photography','Photography is not decoration.',-34.6],['02','Conversation','Built around genuine conversation rather than scripted answers.',-29],['03','Editorial','Shaping everything into a chapter that reads as one piece.',-23.4]].forEach(function(m){
      exOnWall(A,'n',m[3],2.7,4.6,2.8,function(x,W,H){exBg(x,W,H,bg);var L=W*.09;
        exK(x,'The medium · '+m[0],L,H*.17,H*.05,md);exT(x,m[1],L,H*.42,H*.15,dk);exRule(x,L,H*.52,H*.08,H*.01,vio);
        exW(x,m[2],L,H*.68,W*.82,H*.075,H*.1,'italic 400 '+Math.round(H*.075)+'px "Bodoni Moda"','#2b2926')},{act:aboutManifesto,label:'The medium · '+m[1],r:4.5})});
    /* south: the founder */
    var pos=onWall(A,'s',-25.6),g=new T.Group(),fr=new T.Mesh(new T.BoxGeometry(2,2.6,.06),MAT.frame);fr.position.z=.03;g.add(fr);
    var inner=exSign(1.86,2.46,function(c,W,H){c.fillStyle='#e4e0d8';c.fillRect(0,0,W,H);c.strokeStyle='#8e8a82';c.lineWidth=3;c.setLineDash([12,12]);c.strokeRect(W*.08,H*.06,W*.84,H*.88);exK(c,'Portrait',W/2,H*.47,H*.042,'#3f3c37','center');exK(c,'To be supplied',W/2,H*.56,H*.042,'#3f3c37','center')},300);
    inner.position.z=.065;g.add(inner);place(g,pos.x,2.5,pos.z,pos.n);var fs=spot(4.4,5.6,.25);place(fs,pos.x,3,pos.z-.01,'nz');
    addInter(pos.x,pos.z,'nz',4,'Read','The founder',aboutFounder,{y:2.5,w:2,h:2.6});
    exOnWall(A,'s',-32,2.5,5,2.6,function(x,W,H){exBg(x,W,H,bg);var L=W*.08;
      exK(x,'The founder',L,H*.18,H*.055,md);exT(x,'Matthew Beecher',L,H*.45,H*.16,dk);exRule(x,L,H*.56,H*.07,H*.01,vio);
      exK(x,'Photographer · Filmmaker · Storyteller',L,H*.71,H*.05,'#3a3733');exI(x,'Biography on approval.',L,H*.86,H*.065,'#55524c')},{act:aboutFounder,label:'The founder',r:5});
    /* east: mission and vision, flanking the door */
    [['The mission','To preserve personal stories through meaningful conversations, cinematic photography, and thoughtful editorial storytelling.',-8.5],['The vision','To build a lasting collection of human experiences that encourages understanding, reflection, and connection across different walks of life.',-17.5]].forEach(function(m){
      exOnWall(A,'e',m[2],2.9,4.6,3.4,function(x,W,H){exBg(x,W,H,bg);var L=W*.08;exK(x,m[0],L,H*.16,H*.05,md);exRule(x,L,H*.22,H*.07,H*.01,vio);
        exW(x,m[1],L,H*.36,W*.84,H*.07,H*.1,null,dk)},{act:aboutMission,label:m[0],r:5})});
    box(3,.46,.7,MAT.bench,-29,.23,-13);col(-30.5,-27.5,-13.4,-12.6);
    var al=new T.PointLight(0xfff4e6,0.8,20,2);al.position.set(-29,5.2,-13);scene.add(al);
  }
