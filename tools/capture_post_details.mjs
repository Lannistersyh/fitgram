/* 定向读取已打开公开帖子的媒体、公开日期/计数；不采集用户会话字段。 */
import fs from 'node:fs/promises';
const root='/Users/admin/科研项目/fitgram-prompt/fitgram';
const target=process.env.FITGRAM_CDP_TARGET;
if(!target)throw Error('请先确认自有采集标签，再设置FITGRAM_CDP_TARGET；禁止并行操作浏览器，全部标签不超过8个。');
const raw=JSON.parse(await fs.readFile(root+'/assets/research/raw_posts.json','utf8'));
const chosen=raw.posts.filter(p=>['i_am_kentadesu_','kabuki_610'].includes(p.sourceHandle)||(p.sourceHandle==='tonywack_official'&&!['DeiTv7ez0aG','Deq4sYGE82H','DeRFX8tE_7J'].includes(p.code)));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function proxy(path,body){return(await fetch('http://localhost:3456/'+path,{method:body==null?'GET':'POST',body,signal:AbortSignal.timeout(25000)})).json();}
function expression(code){return `JSON.stringify((()=>{let matches=[];function walk(v){if(!v||typeof v!=='object')return;if(v.code===${JSON.stringify(code)}&&v.image_versions2){matches.push(v);return;}for(const x of Object.values(v))walk(x);}for(const s of document.querySelectorAll('script[type="application/json"]')){try{walk(JSON.parse(s.textContent))}catch(e){}}const v=matches.find(x=>x.taken_at)||matches[0];if(!v)return null;return{code:v.code,captionRaw:v.caption?.text||'',takenAt:v.taken_at||null,counts:{likes:v.like_count??null,comments:v.comment_count??null,saves:null},images:(v.carousel_media||[v]).slice(0,4).map((m,i)=>({slide:i+1,width:m.original_width||null,height:m.original_height||null,url:m.image_versions2?.candidates?.[0]?.url||null})),taggedBrands:(v.usertags?.in||[]).map(t=>({handle:t.user?.username,position:t.position}))}})())`;}
for(const post of chosen){
 try{
  await proxy('navigate?target='+target,post.sourceUrl);await pause(1300);
  const response=await proxy('eval?target='+target,expression(post.code));const detail=JSON.parse(response.value||'null');
  if(!detail){console.log(JSON.stringify({code:post.code,detail:false}));continue;}
  post.captionRaw=detail.captionRaw||post.captionRaw;post.date=detail.takenAt?new Date(detail.takenAt*1000).toISOString().slice(0,10):null;post.counts=detail.counts;post.taggedBrands=detail.taggedBrands;post.evidenceOrigin='public-post-embedded-media';post.detailCapturedAt=new Date().toISOString();post.carousel=[];
  for(const image of detail.images){
   if(!image.url)continue;
   if(image.slide===1){post.carousel.push({slide:1,imageLocal:post.imagesLocal[0],width:post.imageWidth,height:post.imageHeight});continue;}
   const expr=`(async()=>{const r=await fetch(${JSON.stringify(image.url)});if(!r.ok)return{status:r.status};const blob=await r.blob();const bitmap=await createImageBitmap(blob);const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return{status:r.status,width:bitmap.width,height:bitmap.height,data:btoa(binary)}})()`;
   const r=await proxy('eval?target='+target,expr);if(!r.value?.data)continue;
   const file='assets/real/'+post.sourceHandle+'/'+post.code+'-'+image.slide+'.jpg';await fs.writeFile(root+'/'+file,Buffer.from(r.value.data,'base64'));
   post.carousel.push({slide:image.slide,imageLocal:file,width:r.value.width,height:r.value.height});
  }
  await fs.writeFile(root+'/assets/research/raw_posts.json',JSON.stringify(raw,null,2));console.log(JSON.stringify({code:post.code,handle:post.sourceHandle,photos:post.carousel.length,date:post.date,likes:post.counts.likes}));
 }catch(e){console.log(JSON.stringify({code:post.code,error:e.message}));}
 await pause(1300);
}
console.log('post-detail capture complete');
