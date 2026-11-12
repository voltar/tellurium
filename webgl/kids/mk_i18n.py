import re
t=open('einfach_template.html').read()
i18n=open('i18n.js').read()
def R(a,b):
  global t
  assert a in t,a[:60];t=t.replace(a,b)
R("setE(0.2);setDoy(80);camera.position.set(0,9,7.2);controls.update();say(TXT.start);","mkSunLab();setE(0.2);setDoy(80);applyLang();camera.position.set(0,9,7.2);controls.update();say(TXT.start);")
R('<h1>Die Erde und die Sonne</h1>','<div class="top"><h1 id="title"></h1><select id="lang" aria-label="Language"></select></div>')
R('<p class="intro">Die Sonne steht in der Mitte. Die Erde kreist in einem Jahr einmal um sie. Der Mond kreist um die Erde.</p>','<p class="intro" id="intro"></p>')
R('<div id="hint">Ziehen: drehen · Mausrad oder zwei Finger: zoomen</div>','<div id="hint"></div>')
R('<button data-s="tag">Tag und Nacht</button>\n<button data-s="jahr">Jahreszeiten</button>\n<button data-s="mond">Mond</button>\n<button data-s="ch">Schweiz</button>','<button data-s="tag" id="b_tag"></button>\n<button data-s="jahr" id="b_jahr"></button>\n<button data-s="mond" id="b_mond"></button>\n<button data-s="ch" id="b_ch"></button>')
R('<div class="lbl">Mondphase</div>','<div class="lbl" id="l_phase"></div>')
R('<div class="lbl" style="margin-bottom:8px">Datum wählen</div>','<div class="lbl" style="margin-bottom:8px" id="l_pick"></div>')
R('<button id="bgo" class="on">Anzeigen</button></div></div>','<button id="bgo" class="on"></button></div></div>\n<div class="card"><label class="lbl" for="country" id="l_country" style="display:block;margin-bottom:8px"></label><select id="country" style="width:100%"></select></div>')
R('<button id="home" style="margin-top:12px;width:100%">Übersicht</button>','<button id="home" style="margin-top:12px;width:100%"></button>')
a=t.index('<summary>Details</summary>');b=t.index('</details>')
t=t[:a]+'''<summary id="l_details"></summary>
<p id="phys"></p>
<b id="l_xdate"></b>: <span id="xdate"></span><br><b id="l_dist"></b>: <span id="dist"></span><br><b id="l_vel"></b>: <span id="vel"></span><br><b id="l_illum"></b>: <span id="illum"></span>
<label><span id="l_ecc"></span>: <span id="ev"></span><input id="ecc" type="range" min="0.0167" max="0.3" step="0.0001" value="0.2"></label>
<label><span id="l_speed"></span>: <span id="spv"></span> <span id="l_dps"></span><input id="speed" type="range" min="1" max="60" step="1" value="12"></label>
<label><input type="checkbox" id="marks"> <span id="l_marks"></span></label>
<label><input type="checkbox" id="realspin"> <span id="l_realspin"></span></label>
'''+t[b:]
R('.intro{','.top{display:flex;justify-content:space-between;align-items:center;gap:10px}#lang{min-height:44px;border-radius:99px;padding:4px 14px;flex:none}\n.intro{')
R("const MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];\nconst MS=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];",
i18n+'''
const LS=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(_){}};
let lang=LS('tell_lang')||(()=>{const b=(navigator.language||'de').slice(0,2);return L[b]?b:'en'})();if(!L[lang])lang='de';
let cc=LS('tell_cc');if(!CC[cc])cc='CH';
let T=L[lang],MON=[],MS=[];
const fmtD=(dd,m)=>new Intl.DateTimeFormat(lang,{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,m,dd)));
const cname=()=>{try{return new Intl.DisplayNames([lang],{type:'region'}).of(cc)}catch(_){return cc}};
const fill=(s,o)=>s.replace(/\\{(\\w)\\}/g,(_,k)=>o[k]);
const nf=(v,d)=>v.toLocaleString(lang,{minimumFractionDigits:d,maximumFractionDigits:d});''')
R("const SE=m=>m==11||m<2?['','Winter']:m<5?['','Frühling']:m<8?['','Sommer']:['','Herbst'];",
"const SE=m=>{const s=m==11||m<2?0:m<5?1:m<8?2:3;return ['',T.seasons[CC[cc][0]<0?(s+2)%4:s]]};")
a=t.index("let pin;{const la=46.8");b=t.index("earth.add(pin)}",a)+len("earth.add(pin)}")
t=t[:a]+'''let pin=new THREE.Group();{const needle=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.24,6),new THREE.MeshStandardMaterial({color:0xdddddd,metalness:.9,roughness:.2}));needle.position.y=0.12;pin.add(needle);
 const head=new THREE.Mesh(new THREE.SphereGeometry(0.045,16,8),new THREE.MeshStandardMaterial({color:0xff2020,roughness:.4,emissive:0x600000}));head.position.y=0.24;pin.add(head);earth.add(pin)}
function placePin(){const la=CC[cc][0]*Math.PI/180,lo=CC[cc][1]*Math.PI/180;const n=new THREE.Vector3(Math.cos(la)*Math.cos(lo),Math.sin(la),-Math.cos(la)*Math.sin(lo));
 pin.position.copy(n.clone().multiplyScalar(RE*0.98));pin.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n)}
placePin();'''+t[b:]
R("const PH=['Neumond','Zunehmende Sichel','Erstes Viertel','Zunehmender Mond','Vollmond','Abnehmender Mond','Letztes Viertel','Abnehmende Sichel'].map(n=>[n,n]);","let phIdx=0;")
R("let curDoy=2.5,lastMonth=-1,curPhase=PH[0];","let curDoy=2.5,lastMonth=-1;")
R("$('datum').textContent=`${dd}. ${MON[m]}`;","$('datum').textContent=fmtD(dd,m);")
R("$('xdate').textContent=`${dd}. ${MON[m]} ${","$('xdate').textContent=`${fmtD(dd,m)} ${")
R("$('dist').textContent=(rr/1e6).toFixed(2).replace('.',',')+' Mio. km';$('vel').textContent=v.toFixed(2).replace('.',',')+' km/s';","$('dist').textContent=nf(rr/1e6,2)+' '+T.mkm;$('vel').textContent=nf(v,2)+' km/s';")
R("curPhase=PH[Math.floor(mod(elong/(2*Math.PI)*8+0.5,8))];$('moonIcon').innerHTML=moonSVG(elong);$('moonName').textContent=curPhase[1];","phIdx=Math.floor(mod(elong/(2*Math.PI)*8+0.5,8));$('moonIcon').innerHTML=moonSVG(elong);$('moonName').textContent=T.phases[phIdx];")
a=t.index("const TXT={");b=t.index("function say(t)")
t=t[:a]+"let curMsg=['t_start'];const msg=()=>{const [k,o]=curMsg;return fill(T[k],Object.assign({c:cname()},o?o():{}))};\n"+t[b:]
R("function say(t){$('say').textContent=t}","function say(k,o){curMsg=[k,o];$('say').textContent=msg()}")
R("function setPlay(p){playing=p;$('play').textContent=p?'Pause':'Abspielen'}","function setPlay(p){playing=p;$('play').textContent=p?T.pause:T.play}")
t=re.sub(r"say\(TXT\.(\w+)\)",lambda m:"say('t_"+m.group(1)+"')",t)
R("setDoy(Math.floor(curDoy)+(12-8.2/15)/24)","setDoy(Math.floor(curDoy)+mod(12-CC[cc][1]/15,24)/24)")
R("MS.forEach((n,i)=>{const b=document.createElement('button');b.textContent=n;b.setAttribute('aria-label',MON[i]);\n b.onclick=()=>{let d=0;for(let k=0;k<i;k++)d+=ML[k];setDoy(d+14.5);const s=SE(i);say(`${MON[i]}: ${s[1]} auf der Nordhalbkugel.`)};$('months').appendChild(b)});",
"for(let i=0;i<12;i++){const b=document.createElement('button');\n b.onclick=()=>{let d=0;for(let k=0;k<i;k++)d+=ML[k];setDoy(d+14.5);say('t_month',()=>({m:MON[i],s:SE(i)[1]}))};$('months').appendChild(b)}")
R("for(let i=1;i<=31;i++)$('bday').add(new Option(i+'.',i));MON.forEach((n,i)=>$('bmon').add(new Option(n,i)));","for(let i=1;i<=31;i++)$('bday').add(new Option(String(i),i));for(let i=0;i<12;i++)$('bmon').add(new Option('',i));")
R("say(`Stellung der Erde am ${dd}. ${MON[m]}.`)","say('t_date',()=>({d:fmtD(dd,m)}))")
R("$('ev').textContent=e.toFixed(4).replace('.',',');","$('ev').textContent=nf(e,4);")
R("const sunLab=label('Sonne','#ffd070',2.4,0.6);sunLab.position.set(0,0,1.3);ecl.add(sunLab);","let sunLab=null;function mkSunLab(){if(sunLab)ecl.remove(sunLab);sunLab=label(T.sun,'#ffd070',2.4,0.6);sunLab.position.set(0,0,1.3);ecl.add(sunLab)}")
R("[[0,'Perihel'],[Math.PI,'Aphel'],[Math.PI/2-LP,'Wintersonnenwende'],[1.5*Math.PI-LP,'Sommersonnenwende']].forEach(([nu,t])=>","[[0,T.mk[0]],[Math.PI,T.mk[1]],[Math.PI/2-LP,T.mk[2]],[1.5*Math.PI-LP,T.mk[3]]].forEach(([nu,t])=>")
R("window.tell={","""function applyLang(){T=L[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 MON=[...Array(12)].map((_,i)=>new Intl.DateTimeFormat(lang,{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,15))));
 MS=[...Array(12)].map((_,i)=>new Intl.DateTimeFormat(lang,{month:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2026,i,15))).replace(/\\.$/,''));
 document.title=T.title;$('title').textContent=T.title;['intro','hint'].forEach(k=>$(k).textContent=T[k]);
 $('b_tag').textContent=T.tag;$('b_jahr').textContent=T.jahr;$('b_mond').textContent=T.mond;$('b_ch').textContent=cname();
 $('l_phase').textContent=T.phase;$('l_pick').textContent=T.pick;$('bgo').textContent=T.show;$('home').textContent=T.over;$('l_country').textContent=T.country;
 ['details','xdate','dist','vel','illum','ecc','speed','dps','marks','realspin'].forEach(k=>$('l_'+k).textContent=T[k]);$('phys').textContent=fill(T.phys,{c:cname()});
 document.querySelectorAll('#months button').forEach((b,i)=>{b.textContent=MS[i];b.setAttribute('aria-label',MON[i])});
 [...$('bmon').options].forEach((o,i)=>o.textContent=MON[i]);
 const dn=new Intl.DisplayNames([lang],{type:'region'});const sel=$('country');sel.innerHTML='';
 Object.keys(CC).map(c=>[c,dn.of(c)]).sort((a,b)=>a[1].localeCompare(b[1],lang)).forEach(([c,n])=>sel.add(new Option(n,c)));sel.value=cc;
 setPlay(playing);mkSunLab();if(ring)setE(e);else update();$('say').textContent=msg()}
Object.entries(L).forEach(([k,v])=>$('lang').add(new Option(v.n,k)));$('lang').value=lang;
$('lang').onchange=ev=>{lang=ev.target.value;LS('tell_lang',lang);applyLang()};
$('country').onchange=ev=>{cc=ev.target.value;LS('tell_cc',cc);placePin();applyLang();if(document.querySelector('#scenes button.on')?.dataset.s==='ch')scene_('ch')};
window.tell={setLang:l=>{$('lang').value=l;$('lang').onchange({target:$('lang')})},setCountry:c=>{$('country').value=c;$('country').onchange({target:$('country')})},""")
assert 'TXT' not in t
open('einfach_template.html','w').write(t)
