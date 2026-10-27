/* 仅采集公开页面DOM；全程复用一个自有Edge标签，不提取凭据。 */
import fs from 'node:fs/promises';
const root=decodeURIComponent(new URL('../',import.meta.url).pathname).replace(/\/$/,'');
const target=process.env.FITGRAM_CDP_TARGET;
if(!target)throw Error('请先确认自有采集标签，再设置FITGRAM_CDP_TARGET；禁止并行操作浏览器，全部标签不超过8个。');
const capturedAt=new Date().toISOString();
const definitions=[['japan_streetstyle_','jp','curation'],['i_am_kentadesu_','jp','creator'],['nanikajapan','jp','curation'],['kabuki_610','jp','creator'],['mensnonnojp','jp','magazine'],['0neonones_','kr','creator'],['gentlemans_seoul','kr','curation'],['alyxtsu','kr','creator'],['coor_official','kr','brand'],['tonywack_official','kr','brand'],['solidhomme','kr','brand']];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function proxy(path,body){const r=await fetch('http://localhost:3456/'+path,{method:body==null?'GET':'POST',body,signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('proxy '+r.status);return r.json();}
const expression=`JSON.stringify((()=>{const main=document.querySelector('main');if(!main)return {text:document.body.innerText.slice(0,800),posts:[]};return {text:main.innerText.slice(0,7000),verified:!!main.querySelector('svg[aria-label="已验证"],svg[aria-label="Verified"]'),posts:Array.from(main.querySelectorAll('a[href]')).filter(a=>/\\/(p|reel)\\//.test(a.href)).slice(0,24).map(a=>{const i=a.querySelector('img');return{url:a.href,alt:i?.alt||'',src:i?.currentSrc||i?.src||'',width:i?.naturalWidth||null,height:i?.naturalHeight||null}})}})())`;
const sources=[],posts=[];
for(const [handle,region,sourceKind] of definitions){
  await proxy('navigate?target='+target,'https://www.instagram.com/'+handle+'/');
  let observed;
  for(let attempt=0;attempt<5;attempt++){
    await pause(attempt===0?1800:1500);
    const result=await proxy('eval?target='+target,expression);observed=JSON.parse(result.value||'{}');
    if(observed.posts?.length||/无法访问|不可用|private|私密|找不到/i.test(observed.text||''))break;
  }
  const lines=(observed.text||'').split('\n').map(s=>s.trim()).filter(Boolean);
  sources.push({id:'ig-'+handle,handle:'@'+handle,url:'https://www.instagram.com/'+handle+'/',name:lines[1]||handle,region,sourceKind,bioRaw:lines.filter(l=>!/@|联系|Contact|邮箱|email/i.test(l)).join('\n'),followers:null,following:null,postsCount:null,verified:observed.verified===true,evidence:[{field:'profile',text:lines.slice(0,7).join(' / '),url:'https://www.instagram.com/'+handle+'/',observedAt:capturedAt}]});
  for(const p of observed.posts||[]){const code=p.url.match(/\/(?:p|reel)\/([^/?#]+)/)?.[1];if(!code||!p.src)continue;posts.push({id:'raw-'+code,code,sourceHandle:handle,sourceUrl:p.url,date:null,captionRaw:p.alt,imagesLocal:[],imageUrls:[p.src],altTexts:[p.alt],imageWidth:p.width,imageHeight:p.height,taggedBrands:[],counts:{likes:null,comments:null,saves:null},location:null,evidenceOrigin:'public-profile-grid-alt',capturedAt});}
  await fs.writeFile(root+'/assets/research/raw_sources.json',JSON.stringify({collectedAt:capturedAt,sources},null,2));
  await fs.writeFile(root+'/assets/research/raw_posts.json',JSON.stringify({collectedAt:capturedAt,posts},null,2));
  console.log(JSON.stringify({handle,posts:observed.posts?.length||0,header:lines.slice(0,5),firstCaptions:(observed.posts||[]).slice(0,3).map(p=>p.alt.slice(0,250))}));
  await pause(1600);
}
console.log(JSON.stringify({done:true,sources:sources.length,candidates:posts.length}));
