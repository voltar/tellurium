const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const f of ['tellurium.html','tellurium_offline.html']){
 const p=await b.newPage({viewport:{width:1400,height:850}});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text())});p.on('pageerror',e=>errs.push('pageerror: '+e.message));
 await p.goto('file://'+__dirname+'/'+f);await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(1500);
 console.log(f,'errors:',errs);
 if(f=='tellurium_offline.html')continue;
 const shot=async(n,js)=>{await p.evaluate(js);await p.waitForTimeout(1200);await p.screenshot({path:'screens/'+n+'.png'})};
 await shot('01_perihel',"tell.pause();document.querySelector('[data-d=\"2\"]').click()");
 await shot('02_aphel',"document.querySelector('[data-d=\"184\"]').click()");
 await shot('03_sommersonnenwende_nah',"document.querySelector('[data-d=\"171\"]').click();tell.lookAtEarth(2.4);document.getElementById('marks').click()");
 await shot('04_real_ecc',"tell.controls.target.set(0,0,0);tell.camera.position.set(0,12,9);document.getElementById('real').click()");
}
await b.close()})();
