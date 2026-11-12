const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const run=async(name,vp,mob,locale,steps)=>{const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,locale});const p=await ctx.newPage();const errs=[];
 p.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.text())});p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.goto('file://'+__dirname+'/tellurium_einfach.html');await p.waitForFunction('window.__ready',null,{timeout:60000});await p.waitForTimeout(1500);
 for(const [f,js,full] of steps){await p.evaluate(js);await p.waitForTimeout(2000);await p.evaluate(()=>tell.pause());await p.screenshot({path:'screens_i18n/'+name+'_'+f+'.png',fullPage:!!full})}
 console.log(name,'lang=',await p.evaluate(()=>document.documentElement.lang),'errors:',errs);await ctx.close()};
await run('desk_de',{width:1280,height:900},false,'de-CH',[['start','0',true],['schweiz',"tell.scene('ch')"]]);
await run('desk_en_japan',{width:1280,height:900},false,'en-US',[['start',"tell.setCountry('JP')",true],['japan',"tell.scene('ch')"],['tag',"tell.scene('tag')"]]);
await run('mob_fr_brasil',{width:390,height:844},true,'fr-FR',[['start',"tell.setCountry('BR')",true],['bresil',"tell.scene('ch')"]]);
await run('mob_ar',{width:390,height:844},true,'ar',[['start','0',true]]);
await run('desk_zh',{width:1280,height:900},false,'zh-CN',[['mond',"tell.scene('mond')"]]);
await b.close()})();
