const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,w,h] of [['1024x768',1024,768],['768x1024',768,1024],['1280x800',1280,800]]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(2000);
 await p.screenshot({path:`screens_sun/${n}.png`});
 const r=await p.evaluate(()=>{const v=document.getElementById('view').getBoundingClientRect();return [v.left,v.width,innerWidth]});
 console.log(n,r,errs);
 if(n==='1280x800'){await p.evaluate(()=>tell.pause());const box=await p.$('#view');await p.mouse.wheel(0,0);
  await box.screenshot({path:'screens_sun/sun_frame1.png'});await p.evaluate(()=>tell.play&&tell.play());await p.waitForTimeout(3000);await p.evaluate(()=>tell.pause());await box.screenshot({path:'screens_sun/sun_frame2.png'});}
}
await b.close()})();
