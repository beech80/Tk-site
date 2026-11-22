  /* ===== soft ambient music (generated, no files) =====
     A slow, warm pad progression with occasional soft bell notes, through the shared reverb.
     Starts with the soundscape (after Enter), quiet outside, fuller inside the gallery. Follows the Sound chip. */
  var MUS={g:null,t:0,i:0,bell:0,timer:null};
  var MUS_CHORDS=[[50,57,62,66,69,76],[47,54,62,66,69,74],[43,50,59,62,66,71],[45,52,57,61,64,71]]; /* Dmaj9 · Bm9 · Gmaj7 · A6sus (MIDI) */
  var MUS_BELL=[62,64,66,69,71,74,76,78,81];
  function musHz(m){return 440*Math.pow(2,(m-69)/12)}
  function musStart(){
    var c=AUD.ctx;if(!c||MUS.g)return;
    MUS.g=c.createGain();MUS.g.gain.value=0;
    MUS.lp=c.createBiquadFilter();MUS.lp.type='lowpass';MUS.lp.frequency.value=1400;MUS.lp.Q.value=.3;
    MUS.g.connect(MUS.lp);MUS.lp.connect(AUD.master);
    MUS.wet=c.createGain();MUS.wet.gain.value=.9;MUS.lp.connect(MUS.wet);MUS.wet.connect(AUD.conv);
    MUS.t=c.currentTime+.2;MUS.bell=MUS.t+6;musLevel(curRoom);
    MUS.timer=setInterval(musTick,250);musTick();
  }
  function musChord(t,notes,dur){
    var c=AUD.ctx;
    notes.forEach(function(m,j){
      var f=musHz(m),g=c.createGain(),v=(j===0?.05:.032)/(1+j*.12),a=4.5,r=6;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.setValueAtTime(v,t+dur-1);g.gain.linearRampToValueAtTime(0,t+dur+r);
      [-5,5].forEach(function(dt,k){var o=c.createOscillator();o.type=k?'triangle':'sine';o.frequency.value=f;o.detune.value=dt;o.connect(g);o.start(t);o.stop(t+dur+r+.1)});
      g.connect(MUS.g);
    });
  }
  function musBellAt(t){
    var c=AUD.ctx,m=MUS_BELL[Math.floor(Math.random()*MUS_BELL.length)],f=musHz(m+12);
    var o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type='sine';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.01;
    var g2=c.createGain();g2.gain.value=.25;o2.connect(g2);g2.connect(g);o.connect(g);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.018,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+5);
    g.connect(MUS.g);o.start(t);o2.start(t);o.stop(t+5.2);o2.stop(t+5.2);
  }
  function musTick(){
    var c=AUD.ctx;if(!c||c.state!=='running')return;var now=c.currentTime,dur=11;
    if(MUS.t<now)MUS.t=now+.1;
    while(MUS.t<now+2){musChord(MUS.t,MUS_CHORDS[MUS.i%MUS_CHORDS.length],dur);MUS.i++;MUS.t+=dur}
    if(MUS.bell<now)MUS.bell=now+.5;
    while(MUS.bell<now+2){if(!S.reduced||Math.random()<.5)musBellAt(MUS.bell);MUS.bell+=4+Math.random()*7}
  }
  function musLevel(r){
    if(!MUS.g)return;var t=AUD.ctx.currentTime,v=!r||r.id==='entrance'?.2:r.id==='library'?.28:r.dark?.3:.6;
    MUS.g.gain.cancelScheduledValues(t);MUS.g.gain.setTargetAtTime(v,t,2.5);
  }
  HOOKS.roomChange.push(function(r){musLevel(r)});
  HOOKS.frame.push(function(){if(AUD.ctx&&!MUS.g&&AUD.master)musStart()});
