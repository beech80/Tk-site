/* Dev check: renders the museum headless and takes screenshots at given spots.
   Usage: node tools/check.js '[["name",x,z,yaw], ...]' [outDir] [width] [height]
   Needs: a static server on http://localhost:8765 serving testaments/site, and
   THREE_JS pointing at a local three.min.js r128 (the sandbox cannot reach the CDN). */
const {chromium}=require('playwright');
const spots=JSON.parse(process.argv[2]||'[["lobby",0,-12,0]]');
const out=process.argv[3]||'/tmp';const W=+(process.argv[4]||1280),H=+(process.argv[5]||800);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']});
const p=await b.newPage({viewport:{width:W,height:H}});
if(process.env.THREE_JS)await p.route('**/three.min.js',r=>r.fulfill({path:process.env.THREE_JS,contentType:'application/javascript'}));
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
await p.goto('http://localhost:8765/index.html#lobby');await p.click('#enterBtn');
await p.waitForFunction(()=>window.Museum&&Museum.state().mode==='play',null,{timeout:180000});
for(const [n,x,z,y] of spots){await p.evaluate(a=>Museum.set(a[0],a[1],a[2]),[x,z,y]);await p.waitForTimeout(1500);const st=await p.evaluate(()=>Museum.state());console.log(n,JSON.stringify(st));await p.screenshot({path:out+'/'+n+'.png'});}
console.log(errs.length?errs.join('\n'):'no errors');await b.close();})().catch(e=>{console.error('CHECK FAILED',e.message);process.exit(1)});
