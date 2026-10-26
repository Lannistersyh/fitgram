/* 皮包按主体材质、实际型号、原币种与共享收藏组织，避免皮饰边混入。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};vm.createContext(sandbox);
for(const f of ['catalog-data.js','world-data.js','leather-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8'),sandbox);
const data=sandbox.window.FITGRAM_LEATHER,catalog=sandbox.window.FITGRAM_CATALOG,world=sandbox.window.FITGRAM_WORLD;
const source=['everyday','luxury'].flatMap(t=>JSON.parse(fs.readFileSync(path.join(root,'assets/research/leather-bags-'+t+'.json'),'utf8')));
const extraFile=path.join(root,'assets/research/coach-brand-leather.json'),extras=fs.existsSync(extraFile)?JSON.parse(fs.readFileSync(extraFile,'utf8')):[];source.push(...extras);
assert.equal(data.selectedIds.length,20+extras.length);assert.equal(new Set(data.selectedIds).size,source.length);assert.equal(data.verifiedAt,source.map(p=>p.verifiedAt).sort().at(-1));
assert.deepEqual([...data.selectedIds],source.map(p=>p.id));
assert.equal(JSON.stringify(catalog.items.filter(p=>p.collection==='leather')),JSON.stringify(source));
const types=['crossbody','shoulder','tote','satchel','briefcase','duffel','backpack','tophandle'],leathers=['smooth','grained','suede','woven'];
const hashes=new Set(),shapes=new Set(),styleLinks=new Set();let wear=0;
for(const p of source){
 assert.equal(p.category,'bags');assert(/^2026-10-\d\d$/.test(p.verifiedAt));assert(p.verifiedAt<=data.verifiedAt);assert.equal(p.bodyLeatherVerified,true,'需要逐件核对主体真皮：'+p.id);
 assert(p.material&&p.materialEvidence.text&&p.materialEvidence.url);assert.equal(new URL(p.materialEvidence.url).protocol,'https:');
 assert(types.includes(p.bagType));assert(leathers.includes(p.leatherFamily));shapes.add(p.bagType);
 assert(p.dimensions&&p.dimensions.text&&new URL(p.dimensions.sourceUrl).protocol==='https:');
 assert(p.capacityNote&&p.capacityNote.length>8);assert(Array.isArray(p.carryModes)&&p.carryModes.length>0);
 assert(p.carryModes.every(x=>['手提','单肩','斜挎','双肩'].includes(x)));
 assert(typeof p.catalogAvailable==='boolean');assert(p.styleIds.length>=2);
 assert(p.sourceEvidence.productPage===p.productUrl&&p.sourceEvidence.imagePage);
 assert(['brand-official','official-brand','retailer-product'].includes(p.sourceType));
 assert(p.price===null||(Number.isFinite(p.price)&&p.price>0&&/^[A-Z]{3}$/.test(p.currency)),'已记录价格必须明确原币种；缺价保留null：'+p.id);
 for(const id of p.styleIds){assert(world.styles.some(s=>s.id===id),'无此风格：'+id);styleLinks.add(id);}
 for(const key of ['image','wearImage'])if(p[key]){
  const b=fs.readFileSync(path.join(root,p[key]));assert(b.length>2000&&b[0]===255&&b[1]===216);
  const hash=crypto.createHash('sha256').update(b).digest('hex');assert(!hashes.has(hash),'主图/上身图或型号复用了同一图：'+p.id);hashes.add(hash);
  assert(new URL(p[key==='image'?'imageSource':'wearImageSource']).protocol==='https:');if(key==='wearImage')wear++;
 }
}
for(const tier of ['everyday','luxury'])assert.equal(source.filter(p=>p.bagTier===tier).length,10+extras.filter(p=>p.bagTier===tier).length);
assert(shapes.size>=4,'需要明显不同的包型');assert(data.guides.length>=3&&data.pairings.length>=4);
for(const x of data.guides)assert(x.id&&x.title&&x.text);
for(const x of data.pairings){assert(x.title&&x.note);assert(world.styles.some(s=>s.id===x.styleId));assert.equal(x.bagIds.length,2);assert(x.bagIds.every(id=>data.selectedIds.includes(id)));assert.deepEqual(x.bagIds.map(id=>source.find(p=>p.id===id).bagTier).sort(),['everyday','luxury']);}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of ['js/leather-data.js','js/leather.js','css/leather.css'])assert(html.includes(f));
assert(html.indexOf('js/leather.js')<html.indexOf('js/router.js'));
for(const b of data.brandCollections||[]){
 assert(b.id&&b.name&&b.title&&b.intro);assert(b.productIds.length>=4);assert.equal(new Set(b.productIds).size,b.productIds.length);assert(b.sources.length>=2);
 const picks=b.productIds.map(id=>catalog.items.find(p=>p.id===id));assert(picks.every(p=>p&&p.brand.toLowerCase()===b.name.toLowerCase()));
 for(const p of picks)if(!p.bodyLeatherVerified){assert(!data.selectedIds.includes(p.id),'非真皮主体不能混入真皮专题');assert.equal(p.collection,'brand');assert.equal(p.leatherFamily,'coated-canvas');assert(p.material.includes('涂层帆布'));}
 for(const ref of b.sources)assert(ref.title&&ref.note&&new URL(ref.url).protocol==='https:');
}
console.log(JSON.stringify({passed:true,bags:source.length,everyday:source.filter(p=>p.bagTier==='everyday').length,luxury:source.filter(p=>p.bagTier==='luxury').length,brandCollections:(data.brandCollections||[]).map(b=>({name:b.name,items:b.productIds.length})),bagTypes:[...shapes],wornImages:wear,localImages:hashes.size,linkedStyles:styleLinks.size,pairings:data.pairings.length,totalCatalog:catalog.items.length},null,2));
