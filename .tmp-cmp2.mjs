import fs from 'fs';
import { execSync } from 'child_process';
import crypto from 'crypto';

function bodyText(html){
  let b = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)||[,''])[1];
  b = b.replace(/<script[\s\S]*?<\/script>/gi,' ')
       .replace(/<style[\s\S]*?<\/style>/gi,' ')
       .replace(/<!--[\s\S]*?-->/g,' ')
       .replace(/<[^>]+>/g,' ')
       .replace(/&amp;/g,'&').replace(/&#\d+;/g,' ').replace(/&nbsp;/g,' ')
       .replace(/\s+/g,' ').trim();
  return b;
}

const PAGES = ['','about.html','products.html','factory.html','blog.html','news.html','materials.html','finishes.html','industries.html','faq.html','samples.html','thank-you.html','case-studies.html','custom-packaging-manufacturer.html'];

for(const p of PAGES){
  const liveUrl='https://www.bestpackfactory.com/'+p;
  const localPath=p?`.next/server/app/${p}.html`:`next/server/app/index.html`;
  // 修正路径：index 在 server/app/index.html
  const lp = p?`.next/server/app/${p}.html`:`next/server/app/index.html`;
  try{
    const local=fs.readFileSync(lp,'utf8');
    const live=execSync(`curl -sS -L --max-time 30 -A "Mozilla/5.0" "${liveUrl}"`).toString();
    const lt=bodyText(local), vt=bodyText(live);
    // 字符级 LCS 近似：用 set-of-lines + token hash
    const h=o=>crypto.createHash('md5').update(o).digest('hex');
    if(lt===vt){ console.log(`${(p||'home').padEnd(30)} 完全一致  (len=${lt.length})`); continue; }
    // 找第一个不匹配的句子
    const lw=lt.split(/[.。]/).map(s=>s.trim()).filter(Boolean);
    const vw=vt.split(/[.。]/).map(s=>s.trim()).filter(Boolean);
    console.log(`${(p||'home').padEnd(30)} 差异! local_${lt.length} vs live_${vt.length}`);
    const set=new Set(lw);
    const onlyLive=vw.filter(w=>w&&!set.has(w)).slice(0,3);
    if(onlyLive.length){ console.log('     线上独有句子示例:'); onlyLive.forEach(w=>console.log('       - '+w.slice(0,120))); }
  }catch(e){ console.log(`${(p||'home').padEnd(30)} 出错: ${e.message}`); }
}
