const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text())});
await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(2000);
await p.screenshot({path:'screens_sun/overview_1280x800.png'});
const v=await (await p.$('#view')).boundingBox();await p.mouse.move(v.x+v.width/2,v.y+v.height/2);
for(let i=0;i<14;i++){await p.mouse.wheel(0,-300);await p.waitForTimeout(80)}
await p.waitForTimeout(1500);await (await p.$('#view')).screenshot({path:'screens_sun/sun_closeup.png'});console.log(errs);await b.close()})();
