const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,w,h,lg] of [['desktop_de',1280,900,'de'],['tablet_768x1024_de',768,1024,'de'],['desktop_en',1280,900,'en'],['desktop_ar',1280,900,'ar']]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});
 await p.evaluate(l=>tell.setLang(l),lg);await p.evaluate(()=>document.getElementById('gross').open=true);
 await p.fill('#speed','2');await p.dispatchEvent('#speed','input');await p.waitForTimeout(800);
 const el=await p.$('#gross');await el.screenshot({path:`screens_details/${n}.png`});
 console.log(n,errs,await p.evaluate(()=>[document.getElementById('spv').textContent,document.getElementById('ev').textContent]));}
await b.close()})();
