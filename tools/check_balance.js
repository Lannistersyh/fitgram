/* 学习模块：真实原帧、复核覆盖、边界标注、九种练习与导航。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),s={window:{App:{components:{},utils:{escape:String},state:{}}}};
vm.createContext(s);for(const name of ['balance-data','japan-data','catalog-data','navigation'])vm.runInContext(fs.readFileSync(path.join(root,'js',name+'.js'),'utf8'),s);
const B=s.window.FITGRAM_BALANCE,J=s.window.FITGRAM_JAPAN,P=s.window.FITGRAM_CATALOG.items,N=s.window.App.navigation,ids=new Set(P.map(p=>p.id));
const raw=fn=>JSON.parse(fs.readFileSync(path.join(root,'assets/research',fn),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function jpegSize(b){assert.equal(b[0],255);assert.equal(b[1],216);let n=2;while(n<b.length){assert.equal(b[n++],255);const marker=b[n++];if(marker===216||marker===217)continue;const len=b.readUInt16BE(n);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:b.readUInt16BE(n+5),height:b.readUInt16BE(n+3)};n+=len;}throw Error('JPEG size missing');}
assert.equal(JSON.stringify(B.guides),JSON.stringify([1,2,3,4].flatMap(n=>raw('balance-japan-'+n+'.json'))));
assert.equal(JSON.stringify(B.lessons),JSON.stringify(raw('balance-lessons.json').lessons));assert.equal(JSON.stringify(B.pairing),JSON.stringify(raw('balance-pairing.json')));assert.equal(JSON.stringify(B.reviews),JSON.stringify(raw('balance-match-reviews.json').reviews));
assert.equal(B.source.author,'卡Q因');assert.equal(B.source.url,'https://xhslink.cn/o/AaSmiZgVonM');assert.equal(B.source.durationSeconds,97.934);assert(/^[a-f0-9]{64}$/.test(B.source.originalVideoSha256));
const images=new Set();for(const lesson of B.lessons){
 assert(lesson.observations.length===3&&lesson.comparisonNote.length>25);assert(lesson.tryIt.length>20);assert(lesson.relatedLookIds.every(id=>J.looks.some(p=>p.id===id)));assert(lesson.relatedProductIds.every(id=>ids.has(id)));
 for(const key of ['before','after']){const f=lesson[key];assert(f.timeSeconds>=0&&f.timeSeconds<B.source.durationSeconds);assert(f.image.startsWith('assets/learning/balance/'));const bytes=fs.readFileSync(path.join(root,f.image));assert.equal(sha(bytes),f.sha256);assert.deepEqual(jpegSize(bytes),{width:720,height:1280});assert(!images.has(f.sha256));images.add(f.sha256);}
}
assert.equal(B.lessons.length,4);assert.equal(B.guides.length,20);assert.equal(new Set(B.guides.map(p=>p.id)).size,20);
let limited=0,unknownFoot=0;
for(const g of B.guides){
 assert(J.looks.some(p=>p.id===g.id));assert(['compact','medium','full','partial'].includes(g.overall));
 for(const key of ['summary','upperLower','footwear','neckline','layers','lightness','adjustment'])assert(g[key].length>12,g.id+': '+key);
 assert(g.parts.length>=3);assert(g.parts.every(p=>['small','medium','large','unknown'].includes(p.level)&&p.note.length>2));
 const foot=g.parts.find(p=>p.part==='鞋履');assert(foot);if(foot.level==='unknown'){unknownFoot++;assert(g.limits.length>10);assert(/未|没有|不|另/.test(g.footwear));}
 if(g.limits)limited++;if(g.overall==='partial')assert(g.limits.length>10);
 assert(!g.score&&!g.weight&&!g.measuredSize,'不把编辑观察伪装成测量');
}
const relations=new Set(J.looks.flatMap(p=>p.matches.map(m=>p.id+'/'+m.itemId)));assert.equal(relations.size,49);assert.equal(B.reviews.length,49);const reviewed=new Set();const roles={};
for(const r of B.reviews){const key=r.lookId+'/'+r.itemId;assert(relations.has(key));assert(!reviewed.has(key));reviewed.add(key);assert(['reference','alternative','compare'].includes(r.kind));assert(r.note.length>20);roles[r.kind]=(roles[r.kind]||0)+1;}
assert.equal(B.pairing.shoes.length,3);assert.equal(B.pairing.pants.length,3);assert.equal(B.pairing.pairs.length,9);
for(const p of [...B.pairing.shoes,...B.pairing.pants]){
 const item=P.find(i=>i.id===p.itemId);assert(item);assert(p.image.startsWith('assets/learning/balance/products/'));assert.equal(sha(fs.readFileSync(path.join(root,p.imageEvidence.sourceImage))),p.imageEvidence.sourceSha256);
 const bytes=fs.readFileSync(path.join(root,p.image));assert.equal(sha(bytes),p.imageEvidence.sha256);assert.deepEqual(jpegSize(bytes),{width:p.imageEvidence.width,height:p.imageEvidence.height});assert(!images.has(p.imageEvidence.sha256));images.add(p.imageEvidence.sha256);
}
const cases=new Set();for(const p of B.pairing.pairs){assert(B.pairing.shoes.some(i=>i.key===p.shoeKey));assert(B.pairing.pants.some(i=>i.key===p.pantsKey));assert(!cases.has(p.shoeKey+'/'+p.pantsKey));cases.add(p.shoeKey+'/'+p.pantsKey);assert(p.relation.length>15&&p.hem.length>15&&p.upper.length>15);for(const id of p.lookIds){const g=B.guides.find(g=>g.id===id);assert(g&&g.parts.find(p=>p.part==='鞋履').level!=='unknown','鞋裤练习不把未入镜鞋当成依据：'+id);}}
assert.equal(N.groups.length,3);assert.equal(N.groups.flatMap(g=>g.links).length,10);
for(const g of N.groups){assert.equal(g.label.length,4);for(const p of g.links)assert.equal(p[2].length,4,'导航四字名称：'+p[2]);}
for(const [route,expected]of Object.entries({'/learn/shoes':'/learn','/learn/pairing':'/learn/pairing','/catalog/japan':'/catalog','/catalog/reference/JP04':'/catalog','/catalog/all/shoes':'/catalog/all','/catalog/leather/coach':'/catalog/leather','/catalog/world/fr':'/catalog/world','/catalog/blazers':'/catalog/blazers'}))assert.equal(N.root(route),expected);
assert.equal(N.mobileRoot('/learn/pairing'),'/learn');assert.equal(N.mobileRoot('/catalog/history'),'/learn');assert.equal(N.mobileRoot('/catalog/leather/coach'),'/catalog/all');
console.log(JSON.stringify({passed:true,lessons:4,frames:8,lookGuides:20,matchReviews:reviewed.size,reviewRoles:roles,limitedViews:limited,unknownFootwear:unknownFoot,pairingProducts:6,pairingCases:cases.size,newImages:images.size,navigationGroups:3,primaryLinks:10,productsUnchanged:P.length},null,2));
