const {chromium}=require('playwright');
const SX_DE=['—','Echtzeit','rund 12-mal schneller','rund 50-mal schneller','rund 365-mal schneller','rund 9 000-mal schneller','rund 18 000-mal schneller','rund 50 000-mal schneller','rund 100 000-mal schneller','rund 500 000-mal schneller','rund 1 Million Mal schneller','rund 3 Millionen Mal schneller'];
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});
 const p=await b.newPage({viewport:{width:1280,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');
 await p.waitForFunction('window.__ready',null,{timeout:60000});
 await p.evaluate(()=>tell.setLang('de'));
 await p.waitForTimeout(400);

 const ui=await p.evaluate(()=>{
  const today=document.getElementById('btoday');
  const spx=document.getElementById('spx');
  return {
   todayLabel:today&&today.textContent,
   todayVisible:!!(today&&today.offsetParent),
   defaultMult:spx&&spx.textContent,
   defaultSp:document.getElementById('spv').textContent,
   og:document.querySelector('meta[property="og:image"]').content
  };
 });

 const mults=await p.evaluate((SX_DE)=>{
  const out=[];
  const speed=document.getElementById('speed');
  for(let i=0;i<=11;i++){speed.value=String(i);speed.dispatchEvent(new Event('input'));
   out.push({i,spx:document.getElementById('spx').textContent,tell:tell.mult(),label:document.getElementById('spv').textContent});
  }
  speed.value='7';speed.dispatchEvent(new Event('input'));
  return out;
 },SX_DE);

 const today=await p.evaluate(()=>{
  const playing0=document.getElementById('play').textContent;
  const speed0=document.getElementById('speed').value;
  const days0=window.__sim.Mvis();
  tell.setToday();
  const expect=tell.todayDoy();
  // curDoy is in the closure; reconstruct from datum/xdate or Mvis via setDoy invert is hard
  // compare by setting again? expose via setDoy read: we can compare date + time
  const xdate=document.getElementById('xdate').textContent;
  const [dd,mo]=[document.getElementById('bday').value,document.getElementById('bmon').value].map(Number);
  const now=new Date();
  const frac=(now.getHours()+now.getMinutes()/60+now.getSeconds()/3600)/24;
  let d=0;for(let k=0;k<mo;k++){} // month already set
  return {
   playingSame:document.getElementById('play').textContent===playing0,
   speedSame:document.getElementById('speed').value===speed0,
   day:dd,month:mo,
   nowDay:now.getDate(),nowMonth:now.getMonth(),
   xdate,
   // doy via tell: setDoy used todayDoy; check earth moved
   moved:window.__sim.Mvis()!==days0,
   // read displayed date matches local today (day/month)
  };
 });

 // finer doy check: call setToday and compare xdate clock to local within 2 minutes
 const doyOk=await p.evaluate(()=>{
  tell.setToday();
  const now=new Date();
  const ML=[31,28,31,30,31,30,31,31,30,31,30,31];
  const m=now.getMonth(),dd=Math.min(now.getDate(),ML[m]);
  let d=0;for(let k=0;k<m;k++)d+=ML[k];
  const expect=d+dd-1+(now.getHours()+now.getMinutes()/60+now.getSeconds()/3600)/24;
  // Use setDoy inverse: doyOfNu is internal. Compare bday/bmon and xdate time.
  const xd=document.getElementById('xdate').textContent;
  const tm=xd.match(/(\d{2}):(\d{2})/);
  const gotMin=(tm?+tm[1]*60+ +tm[2]:null);
  const expMin=now.getHours()*60+now.getMinutes();
  const dayOk=+document.getElementById('bday').value===dd && +document.getElementById('bmon').value===m;
  const timeOk=gotMin!==null && Math.abs(((gotMin-expMin+1440)%1440))<=2 || Math.abs(gotMin-expMin)<=2;
  return {dayOk,timeOk,xd,gotMin,expMin,dd,m};
 });

 const copy=await p.evaluate(()=>{
  const check=(lang)=>{
   tell.setLang(lang);
   document.getElementById('gross').open=true;
   document.getElementById('marks').checked=true;
   document.getElementById('marks').dispatchEvent(new Event('change'));
   const phys=document.getElementById('phys').textContent;
   const marks=document.getElementById('l_marks').textContent;
   const ev=document.getElementById('ecc_ex').textContent;
   const blob=phys+'\n'+marks+'\n'+ev;
   return {phys,marks,ev,blob};
  };
  const de=check('de'),en=check('en');
  tell.setLang('de');
  return {de,en};
 });

 const orbits=await p.evaluate(()=>{
  const e=window.__opt.earthPath(),m=window.__opt.moonPath();
  const info=o=>({type:o.type,isMesh:o.isMesh,isLine:o.isLine||o.type==='Line'||o.type==='LineLoop',mat:o.material&&o.material.type,metalness:o.material&&o.material.metalness,color:o.material&&o.material.color&&'#'+o.material.color.getHexString()});
  return {earth:info(e),moon:info(m)};
 });

 const langsToday=await p.evaluate(()=>{
  const out={};
  for(const lg of ['de','en','fr','it','es','pt','zh','ar']){tell.setLang(lg);out[lg]=document.getElementById('btoday').textContent}
  tell.setLang('de');return out;
 });

  const multOk=mults.every((r,i)=>r.tell===SX_DE[i] && r.spx===SX_DE[i]);
const termsDe=['Perihel','Aphel'];
 const termsEn=['perihelion','aphelion','Perihelion','Aphelion'];
 // allowed only if preceded by plain explanation in same phys text
 const dePhysOk=copy.de.phys.includes('der Sonne am nächsten')&&copy.de.phys.includes('am weitesten entfernt')
   &&(!/\bPerihel\b/.test(copy.de.phys) || /am nächsten \(Perihel/.test(copy.de.phys))
   &&(!/\bAphel\b/.test(copy.de.phys) || /weitesten entfernt \(Aphel/.test(copy.de.phys));
 const deMarksOk=!/^(Perihel|Aphel)/.test(copy.de.marks) && /Sonne am nächsten/.test(copy.de.marks);
 const enPhysOk=copy.en.phys.includes('closest to the Sun')&&copy.en.phys.includes('farthest')
   &&(!/perihelion/i.test(copy.en.phys) || /closest to the Sun \(perihelion/.test(copy.en.phys));
 const enMarksOk=!/perihelion|aphelion/i.test(copy.en.marks);
 const copyOk=dePhysOk&&deMarksOk&&enPhysOk&&enMarksOk;
 const orbitOk=orbits.earth.isLine&&orbits.moon.isLine&&!orbits.earth.isMesh&&!orbits.moon.isMesh
   &&orbits.earth.mat.includes('Line')&&(orbits.earth.metalness===undefined||orbits.earth.metalness===0);
 const todayLabels={de:'Heute',en:'Today',fr:'Aujourd\'hui',it:'Oggi',es:'Hoy',pt:'Hoje',zh:'今天',ar:'اليوم'};
 const todayLangOk=Object.entries(todayLabels).every(([k,v])=>langsToday[k]===v);
 const todayJumpOk=today.speedSame&&today.playingSame&&today.day===today.nowDay&&today.month===today.nowMonth&&doyOk.dayOk&&doyOk.timeOk;
 const allOk=!errs.length&&ui.todayLabel==='Heute'&&ui.defaultSp.includes('10 Minuten')&&ui.defaultMult==='rund 50 000-mal schneller'&&copyOk&&multOk&&orbitOk&&todayLangOk&&todayJumpOk
   &&ui.og==='https://bamboo-clear-vivid-king.grok.me/og.jpg';

 console.log('UI',JSON.stringify(ui));
 console.log('MULTS',JSON.stringify(mults.map(m=>({i:m.i,spx:m.spx}))));
 console.log('TODAY',JSON.stringify(today),JSON.stringify(doyOk));
 console.log('COPY_DE_MARKS',copy.de.marks);
 console.log('COPY_DE_PHYS_SNIP',copy.de.phys.slice(0,280));
 console.log('COPY_EN_MARKS',copy.en.marks);
 console.log('ORBITS',JSON.stringify(orbits));
 console.log('TODAY_LANGS',JSON.stringify(langsToday));
 console.log('FLAGS',JSON.stringify({multOk,copyOk,dePhysOk,deMarksOk,enPhysOk,enMarksOk,orbitOk,todayLangOk,todayJumpOk,errs:errs.length}));
 console.log('ERRS',JSON.stringify(errs));
 console.log('ALL_OK',allOk);
 await b.close();
 if(!allOk) process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
