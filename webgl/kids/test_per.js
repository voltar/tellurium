const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:800,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready');
for(const ex of [false,true]){
const r=await p.evaluate((ex)=>{tell.pause&&tell.pause();const c=document.getElementById('ecc');c.checked=ex;c.onchange({target:c});
 const S=__sim,dt=0.01,N=Math.round(365.256*3/dt);let ea=S.ea(),ma=S.ma(),E=0,M=0;const mo=[],ph=[];let lastP=S.el(),t=0;
 const wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
 let earthAtMoon=null;
 for(let i=0;i<N;i++){S.adv(dt);t+=dt;const a=S.ea(),m=S.ma();E+=wrap(a-ea);M+=wrap(m-ma);ea=a;ma=m;
  if(earthAtMoon===null&&Math.abs(M)>=2*Math.PI){earthAtMoon=[t,E/(2*Math.PI)]}
  const pi=S.el();if(pi===4&&lastP===3)ph.push(t);lastP=pi}
 const syn=ph.length>1?(ph[ph.length-1]-ph[0])/(ph.length-1):null;
 return {days:t,earthRot:E/(2*Math.PI),moonRev:M/(2*Math.PI),sidDay:t/(E/(2*Math.PI)),moonSid:t/(M/(2*Math.PI)),earthRotPerMoonOrbit:earthAtMoon,synodic:syn,rotPerYear:E/(2*Math.PI)/3}},ex);
console.log('exaggerated='+ex,JSON.stringify(r));}
console.log(errs);await b.close()})();
