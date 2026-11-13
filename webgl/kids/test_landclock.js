const {chromium}=require('playwright');
const SP=[0,1/86400,365.25/(30.4375*86400),365.25/(7*86400),365.25/86400,365.25/3600,365.25/1800,365.25/600,365.25/300,365.25/60,365.25/30,365.25/10];
const launch=()=>chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});

async function measure(p, ms){
  return p.evaluate(async (ms)=>{
    const m0=__sim.Mvis(), t0=performance.now();
    await new Promise(r=>setTimeout(r,ms));
    const elapsed=(performance.now()-t0)/1000;
    const dM=__sim.Mvis()-m0;
    const dps=tell.daysPerSec();
    const expect=2*Math.PI*dps*elapsed/365.25;
    return {dM,elapsed,dps,playing:tell.isPlaying(),expect,ratio:expect===0?(Math.abs(dM)<1e-8?1:Infinity):dM/expect};
  },ms);
}

(async()=>{
 const b=await launch();
 const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');
 await p.waitForFunction('window.__ready',null,{timeout:60000});
 await p.evaluate(()=>tell.setLang('de'));

 // --- (1) country view keeps time running at the selected speed, no date snap
 await p.evaluate(()=>{tell.pause();tell.setSpeed(7);tell.setDoy(80.05)});
 const before=await p.evaluate(()=>({M:__sim.Mvis(),playing:tell.isPlaying(),dps:tell.daysPerSec()}));
 await p.evaluate(()=>tell.scene('ch'));
 const afterEnter=await p.evaluate(()=>({
   M:__sim.Mvis(),
   playing:tell.isPlaying(),
   dps:tell.daysPerSec(),
   btn:document.querySelector('#scenes button.on')&&document.querySelector('#scenes button.on').dataset.s,
   say:document.getElementById('say').textContent
 }));
 const noSnap=Math.abs(afterEnter.M-before.M)<1e-9;
 const starts=afterEnter.playing===true && Math.abs(afterEnter.dps-SP[7])<1e-12 && afterEnter.btn==='ch';
 const rCh=await measure(p,400);
 const advances=rCh.playing && rCh.dM>0 && rCh.ratio>0.55 && rCh.ratio<1.5 && Math.abs(rCh.dps-SP[7])<1e-12;

 // pause and play still work in country view
 await p.evaluate(()=>tell.pause());
 const paused=await measure(p,250);
 const pauseOk=!paused.playing && Math.abs(paused.dM)<1e-6;
 await p.evaluate(()=>tell.play());
 const resumed=await measure(p,350);
 const resumeOk=resumed.playing && resumed.dM>0 && resumed.ratio>0.55 && resumed.ratio<1.5;

 // changing speed in country view takes effect
 await p.evaluate(()=>tell.setSpeed(4));
 const mid=await p.evaluate(()=>tell.daysPerSec());
 const r4=await measure(p,350);
 const speedOk=Math.abs(mid-SP[4])<1e-12 && r4.dM>0 && r4.ratio>0.5 && r4.ratio<1.6;

 // changing country must not snap the date
 const mPreCc=await p.evaluate(()=>__sim.Mvis());
 await p.evaluate(()=>tell.setCountry('JP'));
 const mPostCc=await p.evaluate(()=>__sim.Mvis());
 const noSnapOnCc=Math.abs(mPostCc-mPreCc)<0.02; // allow a few ticks while the change happens

 // --- (2) clock next to the date: visible at 0-4, hidden at 5-11
 await p.evaluate(()=>{tell.pause();tell.setDoy(80.5)});
 const clocks=[];
 for(let i=0;i<=11;i++){
   const row=await p.evaluate((i)=>{
     tell.setSpeed(i);
     const u=document.getElementById('uhr'), f=document.getElementById('fsUhr');
     return {
       i,
       date:document.getElementById('datum').textContent,
       time:u.textContent,
       on:u.classList.contains('on'),
       fsDate:document.getElementById('fsDatum').textContent,
       fsTime:f.textContent,
       fsOn:f.classList.contains('on')
     };
   },i);
   clocks.push(row);
 }
 const timeRe=/^\d{1,2}[:.]\d{2}$/;
 const showOk=clocks.slice(0,5).every(r=>r.on && r.fsOn && timeRe.test(r.time) && r.time===r.fsTime && r.date && r.date===r.fsDate && !timeRe.test(r.date));
 const hideOk=clocks.slice(5).every(r=>!r.on && !r.fsOn && r.time==='' && r.fsTime==='' && r.date && r.date===r.fsDate && !/\d{1,2}[:.]\d{2}/.test(r.date));
 // 24h in de around noon from doy 80.5
 const noonish=clocks[0].time==='12:00';

 // locale 24h for de/fr/it/es/pt; en may be 12h
 const loc=await p.evaluate(()=>{
   const out={};
   for(const lang of ['de','fr','it','es','pt','en']){
     tell.setLang(lang);tell.pause();tell.setDoy(80.5);tell.setSpeed(1);
     out[lang]=document.getElementById('uhr').textContent;
   }
   tell.setLang('de');
   return out;
 });
 const loc24=['de','fr','it','es','pt'].every(l=>loc[l]==='12:00' || loc[l]==='12.00');

 const ok=noSnap && starts && advances && pauseOk && resumeOk && speedOk && noSnapOnCc && showOk && hideOk && noonish && loc24 && !errs.length;
 console.log(JSON.stringify({ok,noSnap,starts,advances,rCh,pauseOk,resumeOk,speedOk,noSnapOnCc,showOk,hideOk,noonish,loc24,clocks:clocks.map(r=>({i:r.i,date:r.date,time:r.time,on:r.on})),loc,afterEnter,errs},null,2));
 if(!ok) process.exitCode=1;
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
