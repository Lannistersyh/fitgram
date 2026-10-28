/* 日系选图：原帖归属、独立图片、去重、应季标注与旧资料隔离。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),s={window:{App:{utils:{escape:String}}}};
vm.createContext(s);
for(const file of ['data.js','catalog-data.js','reference-data.js','japan-data.js','seasons.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),s);
const J=s.window.FITGRAM_JAPAN,R=s.window.FITGRAM_REFERENCES,D=s.window.FITGRAM_DATA,T=s.window.App.seasons,products=s.window.FITGRAM_CATALOG.items;
const canonical=[1,2,3,4].flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,'assets/research/japan-looks-'+n+'.json'),'utf8')));
assert.equal(JSON.stringify(J.looks),JSON.stringify(canonical));
assert.equal(J.looks.length,20);assert.equal(J.sources.length,5);assert.equal(R.looks.length,28);assert.equal(D.posts.length,48);assert.equal(products.length,149);
assert.equal(new Set([...J.looks,...R.looks].map(p=>p.id)).size,48);
const productIds=new Set(products.map(p=>p.id)),oldCodes=new Set(D.posts.map(p=>p.code)),sourceHandles=new Set(J.sources.map(p=>p.handle)),images=new Set(),originalHashes=new Set();
const categories=['shirts','tops','pants','outerwear','shoes','bags','jewelry','accessories'],hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function jpegSize(b){
 assert.equal(b[0],255);assert.equal(b[1],216);let n=2;
 while(n<b.length){assert.equal(b[n++],255);const marker=b[n++];if(marker===216||marker===217)continue;const len=b.readUInt16BE(n);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:b.readUInt16BE(n+5),height:b.readUInt16BE(n+3)};n+=len;}
 throw Error('Missing JPEG size');
}
let links=0,bytesTotal=0,minHashDistance=65,closestPair=[];
for(const [i,p]of J.looks.entries()){
 assert.equal(p.id,'JP'+String(i+1).padStart(2,'0'));assert.equal(p.collection,'japan');assert(p.garments.length>=3);assert(p.categories.every(c=>categories.includes(c)));assert.equal(new Set(p.categories).size,p.categories.length);
 for(const key of ['title','analysis','poseNote','formula','distinctReason','scene','pose','palette','styleFamily','captionNote'])assert(typeof p[key]==='string'&&p[key].trim(),p.id+': '+key);
 const v=p.provenance;assert.equal(v.kind,'instagram-post');assert(sourceHandles.has(v.handle));assert(!oldCodes.has(v.postCode),'重复原 IG 帖：'+p.id);
 assert.equal(v.sourceUrl,'https://www.instagram.com/p/'+v.postCode+'/');assert.equal(v.profileUrl,'https://www.instagram.com/'+v.handle+'/');assert(Number.isInteger(v.photoIndex)&&v.photoIndex>=1&&v.photoIndex<=20);
 assert(T.parse(v.postedAt)&&v.postedAt<=v.collectedAt);assert.equal(v.collectedAt,'2026-10-28');assert(v.sourceWidth>0&&v.sourceHeight>0);
 assert(/^[a-f0-9]{64}$/.test(v.originalImageSha256));assert(!originalHashes.has(v.originalImageSha256),'重复原图：'+p.id);originalHashes.add(v.originalImageSha256);
 assert(/^[a-f0-9]{16}$/.test(v.differenceHash));assert(!p.personId&&!p.artistExactMatch&&!p.price,'不按照片编造身份、同款或价格');
 for(const [key,sizeKey,maxWidth]of [['image','display',900],['thumbnail','thumbnail',360]]){
  assert.equal(p[key],'assets/references/japan2026/'+(key==='image'?'full':'thumb')+'/'+p.id+'.jpg');
  const bytes=fs.readFileSync(path.join(root,p[key])),size=jpegSize(bytes),meta=v[sizeKey];assert(bytes.length>5000);assert.equal(hash(bytes),meta.sha256);assert(!images.has(meta.sha256));images.add(meta.sha256);assert.equal(bytes.length,meta.bytes);bytesTotal+=bytes.length;
  assert.deepEqual(size,{width:meta.width,height:meta.height});assert.equal(size.width,Math.min(maxWidth,v.sourceWidth));assert(Math.abs(size.height/size.width-v.sourceHeight/v.sourceWidth)<.005,'完整等比例缩放：'+p.id);
 }
 assert(p.seasonGuide.seasons.includes(p.seasonGuide.primary));assert(p.seasonGuide.seasons.every(k=>T.keys.includes(k)));assert(p.seasonGuide.note.length>15);
 assert.equal(new Set(p.matches.map(m=>m.itemId)).size,p.matches.length);assert(p.matches.length>=2);
 for(const m of p.matches){assert(productIds.has(m.itemId));assert.equal(m.level,'similar-style');assert(m.note.length>25);links++;}
 assert.deepEqual(Object.keys(p.contrast).sort(),['layering','main','palette','silhouette']);
 for(const other of J.looks.slice(0,i)){
  const facets=Object.keys(p.contrast).filter(k=>p.contrast[k]!==other.contrast[k]);assert(facets.length>=2,'选图差异不足：'+p.id+'/'+other.id);
  const d=(BigInt('0x'+v.differenceHash)^BigInt('0x'+other.provenance.differenceHash)).toString(2).split('1').length-1;
  if(d<minHashDistance){minHashDistance=d;closestPair=[other.id,p.id];}assert(d>6,'感知近似需重新目视核对：'+p.id+'/'+other.id);
 }
}
const posts=new Set(J.looks.map(p=>p.provenance.postCode));assert.equal(posts.size,19);
for(const source of J.sources){
 assert.equal(source.followersPrecision,'rounded-public-profile-display');assert.equal(source.observedAt,'2026-10-28');assert(source.followersApprox>=200000);assert(source.followersDisplay.includes('万粉丝'));
 assert.equal(JSON.stringify(source.lookIds),JSON.stringify(J.looks.filter(p=>p.provenance.handle===source.handle).map(p=>p.id)));
}
const audit=J.audit;assert.equal(audit.selectedLooks,20);assert.equal(audit.selectedPosts,19);assert.equal(audit.selectedAccounts,5);assert.equal(audit.records.length,47);assert.equal(audit.photoPostCoversReviewed,47);assert.equal(audit.records.filter(p=>p.decision==='selected').length,19);assert.equal(new Set(audit.records.flatMap(p=>p.lookIds)).size,20);
const seasons=Object.fromEntries(T.keys.map(k=>[k,J.looks.filter(p=>T.matches(p,k)).length]));
for(const k of T.keys){const sorted=T.prioritize(J.looks,k);assert.equal(sorted.length,20);let other=false;for(const p of sorted){if(!T.matches(p,k))other=true;else assert(!other);}}
assert.equal(seasons.summer,3);assert(T.matches(J.looks.find(p=>p.id==='JP20'),'summer'));assert(!T.matches(J.looks.find(p=>p.id==='JP20'),'autumn'));
console.log(JSON.stringify({passed:true,newReferences:20,posts:posts.size,accounts:J.sources.length,mergedReferences:48,similarStyleLinks:links,imageFiles:images.size,imageBytes:bytesTotal,minimumDifferenceHashDistance:minHashDistance,closestPairReviewed:closestPair,seasons,legacyIgLooks:D.posts.length,legacyReferences:R.looks.length,products:products.length},null,2));
