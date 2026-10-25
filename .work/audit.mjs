import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const base = 'http://localhost:3100';
const sitemapResponse = await fetch(base + '/sitemap.xml');
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const paths = [...new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname).concat(['/resources/case-studies','/resources/testimonials','/resources/faqs','/resources/knowledge-center']))];
const results=[]; const links=new Set();
for (let i=0;i<paths.length;i+=4) {
 await Promise.all(paths.slice(i,i+4).map(async path => {
  const start=performance.now(); const response=await fetch(base+path); const html=await response.text();
  const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  assert.equal(response.status,200,path); assert.equal((visible.match(/<h1\b/g)||[]).length,1,`${path}: H1`);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.ok(!visible.includes('\\n'),`${path}: escaped newline`);
  const title=html.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title,`${path}: title`);
  assert.ok((title.match(/identiVerse/g)||[]).length<=1,`${path}: duplicate brand`);
  for(const m of visible.matchAll(/href="(\/[^"#]*)"/g)) { const u=new URL(m[1].replaceAll('&amp;','&'),base); if(!u.pathname.startsWith('/_next/')) links.add(u.pathname); }
  results.push({path,status:response.status,bytes:Buffer.byteLength(html),ms:Math.round(performance.now()-start),cache:response.headers.get('cache-control'),title});
 }));
}
for(const path of links) { if(paths.includes(path)) continue; const r=await fetch(base+path);assert.equal(r.status,200,`linked route ${path}`); }
const sample=[];for(let i=0;i<5;i++){const start=performance.now();const r=await fetch(base+'/');await r.arrayBuffer();sample.push(Math.round(performance.now()-start));}
const report={date:'2026-10-25',routes:results.sort((a,b)=>a.path.localeCompare(b.path)),internalLinkedPaths:links.size,warmHomepageFullResponseMs:sample,notes:['Read-only GET requests only; no forms submitted.','Local server timings are not Lighthouse or Core Web Vitals measurements.','No browser available for viewport or screenshot QA.']};
await writeFile('.work/http-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passedRoutes:results.length,internalLinkedPaths:links.size,warmHomepageFullResponseMs:sample,representative:results.filter(r=>['/','/contact','/technologies/keycloak','/services/iam-development'].includes(r.path))},null,2));
