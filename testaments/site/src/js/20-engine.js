  /* ======================================================================
     ENGINE
     ====================================================================== */
  var T,R,scene,cam,clock,running=false,ready=false,loader,screenTex=null;
  var P={x:0,z:24,yaw:0,pitch:0,vx:0,vz:0},EYE=1.65,RAD=.35;
  var cols=[],inter=[],doorL,doorR,doorT=0,doorCol,keys={},joy={x:0,y:0},auto=null,anim=null,mode='load',near=null,suppress=false,curRoom={id:''},ovKind=null;
  var canvas=$('cv');
  /* extension points: modules register here instead of editing the core */
  var HOOKS={afterMaterials:[],afterBuild:[],frame:[],resize:[],render:null,roomChange:[]};

  function webgl(){try{var c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch(e){return false}}
  function loadTxt(t){$('loadTxt').textContent=t}
  function fail(msg){var l=$('load');l.hidden=false;l.classList.add('failed');l.innerHTML='<p class="mark">TESTAMENTS</p><p class="loadtag">Understand the Why.</p><p class="failmsg">'+esc(msg)+'</p><div class="row"><button class="btn" type="button" id="failFilm">Watch the film</button><button class="btn" type="button" id="failRetry">Try again</button></div>'+(SITE.contactEmail?'<p class="failmail">Questions: <span>'+esc(SITE.contactEmail)+'</span></p>':'');
    $('failRetry').addEventListener('click',function(){location.reload()});$('failFilm').addEventListener('click',function(){var v=$('filmVid');$('film').hidden=false;try{v.play().catch(function(){})}catch(e){}$('filmClose').focus()})}
  function boot(){
    if(!webgl()){fail('TESTAMENTS is a museum you walk through in 3D, and this browser can’t display it. Please try a recent version of Chrome, Safari, Firefox or Edge.');return}
    var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    s.onload=function(){var fl=document.fonts&&document.fonts.load?Promise.all([document.fonts.load('400 60px "Bodoni Moda"'),document.fonts.load('italic 400 60px "Bodoni Moda"'),document.fonts.load('500 30px Inter'),document.fonts.load('400 30px Inter')]).catch(function(){}):Promise.resolve();
      fl.then(function(){try{build()}catch(e){console.error(e);fail('The museum could not start on this device. ('+(e&&e.message||e)+')')}})};
    s.onerror=function(){fail('The museum could not load. Please check your connection and reload the page.')};
    document.head.appendChild(s);
  }

  /* ---------- canvas drawing ---------- */
  var CTEX_SIDE=coarse?2048:4096,CTEX_AREA=coarse?3e6:6e6;
  function ctex(w,h,fn){var k=Math.min(1,CTEX_SIDE/Math.max(w,h),Math.sqrt(CTEX_AREA/(w*h)));var c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*k));c.height=Math.max(1,Math.round(h*k));var x=c.getContext('2d');if(!x)throw new Error('canvas '+w+'x'+h+' unavailable');if(coarse){var fd=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');Object.defineProperty(x,'font',{get:function(){return fd.get.call(x)},set:function(v){fd.set.call(x,String(v).replace(/\b(300|400)\b(?=[^"]*"Bodoni)/,'600').replace(/\b(300|400)\b(?=[^"]*Inter)/,'500'))}})}if(k<1)x.scale(c.width/w,c.height/h);var ofT=x.fillText.bind(x);x.fillText=function(t,px,py,mw){ofT(t,px,py,mw);var m=/(\d+(?:\.\d+)?)px/.exec(x.font),fs=m?+m[1]:20;if(/Bodoni/.test(x.font)||fs<40){x.save();x.strokeStyle=x.fillStyle;x.lineJoin='round';x.lineWidth=fs*(coarse?.035:.018);x.strokeText(t,px,py,mw);x.restore()}};fn(x,w,h);var t=new T.CanvasTexture(c);if(coarse)t.onUpdate=function(){c.width=c.height=1};t.encoding=T.sRGBEncoding;t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());return t}
  function sp(x,s,cx,y,gap,align){var ws=s.split('').map(function(ch){return x.measureText(ch).width}),tot=ws.reduce(function(a,b){return a+b},0)+gap*(s.length-1);var px=align==='left'?cx:align==='right'?cx-tot:cx-tot/2;x.textAlign='left';s.split('').forEach(function(ch,i){x.fillText(ch,px,y);px+=ws[i]+gap})}
  function wrap(x,t,px,y,maxW,lh){var words=String(t).split(' '),line='';x.textAlign='left';words.forEach(function(w){if(line&&x.measureText(line+w).width>maxW){x.fillText(line.trim(),px,y);line='';y+=lh}line+=w+' '});x.fillText(line.trim(),px,y);return y}
  function plane(w,h,tex,solid){return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex,transparent:!solid,depthWrite:!!solid}))}
  var GLOW,SPOT,MAT={};
  function glow(w,h,col,op){return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:GLOW,color:col,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}))}
  function spot(w,h,op,col){return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:SPOT,color:col||0xfff1dc,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false}))}
  function floorGlow(x,z,w,h,col,op){var g=glow(w,h,col,op);g.rotation.x=-Math.PI/2;g.position.set(x,.025,z);scene.add(g);return g}
  var ROT={px:Math.PI/2,nx:-Math.PI/2,pz:0,nz:Math.PI},NV={px:[1,0],nx:[-1,0],pz:[0,1],nz:[0,-1]};
  function box(w,h,d,mat,x,y,z){var m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m}
  function col(x1,x2,z1,z2){var c={x1:Math.min(x1,x2),x2:Math.max(x1,x2),z1:Math.min(z1,z2),z2:Math.max(z1,z2)};cols.push(c);return c}
  function slab(x1,z1,x2,z2,y,mat,down){var m=new T.Mesh(new T.PlaneGeometry(Math.abs(x2-x1),Math.abs(z2-z1)),mat);m.rotation.x=down?Math.PI/2:-Math.PI/2;m.position.set((x1+x2)/2,y,(z1+z2)/2);scene.add(m);return m}
  function place(o,x,y,z,n){o.position.set(x,y,z);o.rotation.y=ROT[n];scene.add(o);return o}
  function onWall(r,side,along){var o=.16;if(side==='w')return {x:r.x1+o,z:along,n:'px'};if(side==='e')return {x:r.x2-o,z:along,n:'nx'};if(side==='s')return {x:along,z:r.z1-o,n:'nz'};return {x:along,z:r.z2+o,n:'pz'}}
  /* addInter(x,z,n,radius,verb,label,act[,hl]) -> the entry (set entry.off=true to disable it).
     hl (optional) shapes the purple highlight shown when it is targeted:
       a THREE.Object3D (outlined by its bounding box), or {y,w,h[,x,z]} a frame of w x h metres centred at height y
       (on the wall when n is given, else turned to the visitor), or {r} a floor ring of radius r. Default: a floor ring. */
  function addInter(x,z,n,r,verb,label,act,hl){var v=n?NV[n]:[undefined,undefined],o={x:x,z:z,nx:v[0],nz:v[1],r:r,verb:verb,label:label,act:act,hl:hl||null};inter.push(o);return o}

  /* ---------- rooms ---------- */
  function buildRoom(r){
    var th=.3,mat=r.white?MAT.whiteWall:MAT.wall,sides={s:['z',r.z1,r.x1,r.x2],n:['z',r.z2,r.x1,r.x2],w:['x',r.x1,r.z2,r.z1],e:['x',r.x2,r.z2,r.z1]};
    Object.keys(sides).forEach(function(k){
      if(r.open&&r.open.indexOf(k)>=0)return;var sd=sides[k],a=sd[2],b=sd[3];
      var gaps=(r.doors||[]).filter(function(d){return d.s===k}).map(function(d){var w=d.w||4;return [d.at-w/2,d.at+w/2,d.h||4]}).sort(function(p,q){return p[0]-q[0]});
      var cur=a;gaps.concat([[b,b,0]]).forEach(function(g){
        if(g[0]-cur>.01){var len=g[0]-cur,mid=(cur+g[0])/2;if(sd[0]==='z'){box(len,r.h,th,mat,mid,r.h/2,sd[1]);col(cur,g[0],sd[1]-th/2,sd[1]+th/2)}else{box(th,r.h,len,mat,sd[1],r.h/2,mid);col(sd[1]-th/2,sd[1]+th/2,cur,g[0])}}
        if(g[2]&&r.h>g[2]){var lw=g[1]-g[0],lm=(g[0]+g[1])/2,lh=r.h-g[2];if(sd[0]==='z')box(lw,lh,th,mat,lm,g[2]+lh/2,sd[1]);else box(th,lh,lw,mat,sd[1],g[2]+lh/2,lm)}
        cur=Math.max(cur,g[1]);
      });
    });
    if(r.id!=='lobby')slab(r.x1,r.z1,r.x2,r.z2,r.h,MAT.ceil,true);
    if(!r.cor&&r.id!=='vestibule'){var cx=(r.x1+r.x2)/2,cz=(r.z1+r.z2)/2,W=r.x2-r.x1,D=r.z1-r.z2;
      if(r.id!=='lobby')for(var i=1;i<4;i++)for(var j=1;j<3;j++){var d=new T.Mesh(new T.CircleGeometry(.11,12),MAT.lamp);d.rotation.x=Math.PI/2;d.position.set(r.x1+W*i/4,r.h-.02,r.z2+D*j/3);scene.add(d)}
      floorGlow(cx,cz,W*.9,D*.9,0xfff1dc,r.white?.14:.07)}
  }

  /* ---------- photographs, empty frames, wall panels ---------- */
  function hang(id,r,side,along,y,h){
    var p=photo(id),w=h*p.w/p.h,g=new T.Group(),pos=onWall(r,side,along);
    var fr=new T.Mesh(new T.BoxGeometry(w+.14,h+.14,.06),MAT.frame);fr.position.z=.03;g.add(fr);
    var tex=loader.load(src(id));tex.encoding=T.sRGBEncoding;tex.anisotropy=4;
    var ph=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));ph.position.z=.065;g.add(ph);
    var s=spot(w*2.4,h*2.5,r.white?.35:.85);s.position.set(0,h*.42,.008);g.add(s);
    var i=PHOTOS.indexOf(p)+1,dark=!!r.white;
    var lab=plane(.46,.2,ctex(460,200,function(c){c.fillStyle=dark?'#1a1a1a':'#efede8';c.font='500 34px Inter';sp(c,'PL. '+i,0,60,6,'left');c.fillStyle=dark?'#55534f':'#a3a29e';c.font='400 26px Inter';c.fillText('TESTAMENTS',0,120);c.fillText('photography',0,160)}));
    lab.position.set(w/2+.42,-h/2+.1,.01);g.add(lab);
    place(g,pos.x,y,pos.z,pos.n);addInter(pos.x,pos.z,pos.n,3.6,'View','View photograph',function(){openPhoto(id)},{y:y,w:w+.14,h:h+.14});
  }
  function emptyFrame(r,side,along,y,w,h,c){
    var pos=onWall(r,side,along),g=new T.Group();var fr=new T.Mesh(new T.BoxGeometry(w+.14,h+.14,.06),MAT.frame);fr.position.z=.03;g.add(fr);
    var t=plane(w,h,ctex(512,Math.round(512*h/w),function(cx,W,H){cx.fillStyle='#111';cx.fillRect(0,0,W,H);cx.strokeStyle='rgba(255,255,255,.18)';cx.lineWidth=2;cx.strokeRect(24,24,W-48,H-48);cx.fillStyle='#bdbbb6';cx.font='500 22px Inter';sp(cx,'PLATE',W/2,H/2-14,8);cx.fillStyle='#8e8c88';cx.font='400 20px Inter';sp(cx,'ON RELEASE',W/2,H/2+22,6)}),true);
    t.position.z=.065;g.add(t);var s=spot(w*2.4,h*2.5,.5);s.position.set(0,h*.42,.008);g.add(s);
    place(g,pos.x,y,pos.z,pos.n);addInter(pos.x,pos.z,pos.n,3.4,'View','Plate · on release',function(){toast('Photographs for '+c.title+' will hang here when the chapter is published.')},{y:y,w:w+.14,h:h+.14});
  }
  function panel(r,side,along,y,w,h,fn,opts){
    opts=opts||{};var pos=onWall(r,side,along),pxw=Math.round(w*200),pxh=Math.round(h*200);
    var m=plane(w,h,ctex(pxw,pxh,fn));place(m,pos.x+NV[pos.n][0]*.01,y,pos.z+NV[pos.n][1]*.01,pos.n);
    if(opts.light!==false){var s=spot(w*1.5,h*1.9,r.white?.25:.5);place(s,pos.x+NV[pos.n][0]*.005,y+h*.25,pos.z+NV[pos.n][1]*.005,pos.n)}
    if(opts.act)m.inter=addInter(pos.x,pos.z,pos.n,opts.r||4.5,opts.verb||'Read',opts.label||'Read',opts.act,opts.hl||{y:y,w:w,h:h});
    return m;
  }

