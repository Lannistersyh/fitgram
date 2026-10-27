/* 补充适合秋冬的公开候选；同一个标签连续复用，禁止新建标签。 */
import fs from 'node:fs/promises';
const root=decodeURIComponent(new URL('../',import.meta.url).pathname).replace(/\/$/,'');
const target=process.env.FITGRAM_CDP_TARGET;
if(!target)throw Error('请先确认自有采集标签，再设置FITGRAM_CDP_TARGET；禁止并行操作浏览器，全部标签不超过8个。');
const raw=JSON.parse(await fs.readFile(root+'/assets/research/raw_posts.json','utf8')),seen=new Set(raw.posts.map(p=>p.code));
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function proxy(path,body){return(await fetch('http://localhost:3456/'+path,{method:body==null?'GET':'POST',body,signal:AbortSignal.timeout(25000)})).json();}
const expression=`JSON.stringify(Array.from(document.querySelectorAll('main a[href]')).filter(a=>/\\/(p|reel)\\//.test(a.href)).map(a=>({url:a.href,alt:a.querySelector('img')?.alt||'',src:a.querySelector('img')?.currentSrc||a.querySelector('img')?.src||''})))`;
for(const handle of ['i_am_kentadesu_','kabuki_610','0neonones_','tonywack_official']){
 await proxy('navigate?target='+target,'https://www.instagram.com/'+handle+'/');await pause(1800);let added=0;
 for(let scroll=0;scroll<4&&added<12;scroll++){
  await proxy('scroll?target='+target+'&y=1700');await pause(1600);
  const response=await proxy('eval?target='+target,expression);const posts=JSON.parse(response.value||'[]');
  for(const p of posts){const code=p.url.match(/\/(?:p|reel)\/([^/?#]+)/)?.[1];if(!code||seen.has(code)||!p.src||added>=12)continue;seen.add(code);raw.posts.push({id:'raw-'+code,code,sourceHandle:handle,sourceUrl:p.url,date:null,captionRaw:p.alt,imagesLocal:[],imageUrls:[p.src],altTexts:[p.alt],taggedBrands:[],counts:{likes:null,comments:null,saves:null},location:null,evidenceOrigin:'public-profile-grid-alt',capturedAt:new Date().toISOString()});added++;}
 }
 await fs.writeFile(root+'/assets/research/raw_posts.json',JSON.stringify(raw,null,2));console.log(JSON.stringify({handle,added}));await pause(1600);
}
console.log(JSON.stringify({totalCandidates:raw.posts.length}));
