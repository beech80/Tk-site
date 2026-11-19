  /* ---------- input ---------- */
  function bindInput(){
    var MOVE={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,ShiftLeft:1,ShiftRight:1};
    document.addEventListener('keydown',function(e){
      if(!gate.hidden&&!gate.classList.contains('out'))return;
      if(!lb.hidden){if(e.key==='Escape')lb.hidden=true;if(e.key==='ArrowLeft')$('lbPrev').click();if(e.key==='ArrowRight')$('lbNext').click();return}
      if(!$('reader').hidden){if(e.key==='Escape')$('reader').hidden=true;if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}return}
      if(!$('film').hidden){if(e.key==='Escape')$('filmClose').click();return}
      if(!$('ov').hidden){var typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);if(e.key==='Escape'){closeOv();e.preventDefault()}else if(!typing&&e.code==='KeyM'&&ovKind==='map')closeOv();return}
      if(mode!=='play')return;
      if(e.code==='Escape'){openMenu();e.preventDefault();return}
      if(e.code==='KeyM'){openMap();e.preventDefault();return}
      if(e.code==='KeyE'||(e.code==='Enter'&&near&&e.target===canvas)){interact();e.preventDefault();return}
      if(MOVE[e.code]){keys[e.code]=true;e.preventDefault()}
    });
    document.addEventListener('keyup',function(e){if(MOVE[e.code])keys[e.code]=false});
    window.addEventListener('blur',function(){keys={}});
    var drag=null;
    canvas.addEventListener('mousedown',function(e){if(mode!=='play')return;drag={x:e.clientX,y:e.clientY};if(!document.pointerLockElement&&canvas.requestPointerLock){try{var r=canvas.requestPointerLock();if(r&&r.catch)r.catch(function(){})}catch(err){}}});
    window.addEventListener('mouseup',function(){drag=null});
    document.addEventListener('mousemove',function(e){if(mode!=='play')return;var dx,dy;if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY}else if(drag){dx=e.clientX-drag.x;dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY}else return;look(dx,dy,.0022)});
    document.addEventListener('pointerlockchange',function(){var l=document.pointerLockElement===canvas;canvas.classList.toggle('locked',l);$('lookhint').hidden=l||coarse;if(!l&&mode==='play'&&!suppress)openMenu();suppress=false});
    canvas.addEventListener('dblclick',function(e){if(mode==='play'&&!document.pointerLockElement)tapWalk(e.clientX,e.clientY)});
    var joyEl=$('joy'),knob=$('knob'),jid=null,lid=null,lx=0,ly=0,tap=null;joyEl.hidden=!coarse;
    function mj(t){var r=joyEl.getBoundingClientRect(),dx=t.clientX-(r.left+r.width/2),dy=t.clientY-(r.top+r.height/2),m=r.width/2,d=Math.hypot(dx,dy);if(d>m){dx*=m/d;dy*=m/d}knob.style.transform='translate('+dx+'px,'+dy+'px)';joy.x=dx/m;joy.y=dy/m}
    joyEl.addEventListener('touchstart',function(e){var t=e.changedTouches[0];jid=t.identifier;mj(t);e.preventDefault()},{passive:false});
    canvas.addEventListener('touchstart',function(e){if(mode!=='play')return;var t=e.changedTouches[0];if(lid===null){lid=t.identifier;lx=t.clientX;ly=t.clientY;tap={t:performance.now(),m:0}}e.preventDefault()},{passive:false});
    document.addEventListener('touchmove',function(e){var used=false;Array.prototype.forEach.call(e.changedTouches,function(t){if(t.identifier===jid){mj(t);used=true}else if(t.identifier===lid){var dx=t.clientX-lx,dy=t.clientY-ly;lx=t.clientX;ly=t.clientY;if(tap)tap.m+=Math.abs(dx)+Math.abs(dy);look(dx,dy,.0045);used=true}});if(used)e.preventDefault()},{passive:false});
    function endT(e){Array.prototype.forEach.call(e.changedTouches,function(t){if(t.identifier===jid){jid=null;joy.x=joy.y=0;knob.style.transform=''}if(t.identifier===lid){lid=null;if(tap&&tap.m<10&&performance.now()-tap.t<300)tapWalk(t.clientX,t.clientY);tap=null}})}
    document.addEventListener('touchend',endT);document.addEventListener('touchcancel',endT);
    $('act').addEventListener('click',interact);
    $('goIn').addEventListener('click',walkIn);
    $('goAbout').addEventListener('click',function(){S.skipIntro=$('skipIn').checked;save();var s=SPAWN.about;doorT=1;play();teleport(s[0],s[1],s[2])});
    $('bMap').addEventListener('click',openMap);$('bMenu').addEventListener('click',openMenu);$('bCart').addEventListener('click',openCart);
    window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if((mode==='play'||mode==='ui')&&SPAWN[h]&&roomAt(P.x,P.z).id!==h)travel(h)});
  }
  function look(dx,dy,k){P.yaw-=dx*k*S.sens;P.pitch=Math.max(-1.1,Math.min(1.1,P.pitch-dy*k*S.sens))}
  function tapWalk(cx,cy){var r=canvas.getBoundingClientRect(),v=new T.Vector3((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1,.5);v.unproject(cam);var d=v.sub(cam.position).normalize();if(d.y>=-.02)return;var t=-cam.position.y/d.y;if(t>40)return;auto={x:cam.position.x+d.x*t,z:cam.position.z+d.z*t}}

