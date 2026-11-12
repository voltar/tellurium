const {chromium}=require('playwright');
const {mkdirSync}=require('fs');
(async()=>{
 mkdirSync('screens_opt5',{recursive:true});
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox','--disable-dev-shm-usage']});

 // desktop normal
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause()});
  await p.waitForTimeout(800);
  await p.screenshot({path:'screens_opt5/desktop_de.png',fullPage:false});
  console.log('desktop_de',errs);
  // details
  await p.evaluate(()=>{document.getElementById('gross').open=true;document.getElementById('gross').scrollIntoView()});
  await p.waitForTimeout(200);
  const det=await p.$('#gross');
  await det.screenshot({path:'screens_opt5/desktop_de_details.png'});
  console.log('desktop_de_details');
  await p.close();
 }

 // desktop fullscreen
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause();return tell.enterFs('pseudo')});
  await p.waitForTimeout(700);
  await p.screenshot({path:'screens_opt5/desktop_fs.png',fullPage:false});
  console.log('desktop_fs');
  await p.close();
 }

 // tablet
 {
  const p=await b.newPage({viewport:{width:768,height:1024},hasTouch:true});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{tell.setLang('de');tell.pause()});
  await p.waitForTimeout(800);
  await p.screenshot({path:'screens_opt5/tablet_768x1024_de.png',fullPage:false});
  console.log('tablet');
  await p.close();
 }

 // earth lighting close crop
 {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('file://'+__dirname+'/tellurium_einfach.html');
  await p.waitForFunction('window.__ready',null,{timeout:60000});
  await p.evaluate(()=>{
    tell.setLang('de');
    tell.setDoy(80.35); // 21/22 Mar, late morning-ish for terminator
    tell.scene('tag');
    tell.pause();
  });
  await p.waitForTimeout(1600);
  const box=await p.evaluate(()=>{
    const earth=tell.camera; // use project
    // access mesh via camera/scene is hard; project from tell
    return null;
  });
  // screenshot the view then crop around canvas center-left (earth in tag scene)
  await p.locator('#view').screenshot({path:'screens_opt5/earth_view.png'});
  // Also compute earth screen position
  const pos=await p.evaluate(()=>{
    const cam=tell.camera;
    const THREE=null;
    const w=document.getElementById('view').getBoundingClientRect();
    // earth world pos
    const v=new (cam.position.constructor)(); // Vector3
    // tell doesn't expose earth. Use a dummy: render and find later
    const earthW=(()=>{try{
      // walk? not available
      return null;
    }catch(e){return null}})();
    return {vw:w.width,vh:w.height};
  });
  console.log('earth view',pos);
  await p.close();
 }
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
