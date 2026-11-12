const {chromium}=require('playwright');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const dir=__dirname+'/screens_opt5';

 {
  const p=await b.newPage({viewport:{width:1280,height:1780}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause()});
  await p.waitForTimeout(800);
  await p.screenshot({path:dir+'/desktop_de.png',fullPage:false});
  const has=await p.evaluate(()=>{
    const t=document.getElementById('btoday').getBoundingClientRect();
    const v=document.getElementById('view').getBoundingClientRect();
    const s=document.getElementById('spx').getBoundingClientRect();
    return {heuteIn:t.top>=0&&t.bottom<=innerHeight&&t.width>0,multIn:s.bottom<=innerHeight,viewIn:v.height>100,heute:document.getElementById('btoday').textContent,mult:document.getElementById('spx').textContent,vh:innerHeight};
  });
  console.log('desktop_de',has);
  await p.close();
 }

 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.setDoy(80.4);tell.scene('tag');tell.pause()});
  await p.waitForTimeout(1800);
  await p.locator('#view').screenshot({path:dir+'/earth_view.png'});
  console.log('earth_view');
  await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
