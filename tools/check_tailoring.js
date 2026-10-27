/* 西装款式课：不重复旧单品、真实图像、两类混合款与搭配引用核验。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.createContext(sandbox);
for(const name of ['catalog-data.js','tailoring-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),sandbox);
const all=sandbox.window.FITGRAM_CATALOG.items,data=sandbox.window.FITGRAM_TAILORING;
const source=JSON.parse(fs.readFileSync(path.join(root,'assets/research/blazer-products.json'),'utf8'));
const lessons=JSON.parse(fs.readFileSync(path.join(root,'assets/research/blazer-lessons.json'),'utf8'));
assert.equal(source.length,8);assert.equal(data.lessons.length,10);assert.equal(new Set(data.productIds).size,10);
assert.equal(JSON.stringify(data.lessons),JSON.stringify(lessons.lessons));
assert.equal(JSON.stringify(all.filter(p=>p.collection==='tailoring')),JSON.stringify(source));
assert.equal(data.lessons.filter(l=>l.group==='hybrid').length,2);
assert.equal(new Set(data.lessons.map(l=>l.lapel)).size,3);
assert.equal(data.readingSteps.length,3);assert.equal(data.pairs.length,3);
const product=id=>all.find(p=>p.id===id),hashes=new Set();
function jpegSize(b){
 assert(b[0]===255&&b[1]===216,'必须为JPEG');let pos=2;
 while(pos<b.length){assert.equal(b[pos],255);const marker=b[pos+1];pos+=2;if(marker===216||marker===217)continue;const len=b.readUInt16BE(pos);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return [b.readUInt16BE(pos+3),b.readUInt16BE(pos+5)];pos+=len;}
 throw Error('JPEG缺少尺寸');
}
for(const p of source){
 assert.equal(p.category,'outerwear');assert.equal(p.collection,'tailoring');assert.equal(p.mainlandStatus,'unverified');assert.equal(p.verifiedAt,'2026-10-27');
 assert(Number.isFinite(p.price)&&p.price>0);assert(['USD','EUR','GBP','KRW'].includes(p.currency));
 assert.equal(p.materialEvidence.url,p.productUrl);assert.equal(p.sourceEvidence.productPage,p.productUrl);assert.equal(p.sourceEvidence.imagePage,p.productUrl);
 assert.equal(p.sourceType,'official-brand');assert.equal(p.imageKind,'packshot');assert(p.material.length>10);assert(!p.artistExactMatch);
 for(const key of ['image','wearImage']){
  assert(p[key]&&p[key].startsWith('assets/catalog/outerwear/'));
  const b=fs.readFileSync(path.join(root,p[key]));assert(b.length>2000);assert(Math.max(...jpegSize(b))<=1000,'图像最长边不超过1000px');
  const hash=crypto.createHash('sha256').update(b).digest('hex');assert(!hashes.has(hash),'不同视图不能复用同一张图');hashes.add(hash);
  assert(new URL(p[key+'Source']).protocol==='https:');
 }
}
for(const l of data.lessons){
 assert(/^[a-z-]+$/.test(l.id));const p=product(l.productId);assert(p&&p.category==='outerwear');
 assert(['notch','peak','shawl'].includes(l.lapel));assert(['single','double','hidden'].includes(l.closure));
 assert(l.seasons.length&&l.seasons.every(s=>['spring','summer','autumn','winter'].includes(s)));
 assert(l.points.length===3&&l.points.every(s=>s.length>12));
 assert(l.pairingIds.length&&l.pairingIds.every(id=>['pants','shoes'].includes(product(id)?.category)));
 assert.equal(p.outerwearType,l.group==='hybrid'?'tailored-hybrid':'blazer');
 for(const key of ['focus','shoulder','length','pockets','fabric','tryIt'])assert(typeof l[key]==='string'&&l[key].trim());
}
for(const pair of data.pairs){assert(pair.left!==pair.right);assert(data.lessons.some(l=>l.id===pair.left));assert(data.lessons.some(l=>l.id===pair.right));}
for(const id of ['world-uk-commodore','world-it-luca-blazer'])assert.equal(product(id).verifiedAt,'2026-10-23','旧商品核验日期保留');
assert(product('blazer-havana-double').sourceCaveat.includes('不一致')||product('blazer-havana-double').fitNote.includes('不一致'));
assert.equal(product('blazer-tonywack-cropped').outerwearType,'tailored-hybrid');
assert.equal(product('blazer-milano-dinner').material.includes('98%'),true);
console.log(JSON.stringify({passed:true,newProducts:source.length,lessons:data.lessons.length,existingProducts:2,hybrids:2,brands:new Set(data.productIds.map(id=>product(id).brand)).size,images:hashes.size,wornImages:source.filter(p=>p.wearImage).length,lapels:3,catalogTotal:all.length},null,2));
