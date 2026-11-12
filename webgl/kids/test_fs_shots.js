const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const shots=[
  {n:'desktop_normal',w:1280,h:900,touch:false,fs:false,pseudo:false},
  {n:'desktop_fullscreen',w:1280,h:900,touch:false,fs:true,pseudo:true},
  {n:'tablet_1024x768_landscape_fullscreen',w:1024,h:768,touch:true,fs:true,pseudo:true},
  {n:'phone_390x844_pseudo_fullscreen',w:390,h:844,touch:true,mobile:true,fs:true,pseudo:true},
 ];
 const {mkdirSync}=require('fs');
 mkdirSync('screens_fullscreen',{recursive:true});
 for(const s of shots){
  const p=await b.newPage({viewport:{width:s.w,height:s.h},hasTouch:!!s.touch,isMobile:!!s.mobile});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>tell.setLang('de'));
  await p.evaluate(()=>{tell.pause&&tell.pause()});
  if(s.fs){await p.evaluate(m=>tell.enterFs(m), s.pseudo?'pseudo':undefined); await p.waitForTimeout(700);}
  else await p.waitForTimeout(600);
  await p.screenshot({path:`screens_fullscreen/${s.n}.png`,fullPage:false});
  const info=await p.evaluate(()=>({mode:tell.fsMode(),isFs:tell.isFs(),label:document.getElementById('fsBtn').getAttribute('aria-label'),hud:getComputedStyle(document.getElementById('fsHud')).display}));
  console.log(s.n,errs,info);
  await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
