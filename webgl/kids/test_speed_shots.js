const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const shots=[
  ['desktop_de',1280,900,'de',7],
  ['desktop_de_realtime',1280,900,'de',1],
  ['desktop_de_fast',1280,900,'de',10],
  ['tablet_768x1024_de',768,1024,'de',7],
  ['desktop_en',1280,900,'en',7],
  ['desktop_ar',1280,900,'ar',7],
 ];
 for(const [n,w,h,lg,sp] of shots){
  const p=await b.newPage({viewport:{width:w,height:h}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(l=>tell.setLang(l),lg);
  await p.evaluate(v=>{const s=document.getElementById('speed');s.value=String(v);s.dispatchEvent(new Event('input'));tell.pause&&tell.pause()},sp);
  await p.waitForTimeout(600);
  await p.screenshot({path:`screens_speed/${n}.png`,fullPage:false});
  const el=await p.$('.speed-card');
  if(el) await el.screenshot({path:`screens_speed/${n}_speedcard.png`});
  console.log(n,errs,await p.evaluate(()=>[document.getElementById('spv').textContent, document.querySelector('.speed-card')?'main':'missing']));
  await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
