import fs from 'fs';
import { execSync } from 'child_process';

const PAGES = ['','about.html','products.html','factory.html','blog.html','news.html','materials.html','finishes.html','industries.html','faq.html','samples.html','thank-you.html','contact.html'];

function strip(html){
  // 去掉 <head> 里一切，只留 body，再剥掉所有标签、脚本、样式，取纯文本
  let b = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i)||[,''])[1];
  b = b.replace(/<script[\s\S]*?<\/script>/gi,' ')
       .replace(/<style[\s\S]*?<\/style>/gi,' ')
       .replace(/<[^>]+>/g,' ')
       .replace(/&amp;/g,'&').replace(/&#\d+;/g,' ').replace(/&nbsp;/g,' ')
       .replace(/\s+/g,' ').trim();
  return b;
}

for(const p of PAGES){
  const url = 'https://www.bestpackfactory.com/' + p;      // '/' = home
  const localPath = p ? `.next/server/app/${p}.html` : '.next/server/app/index.html';
  let local='', live='';
  try { local = fs.readFileSync(localPath,'utf8'); } catch(e){ console.log(`${p.padEnd(18)} 本地缺产物`); continue; }
  try {
    live = execSync(`curl -sS -L --max-time 30 -A "Mozilla/5.0" "${url}"`).toString();
  } catch(e) { console.log(`${p.padEnd(18)} 线上抓取失败`); continue; }
  const ls=strip(local), vs=strip(live);
  // 粗略：完全一致
  if (ls===vs) { console.log(`${p.padEnd(18)} 一致`); continue; }
  // 长度差异 + 关键词差异采样
  const la=ls.length, va=vs.length;
  console.log(`${p.padEnd(18)} 长度差异 local=${la} live=${va} 差=${va-la}`);
}
