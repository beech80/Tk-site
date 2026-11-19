  var $=function(id){return document.getElementById(id)};
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  var coarse=window.matchMedia('(pointer: coarse)').matches;
  var CH=CHAPTERS.filter(function(c){return c.status!=='draft'});
  function chap(s){return CH.filter(function(c){return c.slug===s})[0]}
  function who(c){return c?(c.subjects.length?c.subjects.join(' & '):(c.subjectsNote||'')):''}
  function photo(id){return PHOTOS.filter(function(p){return p.id===id})[0]}
  function src(id){return 'assets/photos/'+id+'.jpg'}
  var STATUS={'coming-soon':'Coming soon',published:'Published',archived:'Archive'};
  function edState(c){var s=c.edition.state;return s==='available'?(c.edition.stock===0?'Sold out':'Available'):s==='preorder'?'Preorder':s==='sold-out'?'Sold out':'Coming soon'}
  function money(e){return new Intl.NumberFormat('en-US',{style:'currency',currency:e.currency||'USD'}).format(e.price)}

  var launch=new Date(SITE.launchDate+'T00:00:00'),launchTxt=launch.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),days=Math.ceil((launch-new Date())/864e5),pre=days>0;
  $('gateLaunch').textContent=pre?'Launching '+launchTxt:'';$('introLaunch').textContent=pre?'Opening '+launchTxt+' · '+days+(days===1?' day':' days'):'';

  var S={sens:1,speed:1,quality:'auto',reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches,skipIntro:false};
  try{var st=JSON.parse(store('t.museum')||'{}');for(var k in st)S[k]=st[k]}catch(e){}
  function save(){store('t.museum',JSON.stringify(S))}

  /* ---------- film gate ---------- */
  var gate=$('gate'),gv=$('gateVideo'),gateDone=false;
  if(S.reduced){gv.removeAttribute('autoplay');try{gv.pause()}catch(e){}}
  $('soundBtn').addEventListener('click',function(){gv.muted=!gv.muted;if(!gv.muted)gv.play().catch(function(){});this.setAttribute('aria-pressed',String(!gv.muted));this.textContent=gv.muted?'Sound off':'Sound on'});
  $('enterBtn').addEventListener('click',function(){gateDone=true;gate.classList.add('out');setTimeout(function(){try{gv.pause()}catch(e){}gate.hidden=true},S.reduced?0:1100);afterGate()});
  setTimeout(function(){$('enterBtn').focus()},60);
  function replayFilm(){closeOv();gate.hidden=false;gate.classList.remove('out');try{gv.currentTime=0;if(!S.reduced)gv.play().catch(function(){})}catch(e){}pauseFor();setTimeout(function(){$('enterBtn').focus()},60)}

