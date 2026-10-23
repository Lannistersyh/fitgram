/* 单品图鉴验收：检查来源、实际图片、型号唯一性与搭配引用。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'js/catalog-data.js'),'utf8'),sandbox);
const data=sandbox.window.FITGRAM_CATALOG,all=data.items,list=all.filter(p=>!p.collection),global=all.filter(p=>p.collection==='international'),categories=['shoes','pants','shirts'];
const allow=['adidas.com','adidas.com.cn','puma.com','converse.com','converse.co.jp','vans.com','vans.com.mx','newbalance.com','nike.com','nike.com.cn','drmartens.com','onitsukatiger.com','asics.com','levi.com','levi.com.sg','dickies.com','dickieslife.com','dickiesaustralia.com','carhartt-wip.com','gramicci.com','gramicci.co.uk','uniqlo.com','tonywack.com','iteshop.com','ralphlauren.cn','newbalance.com.cn','drmartens.com.cn','ourlegacy.com','nomaintenance.us','adieu-paris.com','allblues.se','entirestudios.com','asket.com','schottnyc.com','baggu.com','topodesigns.eu','tecovas.com','wrangler.com','stussy.com','neweracap.com','cambridgesatchel.com','barbour.com','crockettandjones.com','fredperry.jp','peterchristian.co.uk','fursac.com','bleu-de-chauffe.com','lacoste.ae','lucafaloni.com','cpcompany.com','scarosso.com','gilesandbrother.com','sergedenimes.com','allanjoseph.com','giovanniraspini.com','fila.co.uk','danner.com','patagonia.com','shelta.se','shelta.eu','topodesigns.com','allsaints.com','allsaints.jp'];
const hashes=new Set();
function https(s){return new URL(s).protocol==='https:';}
const additions=JSON.parse(fs.readFileSync(path.join(root,'assets/research/catalog-reference-additions.json'),'utf8'));
const worldFiles=['us','uk','fr','it'].map(c=>path.join(root,'assets/research/world-products-'+c+'.json'));
for(const c of ['us','uk','fr','it'])for(const stem of ['world-products-','world-jewelry-'])worldFiles.push(path.join(root,'assets/research/'+stem+c+'-extra.json'));
const worldItems=worldFiles.filter(f=>fs.existsSync(f)).flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
assert.equal(JSON.stringify(all.filter(p=>p.collection==='world')),JSON.stringify(worldItems));
assert.equal(all.length,54+additions.length+worldItems.length);assert.equal(new Set(all.map(p=>p.id)).size,all.length);assert.equal(new Set(all.map(p=>p.productUrl)).size,all.length);
assert.equal(JSON.stringify(all.filter(p=>p.collection==='reference')),JSON.stringify(additions));assert.equal(list.length,30);assert.equal(new Set(list.map(p=>p.id)).size,30);assert.equal(new Set(list.map(p=>p.productUrl)).size,30);
for(const c of categories){assert.equal(list.filter(p=>p.category===c).length,10);const source=JSON.parse(fs.readFileSync(path.join(root,'assets/research/catalog-'+c+'.json'),'utf8'));assert.equal(JSON.stringify(list.filter(p=>p.category===c)),JSON.stringify(source));}
for(const p of all){
  for(const key of ['id','brand','name','model','sku','color','image','imageSource','productUrl','market','verifiedAt','reason','styling','fitNote','availability'])assert(typeof p[key]==='string'&&p[key].trim(),'缺少 '+key+': '+p.id);
  assert(Array.isArray(p.tags)&&p.tags.length>=2);
  assert(https(p.productUrl)&&https(p.imageSource));
  const hostname=new URL(p.productUrl).hostname;assert(allow.some(host=>hostname===host||hostname.endsWith('.'+host)),'非已核实官方域名：'+hostname);
  assert(p.image.startsWith('assets/catalog/'+p.category+'/')&&!p.image.includes('..'));
  const bytes=fs.readFileSync(path.join(root,p.image));assert(bytes.length>2000,'图片为空或过小：'+p.id);
  assert(bytes[0]===255&&bytes[1]===216,'发布资源应为经解码检查的JPEG：'+p.id);
  const hash=crypto.createHash('sha256').update(bytes).digest('hex');assert(!hashes.has(hash),'不同型号复用了同一图片：'+p.id);hashes.add(hash);
  assert(p.price===null||(Number.isFinite(p.price)&&p.price>0));
  if(p.price!==null)assert(/^[A-Z]{3}$/.test(p.currency),'数值价格必须明确原币种：'+p.id);
  assert(!p.artistExactMatch,'搭配选品不能自动升级为艺人同款');
}
// 皮鞋以实际鞋面资料为准，且覆盖用户确认的两类方向。
const shoes=list.filter(p=>p.category==='shoes');
for(const p of shoes){assert(['derby','loafer','boots'].includes(p.shoeType));assert(p.upperMaterial&&/皮|leather/i.test(p.upperMaterial));assert(p.materialEvidence&&https(p.materialEvidence.url)&&p.materialEvidence.text);assert(!/跑鞋|帆布鞋|运动鞋|Sneaker/i.test(p.name+' '+p.model));}
assert.deepEqual(Object.fromEntries(['derby','loafer','boots'].map(type=>[type,shoes.filter(p=>p.shoeType===type).length])),{derby:2,loafer:4,boots:4});
assert.equal(global.length,24);
assert.equal(new Set(global.map(p=>p.editorialOrder)).size,24);
for(const category of ['shoes','shirts','outerwear','jewelry']){
  const records=global.filter(p=>p.category===category);assert.equal(records.length,6);
  assert.equal(JSON.stringify(records),JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'assets/research/catalog-international-'+category+'.json'),'utf8'))));
}
let wornImages=0;
for(const p of global){
  assert.equal(p.mainlandStatus,'unverified');assert.equal(p.purchaseMode,'international-reference');
  assert(['EUR','USD'].includes(p.currency));assert(p.material&&p.materialEvidence&&p.materialEvidence.url===p.productUrl);
  assert(p.sourceEvidence.productPage===p.productUrl&&p.sourceEvidence.imagePage===p.productUrl);
  if(p.brand==='ADIEU')assert(p.sku.includes('-M-'),'须核对男款页面，不能混入另一性别版型的编号');
  if(p.wearImage){const bytes=fs.readFileSync(path.join(root,p.wearImage));assert(bytes.length>2000&&bytes[0]===255&&bytes[1]===216);assert(https(p.wearImageSource));wornImages++;}
}
assert.equal(wornImages,12);
assert.equal(data.internationalOutfits.length,3);
for(const r of data.internationalOutfits){assert.equal(r.items.length,4);assert.deepEqual([...new Set(r.items.map(id=>global.find(p=>p.id===id)?.category))].sort(),['jewelry','outerwear','shirts','shoes']);}
assert(data.outfits.length>=3);
const pref=data.preferences;assert.equal(pref.market,'中国大陆');assert.equal(pref.currency,'CNY');assert.equal(pref.min,1000);assert.equal(pref.max,3000);
const cn=list.filter(p=>['verified','catalog'].includes(p.mainlandStatus)&&p.currency==='CNY'),within=cn.filter(p=>p.price>=pref.min&&p.price<=pref.max);
assert(cn.length>=20,'多数选品需有大陆价格证据');assert(within.length>15,'预算内款式需占多数');
for(const p of list){assert(['verified','catalog','unverified'].includes(p.mainlandStatus));assert(p.mainlandNote);if(p.mainlandStatus!=='unverified'){assert.equal(p.currency,'CNY');assert(p.storeName);assert(p.evidence||p.sourceEvidence);if(p.purchaseMode==='official-store-search'){assert(p.purchaseUrl==='https://drmartens.tmall.com');assert(p.mainlandNote.includes('证书'));}if(p.purchaseMode==='official-mini-program')assert.equal(p.mainlandStatus,'catalog');}}

for(const r of data.outfits){assert.equal(r.items.length,3);assert.deepEqual([...new Set(r.items.map(id=>list.find(p=>p.id===id)?.category))].sort(),[...categories].sort());}
console.log(JSON.stringify({passed:true,items:all.length,mainlandSelection:list.length,internationalSelection:global.length,referenceAdditions:additions.length,worldAdditions:worldItems.length,internationalCategories:4,wornImages,images:hashes.size,categories:Object.fromEntries(categories.map(c=>[c,10])),brands:new Set(all.map(p=>p.brand)).size,outfits:data.outfits.length+data.internationalOutfits.length,priced:all.filter(p=>p.price!==null).length,mainlandCNY:cn.length,inBudget:within.length,overseasReferences:all.length-cn.length},null,2));
