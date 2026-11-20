  /* ===== procedural soundscape (Web Audio, no files) =====
     Room tone per room, footsteps from walking speed, the glass doors, soft UI clicks.
     Starts only after a user gesture; pauses for the film, the gate and a hidden tab. Toggle: HUD "Sound" chip. */
  var AUD={ctx:null,on:store('t.sound')!=='0',vol:.55,key:'',lx:null,lz:null,acc:0,foot:0,door:0,wasUi:false,mediaT:0,media:false,cricket:3};
  var AUD_PRESET={
    entrance:{tone:.05,lp:420,air:.03,bp:520,hum:0,rev:.06,surf:'stone'},
    vestibule:{tone:.035,lp:320,air:.008,bp:1800,hum:.003,rev:.25,surf:'polish'},
    lobby:{tone:.045,lp:300,air:.012,bp:2600,hum:.005,rev:.5,surf:'polish'},
    gallery:{tone:.022,lp:220,air:.003,bp:2200,hum:.003,rev:.2,surf:'polish'},
    corridor:{tone:.026,lp:240,air:.004,bp:2200,hum:.003,rev:.16,surf:'polish'},
    library:{tone:.018,lp:190,air:.002,bp:2000,hum:.0025,rev:.08,surf:'soft'},
    shop:{tone:.024,lp:260,air:.004,bp:2400,hum:.004,rev:.12,surf:'polish'}
  };
  function audPreset(r){if(!r||!r.id)return AUD_PRESET.lobby;return AUD_PRESET[r.id]||(r.cor?AUD_PRESET.corridor:AUD_PRESET.gallery)}
  function audNoise(ctx,sec,brown){var n=Math.floor(ctx.sampleRate*sec),b=ctx.createBuffer(2,n,ctx.sampleRate);for(var ch=0;ch<2;ch++){var d=b.getChannelData(ch),last=0;for(var i=0;i<n;i++){var w=Math.random()*2-1;if(brown){last=(last+.02*w)/1.02;d[i]=last*3.5}else d[i]=w}}return b}
  function audInit(){
    if(AUD.ctx){audApply();return}
    var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{
      var c=AUD.ctx=new AC(),t=c.currentTime;
      AUD.master=c.createGain();AUD.master.gain.value=0;
      var comp=c.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=3;AUD.master.connect(comp);comp.connect(c.destination);
      /* generated reverb impulse */
      var n=Math.floor(c.sampleRate*3.2),ir=c.createBuffer(2,n,c.sampleRate);for(var ch=0;ch<2;ch++){var d=ir.getChannelData(ch);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)*.5}
      AUD.conv=c.createConvolver();AUD.conv.buffer=ir;AUD.send=c.createGain();AUD.send.gain.value=.2;AUD.send.connect(AUD.conv);AUD.conv.connect(AUD.master);
      AUD.white=audNoise(c,2,false);
      /* room tone: low brown noise */
      var bs=c.createBufferSource();bs.buffer=audNoise(c,6,true);bs.loop=true;AUD.lp=c.createBiquadFilter();AUD.lp.type='lowpass';AUD.lp.frequency.value=300;AUD.tone=c.createGain();AUD.tone.gain.value=0;bs.connect(AUD.lp);AUD.lp.connect(AUD.tone);AUD.tone.connect(AUD.master);bs.start(t);
      /* air: band-passed noise that breathes slowly */
      var ws=c.createBufferSource();ws.buffer=audNoise(c,4,false);ws.loop=true;AUD.bp=c.createBiquadFilter();AUD.bp.type='bandpass';AUD.bp.frequency.value=2400;AUD.bp.Q.value=.6;AUD.air=c.createGain();AUD.air.gain.value=0;var airMod=c.createGain();airMod.gain.value=1;
      ws.connect(AUD.bp);AUD.bp.connect(airMod);airMod.connect(AUD.air);AUD.air.connect(AUD.master);AUD.air.connect(AUD.send);ws.start(t);
      var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.07;lg.gain.value=.45;lfo.connect(lg);lg.connect(airMod.gain);lfo.start(t);
      /* a faint building hum */
      AUD.hum=c.createGain();AUD.hum.gain.value=0;[55,110.4,164.7].forEach(function(f,i){var o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.value=[1,.45,.15][i];o.connect(g);g.connect(AUD.hum);o.start(t)});AUD.hum.connect(AUD.master);
      AUD.key='';audRoom(curRoom);audApply();
    }catch(e){AUD.ctx=null}
  }
  function audRoom(r){
    if(!AUD.ctx)return;var p=audPreset(r),t=AUD.ctx.currentTime,k=1.6;AUD.surf=p.surf;
    AUD.tone.gain.setTargetAtTime(p.tone,t,k);AUD.lp.frequency.setTargetAtTime(p.lp,t,k);AUD.air.gain.setTargetAtTime(p.air,t,k);AUD.bp.frequency.setTargetAtTime(p.bp,t,k);AUD.hum.gain.setTargetAtTime(p.hum,t,k);AUD.send.gain.setTargetAtTime(p.rev,t,.8);
  }
  function audWant(){return AUD.on&&!document.hidden&&$('film').hidden&&gate.hidden&&!AUD.media}
  function audApply(){
    var c=AUD.ctx;if(!c)return;var w=audWant(),t=c.currentTime;
    if(w){if(c.state==='suspended')c.resume().catch(function(){});AUD.master.gain.cancelScheduledValues(t);AUD.master.gain.setTargetAtTime(AUD.vol,t,.6)}
    else{AUD.master.gain.cancelScheduledValues(t);AUD.master.gain.setTargetAtTime(0,t,.12);setTimeout(function(){if(!audWant()&&c.state==='running')c.suspend().catch(function(){})},700)}
  }
  /* one short filtered noise burst */
  function audBurst(t,dur,type,freq,q,gain,pan,rev,rate){
    var c=AUD.ctx,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),out=g;
    s.buffer=AUD.white;s.playbackRate.value=rate||1;f.type=type;f.frequency.value=freq;f.Q.value=q;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    s.connect(f);f.connect(g);if(c.createStereoPanner&&pan){var p=c.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}
    out.connect(AUD.master);if(rev){var sg=c.createGain();sg.gain.value=rev;out.connect(sg);sg.connect(AUD.send)}
    s.start(t,Math.random()*1.5,dur+.05);
  }
  function audTone(t,f0,f1,dur,gain){var c=AUD.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AUD.master);o.start(t);o.stop(t+dur+.05)}
  function audStep(speed){
    if(!AUD.ctx||AUD.ctx.state!=='running')return;var c=AUD.ctx,t=c.currentTime+.01,v=Math.min(1.25,.55+speed*.16),r=.9+Math.random()*.2;AUD.foot^=1;var pan=AUD.foot?-.12:.12;
    if(AUD.surf==='stone'){audBurst(t,.13,'lowpass',1100*r,.7,.05*v,pan,.3,r);audBurst(t+.025,.08,'bandpass',2600*r,1.2,.012*v,pan,0,r);audTone(t,90,55,.07,.05*v)}
    else if(AUD.surf==='soft'){audBurst(t,.09,'lowpass',700*r,.6,.035*v,pan,.4,r);audTone(t,80,50,.06,.035*v)}
    else{audBurst(t,.06,'bandpass',2300*r,1.1,.04*v,pan,1,r);audBurst(t+.004,.1,'lowpass',500,.7,.03*v,pan,.6,r);audTone(t,110,60,.06,.04*v)}
  }
  function audDoor(open){
    if(!AUD.ctx||AUD.ctx.state!=='running')return;var c=AUD.ctx,t=c.currentTime+.02,d=1.9;
    /* glass panel gliding: a slow band-passed sweep, a low motor, a soft seal at the end */
    var s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=AUD.white;s.loop=true;f.type='bandpass';f.Q.value=2.2;f.frequency.setValueAtTime(open?420:1300,t);f.frequency.exponentialRampToValueAtTime(open?1300:420,t+d);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.022,t+.35);g.gain.linearRampToValueAtTime(.016,t+d-.4);g.gain.linearRampToValueAtTime(0,t+d);s.connect(f);f.connect(g);g.connect(AUD.master);g.connect(AUD.send);s.start(t);s.stop(t+d+.1);
    var m=c.createOscillator(),mg=c.createGain(),ml=c.createBiquadFilter();m.type='sawtooth';m.frequency.value=48;ml.type='lowpass';ml.frequency.value=160;mg.gain.setValueAtTime(0,t);mg.gain.linearRampToValueAtTime(.012,t+.3);mg.gain.linearRampToValueAtTime(0,t+d);m.connect(ml);ml.connect(mg);mg.connect(AUD.master);m.start(t);m.stop(t+d+.1);
    audTone(t+d-.08,70,45,.18,.05);audBurst(t+d-.08,.12,'lowpass',600,.7,.015,0,.4);
  }
  function audClick(){if(!AUD.ctx||!audWant()||AUD.ctx.state!=='running')return;var t=AUD.ctx.currentTime+.005;audTone(t,1900,1500,.035,.018);audBurst(t,.025,'highpass',3500,.7,.006,0,0)}
  function audOpen(){if(!AUD.ctx||AUD.ctx.state!=='running')return;var t=AUD.ctx.currentTime+.01;audTone(t,660,655,.5,.012);audTone(t+.04,990,985,.45,.008)}
  function audCricket(){if(!AUD.ctx||AUD.ctx.state!=='running')return;var t=AUD.ctx.currentTime+.02,f=4300+Math.random()*500,g=.0025+Math.random()*.002,pan=Math.random()*1.4-.7;
    for(var i=0;i<3;i++){var o=AUD.ctx.createOscillator(),gg=AUD.ctx.createGain(),out=gg;o.frequency.value=f;gg.gain.setValueAtTime(0,t+i*.06);gg.gain.linearRampToValueAtTime(g,t+i*.06+.01);gg.gain.linearRampToValueAtTime(0,t+i*.06+.04);o.connect(gg);
      if(AUD.ctx.createStereoPanner){var p=AUD.ctx.createStereoPanner();p.pan.value=pan;gg.connect(p);out=p}out.connect(AUD.master);o.start(t+i*.06);o.stop(t+i*.06+.05)}}

  /* frame: footsteps, doors, overlay ticks, media pause */
  HOOKS.frame.push(function(dt,raw){
    if(!AUD.ctx)return;
    AUD.mediaT-=raw;if(AUD.mediaT<=0){AUD.mediaT=.5;var ov=$('ov'),m=false;if(!ov.hidden)Array.prototype.forEach.call(ov.querySelectorAll('video,audio'),function(v){if(!v.paused&&!v.muted)m=true});
      var k=(audWant()?1:0)+'|'+m;if(m!==AUD.media){AUD.media=m;audApply()}else if(k!==AUD.key){AUD.key=k;audApply()}}
    /* doors */
    if(AUD.door!==doorT){var d=doorT-AUD.door;if(d>0&&d<.2&&AUD.door<.02&&P.z>-14)audDoor(true);else if(d<0&&d>-.2&&AUD.door>.98&&P.z>-14)audDoor(false);AUD.door=doorT}
    /* overlay opened */
    var ui=mode==='ui';if(ui&&!AUD.wasUi&&$('film').hidden)audOpen();AUD.wasUi=ui;
    /* footsteps from the distance actually walked (P.vx/P.vz while playing, the walk-in animation too) */
    if(AUD.lx===null){AUD.lx=P.x;AUD.lz=P.z}
    var dx=P.x-AUD.lx,dz=P.z-AUD.lz,dist=Math.hypot(dx,dz);AUD.lx=P.x;AUD.lz=P.z;
    if(dist>1.5||(mode!=='play'&&mode!=='anim')){AUD.acc=.5;return}
    var speed=mode==='play'?Math.hypot(P.vx,P.vz):dist/Math.max(raw,1e-3);
    if(speed<.35){AUD.acc=.5;}else{AUD.acc+=dist;var stride=.62+Math.min(speed,6)*.05;if(AUD.acc>=stride){AUD.acc-=stride;audStep(speed)}}
    if(curRoom.id==='entrance'){AUD.cricket-=raw;if(AUD.cricket<=0){AUD.cricket=2.5+Math.random()*6;audCricket()}}
  });
  HOOKS.roomChange.push(function(r){audRoom(r)});

  /* start on a user gesture */
  (function(){
    var go=function(){if(AUD.on)audInit()};
    $('enterBtn').addEventListener('click',go);canvas.addEventListener('pointerdown',go);document.addEventListener('keydown',function(e){if(gate.hidden)go()});
    document.addEventListener('visibilitychange',audApply);
    document.addEventListener('click',function(e){var b=e.target&&e.target.closest&&e.target.closest('button,a,[role=button]');if(b&&b.id!=='bSound')audClick()},true);
    /* HUD toggle, styled like the other chips */
    var tb=document.querySelector('.tbtns');if(!tb)return;
    var btn=document.createElement('button');btn.className='chip';btn.id='bSound';btn.type='button';btn.textContent='Sound';
    var show=function(){btn.setAttribute('aria-pressed',String(AUD.on));btn.setAttribute('aria-label',AUD.on?'Sound on':'Sound off');btn.title=AUD.on?'Sound on':'Sound off';btn.style.textDecoration=AUD.on?'':'line-through';btn.style.opacity=AUD.on?'':'.6'};show();
    btn.addEventListener('click',function(){AUD.on=!AUD.on;store('t.sound',AUD.on?'1':'0');show();if(AUD.on){audInit();audApply();setTimeout(audClick,50)}else audApply();canvas.focus({preventScroll:true})});
    tb.insertBefore(btn,tb.firstChild);
  })();
