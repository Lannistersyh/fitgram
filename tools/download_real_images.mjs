/* 从已观察的公开CDN链接下载图片；只复用已有标签，不创建新页。 */
import fs from 'node:fs/promises';
const root='/Users/admin/科研项目/fitgram-prompt/fitgram';
const target=process.env.FITGRAM_CDP_TARGET;
if(!target)throw Error('请先确认自有采集标签，再设置FITGRAM_CDP_TARGET；禁止并行操作浏览器，全部标签不超过8个。');
const raw=JSON.parse(await fs.readFile(root+'/assets/research/raw_posts.json','utf8'));
const sources=JSON.parse(await fs.readFile(root+'/assets/research/raw_sources.json','utf8'));
for(const source of sources.sources){const text=source.bioRaw||'';const n=(re)=>{const m=text.match(re);return m?Number(m[1].replace(/,/g,''))*(m[2]==='万'?10000:1):null;};source.followers=n(/([\d,.]+)(万?)粉丝/);source.following=n(/([\d,.]+)(万?)关注/);source.postsCount=n(/([\d,.]+)(万?)帖子/);}
await fs.writeFile(root+'/assets/research/raw_sources.json',JSON.stringify(sources,null,2));
let count=0;
for(const post of raw.posts){
 const folder='assets/real/'+post.sourceHandle;await fs.mkdir(root+'/'+folder,{recursive:true});
 const file=folder+'/'+post.code+'-1.jpg';
 try{
  const expression=`(async()=>{const r=await fetch(${JSON.stringify(post.imageUrls[0])});if(!r.ok)return{status:r.status};const blob=await r.blob();const img=await createImageBitmap(blob);const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return{status:r.status,width:img.width,height:img.height,type:blob.type,data:btoa(binary)}})()`;
  const r=await fetch('http://localhost:3456/eval?target='+target,{method:'POST',body:expression,signal:AbortSignal.timeout(25000)});const response=await r.json();const value=response.value;
  if(!value?.data){console.log(JSON.stringify({code:post.code,error:response.error||value}));if(value?.status===429)throw Error('rate limited');continue;}
  await fs.writeFile(root+'/'+file,Buffer.from(value.data,'base64'));post.imagesLocal=[file];post.imageWidth=value.width;post.imageHeight=value.height;post.downloadedAt=new Date().toISOString();count++;
  if(count%12===0){await fs.writeFile(root+'/assets/research/raw_posts.json',JSON.stringify(raw,null,2));console.log(JSON.stringify({downloaded:count,lastSource:post.sourceHandle}));}
 }catch(error){console.log(JSON.stringify({code:post.code,error:error.message}));if(error.message==='rate limited')break;}
 await new Promise(r=>setTimeout(r,180));
}
await fs.writeFile(root+'/assets/research/raw_posts.json',JSON.stringify(raw,null,2));
console.log(JSON.stringify({done:true,downloaded:count,candidates:raw.posts.length}));
