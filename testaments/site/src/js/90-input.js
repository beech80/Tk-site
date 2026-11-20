  /* ---------- input ---------- */
  var plMenuT=0;
  function lockPointer(){if(coarse||document.pointerLockElement||!canvas.requestPointerLock)return;try{var r=canvas.requestPointerLock();if(r&&r.catch)r.catch(function(){})}catch(err){}}
  function topDialog(){if(!lb.hidden)return lb;if(!$('reader').hidden)return $('reader');if(!$('film').hidden)return $('film');if(!$('ov').hidden)return $('ov');return null}
  function bindInput(){
    var MOVE={KeyW:1,KeyA:1,KeyS:1,KeyD:1,ArrowUp:1,ArrowDown:1,ArrowLeft:1,ArrowRight:1,ShiftLeft:1,ShiftRight:1};
    document.addEventListener('keydown',function(e){
      if(!gate.hidden&&!gate.classList.contains('out'))return;
      /* keep Tab inside whichever dialog is open */
      if(e.key==='Tab'){var dlg=topDialog();if(dlg){var fs=Array.prototype.filter.call(dlg.querySelectorAll('button,[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])'),function(el){return !el.disabled&&el.offsetParent!==null&&el.tabIndex>=0});if(fs.length){var i=fs.indexOf(document.activeElement);if(e.shiftKey&&(i<=0)){fs[fs.length-1].focus();e.preventDefault()}else if(!e.shiftKey&&(i<0||i===fs.length-1)){fs[0].focus();e.preventDefault()}}}return}
      if(mode==='anim'){if(!/^(Shift|Control|Alt|Meta)/.test(e.key)){skipAnim();e.preventDefault()}return}
      if(!lb.hidden){if(e.key==='Escape')$('lbClose').click();if(e.key==='ArrowLeft')$('lbPrev').click();if(e.key==='ArrowRight')$('lbNext').click();return}
      if(!$('reader').hidden){if(e.key==='Escape')$('rClose').click();if(e.key==='ArrowRight'){e.preventDefault();turn(1)}if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}return}
      if(!$('film').hidden){if(e.key==='Escape')$('filmClose').click();return}
      if(!$('ov').hidden){var typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);if(e.key==='Escape'){if(performance.now()-plMenuT>250)closeOv();e.preventDefault()}else if(!typing&&e.code==='KeyM'&&ovKind==='map')closeOv();return}
      if(mode==='intro'&&e.key==='Escape'){openMenu();return}
      if(mode!=='play')return;
      if(e.code==='Escape'){if(performance.now()-plMenuT>250)openMenu();e.preventDefault();return}
      if(e.code==='KeyM'){openMap();e.preventDefault();return}
      if(e.code==='KeyE'||(e.code==='Enter'&&near&&e.target===canvas)){interact();e.preventDefault();return}
      if(MOVE[e.code]){keys[e.code]=true;e.preventDefault();uiMoved()}
    });
    document.addEventListener('keyup',function(e){if(MOVE[e.code])keys[e.code]=false});
    window.addEventListener('blur',function(){keys={}});
    /* mouse: click locks the pointer; once locked, a click uses what is targeted */
    var drag=null;
    canvas.addEventListener('mousedown',function(e){
      if(mode==='anim'){skipAnim();return}
      if(mode!=='play'||e.button!==0)return;
      if(document.pointerLockElement===canvas){if(near)interact();return}
      drag={x:e.clientX,y:e.clientY,m:0};lockPointer()});
    window.addEventListener('mouseup',function(){drag=null});
    document.addEventListener('mousemove',function(e){if(mode!=='play')return;var dx,dy;if(document.pointerLockElement===canvas){dx=e.movementX;dy=e.movementY}else if(drag){dx=e.clientX-drag.x;dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY}else return;
      if(Math.abs(dx)>200||Math.abs(dy)>200)return;lookBy(dx,dy,.0022)});
    document.addEventListener('pointerlockchange',function(){var l=document.pointerLockElement===canvas;canvas.classList.toggle('locked',l);lookHint();if(!l&&mode==='play'&&!suppress){plMenuT=performance.now();openMenu()}suppress=false});
    canvas.addEventListener('dblclick',function(e){if(mode==='play'&&!document.pointerLockElement)tapWalk(e.clientX,e.clientY)});
    canvas.addEventListener('contextmenu',function(e){e.preventDefault()});

    /* touch: a joystick appears under the left thumb; the right side looks; taps use or walk */
    var joyEl=$('joy'),knob=$('knob'),jid=null,jo=null,lid=null,lx=0,ly=0,tap=null,jtap=null,JR=52;joyEl.hidden=!coarse;
    function joyAt(x,y){jo={x:x,y:y};joyEl.style.left=x+'px';joyEl.style.top=y+'px';joyEl.classList.add('live')}
    function mj(t){var dx=t.clientX-jo.x,dy=t.clientY-jo.y,d=Math.hypot(dx,dy);if(d>JR){/* drag the base along so the thumb never loses it */var k=(d-JR)/d;jo.x+=dx*k;jo.y+=dy*k;joyEl.style.left=jo.x+'px';joyEl.style.top=jo.y+'px';dx=t.clientX-jo.x;dy=t.clientY-jo.y;d=JR}
      knob.style.transform='translate('+dx+'px,'+dy+'px)';var m=Math.max(0,d-8)/(JR-8),a=Math.atan2(dy,dx);m=m*m*(1.6-.6*m);/* soft start for precise creeping, full speed at the rim */joy.x=Math.cos(a)*m;joy.y=Math.sin(a)*m;if(m>.1)uiMoved()}
    function joyOff(){jid=null;jo=null;joy.x=joy.y=0;knob.style.transform='';joyEl.classList.remove('live');joyEl.style.left=joyEl.style.top=''}
    canvas.addEventListener('touchstart',function(e){
      e.preventDefault();if(mode==='anim'){skipAnim();return}if(mode!=='play')return;
      Array.prototype.forEach.call(e.changedTouches,function(t){
        if(jid===null&&t.clientX<window.innerWidth*.42){jid=t.identifier;joyAt(t.clientX,t.clientY);jtap={t:performance.now(),x:t.clientX,y:t.clientY}}
        else if(lid===null){lid=t.identifier;lx=t.clientX;ly=t.clientY;tap={t:performance.now(),m:0}}})},{passive:false});
    document.addEventListener('touchmove',function(e){var used=false;Array.prototype.forEach.call(e.changedTouches,function(t){
      if(t.identifier===jid){if(jtap&&Math.hypot(t.clientX-jtap.x,t.clientY-jtap.y)>10)jtap=null;if(!jtap)mj(t);used=true}
      else if(t.identifier===lid){var dx=t.clientX-lx,dy=t.clientY-ly;lx=t.clientX;ly=t.clientY;if(tap)tap.m+=Math.abs(dx)+Math.abs(dy);if(!tap||tap.m>6)lookBy(dx,dy*.8,.0048);used=true}});if(used)e.preventDefault()},{passive:false});
    function endT(e){Array.prototype.forEach.call(e.changedTouches,function(t){
      if(t.identifier===jid){var wasTap=jtap&&performance.now()-jtap.t<320;joyOff();if(wasTap&&e.type==='touchend')tapAt(t.clientX,t.clientY);jtap=null}
      if(t.identifier===lid){lid=null;if(e.type==='touchend'&&tap&&tap.m<10&&performance.now()-tap.t<320)tapAt(t.clientX,t.clientY);tap=null}})}
    document.addEventListener('touchend',endT);document.addEventListener('touchcancel',endT);
    /* no pinch-zoom or double-tap zoom over the museum */
    ['gesturestart','gesturechange'].forEach(function(n){document.addEventListener(n,function(e){if(!topDialog())e.preventDefault()})});
    $('act').addEventListener('click',interact);
    $('goIn').addEventListener('click',walkIn);
    $('goAbout').addEventListener('click',function(){S.skipIntro=$('skipIn').checked;save();var s=SPAWN.about;doorT=1;play();teleport(s[0],s[1],s[2])});
    $('skiphint').addEventListener('click',skipAnim);
    $('bMap').addEventListener('click',openMap);$('bMenu').addEventListener('click',openMenu);$('bCart').addEventListener('click',openCart);$('mini').addEventListener('click',openMap);
    window.addEventListener('hashchange',function(){var h=location.hash.slice(1);if((mode==='play'||mode==='ui')&&SPAWN[h]&&roomAt(P.x,P.z).id!==h)travel(h)});
  }
  function lookBy(dx,dy,k){look.x+=dx*k*S.sens;look.y+=dy*k*S.sens*(S.invertY?-1:1)}
  /* a tap: use the object under the finger if one is there, otherwise walk to the floor point */
  function tapAt(cx,cy){
    var r=canvas.getBoundingClientRect(),best=null,bd=Math.min(r.width,r.height)*.16,v=new T.Vector3();
    inter.forEach(function(o){if(o.off)return;var dx=o.x-P.x,dz=o.z-P.z,d=Math.hypot(dx,dz);if(d>Math.max(o.r,9)||d<.05)return;if(o.nx!==undefined&&(dx*o.nx+dz*o.nz)>0)return;
      var y=o.hl&&o.hl.y!=null?o.hl.y:(o.hl&&o.hl.isObject3D?(new T.Box3().setFromObject(o.hl).getCenter(new T.Vector3()).y):1.2);v.set(o.x,y,o.z).project(cam);if(v.z>1)return;
      var sx=(v.x+1)/2*r.width+r.left,sy=(1-v.y)/2*r.height+r.top,sd=Math.hypot(sx-cx,sy-cy);if(sd<bd&&sightClear(P.x,P.z,o.x+(o.nx||0)*.3-(o.nx===undefined?dx/d:0),o.z+(o.nz||0)*.3-(o.nz===undefined?dz/d:0))){bd=sd;best=o}});
    if(best){if(best===near||Math.hypot(best.x-P.x,best.z-P.z)<=best.r*.9){setPrompt(best);interact();return}
      /* too far: walk up to it */
      var ax=best.nx!==undefined?best.x+best.nx*Math.min(2.2,best.r*.6):best.x-(best.x-P.x)/Math.hypot(best.x-P.x,best.z-P.z)*1.8,az=best.nz!==undefined?best.z+best.nz*Math.min(2.2,best.r*.6):best.z-(best.z-P.z)/Math.hypot(best.x-P.x,best.z-P.z)*1.8;
      auto={x:ax,z:az};return}
    tapWalk(cx,cy)}
  function tapWalk(cx,cy){var r=canvas.getBoundingClientRect(),v=new T.Vector3((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1,.5);v.unproject(cam);var d=v.sub(cam.position).normalize();if(d.y>=-.02)return;var t=-cam.position.y/d.y;if(t>40)return;var gx=cam.position.x+d.x*t,gz=cam.position.z+d.z*t;
    /* never aim through a wall: pull the goal back along the ray to the last clear, free point */
    if(!sightClear(P.x,P.z,gx,gz)||blocked(gx,gz)){var lo=0,hi=1;for(var i=0;i<12;i++){var m=(lo+hi)/2,mx=P.x+(gx-P.x)*m,mz=P.z+(gz-P.z)*m;if(sightClear(P.x,P.z,mx,mz)&&!blocked(mx,mz))lo=m;else hi=m}var L=Math.hypot(gx-P.x,gz-P.z)*lo-.4;if(L<.5)return;var k=L/Math.hypot(gx-P.x,gz-P.z);gx=P.x+(gx-P.x)*k;gz=P.z+(gz-P.z)*k}
    auto={x:gx,z:gz};uiMoved()}
