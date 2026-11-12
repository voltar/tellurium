const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const urls=[];
p.on('response',async r=>{const u=r.url();urls.push(r.request().method()+' '+u);if(/\.js(\?|$)/.test(u)&&u.includes('grok.me')){try{require('fs').writeFileSync('js_'+u.split('/').pop().split('?')[0],await r.body())}catch(e){}}});
await p.goto('https://bamboo-clear-vivid-king.grok.me/',{waitUntil:'networkidle'});await p.waitForTimeout(3000);console.log(urls.join('\n'));await b.close()})();
