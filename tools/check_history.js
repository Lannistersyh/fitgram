/* 历史图、年代、来源与今天的单品各自可追溯，避免把新款当作历史原物。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};vm.createContext(sandbox);
for(const f of ['history-data.js','catalog-data.js','world-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),sandbox);
const data=sandbox.window.FITGRAM_HISTORY,world=sandbox.window.FITGRAM_WORLD,items=sandbox.window.FITGRAM_CATALOG.items;
const source=['history-us-uk.json','history-fr-it.json'].flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'assets/research',f),'utf8'))).sort((a,b)=>a.year-b.year||a.countryId.localeCompare(b.countryId)||a.id.localeCompare(b.id));
assert.equal(data.verifiedAt,'2026-10-25');assert.equal(data.chapters.length,12);
assert.equal(new Set(data.chapters.map(c=>c.id)).size,data.chapters.length);
assert.equal(new Set(data.chapters.map(c=>c.image)).size,data.chapters.length);
assert.equal(new Set(data.chapters.map(c=>c.imageSha256)).size,data.chapters.length);
let refs=0;const linkedStyles=new Set(),linkedProducts=new Set(),imageKinds={};
for(const [index,c] of data.chapters.entries()){
 const canonical={...c};delete canonical.imageSha256;assert.deepEqual(JSON.parse(JSON.stringify(canonical)),source[index]);
 assert(world.countries.some(x=>x.id===c.countryId));assert(c.id.startsWith('history-'+c.countryId+'-'));
 for(const key of ['title','period','summary','story','today','imageAlt','imageDate','credit','rights','notes'])assert(typeof c[key]==='string'&&c[key].trim(),c.id+' 缺少 '+key);
 assert(Number.isInteger(c.year)&&Number.isInteger(c.endYear)&&c.year<=c.endYear&&c.year>=1800&&c.endYear<=2026);
 assert(['archive-photo','museum-object','brand-archive'].includes(c.imageKind));imageKinds[c.imageKind]=(imageKinds[c.imageKind]||0)+1;
 assert.equal(c.signatures.length,3);assert(c.signatures.every(t=>typeof t==='string'&&t.length>3));
 assert(c.styleIds.length>0&&new Set(c.styleIds).size===c.styleIds.length);
 for(const id of c.styleIds){const s=world.styles.find(s=>s.id===id);assert(s&&s.countryId===c.countryId,c.id+' 风格对应错误 '+id);linkedStyles.add(id);}
 assert.equal(c.productIds.length,3);assert.equal(new Set(c.productIds).size,3);
 for(const id of c.productIds){assert(items.some(p=>p.id===id),c.id+' 商品不存在 '+id);assert(c.productNotes&&typeof c.productNotes[id]==='string'&&c.productNotes[id].length>15,c.id+' 缺少逐件关联理由 '+id);linkedProducts.add(id);}
 assert(/^assets\/history\/[a-z0-9-]+\.jpg$/.test(c.image));const b=fs.readFileSync(path.join(root,c.image));assert(b[0]===255&&b[1]===216&&b[2]===255);assert(b.length>5000&&b.length<1500000);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),c.imageSha256);
 assert(c.sources.length>=2);assert.equal(new Set(c.sources.map(s=>s.url)).size,c.sources.length);
 for(const ref of c.sources){assert(ref.label&&ref.supports);assert.equal(new URL(ref.url).protocol,'https:');refs++;}
 for(const key of ['imageSource','imageUrl'])assert.equal(new URL(c[key]).protocol,'https:');
 assert(c.sources.some(s=>s.url===c.imageSource),'照片出处必须同时列入来源 '+c.id);
}
for(const c of world.countries)assert.equal(data.chapters.filter(x=>x.countryId===c.id).length,3);
for(const s of world.styles)assert(linkedStyles.has(s.id),'尚未关联历史章节 '+s.id);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of ['js/history-data.js','js/history.js','css/history.css'])assert(html.includes(f));
assert(html.indexOf('js/history.js')<html.indexOf('js/router.js'));
console.log(JSON.stringify({passed:true,chapters:data.chapters.length,countries:4,imageKinds,styleLinks:linkedStyles.size,productLinks:linkedProducts.size,sources:refs},null,2));
