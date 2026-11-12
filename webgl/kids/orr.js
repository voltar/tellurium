const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1024,height:372}});await p.goto('https://orrery.live',{timeout:60000});await p.waitForTimeout(9000);
await p.mouse.move(512,186);for(let i=0;i<25;i++){await p.mouse.wheel(0,-400);await p.waitForTimeout(80)}await p.waitForTimeout(3000);
await p.screenshot({path:'screens_sun/orrery_sun.png'});await b.close()})();
