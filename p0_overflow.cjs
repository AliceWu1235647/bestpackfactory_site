const { chromium } = require('E:/codex/npm-global/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'C:/Users/Administrator/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true});
  const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const p=await c.newPage();
  await p.goto('http://localhost:3000/products.html',{waitUntil:'load',timeout:60000});
  await p.waitForTimeout(1500);
  const st=await p.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    const offenders=[];
    document.querySelectorAll('*').forEach(e=>{
      const r=e.getBoundingClientRect();
      if(r.right>vw+1||r.left<-1){
        offenders.push({tag:e.tagName,cls:(e.className||'').toString().slice(0,50),left:Math.round(r.left),right:Math.round(r.right),w:Math.round(r.width),scrollW:e.scrollWidth});
      }
    });
    return {vw,count:offenders.length,offenders:offenders.slice(0,15)};
  });
  console.log('viewport',st.vw,'offenders',st.count);
  st.offenders.forEach(o=>console.log(' ',o.tag,o.cls,'L='+o.left,'R='+o.right,'W='+o.w));
  await b.close();
})();
