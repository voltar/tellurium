const {chromium}=require('playwright');
const SP=[0,1/86400,365.25/(30.4375*86400),365.25/(7*86400),365.25/86400,365.25/3600,365.25/1800,365.25/600,365.25/300,365.25/60,365.25/30,365.25/10];
const YEAR=365.25;
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');
 await p.waitForFunction('window.__ready',null,{timeout:60000});
 await p.evaluate(()=>tell.setLang('de'));
 const ui=await p.evaluate(()=>{
  const speed=document.getElementById('speed');
  const card=document.querySelector('.speed-card');
  const gross=document.getElementById('gross');
  return {max:+speed.max,min:+speed.min,value:+speed.value,label:document.getElementById('spv').textContent,
   speedInCard:!!(card&&card.contains(speed)),speedInDetails:!!(gross&&gross.contains(speed))};
 });
 const rates=await p.evaluate(()=>{
  const speed=document.getElementById('speed'); const out=[];
  for(let i=0;i<=+speed.max;i++){speed.value=String(i);speed.dispatchEvent(new Event('input'));out.push({i,label:document.getElementById('spv').textContent})}
  speed.value='7';speed.dispatchEvent(new Event('input'));
  return out;
 });
 const checks=[];
 for(let i=0;i<=11;i++){
  const r=await p.evaluate(({i,SP,YEAR})=>{
   const speed=document.getElementById('speed');
   speed.value=String(i);speed.dispatchEvent(new Event('input'));
   const m0=__sim.Mvis(); const dtDays=SP[i]*1.0; __sim.adv(dtDays); const m1=__sim.Mvis();
   const dM=m1-m0, expect=2*Math.PI*dtDays/YEAR;
   const ok=Math.abs(dM-expect)<1e-12||Math.abs(dM-expect)/Math.max(1e-20,Math.abs(expect))<1e-9;
   return {idx:i,SP:SP[i],dM,expect,ok};
  },{i,SP,YEAR});
  checks.push(r);
 }
 const phys=await p.evaluate(()=>{
  tell.pause&&tell.pause();
  const S=__sim,dt=0.01,N=Math.round(365.256*1/dt);
  let ea=S.ea(),ma=S.ma(),E=0,M=0;const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
  let t=0;for(let i=0;i<N;i++){S.adv(dt);t+=dt;const a=S.ea(),m=S.ma();E+=wrap(a-ea);M+=wrap(m-ma);ea=a;ma=m}
  return {days:t,earthRot:E/(2*Math.PI),moonRev:M/(2*Math.PI),rotPerYear:E/(2*Math.PI),moonSid:t/(M/(2*Math.PI))};
 });
 const langs=await p.evaluate(()=>{
  const out={};
  for(const lg of ['de','en','fr','it','es','pt','zh','ar']){
   tell.setLang(lg); const speed=document.getElementById('speed'); const labs=[];
   for(let i=0;i<=+speed.max;i++){speed.value=String(i);speed.dispatchEvent(new Event('input'));labs.push(document.getElementById('spv').textContent)}
   out[lg]={title:document.getElementById('l_s_speed').textContent,labs,n:labs.length};
   speed.value='7';speed.dispatchEvent(new Event('input'));
  }
  tell.setLang('de'); return out;
 });
 const expectedDE=['Angehalten','Echtzeit (1 Jahr = 1 Jahr)','Ein Jahr dauert 1 Monat','Ein Jahr dauert 1 Woche','Ein Jahr dauert 1 Tag','Ein Jahr dauert 1 Stunde','Ein Jahr dauert 30 Minuten','Ein Jahr dauert 10 Minuten (Standard)','Ein Jahr dauert 5 Minuten','Ein Jahr dauert 1 Minute','Ein Jahr dauert 30 Sekunden','Ein Jahr dauert 10 Sekunden'];
 const deOk=JSON.stringify(rates.map(r=>r.label))===JSON.stringify(expectedDE);
 const allOk=checks.every(c=>c.ok)&&!errs.length&&ui.speedInCard&&!ui.speedInDetails&&ui.value===7&&ui.max===11&&deOk&&Object.values(langs).every(l=>l.n===12);
 console.log('UI',JSON.stringify(ui));
 console.log('RATES',JSON.stringify(rates));
 console.log('CHECKS',JSON.stringify(checks));
 console.log('PHYS',JSON.stringify(phys));
 console.log('DE_OK',deOk);
 console.log('LANG_NS',Object.fromEntries(Object.entries(langs).map(([k,v])=>[k,v.n])));
 console.log('ERRS',JSON.stringify(errs));
 console.log('ALL_OK',allOk);
 await b.close();
 if(!allOk) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
