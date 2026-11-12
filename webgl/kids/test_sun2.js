const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:800}});await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(1500);
const box=await p.$('#view');await box.screenshot({path:'screens_sun/sun_frame1.png'});await p.waitForTimeout(4000);await box.screenshot({path:'screens_sun/sun_frame2.png'});await b.close()})();
