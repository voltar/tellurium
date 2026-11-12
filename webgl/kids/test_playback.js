const {chromium}=require('playwright');
const YEAR=365.25;
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

 // default speed index 7
 const def=await p.evaluate(()=>({idx:+document.getElementById('speed').value,dps:tell.daysPerSec(),playing:tell.isPlaying(),sp:SP_OK})).catch(()=>null);
 const init=await p.evaluate(()=>({idx:+document.getElementById('speed').value,dps:tell.daysPerSec(),playing:tell.isPlaying()}));
 const defaultOk=init.idx===7 && Math.abs(init.dps-SP[7])<1e-12 && init.playing===true;

 // --- playing at default speed actually advances at about the right rate
 const r0=await measure(p,400);
 const rate0ok=r0.playing && r0.ratio>0.6 && r0.ratio<1.4 && r0.dM>0;

 // --- pause then play: must stop, then resume at selected speed and actually start
 await p.evaluate(()=>tell.pause());
 const paused=await measure(p,300);
 const pauseOk=!paused.playing && Math.abs(paused.dM)<1e-6;
 await p.evaluate(()=>tell.play());
 const resumed=await measure(p,400);
 const resumeOk=resumed.playing && Math.abs(resumed.dps-SP[7])<1e-12 && resumed.ratio>0.6 && resumed.ratio<1.4 && resumed.dM>0;

 // --- change speed while playing
 await p.evaluate(()=>tell.setSpeed(4)); // 1 Tag / ~365×
 const midPlay=await p.evaluate(()=>tell.daysPerSec());
 const rFast=await measure(p,300);
 const changeWhilePlayingOk=Math.abs(midPlay-SP[4])<1e-12 && rFast.dM>0 && rFast.ratio>0.55 && rFast.ratio<1.5;

 // --- change speed while paused, then play
 await p.evaluate(()=>{tell.pause();tell.setSpeed(9)});
 const dpsPaused=await p.evaluate(()=>tell.daysPerSec());
 const stillPaused=await measure(p,200);
 await p.evaluate(()=>tell.play());
 const afterPausedSpeed=await measure(p,300);
 const changeWhilePausedOk=Math.abs(dpsPaused-SP[9])<1e-12 && !stillPaused.playing && Math.abs(stillPaused.dM)<1e-6
   && afterPausedSpeed.playing && Math.abs(afterPausedSpeed.dps-SP[9])<1e-12 && afterPausedSpeed.dM>0 && afterPausedSpeed.ratio>0.55 && afterPausedSpeed.ratio<1.5;

 // --- large time gap / visibilitychange must not jump or die
 await p.evaluate(()=>tell.setSpeed(7));
 await p.evaluate(()=>tell.play());
 const vis=await p.evaluate(async ()=>{
  const m0=__sim.Mvis();
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
  Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});
  document.dispatchEvent(new Event('visibilitychange'));
  // stale clock as if the tab slept for 30s
  window.__anim.setLast(performance.now()-30000);
  Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
  Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'visible'});
  document.dispatchEvent(new Event('visibilitychange'));
  const m1=__sim.Mvis(); // should not have leapt during the wake itself
  const t0=performance.now();
  await new Promise(r=>setTimeout(r,350));
  const elapsed=(performance.now()-t0)/1000;
  const dM=__sim.Mvis()-m1;
  const dps=tell.daysPerSec();
  const expect=2*Math.PI*dps*elapsed/365.25;
  const jumpAtWake=m1-m0;
  const maxJump=2*Math.PI*dps*0.15/365.25; // wake itself should be ~0, one frame at most
  return {jumpAtWake,maxJump,dM,elapsed,expect,ratio:dM/expect,playing:tell.isPlaying(),dps};
 });
 // 30s at default would be huge (~2*pi*0.60875*30/365.25 ≈ 0.31 rad); we must be far below that
 const thirtySec=2*Math.PI*SP[7]*30/YEAR;
 const visOk=vis.playing && Math.abs(vis.dps-SP[7])<1e-12 && Math.abs(vis.jumpAtWake)<thirtySec/20
   && vis.ratio>0.5 && vis.ratio<1.6 && vis.dM>0;

 // window focus after stale last
 const foc=await p.evaluate(async ()=>{
  const m0=__sim.Mvis();
  window.__anim.setLast(performance.now()-60000);
  window.dispatchEvent(new Event('focus'));
  await new Promise(r=>setTimeout(r,300));
  const dM=__sim.Mvis()-m0;
  const expect=2*Math.PI*tell.daysPerSec()*0.3/365.25;
  return {dM,expect,ratio:dM/expect,playing:tell.isPlaying()};
 });
 const focOk=foc.playing && foc.dM>0 && foc.ratio>0.45 && foc.ratio<1.7
   && Math.abs(foc.dM)<2*Math.PI*SP[7]*5/YEAR; // not a 60s jump

 // --- repeated pause/play and speed changes
 const seq=await p.evaluate(async ()=>{
  const steps=[7,5,11,2,7];
  const out=[];
  for(const i of steps){
    tell.pause();
    tell.setSpeed(i);
    if(tell.isPlaying()) return {ok:false,why:'still playing after pause',i};
    tell.play();
    if(!tell.isPlaying()) return {ok:false,why:'did not start',i};
    const dps=tell.daysPerSec();
    const SP=[0,1/86400,365.25/(30.4375*86400),365.25/(7*86400),365.25/86400,365.25/3600,365.25/1800,365.25/600,365.25/300,365.25/60,365.25/30,365.25/10];
    if(Math.abs(dps-SP[i])>1e-12) return {ok:false,why:'wrong dps',i,dps,want:SP[i]};
    const m0=__sim.Mvis(),t0=performance.now();
    await new Promise(r=>setTimeout(r,180));
    const dM=__sim.Mvis()-m0, el=(performance.now()-t0)/1000;
    const expect=2*Math.PI*dps*el/365.25;
    if(i===0){ if(Math.abs(dM)>1e-8) return {ok:false,why:'moved at stop',dM}; }
    else if(!(dM>0 && dM/expect>0.4 && dM/expect<1.8)) return {ok:false,why:'bad rate',i,dM,expect,ratio:dM/expect};
    out.push({i,dps,ratio:i===0?1:dM/expect});
  }
  return {ok:true,out};
 });

 // speed 0: play but no motion; then leave 0 and it starts
 await p.evaluate(()=>{tell.pause();tell.setSpeed(0);tell.play()});
 const atZero=await measure(p,200);
 await p.evaluate(()=>tell.setSpeed(7));
 const fromZero=await measure(p,300);
 const zeroOk=atZero.playing && Math.abs(atZero.dps)<1e-15 && Math.abs(atZero.dM)<1e-8
   && fromZero.playing && fromZero.dM>0 && Math.abs(fromZero.dps-SP[7])<1e-12;

 const allOk=!errs.length&&defaultOk&&rate0ok&&pauseOk&&resumeOk&&changeWhilePlayingOk&&changeWhilePausedOk&&visOk&&focOk&&seq.ok&&zeroOk;
 console.log('INIT',JSON.stringify({init,defaultOk,rate0:r0,rate0ok}));
 console.log('PAUSE_PLAY',JSON.stringify({paused,pauseOk,resumed,resumeOk}));
 console.log('SPEED',JSON.stringify({changeWhilePlayingOk,rFast,changeWhilePausedOk,afterPausedSpeed,zeroOk,atZero,fromZero}));
 console.log('FOCUS',JSON.stringify({vis,visOk,foc,focOk,thirtySec}));
 console.log('SEQ',JSON.stringify(seq));
 console.log('ERRS',JSON.stringify(errs));
 console.log('ALL_OK',allOk);
 await b.close();
 if(!allOk) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
