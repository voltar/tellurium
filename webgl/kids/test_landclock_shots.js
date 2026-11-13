const {chromium}=require('playwright');
const {mkdirSync}=require('fs');
(async()=>{
 mkdirSync(__dirname+'/screens_landclock',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});

 async function prep(p){
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
 }

 // desktop DE, country view, slow speed, date + HH:MM
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await prep(p);
  await p.evaluate(()=>{
    tell.setLang('de');
    tell.setDoy(80.5);
    tell.setSpeed(4); // 1 Tag, ~365× — clock visible
    tell.scene('ch');
    tell.pause();
  });
  await p.waitForTimeout(1400);
  await p.screenshot({path:__dirname+'/screens_landclock/desktop_de_country_slow.png',fullPage:false});
  console.log('desktop_slow',errs);
  await p.close();
 }

 // desktop DE, country view, fast speed, date only
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await prep(p);
  await p.evaluate(()=>{
    tell.setLang('de');
    tell.setDoy(80.5);
    tell.setSpeed(7);
    tell.scene('ch');
    tell.pause();
  });
  await p.waitForTimeout(1400);
  await p.screenshot({path:__dirname+'/screens_landclock/desktop_de_country_fast.png',fullPage:false});
  console.log('desktop_fast');
  await p.close();
 }

 // tablet 768x1024 DE, country view, slow speed so the clock is visible
 {
  const p=await b.newPage({viewport:{width:768,height:1024},hasTouch:true});
  await prep(p);
  await p.evaluate(()=>{
    tell.setLang('de');
    tell.setDoy(80.5);
    tell.setSpeed(4);
    tell.scene('ch');
    tell.pause();
  });
  await p.waitForTimeout(1400);
  await p.screenshot({path:__dirname+'/screens_landclock/tablet_768x1024_de.png',fullPage:false});
  console.log('tablet');
  await p.close();
 }

 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
