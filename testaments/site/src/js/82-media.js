  /* ---------- photo viewer ---------- */
  var lb=$('lb'),lbi=0,lbSet=PHOTOS;
  function showLB(){var p=lbSet[lbi];$('lbImg').src=src(p.id);$('lbImg').alt=p.alt;var im=$('lbImg');im.classList.remove('z','sw');void im.offsetWidth;im.classList.add('sw');$('lbCap').textContent=p.alt;$('lbCount').textContent='Pl. '+(PHOTOS.indexOf(p)+1)+'  ·  '+(lbi+1)+' / '+lbSet.length}
  function openPhoto(id,set){pauseFor();lbSet=set||PHOTOS;lbi=Math.max(0,lbSet.findIndex(function(p){return p.id===id}));showLB();lb.hidden=false;$('lbClose').focus()}
  $('lbClose').addEventListener('click',function(){lb.hidden=true});
  $('lbPrev').addEventListener('click',function(){lbi=(lbi-1+lbSet.length)%lbSet.length;showLB()});$('lbNext').addEventListener('click',function(){lbi=(lbi+1)%lbSet.length;showLB()});
  $('lbImg').addEventListener('click',function(){this.classList.toggle('z')});
  $('lbCapT').addEventListener('click',function(){var on=this.getAttribute('aria-pressed')!=='true';this.setAttribute('aria-pressed',String(on));$('lbCap').style.visibility=on?'visible':'hidden'});
  swipe(lb,function(d){lbi=(lbi+(d>0?-1:1)+lbSet.length)%lbSet.length;showLB()});

  /* ---------- film ---------- */
  function openFilm(u){pauseFor();var v=$('filmVid');if(typeof u==='string'&&u)v.src=u;$('film').hidden=false;try{v.currentTime=0;v.play().catch(function(){})}catch(e){}$('filmClose').focus()}
  if(window.__vertFilm){var fv=$('filmVid');fv.poster='assets/intro-vertical-poster.jpg';fv.querySelector('source').src='assets/intro-vertical.mp4';fv.load()}
  $('filmClose').addEventListener('click',function(){try{$('filmVid').pause()}catch(e){}$('film').hidden=true});

  /* ---------- reader ---------- */
  var PAGES=[
    {k:1,label:'Cover',html:'<div class="pin" style="display:grid;align-content:space-between;text-align:center"><div style="font-family:var(--display);font-weight:500;font-size:10cqw;letter-spacing:.12em;margin-right:-.12em">TESTAMENTS</div><div style="margin:0 8cqw;aspect-ratio:4/5;position:relative;overflow:hidden"><img src="'+src('glasses-closeup')+'" alt="" style="object-position:38% 50%"></div><div style="font-family:var(--display);font-style:italic;font-size:5cqw">Understand the Why.</div></div>'},
    {k:1,html:'<div class="pin" style="display:grid;align-content:center"><p style="font-size:2.6cqw;letter-spacing:.3em;text-transform:uppercase;color:#a3a29e">Format preview</p><p style="font-family:var(--display);font-size:5.6cqw;line-height:1.3;margin-top:5cqw">This is how a chapter will read. Published chapters replace these pages.</p></div>'},
    {img:'wall-upward'},
    {html:'<div class="pin" style="display:grid;align-content:center"><p style="font-size:2.4cqw;letter-spacing:.3em;text-transform:uppercase;color:#55534f">Introduction</p><p style="font-family:var(--display);font-size:6cqw;line-height:1.28;margin-top:5cqw">Every person carries a story. A beginning. A turning point. A journey still unfolding.</p></div>'},
    {img:'mural-wide',pos:'64% 50%'},
    {k:1,html:'<div class="pin" style="display:grid;align-content:center"><p style="font-family:var(--display);font-size:24cqw;line-height:.6;color:#858585">“</p><p style="font-family:var(--display);font-size:9.5cqw;line-height:1.05;margin-top:4cqw">Understand the Why.</p></div>'},
    {html:'<div class="pin"><p style="font-size:2.4cqw;letter-spacing:.3em;text-transform:uppercase;color:#55534f;border-bottom:1px solid rgba(8,8,8,.2);padding-bottom:2.5cqw">The interview format</p><div style="margin-top:8cqw;display:grid;gap:2.6cqw"><p style="font-size:2.3cqw;letter-spacing:.28em;text-transform:uppercase;font-weight:500;color:#55534f">Interviewer</p><p style="font-family:var(--display);font-style:italic;font-size:4.6cqw;line-height:1.35">What does freedom mean to you?</p><p style="font-size:2.3cqw;letter-spacing:.28em;text-transform:uppercase;font-weight:500;color:#55534f;margin-top:5cqw">Subject</p><p style="font-family:var(--display);font-size:4.6cqw;line-height:1.35;color:#7a7874">[Approved interview response]</p></div></div>'},
    {img:'railroad',pos:'70% 50%'},{img:'reach',pos:'50% 40%'},
    {html:'<div class="pin" style="display:grid;align-content:end"><p style="font-family:var(--display);font-size:6cqw;line-height:1.28">A photograph captures a moment. A conversation reveals a journey.</p><p style="font-size:2.4cqw;letter-spacing:.3em;text-transform:uppercase;color:#55534f;margin-top:6cqw">Beyond what you see</p></div>'},
    {img:'guitar-tree',pos:'50% 60%'},
    {k:1,label:'Back cover',html:'<div class="pin" style="display:grid;align-content:space-between;text-align:center"><div></div><p style="font-family:var(--display);font-style:italic;font-size:8cqw">Every Chapter Matters.</p><p style="font-family:var(--display);font-weight:500;font-size:4cqw;letter-spacing:.2em;margin-right:-.2em">TESTAMENTS</p></div>'}
  ];
  var rp=0,spreadMode=true,zoom=1,rs=$('rStage'),spr=$('rSpread');
  var svp=parseInt(store('t.reader.page'),10);if(svp>=0&&svp<PAGES.length)rp=svp;
  function isSpread(){return spreadMode&&rs.clientWidth>=760}
  function grp(i){if(!isSpread())return [i];if(i===0)return [0];if(i===PAGES.length-1&&PAGES.length%2===0)return [i];var a=i%2===1?i:i-1;return a+1<PAGES.length?[a,a+1]:[a]}
  function pg(i,side){var p=PAGES[i],inner=p.img?'<img src="'+src(p.img)+'" alt="'+esc(photo(p.img).alt)+'" style="object-position:'+(p.pos||'50% 50%')+'">':p.html;return '<div class="rpage '+(p.k?'k ':'')+side+'">'+inner+((i>0&&i<PAGES.length-1&&!p.img)?'<span class="fol">'+i+'</span>':'')+'</div>'}
  function renderR(){var g=grp(rp);rp=g[0];var ah=rs.clientHeight-40,aw=rs.clientWidth-(window.innerWidth<600?24:140);var pw=Math.max(180,Math.min(aw/(isSpread()?2:1),ah*23/30))*zoom;
    spr.innerHTML=g.map(function(i,n){return pg(i,g.length===2?(n?'r':'l'):'r')}).join('');spr.querySelectorAll('.rpage').forEach(function(e){e.style.width=pw+'px'});
    $('rInd').textContent=(g.length===2?'Pages '+g[0]+'–'+g[1]:(PAGES[g[0]].label||'Page '+g[0]))+' / '+(PAGES.length-1);$('rPrev').disabled=g[0]===0;$('rNext').disabled=g[g.length-1]>=PAGES.length-1;
    $('rView').textContent=spreadMode?'Spread':'Single';$('rThumbs').querySelectorAll('button').forEach(function(b,i){b.setAttribute('aria-current',String(g.indexOf(i)>=0))});store('t.reader.page',String(rp))}
  function turn(d){var g=grp(rp);if(d>0){var n=g[g.length-1]+1;if(n<PAGES.length){rp=n;renderR()}}else if(g[0]>0){rp=grp(g[0]-1)[0];renderR()}}
  $('rThumbs').innerHTML=PAGES.map(function(p,i){return '<button type="button" aria-label="Go to '+(p.label||'page '+i)+'"><span class="tp '+(p.k?'k':'i')+'">'+(p.img?'<img src="'+src(p.img)+'" alt="" loading="lazy">':'')+'</span>'+(p.label?p.label.split(' ')[0]:i)+'</button>'}).join('');
  $('rThumbs').querySelectorAll('button').forEach(function(b,i){b.addEventListener('click',function(){rp=i;renderR()})});
  $('rPrev').addEventListener('click',function(){turn(-1)});$('rNext').addEventListener('click',function(){turn(1)});
  $('rView').addEventListener('click',function(){spreadMode=!spreadMode;renderR()});$('rIn').addEventListener('click',function(){zoom=Math.min(2.5,zoom+.25);renderR()});$('rOut').addEventListener('click',function(){zoom=Math.max(.5,zoom-.25);renderR()});
  $('rFull').addEventListener('click',function(){try{if(document.fullscreenElement)document.exitFullscreen();else $('reader').requestFullscreen().catch(function(){})}catch(e){}});
  document.addEventListener('fullscreenchange',function(){if(!$('reader').hidden)setTimeout(renderR,60)});
  $('rClose').addEventListener('click',function(){$('reader').hidden=true});
  swipe(rs,function(d){if(zoom<=1)turn(d>0?-1:1)});
  window.addEventListener('resize',function(){if(!$('reader').hidden)renderR()});
  function openReader(c){pauseFor();$('rTitle').textContent=c&&c.readable&&c.status==='published'?'Chapter '+c.num+' · '+c.title:'Format preview';$('reader').hidden=false;requestAnimationFrame(renderR);$('rClose').focus()}

  function swipe(el,cb){var x0=null,y0=0;el.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});el.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)cb(dx);x0=null},{passive:true})}

