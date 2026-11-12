const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,vp,mob] of [['desk',{width:1280,height:900},false],['mob',{width:390,height:844},true]]){
 const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(2500);
 const shot=async(f,full)=>p.screenshot({path:`screens_einfach/${n}_${f}.png`,fullPage:!!full});
 await shot('01_start',true);
 for(const [s,f] of [['tag','02_tag_nacht'],['jahr','03_jahreszeiten'],['mond','04_mond'],['ch','05_schweiz']]){await p.click(`[data-s="${s}"]`);await p.waitForTimeout(2200);await p.evaluate(()=>tell.pause());await p.waitForTimeout(300);await shot(f)}
 await p.selectOption('#bday','7');await p.selectOption('#bmon','5');await p.click('#bgo');await p.waitForTimeout(1800);await shot('06_geburtstag');
 await p.click('summary');await p.waitForTimeout(300);await shot('07_fuer_grosse',true);
 console.log(n,'errors:',errs);}
await b.close()})();
