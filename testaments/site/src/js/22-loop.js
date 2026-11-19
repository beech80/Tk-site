  /* ---------- quality, resize, loop ---------- */
  function quality(){if(!R)return;var q=S.quality==='auto'?(coarse?'low':'medium'):S.quality,d=window.devicePixelRatio||1;R.setPixelRatio(q==='low'?Math.min(d,1)*.8:q==='medium'?Math.min(d,1.25):Math.min(d,2))}
  function resize(){if(!R)return;var w=window.innerWidth,h=window.innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?80:68;cam.updateProjectionMatrix();HOOKS.resize.forEach(function(f){f(w,h)})}
  window.addEventListener('resize',resize);
  function start(){if(running)return;running=true;clock.getDelta();loop()}
  function loop(){if(!running)return;requestAnimationFrame(loop);var raw=Math.min(.5,clock.getDelta());step(Math.min(.05,raw),raw);for(var hi=0;hi<HOOKS.frame.length;hi++)HOOKS.frame[hi](Math.min(.05,raw),raw);if(HOOKS.render)HOOKS.render();else R.render(scene,cam)}
  function blocked(x,z){for(var i=0;i<cols.length;i++){var c=cols[i];if(c.off)continue;var cx=Math.max(c.x1,Math.min(x,c.x2)),cz=Math.max(c.z1,Math.min(z,c.z2));if((x-cx)*(x-cx)+(z-cz)*(z-cz)<RAD*RAD)return true}return false}
  function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
  function step(dt,raw){
    if(mode==='ui'&&$('lb').hidden&&$('reader').hidden&&$('film').hidden&&$('ov').hidden&&gate.hidden)resume();
    if(mode==='anim'&&anim){anim.t+=raw/anim.d;var k=ease(Math.min(1,anim.t));P.x=anim.x0+(anim.x1-anim.x0)*k;P.z=anim.z0+(anim.z1-anim.z0)*k;P.yaw=anim.y0+(anim.y1-anim.y0)*k;P.pitch*=.9;if(anim.t>=1){anim=null;play()}}
    if(mode==='intro')P.yaw=Math.sin(clock.elapsedTime*.15)*.06;
    if(mode==='play'){
      var f=0,s=0;if(keys.KeyW||keys.ArrowUp)f+=1;if(keys.KeyS||keys.ArrowDown)f-=1;if(keys.KeyD||keys.ArrowRight)s+=1;if(keys.KeyA||keys.ArrowLeft)s-=1;f+=-joy.y;s+=joy.x;
      var spd=3.1*S.speed*(keys.ShiftLeft||keys.ShiftRight?1.7:1),sy=Math.sin(P.yaw),cy=Math.cos(P.yaw),tx=(-sy*f+cy*s)*spd,tz=(-cy*f-sy*s)*spd;
      if(auto){if(f||s)auto=null;else{var dx=auto.x-P.x,dz=auto.z-P.z,dd=Math.hypot(dx,dz);if(dd<.4)auto=null;else{tx=dx/dd*spd;tz=dz/dd*spd;var want=Math.atan2(-dx,-dz),diff=((want-P.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;P.yaw+=diff*Math.min(1,dt*3)}}}
      var a=Math.min(1,dt*(f||s||auto?7:9));P.vx+=(tx-P.vx)*a;P.vz+=(tz-P.vz)*a;
      var nx=P.x+P.vx*dt,nz=P.z+P.vz*dt,hit=false;if(!blocked(nx,P.z))P.x=nx;else{P.vx=0;hit=true}if(!blocked(P.x,nz))P.z=nz;else{P.vz=0;hit=true}
      if(hit&&auto&&Math.abs(P.vx)<.01&&Math.abs(P.vz)<.01)auto=null;
    }
    if(Math.hypot(P.x,P.z)<9||(mode==='anim'&&P.z<12))doorT=Math.min(1,doorT+raw*.9);
    doorL.position.x=-1.5-2.95*ease(doorT);doorR.position.x=1.5+2.95*ease(doorT);doorCol.off=doorT>.55;
    cam.position.set(P.x,EYE,P.z);cam.rotation.set(P.pitch,P.yaw,0);
    if(mode==='play')findNear();else setPrompt(null);
    var rm=roomAt(P.x,P.z);if(rm.id!==curRoom.id){var prevRoom=curRoom;curRoom=rm;HOOKS.roomChange.forEach(function(f){f(rm,prevRoom)});if(!rm.cor)$('room').textContent=rm.name;if(SPAWN[rm.id]&&(mode==='play')){try{history.replaceState(null,'','#'+rm.id)}catch(e){}}}
    if(screenTex){var sv=$('screenVid'),inLib=curRoom.id==='library'||curRoom.id==='c-library';if(inLib&&sv.paused)sv.play().catch(function(){});if(!inLib&&!sv.paused)sv.pause()}
    if(ovKind==='map')dot();
  }
  function roomAt(x,z){if(z>0)return {id:'entrance',name:'Entrance'};for(var i=0;i<ROOMS.length;i++){var r=ROOMS[i];if(x>=r.x1&&x<=r.x2&&z<=r.z1&&z>=r.z2)return r}return {id:'lobby',name:'Central Lobby'}}

  /* ---------- interaction ---------- */
  function findNear(){
    var best=null,bs=1e9,fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
    inter.forEach(function(o){var dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz);if(d>o.r||d<.05)return;if(o.nx!==undefined&&(dx*o.nx+dz*o.nz)>0)return;var dt=(dx*fx+dz*fz)/d;if(dt<.55&&d>1.3)return;var sc=d*(1.6-dt);if(sc<bs){bs=sc;best=o}});
    setPrompt(best);
  }
  function setPrompt(o){if(o===near)return;near=o;$('prompt').hidden=!o||coarse;$('act').hidden=!o||!coarse;if(o){$('promptTxt').textContent=o.label;$('act').textContent=o.verb}}
  function interact(){if(mode==='play'&&near)near.act()}
  var toastT;function toast(t){var el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('on')},3600)}

  /* ---------- states ---------- */
  function afterGate(){
    if(!ready)return;
    var h=(location.hash||'').slice(1);
    if(SPAWN[h]&&h!=='entrance'){var s=SPAWN[h];teleport(s[0],s[1],s[2],true);doorT=1;play();return}
    if(S.skipIntro){teleport(0,-11,0,true);doorT=1;play();return}
    mode='intro';$('intro').hidden=false;$('hud').hidden=true;$('skipIn').checked=!!S.skipIntro;setTimeout(function(){$('goIn').focus()},40);
  }
  function play(){mode='play';$('intro').hidden=true;$('hud').hidden=false;lookHint();canvas.focus({preventScroll:true})}
  function lookHint(){$('lookhint').hidden=coarse||!!document.pointerLockElement}
  function walkIn(){S.skipIntro=$('skipIn').checked;save();$('intro').hidden=true;$('hud').hidden=false;$('lookhint').hidden=true;
    if(S.reduced){teleport(0,-11,0,true);doorT=1;play();return}
    mode='anim';anim={t:0,d:5.2,x0:P.x,z0:P.z,y0:P.yaw,x1:0,z1:-11,y1:0}}
  function teleport(x,z,yaw,instant){var go=function(){P.x=x;P.z=z;P.yaw=yaw||0;P.pitch=0;P.vx=P.vz=0;auto=null;if(z<0)doorT=1};if(instant||S.reduced){go();return}var f=$('fade');f.classList.add('on');setTimeout(function(){go();setTimeout(function(){f.classList.remove('on')},60)},360)}
  function travel(id){var s=SPAWN[id];if(!s)return;closeOv();teleport(s[0],s[1],s[2]);if(mode!=='play')play()}

