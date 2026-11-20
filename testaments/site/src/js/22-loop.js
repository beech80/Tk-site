  /* ---------- quality, resize, loop ---------- */
  function quality(){if(!R)return;var q=S.quality==='auto'?(coarse?'low':'medium'):S.quality,d=window.devicePixelRatio||1;R.setPixelRatio(q==='low'?Math.min(d,coarse?1.5:1):q==='medium'?Math.min(d,1.25):Math.min(d,2))}
  var baseFov=68,fovNow=68;
  function resize(){if(!R)return;var w=window.innerWidth,h=window.innerHeight;R.setSize(w,h,false);cam.aspect=w/h;baseFov=w<h?80:68;cam.fov=fovNow=baseFov;cam.updateProjectionMatrix();HOOKS.resize.forEach(function(f){f(w,h)});if(typeof mmResize==='function')mmResize()}
  window.addEventListener('resize',resize);
  function start(){if(running)return;running=true;clock.getDelta();loop()}
  function loop(){if(!running)return;requestAnimationFrame(loop);var raw=Math.min(.5,clock.getDelta());step(Math.min(.05,raw),raw);for(var hi=0;hi<HOOKS.frame.length;hi++)HOOKS.frame[hi](Math.min(.05,raw),raw);if(HOOKS.render)HOOKS.render();else R.render(scene,cam)}
  function blocked(x,z){for(var i=0;i<cols.length;i++){var c=cols[i];if(c.off)continue;var cx=Math.max(c.x1,Math.min(x,c.x2)),cz=Math.max(c.z1,Math.min(z,c.z2));if((x-cx)*(x-cx)+(z-cz)*(z-cz)<RAD*RAD)return true}return false}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}

  /* collision: the visitor is a circle; push out of every box along the shortest way and
     keep only the velocity along the wall, so walls slide and corners round off. */
  function collide(){
    var hit=false;
    for(var it=0;it<4;it++){var moved=false;
      for(var i=0;i<cols.length;i++){var c=cols[i];if(c.off)continue;
        if(P.x<c.x1-RAD||P.x>c.x2+RAD||P.z<c.z1-RAD||P.z>c.z2+RAD)continue;
        var cx=Math.max(c.x1,Math.min(P.x,c.x2)),cz=Math.max(c.z1,Math.min(P.z,c.z2)),dx=P.x-cx,dz=P.z-cz,d2=dx*dx+dz*dz,nx,nz,pen;
        if(d2>=RAD*RAD)continue;
        if(d2>1e-10){var d=Math.sqrt(d2);nx=dx/d;nz=dz/d;pen=RAD-d}
        else{var l=P.x-c.x1,r=c.x2-P.x,b=P.z-c.z1,f=c.z2-P.z,m=Math.min(l,r,b,f);
          if(m===l){nx=-1;nz=0;pen=l+RAD}else if(m===r){nx=1;nz=0;pen=r+RAD}else if(m===b){nx=0;nz=-1;pen=b+RAD}else{nx=0;nz=1;pen=f+RAD}}
        P.x+=nx*(pen+1e-4);P.z+=nz*(pen+1e-4);
        var vn=P.vx*nx+P.vz*nz;if(vn<0){P.vx-=vn*nx;P.vz-=vn*nz}
        moved=hit=true}
      if(!moved)break}
    return hit;
  }
  /* 2D line of sight between two points against the colliders */
  function sightClear(x0,z0,x1,z1){var dx=x1-x0,dz=z1-z0;
    for(var i=0;i<cols.length;i++){var c=cols[i];if(c.off)continue;var t0=0,t1=1,ok=true;
      [[dx,x0,c.x1,c.x2],[dz,z0,c.z1,c.z2]].forEach(function(a){if(!ok)return;if(Math.abs(a[0])<1e-9){if(a[1]<a[2]||a[1]>a[3])ok=false;return}var u=(a[2]-a[1])/a[0],v=(a[3]-a[1])/a[0];if(u>v){var s=u;u=v;v=s}t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)ok=false});
      if(ok&&t0<=t1)return false}
    return true}

  /* camera feel */
  var look={x:0,y:0},bobPh=0,bobAmp=0,camY=EYE,autoStuck=0;
  function step(dt,raw){
    if(mode==='ui'&&$('lb').hidden&&$('reader').hidden&&$('film').hidden&&$('ov').hidden&&gate.hidden)resume();
    if(mode==='anim'&&anim)animStep(raw);
    if(mode==='intro'){P.yaw=Math.sin(clock.elapsedTime*.15)*.05;P.pitch=.05+Math.sin(clock.elapsedTime*.11)*.012}
    var moving=false,sprint=false;
    if(mode==='play'){
      /* smoothed look: input accumulates, the camera eases toward it */
      var la=S.smooth===false?1:1-Math.exp(-dt*32),lx=look.x*la,ly=look.y*la;look.x-=lx;look.y-=ly;
      P.yaw-=lx;P.pitch=Math.max(-1.1,Math.min(1.1,P.pitch-ly));
      var f=0,s=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD||keys.ArrowRight)s+=1;if(keys.KeyA||keys.ArrowLeft)s-=1;f+=-joy.y;s+=joy.x;
      var fl=Math.hypot(f,s);if(fl>1){f/=fl;s/=fl}
      sprint=!!(keys.ShiftLeft||keys.ShiftRight)||Math.hypot(joy.x,joy.y)>.97;
      var spd=3.1*S.speed*(sprint?1.7:1),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),tx=(-sy*f+cy*s)*spd,tz=(-cy*f-sy*s)*spd;
      if(auto){if(fl>.05)auto=null;else{var dx=auto.x-P.x,dz=auto.z-P.z,dd=Math.hypot(dx,dz),as=3.1*S.speed*Math.min(1,dd/1.2+.25);if(dd<.3)auto=null;else{tx=dx/dd*as;tz=dz/dd*as;var want=Math.atan2(-dx,-dz),diff=((want-P.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;if(auto.turn!==false&&dd>.8)P.yaw+=diff*Math.min(1,dt*2.6)}}}
      moving=fl>.05||!!auto;
      var a=1-Math.exp(-dt*(moving?8:11));P.vx+=(tx-P.vx)*a;P.vz+=(tz-P.vz)*a;
      if(Math.abs(P.vx)<1e-3&&Math.abs(P.vz)<1e-3&&!moving){P.vx=P.vz=0}
      var dist=Math.hypot(P.vx,P.vz)*dt,n=Math.max(1,Math.ceil(dist/.12)),hit=false;
      for(var k=0;k<n;k++){P.x+=P.vx*dt/n;P.z+=P.vz*dt/n;if(collide())hit=true}
      if(auto){if(hit&&Math.hypot(P.vx,P.vz)<.5)autoStuck+=dt;else autoStuck=0;if(autoStuck>.4){auto=null;autoStuck=0}}
      /* walking bob */
      var sp=Math.hypot(P.vx,P.vz),bw=(S.reduced||S.bob===false)?0:Math.min(1,sp/3.1);bobAmp+=(bw-bobAmp)*Math.min(1,dt*5);bobPh+=dt*sp*4.2;
      camY+=(EYE-camY)*Math.min(1,dt*3);
    }else{bobAmp*=.9;look.x=look.y=0}
    if(Math.hypot(P.x,P.z)<9||(mode==='anim'&&P.z<12))doorT=Math.min(1,doorT+raw*.9);
    doorL.position.x=-1.5-2.95*ease(doorT);doorR.position.x=1.5+2.95*ease(doorT);doorCol.off=doorT>.55;
    var by=bobAmp*.026*Math.cos(bobPh*2),bx=bobAmp*.018*Math.sin(bobPh);
    cam.position.set(P.x+Math.cos(P.yaw)*bx,camY+by,P.z-Math.sin(P.yaw)*bx);cam.rotation.set(P.pitch,P.yaw,bobAmp*.0035*Math.sin(bobPh));
    /* a slight widening of view when walking fast */
    var ft=baseFov+((sprint&&moving&&!S.reduced&&Math.hypot(P.vx,P.vz)>3.6)?5:0);fovNow+=(ft-fovNow)*Math.min(1,dt*4);if(Math.abs(cam.fov-fovNow)>.02){cam.fov=fovNow;cam.updateProjectionMatrix()}
    if(mode==='play')findNear();else setPrompt(null);
    walkMarkStep(dt);
    hlStep(dt);
    var rm=roomAt(P.x,P.z);if(rm.id!==curRoom.id){var prevRoom=curRoom;curRoom=rm;HOOKS.roomChange.forEach(function(f){f(rm,prevRoom)});uiRoom(rm,prevRoom);if(SPAWN[rm.id]&&(mode==='play')){try{history.replaceState(null,'','#'+rm.id)}catch(e){}}}
    if(screenTex){var sv=$('screenVid'),inLib=curRoom.id==='library'||curRoom.id==='c-library';if(inLib&&sv.paused)sv.play().catch(function(){});if(!inLib&&!sv.paused)sv.pause()}
    if(ovKind==='map')dot();
  }
  function roomAt(x,z){if(z>0)return {id:'entrance',name:'Entrance'};for(var i=0;i<ROOMS.length;i++){var r=ROOMS[i];if(x>=r.x1&&x<=r.x2&&z<=r.z1&&z>=r.z2)return r}return {id:'lobby',name:'Central Lobby'}}

  /* ---------- camera paths (the walk-in) ---------- */
  /* pts: [[x,z,yaw,pitch,camY],...]; glides along a smooth curve paced by distance */
  function camPath(pts,d,done){var L=[0];for(var i=1;i<pts.length;i++)L.push(L[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])+.001);anim={t:0,d:d,pts:pts,L:L,done:done};mode='anim'}
  function cr(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)}
  function animStep(raw){
    anim.t+=raw/anim.d;var u=Math.min(1,anim.t),e=u*u*u*(u*(u*6-15)+10),pts=anim.pts,L=anim.L,tot=L[L.length-1],s=e*tot,i=0;
    while(i<pts.length-2&&L[i+1]<s)i++;var k=(s-L[i])/(L[i+1]-L[i]),p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(pts.length-1,i+2)];
    P.x=cr(p0[0],p1[0],p2[0],p3[0],k);P.z=cr(p0[1],p1[1],p2[1],p3[1],k);P.yaw=cr(p0[2],p1[2],p2[2],p3[2],k);P.pitch=cr(p0[3],p1[3],p2[3],p3[3],k);camY=cr(p0[4],p1[4],p2[4],p3[4],k);
    if(anim.t>=1)endAnim();
  }
  function endAnim(){if(!anim)return;var l=anim.pts[anim.pts.length-1],cb=anim.done;P.x=l[0];P.z=l[1];P.yaw=l[2];P.pitch=l[3];camY=l[4];P.vx=P.vz=0;anim=null;doorT=Math.max(doorT,P.z<0?1:doorT);if(cb)cb();else play()}
  function skipAnim(){if(mode!=='anim'||!anim)return;var f=$('fade');f.classList.add('on');setTimeout(function(){endAnim();setTimeout(function(){f.classList.remove('on')},80)},S.reduced?0:300)}

  /* ---------- interaction ---------- */
  function findNear(){
    var cands=[],fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
    inter.forEach(function(o){if(o.off)return;var dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz);if(d>o.r||d<.05)return;if(o.nx!==undefined&&(dx*o.nx+dz*o.nz)>0)return;var dt=(dx*fx+dz*fz)/d;if(dt<.55&&d>1.3)return;cands.push([d*(1.6-dt),o,d])});
    cands.sort(function(a,b){return a[0]-b[0]});
    var best=null;for(var i=0;i<cands.length&&i<4;i++){var o=cands[i][1],d=cands[i][2],ex,ez;if(o.nx!==undefined){ex=o.x+o.nx*.3;ez=o.z+o.nz*.3}else{var sh=Math.min(1,d*.6)/d;ex=o.x-(o.x-P.x)*sh;ez=o.z-(o.z-P.z)*sh}if(sightClear(P.x,P.z,ex,ez)){best=o;break}}
    setPrompt(best);
  }
  function setPrompt(o){if(o===near)return;near=o;var on=!!o;$('prompt').hidden=!on;$('act').hidden=!on||!coarse;$('reticle').classList.toggle('on',on);if(o){$('promptTxt').textContent=o.label;$('promptVerb').textContent=o.verb||'View';$('act').textContent=o.verb||'View';$('act').setAttribute('aria-label',(o.verb||'View')+': '+o.label);hint('target',coarse?'Tap what’s in front of you, or the button, to open it.':'Press E or click to open what’s in front of you.')}}
  function interact(){if(mode==='play'&&near){var o=near;$('reticle').classList.add('pulse');setTimeout(function(){$('reticle').classList.remove('pulse')},300);o.act()}}

  /* ---------- the highlight around the current target ---------- */
  var HL=null,hlO=null,hlOp=0;
  function hlMake(){
    var bar=ctex(4,64,function(c){var g=c.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.38,'rgba(255,255,255,.18)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(.62,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,4,64)});
    var ring=ctex(256,256,function(c){var g=c.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.62,'rgba(255,255,255,.06)');g.addColorStop(.8,'rgba(255,255,255,.9)');g.addColorStop(.86,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,256,256)});
    function m(map){return new T.MeshBasicMaterial({map:map,color:0xb49be0,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false})}
    var g=new T.Group(),bm=m(bar),bars=[];for(var i=0;i<4;i++){var b=new T.Mesh(new T.PlaneGeometry(1,1),bm);g.add(b);bars.push(b)}
    var fill=new T.Mesh(new T.PlaneGeometry(1,1),m(GLOW));fill.position.z=-.01;g.add(fill);
    var rg=new T.Mesh(new T.PlaneGeometry(1,1),m(ring));rg.rotation.x=-Math.PI/2;
    g.visible=rg.visible=false;g.renderOrder=rg.renderOrder=5;scene.add(g);scene.add(rg);
    HL={g:g,bars:bars,bm:bm,fill:fill,ring:rg,v:new T.Vector3(),b:new T.Box3()};
  }
  /* frame of size w x h centred at (x,y,z) facing yaw */
  function hlFrame(x,y,z,w,h,yaw){var t=Math.max(.06,Math.min(.14,Math.max(w,h)*.035)),b=HL.bars;HL.g.position.set(x,y,z);HL.g.rotation.set(0,yaw,0);
    b[0].scale.set(w+t,t,1);b[0].position.set(0,h/2,0);b[1].scale.set(w+t,t,1);b[1].position.set(0,-h/2,0);
    b[2].scale.set(h-t*.4,t,1);b[2].rotation.z=Math.PI/2;b[2].position.set(-w/2,0,0);b[3].scale.set(h-t*.4,t,1);b[3].rotation.z=Math.PI/2;b[3].position.set(w/2,0,0);
    HL.fill.scale.set(w*1.5+.6,h*1.5+.6,1);HL.g.visible=true;HL.ring.visible=false}
  function hlRing(x,z,r){HL.ring.position.set(x,.035,z);HL.ring.scale.set(r*2,r*2,1);HL.ring.visible=true;HL.g.visible=false}
  function hlPlace(o){
    var hl=o.hl,hasN=o.nx!==undefined,yawN=hasN?Math.atan2(o.nx,o.nz):0;
    if(hl&&hl.isObject3D){HL.b.setFromObject(hl);if(HL.b.isEmpty()){hlRing(o.x,o.z,.9);return}var c=HL.b.getCenter(HL.v.clone()),sz=HL.b.getSize(HL.v);
      if(hasN){var w=Math.abs(o.nx)>.5?sz.z:sz.x,dp=Math.abs(o.nx)>.5?sz.x:sz.z;hlFrame(c.x+o.nx*(dp/2+.04),c.y,c.z+o.nz*(dp/2+.04),w+.08,sz.y+.08,yawN)}
      else{var dx=cam.position.x-c.x,dz=cam.position.z-c.z,dl=Math.hypot(dx,dz)||1,ext=Math.max(sz.x,sz.z);hlFrame(c.x+dx/dl*(ext/2+.05),c.y,c.z+dz/dl*(ext/2+.05),ext+.1,sz.y+.1,Math.atan2(dx,dz))}
      return}
    if(hl&&hl.w&&hl.h){var x=hl.x!=null?hl.x:o.x+(hasN?o.nx*.1:0),z=hl.z!=null?hl.z:o.z+(hasN?o.nz*.1:0),y=hl.y!=null?hl.y:1.6;
      var yaw=hasN?yawN:Math.atan2(cam.position.x-x,cam.position.z-z);hlFrame(x,y,z,hl.w,hl.h,yaw);return}
    var rr=hl&&hl.r?hl.r:.9;hlRing(o.x+(hasN?o.nx*.75:0),o.z+(hasN?o.nz*.75:0),rr);
  }
  function hlStep(dt){
    if(!HL){if(!near)return;hlMake()}
    if(near&&near!==hlO){hlO=near;hlOp=0;hlPlace(near)}
    else if(near&&near.nx===undefined&&near.hl)hlPlace(near);
    hlOp+=((near?1:0)-hlOp)*Math.min(1,dt*(near?7:10));if(!near&&hlOp<.01){hlO=null;HL.g.visible=HL.ring.visible=false;return}
    var pul=S.reduced?1:.82+.18*Math.sin(clock.elapsedTime*2.6),op=hlOp*pul;HL.bm.opacity=.85*op;HL.fill.material.opacity=.07*op;HL.ring.material.opacity=.7*op;
  }

  /* ---------- tap-to-walk destination: a soft ring on the floor that fades as you arrive ---------- */
  var WMK=null,wmkOp=0,wmkT=null;
  function walkMarkStep(dt){
    var want=mode==='play'&&auto&&!auto.noMark?1:0;
    if(want&&!WMK){var rt=ctex(128,128,function(c){var g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.18,'rgba(255,255,255,0)');g.addColorStop(.7,'rgba(255,255,255,.05)');g.addColorStop(.82,'rgba(255,255,255,.85)');g.addColorStop(.9,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,128,128)});
      WMK=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:rt,color:0xe8e0f4,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false}));WMK.rotation.x=-Math.PI/2;WMK.renderOrder=4;WMK.visible=false;scene.add(WMK)}
    if(!WMK)return;
    if(want&&auto!==wmkT){wmkT=auto;WMK.position.set(auto.x,.03,auto.z);wmkOp=Math.max(wmkOp,.2)}
    if(want){var dd=Math.hypot(auto.x-P.x,auto.z-P.z);want=Math.min(1,dd/1.5)}
    wmkOp+=(want-wmkOp)*Math.min(1,dt*(want?9:6));WMK.visible=wmkOp>.01;if(!WMK.visible){wmkT=null;return}
    var pul=S.reduced?1:.85+.15*Math.sin(clock.elapsedTime*3.2),sc=.75+.12*wmkOp;WMK.scale.set(sc,sc,1);WMK.material.opacity=.55*wmkOp*pul;
  }

  /* ---------- states ---------- */
  function afterGate(){
    if(!ready)return;
    var h=(location.hash||'').slice(1);
    if(SPAWN[h]&&h!=='entrance'){var s=SPAWN[h];teleport(s[0],s[1],s[2],true);doorT=1;play();return}
    if(S.skipIntro){teleport(0,-11,0,true);doorT=1;play();return}
    P.x=0;P.z=31;P.yaw=0;P.pitch=.05;camY=2.5;P.vx=P.vz=0;
    mode='intro';$('intro').hidden=false;$('hud').hidden=true;$('skipIn').checked=!!S.skipIntro;setTimeout(function(){$('goIn').focus()},40);
  }
  function play(){var first=mode!=='play'&&mode!=='ui';mode='play';$('intro').hidden=true;$('hud').hidden=false;$('skiphint').hidden=true;lookHint();canvas.focus({preventScroll:true});if(first)uiStart()}
  function lookHint(){$('lookhint').hidden=coarse||!!document.pointerLockElement||!$('ov').hidden}
  function walkIn(){S.skipIntro=$('skipIn').checked;save();$('intro').hidden=true;$('hud').hidden=true;$('lookhint').hidden=true;
    if(S.reduced){teleport(0,-11,0,true);doorT=1;play();return}
    $('skiphint').hidden=false;
    camPath([[P.x,P.z,P.yaw,P.pitch,camY],[-.6,20,.05,.02,2.1],[0,8,0,0,1.75],[0,1.5,0,0,1.66],[0,-5,0,0,EYE],[0,-11,0,0,EYE]],coarse?7:8.5)}
  function teleport(x,z,yaw,instant){var go=function(){P.x=x;P.z=z;P.yaw=yaw||0;P.pitch=0;P.vx=P.vz=0;auto=null;look.x=look.y=0;camY=EYE;if(z<0)doorT=1};if(instant||S.reduced){go();return}var f=$('fade');f.classList.add('on');setTimeout(function(){go();setTimeout(function(){f.classList.remove('on')},60)},360)}
  function travel(id){var s=SPAWN[id];if(!s)return;closeOv();teleport(s[0],s[1],s[2]);if(mode!=='play')play()}
