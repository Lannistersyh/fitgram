/* 分类图鉴验收：来源拼图、裁切坐标、真实图片与近似商品关系。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.createContext(sandbox);
for(const file of ['catalog-data.js','reference-data.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8'),sandbox);
const {looks,source}=sandbox.window.FITGRAM_REFERENCES,products=sandbox.window.FITGRAM_CATALOG.items;
const categories=['shirts','tops','pants','outerwear','shoes','jewelry','accessories'];
assert.equal(looks.length,28);assert.equal(new Set(looks.map(p=>p.id)).size,28);assert.equal(source.kind,'curated-collage');
assert.equal(source.sourceUrl,'https://www.douyin.com/note/7698697475539890810');
assert.equal(source.collages.length,8);assert.equal(source.coverDuplicateOf.length,12);
assert(source.notice.includes('整理账号不等于每张照片的原作者'));
for(const id of source.coverDuplicateOf)assert(looks.some(p=>Number(p.id)===id));
const read=file=>fs.readFileSync(path.join(root,file));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function jpegSize(bytes){
 assert(bytes[0]===255&&bytes[1]===216,'不是JPEG');let pos=2;
 while(pos<bytes.length){assert.equal(bytes[pos],255);let marker=bytes[++pos];pos++;if(marker===216||marker===217)continue;const len=bytes.readUInt16BE(pos);if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {width:bytes.readUInt16BE(pos+5),height:bytes.readUInt16BE(pos+3)};pos+=len;}
 throw new Error('JPEG缺少图像尺寸');
}
for(const c of source.collages){const bytes=read(c.image);assert.equal(hash(bytes),c.sha256);assert.deepEqual(jpegSize(bytes),{width:c.width,height:c.height});}
const allHashes=new Set(),ids=new Set(products.map(p=>p.id));let matched=0,links=0;
for(const p of looks){
 assert(categories.includes(p.categories[0]));assert(p.categories.every(c=>categories.includes(c)));
 assert.equal(new Set(p.categories).size,p.categories.length);
 for(const key of ['title','scene','pose','palette','analysis','poseNote'])assert(typeof p[key]==='string'&&p[key].trim());
 assert(p.garments.length>0);assert.equal(p.provenance.independentOriginalFound,false);assert.equal(p.provenance.originalPhotoUrl,null);
 assert(!p.personId&&!p.artistExactMatch,'不得从照片推断人物或升级同款证据');
 const meta=p.provenance,c=source.collages.find(x=>x.index===meta.sourceCollage),box=meta.crop;
 assert(c&&c.index>=2&&c.index<=8);assert(['左上','右上','左下','右下'].includes(meta.position));
 assert(box.x>=0&&box.y>=0&&box.x+box.width<=c.width&&box.y+box.height<=c.height);
 assert.equal(box.width,meta.originalCropWidth);assert.equal(box.height,meta.originalCropHeight);
 for(const [key,width] of [['image',900],['thumbnail',360]]){
  assert(p[key].startsWith('assets/references/douyin78/')&&!p[key].includes('..'));
  const bytes=read(p[key]),size=jpegSize(bytes);assert(bytes.length>2500);assert.equal(size.width,width);
  assert(Math.abs(size.height/size.width-box.height/box.width)<.004,'等比例缩放：'+p.id);
  const fingerprint=hash(bytes);assert(!allHashes.has(fingerprint),'重复照片：'+p.id);allHashes.add(fingerprint);
 }
 assert.equal(new Set(p.matches.map(m=>m.itemId)).size,p.matches.length);
 if(p.matches.length)matched++;
 for(const m of p.matches){assert(ids.has(m.itemId),'无对应商品：'+m.itemId);assert.equal(m.level,'similar-style');assert(m.note&&m.note.length>12);links++;}
}
for(let index=2;index<=8;index++){const group=looks.filter(p=>p.provenance.sourceCollage===index);assert.equal(group.length,4);assert.equal(new Set(group.map(p=>p.provenance.position)).size,4);}
const originals=[1,2,3,4].flatMap(n=>JSON.parse(fs.readFileSync(path.join(root,'assets/research/reference-looks-'+n+'.json'),'utf8')));
assert.equal(JSON.stringify(originals),JSON.stringify(looks.map(({seasonGuide,...p})=>p)));assert(matched>=24);
for(const p of products.filter(x=>x.collection==='reference'))assert(looks.some(l=>l.matches.some(m=>m.itemId===p.id)),'新增商品必须实际关联参考图：'+p.id);
console.log(JSON.stringify({passed:true,referencePhotos:looks.length,originalCollages:source.collages.length,matchedPhotos:matched,similarStyleLinks:links,productTotal:products.length,photoFiles:allHashes.size,exactPhotoMatches:0,categories:Object.fromEntries(categories.map(c=>[c,looks.filter(p=>p.categories.includes(c)).length]))},null,2));
