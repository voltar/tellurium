const {chromium}=require('playwright');
const launch=()=>chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
(async()=>{
 const b=await launch();
 const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');
 await p.waitForFunction('window.__ready',null,{timeout:60000});
 await p.evaluate(()=>tell.setLang('de'));
 await p.waitForTimeout(400);

 const ui=await p.evaluate(()=>{
  const btn=document.getElementById('fsBtn');
  const hint=document.getElementById('hint');
  const view=document.getElementById('view');
  const br=btn.getBoundingClientRect(), hr=hint.getBoundingClientRect(), vr=view.getBoundingClientRect();
  const overlap=!(br.right<hr.left||br.left>hr.right||br.bottom<hr.top||br.top>hr.bottom);
  const cs=getComputedStyle(btn);
  return {
   inView:view.contains(btn),
   w:Math.round(br.width),h:Math.round(br.height),
   overlapHint:overlap,
   label:btn.getAttribute('aria-label'),
   pressed:btn.getAttribute('aria-pressed'),
   radius:cs.borderRadius,
   hudDisplay:getComputedStyle(document.getElementById('fsHud')).display,
   isFs:tell.isFs(),
   og:document.querySelector('meta[property="og:image"]').content
  };
 });

 const labels=await p.evaluate(()=>{
  const out={};
  for(const lg of ['de','en','fr','it','es','pt','zh','ar']){
   tell.setLang(lg);
   out[lg]=document.getElementById('fsBtn').getAttribute('aria-label');
  }
  tell.setLang('de');
  return out;
 });

 // pseudo-fullscreen enter
 const entered=await p.evaluate(()=>tell.enterFs('pseudo'));
 await p.waitForTimeout(400);
 const fs=await p.evaluate(()=>{
  const view=document.getElementById('view');
  const c=view.querySelector('canvas');
  const hud=document.getElementById('fsHud');
  const btn=document.getElementById('fsBtn');
  return {
   mode:tell.fsMode(),
   isFs:tell.isFs(),
   cls:view.classList.contains('pseudo-fs'),
   html:document.documentElement.classList.contains('fs-pseudo'),
   view:[view.clientWidth,view.clientHeight],
   canvasCss:[c.clientWidth,c.clientHeight],
   canvasBuf:[c.width,c.height],
   hudShown:getComputedStyle(hud).display!=='none',
   date:document.getElementById('fsDatum').textContent,
   sub:document.getElementById('fsSub').textContent,
   play:document.getElementById('fsPlay').textContent,
   spv:document.getElementById('fsSpv').textContent,
   speed:+document.getElementById('fsSpeed').value,
   aria:btn.getAttribute('aria-label'),
   pressed:btn.getAttribute('aria-pressed'),
   vw:innerWidth,vh:innerHeight
  };
 });

 // resize while in fs
 await p.setViewportSize({width:1280,height:700});
 await p.waitForTimeout(350);
 const resized=await p.evaluate(()=>{
  const view=document.getElementById('view');
  const c=view.querySelector('canvas');
  return {view:[view.clientWidth,view.clientHeight],canvas:[c.clientWidth,c.clientHeight],vw:innerWidth,vh:innerHeight};
 });
 await p.setViewportSize({width:1280,height:900});
 await p.waitForTimeout(350);

 // speed / play sync from HUD
 const sync=await p.evaluate(()=>{
  const fsPlay=document.getElementById('fsPlay');
  const was=tell.isFs();
  const playingBefore=document.getElementById('play').textContent;
  fsPlay.click();
  const afterClick={main:document.getElementById('play').textContent,fs:document.getElementById('fsPlay').textContent,changed:document.getElementById('play').textContent!==playingBefore};
  document.getElementById('fsSpeed').value='5';
  document.getElementById('fsSpeed').dispatchEvent(new Event('input'));
  const spd={main:+document.getElementById('speed').value,fs:+document.getElementById('fsSpeed').value,label:document.getElementById('spv').textContent,fsLabel:document.getElementById('fsSpv').textContent};
  document.getElementById('speed').value='7';
  document.getElementById('speed').dispatchEvent(new Event('input'));
  const back={main:+document.getElementById('speed').value,fs:+document.getElementById('fsSpeed').value};
  // restore play
  if(afterClick.changed) fsPlay.click();
  return {was,afterClick,spd,back};
 });

 // Esc exits pseudo
 await p.keyboard.press('Escape');
 await p.waitForTimeout(250);
 const afterEsc=await p.evaluate(()=>({isFs:tell.isFs(),mode:tell.fsMode(),cls:document.getElementById('view').classList.contains('pseudo-fs'),hud:getComputedStyle(document.getElementById('fsHud')).display,aria:document.getElementById('fsBtn').getAttribute('aria-label')}));

 // button toggle back in (pseudo) and out
 await p.evaluate(()=>tell.enterFs('pseudo'));
 await p.waitForTimeout(200);
 const mid=await p.evaluate(()=>tell.isFs());
 await p.click('#fsBtn');
 await p.waitForTimeout(250);
 const afterBtn=await p.evaluate(()=>({isFs:tell.isFs(),mode:tell.fsMode()}));

 const expectedLabels={
  de:'Vollbild',en:'Full screen',fr:'Plein écran',it:'Schermo intero',
  es:'Pantalla completa',pt:'Ecrã inteiro',zh:'全屏',ar:'ملء الشاشة'
 };
 const labelsOk=Object.entries(expectedLabels).every(([k,v])=>labels[k]===v);
 const sizeOk=ui.w>=44&&ui.h>=44;
 const fillOk=fs.view[0]===fs.vw&&fs.view[1]===fs.vh&&fs.canvasCss[0]===fs.view[0]&&fs.canvasCss[1]===fs.view[1];
 const resizeOk=resized.view[0]===resized.vw&&resized.view[1]===resized.vh&&resized.canvas[0]===resized.view[0]&&resized.canvas[1]===resized.view[1];
 const allOk=!errs.length&&ui.inView&&!ui.overlapHint&&sizeOk&&ui.hudDisplay==='none'&&!ui.isFs
  &&entered==='pseudo'&&fs.mode==='pseudo'&&fs.hudShown&&fs.date&&fs.speed===7&&fs.aria==='Vollbild beenden'
  &&fillOk&&resizeOk&&sync.afterClick.changed&&sync.afterClick.main===sync.afterClick.fs
  &&sync.spd.main===5&&sync.spd.main===sync.spd.fs&&sync.spd.label===sync.spd.fsLabel&&sync.back.fs===7
  &&!afterEsc.isFs&&afterEsc.hud==='none'&&afterEsc.aria==='Vollbild'
  &&mid===true&&!afterBtn.isFs&&labelsOk
  &&ui.og==='https://bamboo-clear-vivid-king.grok.me/og.jpg';

 console.log('UI',JSON.stringify(ui));
 console.log('LABELS',JSON.stringify(labels));
 console.log('ENTERED',entered);
 console.log('FS',JSON.stringify(fs));
 console.log('RESIZED',JSON.stringify(resized));
 console.log('SYNC',JSON.stringify(sync));
 console.log('AFTER_ESC',JSON.stringify(afterEsc));
 console.log('AFTER_BTN',JSON.stringify(afterBtn));
 console.log('ERRS',JSON.stringify(errs));
 console.log('ALL_OK',allOk);
 await b.close();
 if(!allOk) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
