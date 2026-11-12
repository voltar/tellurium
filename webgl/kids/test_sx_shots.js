const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const dir=__dirname+'/screens_opt5';
 {
  const p=await b.newPage({viewport:{width:1280,height:1780}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause()});
  await p.waitForTimeout(700);
  await p.screenshot({path:dir+'/desktop_de.png',fullPage:false});
  const el=await p.$('.speed-card');
  if(el) await el.screenshot({path:dir+'/desktop_de_tempo.png'});
  console.log('desktop_de', await p.evaluate(()=>document.getElementById('spx').textContent));
  await p.close();
 }
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause();return tell.enterFs('pseudo')});
  await p.waitForTimeout(700);
  await p.screenshot({path:dir+'/desktop_fs.png',fullPage:false});
  const hud=await p.$('#fsHud');
  if(hud) await hud.screenshot({path:dir+'/desktop_fs_hud.png'});
  console.log('desktop_fs', await p.evaluate(()=>document.getElementById('fsSpx').textContent));
  await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
