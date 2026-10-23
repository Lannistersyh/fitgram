/* 世界衣橱：每国三种差异明确的风格，每套七类真实商品和可追溯资料。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};vm.createContext(sandbox);
for(const f of ['catalog-data.js','world-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),sandbox);
const data=sandbox.window.FITGRAM_WORLD,items=sandbox.window.FITGRAM_CATALOG.items;
const types={bag:['bags'],shoes:['shoes'],top:['shirts','tops'],outerwear:['outerwear'],pants:['pants'],jewelry:['jewelry'],accessory:['accessories']};
assert.deepEqual([...data.countries.map(c=>c.id)],['us','uk','fr','it']);assert.equal(data.styles.length,12);
assert.equal(new Set(data.styles.map(s=>s.id)).size,12);
let links=0,sourceCount=0;const referenced=new Set(),domains=new Set();
for(const c of data.countries){
 const styles=data.styles.filter(s=>s.countryId===c.id);assert.equal(styles.length,3);
 assert.equal(new Set(styles.map(s=>s.slots.find(x=>x.slot==='outerwear').itemId)).size,3,'三套外套必须有明确区别：'+c.id);
 for(const s of styles){
  for(const key of ['name','english','summary','silhouette','avoid','styling'])assert(typeof s[key]==='string'&&s[key].trim(),'缺少风格说明：'+s.id+' '+key);
  assert(s.id.startsWith(c.id+'-'));assert(s.palette.length>=3);assert(s.signatures.length>=3);
  assert.equal(s.slots.length,7);assert.deepEqual([...s.slots.map(x=>x.slot)].sort(),Object.keys(types).sort());
  assert.equal(new Set(s.slots.map(x=>x.itemId)).size,7);
  for(const pick of s.slots){const p=items.find(p=>p.id===pick.itemId);assert(p,'没有此商品：'+s.id+' '+pick.itemId);assert(types[pick.slot].includes(p.category),'品类不符：'+s.id+' '+pick.slot);assert(pick.why&&pick.why.length>8);referenced.add(p.id);links++;}
  assert(s.sources.length>=2);
  for(const ref of s.sources){const url=new URL(ref.url);assert.equal(url.protocol,'https:');assert(ref.title&&ref.note);domains.add(url.hostname);sourceCount++;}
 }
 // 每国三套的衣、外套、裤、鞋至少三项不同，靠轮廓和单品共同区分。
 for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){
  let different=0;for(const slot of ['top','outerwear','pants','shoes'])if(styles[a].slots.find(x=>x.slot===slot).itemId!==styles[b].slots.find(x=>x.slot===slot).itemId)different++;
  assert(different>=3,'两种风格差异不足：'+styles[a].id+' '+styles[b].id);
 }
}
for(const p of items.filter(p=>p.collection==='world')){
 assert(referenced.has(p.id),'未进入风格的新增商品：'+p.id);
 assert.equal(p.verifiedAt,'2026-10-23');assert.equal(p.mainlandStatus,'unverified');assert.equal(p.purchaseMode,'international-reference');
 assert(p.material||p.upperMaterial,'需要材质依据或明确未取得：'+p.id);
 assert(p.sourceEvidence&&p.materialEvidence&&p.materialEvidence.text);
 assert.equal(new URL(p.materialEvidence.url).protocol,'https:');
 if(p.materialEvidence.url!==p.productUrl)assert.equal(p.sourceEvidence.catalogPage,p.materialEvidence.url,'系列页补证需明示来源：'+p.id);assert.equal(p.sourceEvidence.productPage,p.productUrl);
 if(p.imageKind==='worn')assert(/上身|真人/.test(p.imageType));
}
console.log(JSON.stringify({passed:true,countries:data.countries.length,styles:data.styles.length,slots:links,uniqueReferencedProducts:referenced.size,newProducts:items.filter(p=>p.collection==='world').length,evidenceLinks:sourceCount,evidenceDomains:[...domains]},null,2));
