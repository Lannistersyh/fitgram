/* 真实来源静态验收：仅用Node/Python标准库；不联网、不操作浏览器、不修改数据。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const child=require('child_process'),root=path.resolve(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8'),context,{timeout:5000});
const data=context.window.FITGRAM_DATA;
const knownSources=new Set(['japan_streetstyle_','i_am_kentadesu_','nanikajapan','kabuki_610','mensnonnojp','0neonones_','gentlemans_seoul','alyxtsu','coor_official','tonywack_official','solidhomme']);
const kinds=new Set(['creator','curation','magazine','brand']),levels=new Set(['exact','brand','visual']);
const styles=new Map(),evidenceCounts={exact:0,brand:0,visual:0},imageFiles=new Set();
const official=JSON.parse(fs.readFileSync(path.join(root,'assets/research/product_verification.json'),'utf8'));
const catalog=new Map(official.items.filter(i=>i.officialProductVerified).map(i=>[i.productUrl,i]));
function https(value){try{return new URL(value).protocol==='https:';}catch{return false;}}
function unique(values,label){assert.equal(new Set(values).size,values.length,label+'必须唯一');}
function content(value){return typeof value==='string'&&value.trim().length>0;}
function localFile(relative){
  assert(content(relative)&&!path.isAbsolute(relative),'必须使用项目内相对路径');
  const resolved=path.resolve(root,relative);
  assert(resolved.startsWith(root+path.sep),'资源路径不得离开项目');
  assert(fs.existsSync(resolved)&&fs.statSync(resolved).isFile(),'本地资源缺失：'+relative);
  return resolved;
}
function rasterDimensions(file){
  const bytes=fs.readFileSync(file);
  if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),format:'PNG'};
  assert(bytes[0]===255&&bytes[1]===216,'真实照片必须为有效JPEG/PNG，不能是HTML或SVG：'+file);
  let pos=2;
  while(pos+8<bytes.length){
    if(bytes[pos]!==255){pos++;continue;}
    const marker=bytes[pos+1];pos+=2;
    if(marker===216||marker===217||(marker>=208&&marker<=215))continue;
    const length=bytes.readUInt16BE(pos);
    if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker))return {height:bytes.readUInt16BE(pos+3),width:bytes.readUInt16BE(pos+5),format:'JPEG'};
    assert(length>=2,'JPEG分段长度无效');pos+=length;
  }
  throw new Error('JPEG缺少有效尺寸：'+file);
}
function evidence(record,label){
  assert(levels.has(record.identification),label+'识别级别无效');
  assert(content(record.evidenceText)&&https(record.evidenceUrl),label+'需要明确证据文字与HTTPS出处');
}
function checkSource(source){
  const handle=String(source.handle||'').replace(/^@/,'');
  assert(knownSources.has(handle),'清单外来源：'+handle);
  assert.equal(source.id,'ig-'+handle,'真实来源不能沿用虚构ID');
  assert(source.isFictional===false&&kinds.has(source.sourceKind));
  assert(https(source.profileUrl)&&source.profileUrl===source.sourceUrl,'来源主页链接缺失');
  assert.equal(new URL(source.profileUrl).hostname,'www.instagram.com');
  assert.equal(source.posts,data.posts.filter(p=>p.bloggerId===source.id).length);
  assert(source.verified===false||source.verificationObserved===true,'蓝勾需要采集证据');
  for(const key of ['followers','following','accountPosts'])assert(source[key]===null||(Number.isInteger(source[key])&&source[key]>=0));
  localFile(source.avatar);
}
function checkItem(item){
  evidence(item,'单品 '+item.id);evidenceCounts[item.identification]++;
  if(item.identification==='brand')assert(content(item.brand),'品牌线索必须写出品牌');
  if(item.identification==='visual')assert(item.brand===null&&item.modelName===null&&item.editorial===true,'视觉观察不能变成已确认品牌或型号');
  if(item.identification!=='exact')assert(item.productUrl===null&&!item.officialProductVerified,'非exact不能带同款商品链接');
  const hasPrice=['price','priceNumeric','priceMin','priceMax'].some(key=>item[key]!==null&&item[key]!==undefined);
  if(!hasPrice){assert(item.priceCurrency===null);return;}
  assert(item.identification==='exact'&&item.officialProductVerified===true,'价格只允许官网核实的exact单品');
  assert(https(item.productUrl)&&new URL(item.productUrl).pathname.startsWith('/product/'),'价格需要具体商品详情来源');
  assert.equal(item.priceCurrency,'KRW');
  assert(Number.isFinite(item.priceNumeric)&&item.priceNumeric>0);
  assert(item.priceNumeric===item.priceMin&&item.priceMin===item.priceMax,'官网点价不能伪造成估算范围');
  assert(content(item.modelName)&&content(item.verifiedAt)&&content(item.priceBasis));
  const proof=catalog.get(item.productUrl);
  assert(proof,'价格商品未出现在官网核验记录：'+item.id);
  assert.equal(proof.price,item.priceNumeric);assert.equal(proof.currency,item.priceCurrency);
  assert.equal(proof.modelName,item.modelName);assert.equal(proof.officialPageTitle,item.officialPageTitle);
}
function checkPost(post){
  assert(/^r\d+/.test(post.id)&&post.isFictional===false,'造型必须采用真实来源ID');
  assert(data.bloggers.some(b=>b.id===post.bloggerId),'造型来源不存在');
  assert(https(post.sourceUrl)&&/instagram\.com\/.+/.test(post.sourceUrl));
  assert(content(post.code)&&content(post.analysisKey)&&post.originalSourceCode===post.code);
  assert(post.editorial===true&&post.editorialLabel==='本站观察');
  assert(post.caption.length>=60&&post.caption.length<=120,'中文观察长度不符：'+post.id);
  assert(Array.isArray(post.commentsMock)&&post.commentsMock.length===0,'不能伪造原帖评论');
  assert(['budget','budgetMin','budgetMax'].every(key=>post[key]===null),'未知整套预算不能补造');
  assert(['likes','comments','saves'].every(key=>post[key]===null||(Number.isInteger(post[key])&&post[key]>=0)));
  assert(post.tempBand==='unknown'||post.temperatureType==='editorial-recommendation');
  assert(post.date===null||/^\d{4}-\d{2}-\d{2}$/.test(post.date));
  assert(Array.isArray(post.images)&&post.images.length>0,'真实造型缺图');
  for(const image of post.images){
    assert(image.startsWith('assets/real/'),'造型主图不得使用旧插画或中性兜底：'+image);
    const dimensions=rasterDimensions(localFile(image));imageFiles.add(image);
    assert(dimensions.width>100&&dimensions.height>100,'图片过小');
    if(post.images.length===1){assert.equal(post.imageWidth,dimensions.width);assert.equal(post.imageHeight,dimensions.height);}
  }
  localFile(post.placeholder);
  assert(Array.isArray(post.imageEvidence)&&post.imageEvidence.length>0,'原图应保留采集出处');
  for(const layer of post.layers)evidence(layer,'叠穿层次');
  assert(post.items.length>=1,'真实造型至少有一条可见服装观察');
  for(const ref of post.items){
    const item=data.items.find(i=>i.id===ref.itemId);assert(item,'单品引用不存在：'+ref.itemId);
    evidence(ref,'单品引用');assert.equal(ref.identification,item.identification);
    assert(['x','y'].every(axis=>Number.isFinite(ref.hotspot[axis])&&ref.hotspot[axis]>=0&&ref.hotspot[axis]<=1),'热点坐标越界');
  }
  post.styles.forEach(style=>styles.set(style,(styles.get(style)||0)+1));
}
function codeFiles(folder){
  if(!fs.existsSync(folder))return [];
  return fs.readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(folder,entry.name);
    return entry.isDirectory()?codeFiles(file):/\.(?:js|mjs|css|html|py)$/.test(entry.name)?[file]:[];
  });
}
function checkCode(){
  const files=[path.join(root,'index.html'),...['js','css','tools'].flatMap(folder=>codeFiles(path.join(root,folder)))];
  let longest={file:'',lines:0};
  for(const file of files){
    const source=fs.readFileSync(file,'utf8'),lines=source.split('\n').length-(source.endsWith('\n')?1:0);
    assert(lines<=700,path.relative(root,file)+'超过700行');
    if(lines>longest.lines)longest={file:path.relative(root,file),lines};
    if(/\.(?:m?js)$/.test(file)){
      const result=child.spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
      assert.equal(result.status,0,'JS语法错误：'+path.relative(root,file)+'\n'+result.stderr);
    }
  }
  const python=files.filter(file=>file.endsWith('.py'));
  if(python.length){
    const result=child.spawnSync('python3',['-c','import ast,sys; [ast.parse(open(p,encoding="utf-8").read(), filename=p) for p in sys.argv[1:]]',...python],{encoding:'utf8'});
    assert.equal(result.status,0,'Python语法错误：'+result.stderr);
  }
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert(!/<script[^>]+type=["']module/i.test(html),'file协议不能依赖ES Module');
  for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){
    const value=match[1];if(value.startsWith('#')||value.startsWith('data:')||/^https?:/.test(value))continue;
    localFile(value);
  }
  return {files:files.length,longest};
}
assert.equal(data.mode,'real-sources');assert.equal(data.bloggers.length,11);assert.equal(data.posts.length,48);
unique(data.bloggers.map(b=>b.id),'来源ID');unique(data.posts.map(p=>p.id),'造型ID');
unique(data.posts.map(p=>p.analysisKey),'分析键');unique(data.items.map(i=>i.id),'单品ID');
data.bloggers.forEach(checkSource);data.items.forEach(checkItem);data.posts.forEach(checkPost);
assert(data.items.every(item=>data.posts.some(post=>post.items.some(ref=>ref.itemId===item.id))),'存在未引用单品');
const priced=data.items.filter(item=>item.priceNumeric!==null),productUrls=new Set(priced.map(item=>item.productUrl));
assert.equal(productUrls.size,27,'最终快照应有27个去重官方商品');
assert.equal(data.provenance.verifiedPriceItems,priced.length);assert.equal(data.provenance.verifiedPriceProducts,productUrls.size);
assert.equal(data.provenance.pricesVerified,priced.length>0);
const code=checkCode();
console.log(JSON.stringify({passed:true,mode:data.mode,sources:data.bloggers.length,lookSources:data.bloggers.filter(b=>b.posts>0).length,profilesOnly:data.bloggers.filter(b=>b.posts===0).map(b=>b.handle),looks:data.posts.length,uniqueSourceUrls:new Set(data.posts.map(p=>p.sourceUrl)).size,uniqueOriginalPosts:new Set(data.posts.map(p=>p.code)).size,items:data.items.length,identification:evidenceCounts,pricedItemAppearances:priced.length,uniqueOfficialProducts:productUrls.size,localRasterImages:imageFiles.size,captionLength:[Math.min(...data.posts.map(p=>p.caption.length)),Math.max(...data.posts.map(p=>p.caption.length))],styles:Object.fromEntries(styles),unknownDates:data.posts.filter(p=>p.date===null).length,unknownTemperatures:data.posts.filter(p=>p.tempBand==='unknown').length,unknownLikes:data.posts.filter(p=>p.likes===null).length,mockComments:0,inventedBudgets:0,syntaxAndLineChecks:code,browserTabsOpened:0,scope:'本脚本只做离线静态验收；browserTabsOpened不代表主任务公开来源采集的标签数量。'},null,2));
