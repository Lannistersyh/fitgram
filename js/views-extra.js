/* 公开来源资料页：区分已核实信息、视觉判断与未知字段。 */
(function(A){
'use strict';
const V=A.views,U=A.utils,C=A.components,S=A.store,E=U.escape;
let reelObserver=null,reelKeyHandler=null;
const kindNames={creator:'创作者',curation:'内容策展',magazine:'媒体 / 杂志',brand:'品牌',group:'男团官方',other:'资料来源'};
const regions={jp:{label:'日本来源',en:'JAPAN'},kr:{label:'韩国来源',en:'KOREA'},other:{label:'跨地区与其他来源',en:'OTHER SOURCES'}};
const list=value=>Array.isArray(value)?value:[];
const numeric=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0;
const validUrl=value=>typeof value==='string'&&/^https?:\/\//i.test(value);
const sources=()=>list(A.data.bloggers).filter(b=>validUrl(b.profileUrl));
const looks=()=>list(A.data.posts).filter(p=>validUrl(p.sourceUrl));
const sourceLooks=id=>looks().filter(p=>p.bloggerId===id);
const title=post=>post.title||'公开来源造型记录';
function originalKey(p){const match=String(p.sourceUrl||'').match(/\/(?:p|reel|tv)\/([^/?#]+)/);return match?match[1]:String(p.sourceUrl||'').split(/[?#]/)[0].replace(/\/$/,'');}
function originals(data){const seen=new Set();return data.filter(p=>{const key=originalKey(p);if(seen.has(key))return false;seen.add(key);return true;});}
function lookSummary(data){return data.length+' 套造型 / '+originals(data).length+' 篇原帖';}
function imagePosition(p){let indices=list(p.sourceImageIndices).length?p.sourceImageIndices:list(p.imageEvidence).map(e=>e.sourceImageIndex);indices=indices.map(Number).filter(n=>Number.isInteger(n)&&n>0);if(!indices.length&&Number.isInteger(Number(p.sourceImageIndex))&&Number(p.sourceImageIndex)>0)indices=[Number(p.sourceImageIndex)];indices=[...new Set(indices)];return indices.length?'原帖第 '+indices.join('、')+' 张':'原帖图片序号未注明';}
function imageLabel(p){return '<span class="look-source-position">'+E(imagePosition(p))+'</span>';}

function heading(en,name,meta){return '<header class="page-heading"><div><p class="eyebrow">'+en+'</p><h1>'+E(name)+'</h1></div><p class="page-heading__meta">'+meta+'</p></header>';}
function page(type,body){return '<div class="page page--'+type+'">'+body+U.footer()+'</div>';}
function kindOf(b){const kind=b.sourceKind||b.sourceCategory;return kindNames[kind]?kind:'other';}
function kindBadge(b){return '<span class="source-kind">'+kindNames[kindOf(b)]+'</span>';}
function external(url,label,className){return validUrl(url)?'<a class="'+(className||'text-link')+'" href="'+E(url)+'" target="_blank" rel="noopener noreferrer">'+E(label)+' '+C.icon('external',12)+'</a>':'';}
function tagLink(tag){return '<a class="style-tag" href="#/tag/'+encodeURIComponent(String(tag).replace(/^#/,''))+'">'+E(tag)+'</a>';}
function verified(b){return b.verified===true?'<span class="verified" aria-label="来源主页认证已核对" title="来源主页认证已核对">'+C.icon('check',10)+'</span>':'';}
function followerButton(b){const active=S.has('following',b.id);return '<button class="button button--primary '+(active?'is-following':'')+'" data-action="follow" data-id="'+E(b.id)+'" aria-pressed="'+active+'">'+(active?'已追踪':'本地追踪')+'</button>';}
function sourceCard(b,index){
const data=sourceLooks(b.id),detail=[b.name,b.city].filter(Boolean).join(' · ');
return '<article class="blogger-card"><span class="blogger-card__index">'+String(index+1).padStart(2,'0')+'</span><a class="blogger-card__identity" href="#/blogger/'+E(b.id)+'">'+C.avatar(b,66,false)+'<div><div class="blogger-card__name">'+E(b.handle||b.name)+verified(b)+'</div><p>'+E(detail||'以来源主页公开资料为准')+'</p></div></a><div class="source-card__kind">'+kindBadge(b)+'</div><p class="blogger-card__slogan">'+E(b.slogan||b.bio||'公开内容资料索引，原始信息见来源主页。')+'</p><div class="blogger-card__styles">'+list(b.styles).map(tagLink).join('')+'</div><div class="blogger-card__bottom"><span><strong>'+data.length+'</strong> 套造型 · '+originals(data).length+' 篇原帖<span class="blogger-card__frequency">'+(numeric(b.followers)?U.number(b.followers)+' 粉丝 · 公开记录':'粉丝数未核实')+'</span></span><a class="text-link" href="#/blogger/'+E(b.id)+'">查看资料 '+C.icon('arrow-right',14)+'</a></div></article>';
}
function regionSources(key){return sources().filter(b=>key==='other'?!['jp','kr'].includes(b.region):b.region===key);}
function regionDirectory(key){
const data=regionSources(key),region=regions[key];if(!data.length)return '';
return '<section class="blogger-group"><div class="section-title"><div><p class="eyebrow">'+region.en+' / '+data.length+'</p><h2>'+region.label+'</h2></div><p class="muted">账号身份以公开主页为准。</p></div>'+Object.keys(kindNames).map(kind=>{const group=data.filter(b=>kindOf(b)===kind);return group.length?'<section class="source-type-group"><h3 class="source-type-heading">'+kindNames[kind]+' <span>'+group.length+'</span></h3><div class="blogger-directory">'+group.map(sourceCard).join('')+'</div></section>':'';}).join('')+'</section>';
}
V.renderBloggers=function(){
if(!sources().length)return page('bloggers',C.empty('还没有可展示的来源','来源资料核对后会收录到这里。','#/about','了解资料规则'));
return page('bloggers',heading('PUBLIC SOURCES / STYLE INDEX','穿搭来源图鉴',sources().length+' 个来源 · '+new Set(looks().map(p=>p.bloggerId)).size+' 个有造型<br>'+lookSummary(looks()))+'<p class="editor-intro">以 CORTIS 等年轻男团、高粉日本创作者和已核对单品为线索，查找真实造型。来源身份、已确认信息与视觉观察分别标注，照片与原文可回溯到原始页面。</p>'+Object.keys(regions).map(regionDirectory).join(''));
};
function bioLines(b){return String(b.bio||'资料以来源主页公开信息为准。').split(/\n/).filter(Boolean).slice(0,4).map(line=>'<span>'+E(line)+'</span>').join('');}
function profileTabs(id,tab){return '<div class="profile-tabs" role="tablist" aria-label="来源内容">'+[['posts','grid','收录造型'],['reels','reels','图片速览'],['saves','bookmark','本地收藏'],['formulas','layers','穿搭记录']].map(([key,icon,label])=>'<button role="tab" id="tab-'+key+'" aria-controls="profile-content" aria-selected="'+(key===tab)+'" class="'+(key===tab?'is-active':'')+'" data-action="profile-tab" data-id="'+E(id)+'" data-tab="'+key+'">'+C.icon(icon,15)+'<span>'+label+'</span></button>').join('')+'</div>';}
function formulaCard(formula,index){
const f=typeof formula==='string'?{title:formula}:formula,p=U.post(f.postId),palette=list(f.palette);
return '<article class="formula-card"><span class="eyebrow">STYLE NOTE / '+String(index+1).padStart(2,'0')+'</span>'+(palette.length?'<div class="formula-card__swatches">'+palette.map(color=>'<span style="background:'+E(color)+'"></span>').join('')+'</div>':'')+'<h3>'+E(f.title||f.formula||f.name||'来源穿搭记录')+'</h3>'+(f.desc||f.description||f.note?'<p>'+E(f.desc||f.description||f.note)+'</p>':'')+'<div class="formula-card__bottom"><span>'+E(f.evidenceLabel||'资料笔记，非品牌型号确认')+'</span>'+(p&&validUrl(p.sourceUrl)?'<a href="#/p/'+E(p.id)+'" class="text-link">对应记录 '+C.icon('arrow-right',13)+'</a>':external(f.sourceUrl,'查看依据'))+'</div></article>';
}
function profileContent(id,tab){
const b=U.blogger(id),data=sourceLooks(id);
if(tab==='formulas'){const notes=list(b.formulas);return notes.length?'<p class="profile-content__note">视觉观察不等于已确认的品牌、型号或材质，确切信息请核对原帖。</p><div class="formula-grid">'+notes.map(formulaCard).join('')+'</div>':C.empty('尚无已整理的穿搭记录','不补写来源未提供的品牌、材质与穿搭细节。','#/bloggers','返回来源图鉴');}
if(tab==='saves'){const saved=data.filter(p=>S.has('saves',p.id));return '<p class="profile-content__note">这里显示你在本地收藏的造型；同一原帖的不同图片可以分别收藏。</p>'+(saved.length?C.renderGrid(saved):C.empty('还没有收藏这个来源的内容','打开一条收录记录，用书签留在本地衣橱。','#/explore','浏览已收录内容'));}
if(tab==='reels')return data.length?'<p class="profile-content__note">静态图片速览 · 不是原作者发布的视频</p><div class="profile-reel-grid">'+data.map(p=>'<a class="profile-reel" href="#/p/'+E(p.id)+'" aria-label="查看 '+E(title(p))+'">'+C.image(p,0,'profile-reel__image')+'<span>'+C.icon('grid',18)+' '+E(imagePosition(p))+'</span></a>').join('')+'</div>':C.empty('暂无可速览的图片','仅展示已入库且具有原帖链接的资料。','#/bloggers','返回来源图鉴');
return data.length?C.renderGrid(data):C.empty('该来源当前没有合格造型收录','可以先打开来源主页查看原始发布。','#/bloggers','返回来源图鉴');
}
function profileStats(b){const data=sourceLooks(b.id);return '<div class="profile-stats"><span><strong>'+data.length+'</strong> 套造型</span><span><strong>'+originals(data).length+'</strong> 篇原帖</span><span>'+(numeric(b.followers)?'<strong>'+U.number(b.followers)+'</strong> 粉丝':'粉丝数未核实')+'</span>'+(numeric(b.following)?'<span><strong>'+U.number(b.following)+'</strong> 关注</span>':'')+'</div>';}
V.renderBlogger=function(id){
const b=U.blogger(id);if(!b||!validUrl(b.profileUrl))return page('profile',C.empty('该来源不在当前资料索引中','返回图鉴查看已收录的公开来源。','#/bloggers','返回来源图鉴'));
const tab=A.state.profileId===id?(A.state.profileTab||'posts'):'posts';A.state.profileId=id;A.state.profileTab=tab;
return page('profile','<header class="profile-header"><div class="profile-avatar">'+C.avatar(b,150,false)+'</div><div class="profile-info"><div class="profile-info__heading"><h1>'+E(b.handle||b.name)+'</h1>'+verified(b)+'<div class="profile-info__actions">'+followerButton(b)+external(b.profileUrl,'来源主页','button button--secondary')+'</div></div>'+profileStats(b)+'<strong class="profile-info__name">'+E(b.name||b.handle)+(numeric(b.height)?'<span>公开身高 '+b.height+' cm</span>':'')+'</strong><div class="source-card__kind">'+kindBadge(b)+'</div><p class="profile-bio">'+bioLines(b)+'</p><div class="profile-styles">'+list(b.styles).map(tagLink).join('')+'</div><p class="source-profile__note">本地追踪只整理此设备上的资料，不会关注或联系 Instagram 账号。</p></div></header>'+profileTabs(id,tab)+'<section id="profile-content" role="tabpanel" aria-labelledby="tab-'+tab+'">'+profileContent(id,tab)+'</section>');
};
V.setProfileTab=function(id,tab){
if(!['posts','reels','saves','formulas'].includes(tab)||!U.blogger(id))return;A.state.profileId=id;A.state.profileTab=tab;
const content=document.getElementById('profile-content');if(!content)return;content.innerHTML=profileContent(id,tab);content.setAttribute('aria-labelledby','tab-'+tab);
document.querySelectorAll('.profile-tabs [data-tab]').forEach(button=>{const active=button.dataset.tab===tab;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',active);});
};
function sourceRegion(p){const b=U.blogger(p.bloggerId);return b&&b.region;}
function compareNotes(p){
const notes=list(p.visualNotes||p.observations).slice(0,3);if(notes.length)return notes;
return ['风格标注：'+(list(p.styles).join(' / ')||'未分类'),'场景标注：'+(list(p.scenes).join(' / ')||'未核实'),'品牌与型号以原帖明确标注为准；视觉相似不能视为确认。'];
}
function compareLook(p,region){
if(!p)return '<article class="compare-missing"><p class="eyebrow">'+regions[region].en+'</p><h3>暂无对应场景资料</h3><p>当前入库记录没有已标注这一场景的内容，不以其他照片代替。</p></article>';
const b=U.blogger(p.bloggerId)||{},tag=list(p.styles)[0]||'来源记录';
return '<article class="compare-look"><a class="compare-look__image" href="#/p/'+E(p.id)+'">'+C.image(p)+'<span>'+regions[region].en+' / '+E(tag)+'</span></a><div class="compare-look__heading"><a href="#/blogger/'+E(b.id)+'">'+E(b.handle||b.name)+'</a><span>'+(p.tempBand&&!/unknown|unverified|未核实/i.test(p.tempBand)?E(U.temp(p.tempBand)):'温度未核实')+'</span></div><a class="compare-look__title" href="#/p/'+E(p.id)+'">'+E(title(p))+'</a>'+imageLabel(p)+'<ul class="compare-notes">'+compareNotes(p).map((note,i)=>'<li><span>0'+(i+1)+'</span>'+E(note)+'</li>').join('')+'</ul>'+external(p.sourceUrl,'核对原帖')+'</article>';
}
function comparisonEntries(){return list(A.data.compares).filter(c=>c.evidenceVerified===true&&c.dimension&&list(c.jpPosts).some(id=>looks().some(p=>p.id===id))&&list(c.krPosts).some(id=>looks().some(p=>p.id===id)));}
function compareScene(scene,index){const match=region=>looks().find(p=>sourceRegion(p)===region&&list(p.scenes).includes(scene));return '<section class="compare-scene"><div class="section-title"><div><p class="eyebrow">SOURCE COMPARISON / '+String(index+1).padStart(2,'0')+'</p><h2>'+E(scene)+'</h2></div><span class="muted">依据已入库的场景标注。</span></div><div class="compare-pair">'+compareLook(match('jp'),'jp')+compareLook(match('kr'),'kr')+'</div></section>';}
V.renderCompare=function(){
const data=looks(),dimensions=comparisonEntries(),scenes=[...new Set(data.filter(p=>['jp','kr'].includes(sourceRegion(p))).flatMap(p=>list(p.scenes)))].filter(scene=>scene&&!/未核实|未知/.test(scene)).slice(0,4);
const intro='把日本与韩国来源分开阅读，是为了比较具体照片中的轮廓、层次和配色，而不是给地区设定统一穿衣规则。这里仅引用已经入库、能够打开原帖的资料；场景和风格属于索引标注，视觉判断不能代替原作者对品牌、型号与材质的说明。两侧资料不足时保留空缺，避免用无关照片制造完整对照。';
const table=dimensions.length?'<section class="compare-dimensions" aria-label="已收录内容的风格对照"><div class="compare-dimensions__head"><span>观察维度</span><strong>日本来源</strong><strong>韩国来源</strong></div>'+dimensions.map(c=>'<div class="compare-dimension"><h3>'+E(c.dimension)+'</h3><p>'+list(c.jpKeywords).map(E).join(' / ')+'</p><p>'+list(c.krKeywords).map(E).join(' / ')+'</p></div>').join('')+'</section>':'<p class="editor-note">尚无同时具备两侧原帖依据的维度总结，暂不沿用概括性结论。</p>';
return page('compare',heading('SOURCE STUDY / JAPAN × KOREA','从同一场景，读两种照片。',lookSummary(data)+'<br>对照范围随入库资料更新')+'<p class="editor-intro compare-intro">'+intro+'</p>'+table+(scenes.length?scenes.map(compareScene).join(''):C.empty('还没有可做场景对照的资料','场景未核实时不补写对照，请先浏览来源记录。','#/bloggers','查看来源图鉴')));
};
function trendGroups(){
return [...new Set(looks().flatMap(p=>list(p.styles))).values()].filter(style=>style&&!/未核实|未知/.test(style)).slice(0,6).map(style=>({title:style,_posts:looks().filter(p=>list(p.styles).includes(style)),tags:[style],lines:[]}));
}
function trendRank(p,index,max){const b=U.blogger(p.bloggerId)||{};return '<a href="#/p/'+E(p.id)+'" class="trend-rank"><span class="trend-rank__index">'+String(index+1).padStart(2,'0')+'</span>'+C.image(p,0,'trend-rank__image')+'<div class="trend-rank__body"><div><strong>'+E(title(p))+'</strong><span>'+U.number(p.likes)+' 公开点赞</span></div><p>'+E(b.handle||b.name)+' · '+E(imagePosition(p))+'</p><span class="heat-bar"><span style="width:'+Math.round(p.likes/max*100)+'%"></span></span></div>'+C.icon('arrow-right',16)+'</a>';}
function trendCard(t,index){const p=t._posts[0],lines=list(t.lines);return '<article class="trend-card"><a class="trend-card__cover" href="#/p/'+E(p.id)+'">'+C.image(p)+'<span class="eyebrow">STYLE INDEX / '+String(index+1).padStart(2,'0')+'</span></a><div class="trend-card__body"><h2>'+E(t.title||t.name||'来源造型分类')+'</h2><div class="trend-card__notes">'+(lines.length?lines.map(line=>'<p>'+E(line)+'</p>').join(''):'<p>当前分类收录 '+lookSummary(t._posts)+'，按图片整理。风格名称为资料索引标签，不代表来源作者的身份或风格自述。</p>')+'</div><div class="trend-card__posts">'+t._posts.slice(0,3).map(post=>'<a href="#/p/'+E(post.id)+'">'+'<span>'+E(title(post))+imageLabel(post)+'</span>'+C.icon('arrow-right',13)+'</a>').join('')+'</div><div class="trend-card__tags">'+list(t.tags).map(tagLink).join('')+'</div></div></article>';}
V.renderTrends=function(){
const data=looks(),ranked=originals(data).filter(p=>numeric(p.likes)).sort((a,b)=>b.likes-a.likes).slice(0,5),groups=trendGroups(),max=ranked.length?Math.max(1,ranked[0].likes):1;
const ranking=ranked.length?'<section class="trend-ranking"><div class="section-title"><h2>已核实公开点赞 · '+ranked.length+' 篇原帖</h2><span class="muted">同一原帖只列一次；公开数值为采集时记录。</span></div>'+ranked.map((p,i)=>trendRank(p,i,max)).join('')+'</section>':'<p class="editor-note">当前记录的互动数值尚未核实，因此不生成热度榜，也不以估算数字排列内容。</p>';
return page('trends',heading('PUBLIC SOURCES / STYLE TOPICS','从收录资料，寻找穿搭线索。',lookSummary(data)+'<br>'+groups.length+' 个已有分类')+'<p class="editor-intro">以下选题按造型图片整理，同一原帖可以出现在多个图片记录中。照片中的相似廓形可以一起观察，具体品牌、材质和款式仍以原始说明为准。</p>'+ranking+(groups.length?'<section class="trend-grid">'+groups.map(trendCard).join('')+'</section>':C.empty('暂无已整理的风格选题','来源内容完成分类后会出现在这里。','#/bloggers','查看来源图鉴')));
};
function currencyOf(item){const names={RMB:'CNY','人民币':'CNY','韩元':'KRW','日元':'JPY','美元':'USD','欧元':'EUR'};let currency=String(item.priceCurrency||item.currency||'').toUpperCase();if(names[currency])currency=names[currency];if(!currency){const match=String(item.price||'').match(/\b(KRW|CNY|RMB|JPY|USD|EUR|GBP|HKD)\b/i);currency=match?match[1].toUpperCase():String(item.price||'').includes('₩')?'KRW':'';}return /^[A-Z]{3}$/.test(currency)?(names[currency]||currency):null;}
function priceInfo(item){
const currency=currencyOf(item);if(!currency)return null;let min=item.priceMin,max=item.priceMax;
if(numeric(item.priceNumeric)&&item.priceNumeric>0)min=max=item.priceNumeric;
if(!(numeric(min)&&numeric(max)&&min>0&&max>=min)){if(typeof item.price!=='string'||/未核实|未知|待/.test(item.price))return null;const values=item.price.replace(/,/g,'').match(/\d+(?:\.\d+)?/g);if(!values||Number(values[0])<=0)return null;min=Number(values[0]);max=/[～~–至]/.test(item.price)?Number(values[1]||values[0]):min;if(max<min)return null;}
return {currency,min,max};
}
function amount(value,currency){return Number(value).toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+currency;}
function priceText(info){return info.min===info.max?amount(info.min,info.currency):amount(info.min,info.currency)+'～'+amount(info.max,info.currency);}
function closetBudget(items){const known=items.map(priceInfo).filter(Boolean),groups={};known.forEach(p=>{if(!groups[p.currency])groups[p.currency]={currency:p.currency,min:0,max:0};groups[p.currency].min+=p.min;groups[p.currency].max+=p.max;});return {known:known.length,unknown:items.length-known.length,totals:Object.values(groups)};}
function itemEvidence(item){if(item.identification==='exact')return item.officialProductVerified?'原帖与官网商品名已核对':item.brand?'原帖明示单品；官网对应关系以依据为准':'原帖明示目录名；制造品牌未确认';return ({brand:'品牌已确认，具体型号未核实',visual:'仅视觉判断，品牌型号未确认'})[item.identification]||'品牌与型号未核实';}
function availabilityText(item){const states=list(item.availabilityStates),inside=states.includes('InStock'),outside=states.includes('OutOfStock');if(inside&&outside)return '官网采集记录：部分规格有货、部分无货，按所选尺码确认。';if(outside&&!inside)return '官网采集记录：无货；以商品页当前状态为准。';if(inside)return '官网采集记录：有可选规格；以商品页当前状态为准。';return '';}
function closetItem(item){
const price=priceInfo(item),brand=item.identification==='visual'?'品牌未确认':item.brand,product=item.identification==='exact'&&validUrl(item.productUrl),label=item.officialProductVerified?'查看官网同款':'查看原帖单品链接',stock=availabilityText(item);
return '<article class="closet-item"><span class="closet-item__swatch">'+C.icon('hanger',23)+'</span><div><h3>'+E(item.name||'单品记录')+'</h3><p>'+E([brand,item.color,item.category].filter(Boolean).join(' · ')||'单品细节未核实')+'</p><strong>'+(price?E(priceText(price)):'价格或币种未核实')+'</strong><p class="item-evidence">'+itemEvidence(item)+'</p>'+(product?external(item.productUrl,label):'')+external(item.evidenceUrl||item.sourceUrl,'查看原帖依据')+(stock?'<p class="item-stock-note">'+E(stock)+'</p>':'')+(price&&item.priceBasis?'<p class="item-price-basis">'+E(item.priceBasis)+'</p>':'')+'</div><button class="icon-button" data-action="remove-item" data-id="'+E(item.id)+'" aria-label="从本地衣橱移除 '+E(item.name||'单品记录')+'">'+C.icon('close',18)+'</button></article>';
}
function closetItems(items){
if(!items.length)return C.empty('衣橱中还没有单品记录','从有原帖依据的单品开始，已核对到官网的同款会显示详情链接。','#/explore','查看造型与同款');
const budget=closetBudget(items),brandOf=item=>item.identification==='visual'?'品牌未确认':item.brand||'制造品牌未确认',brands=[...new Set(items.map(brandOf))];
return '<div class="closet-budget"><span>已核实价格 '+budget.known+' 件 / 未核实 '+budget.unknown+' 件</span>'+(budget.totals.length?budget.totals.map(p=>'<strong>'+E(priceText(p))+'</strong>').join(''):'<strong>价格未核实</strong>')+'<p>按原币种分别小计，未换汇。仅合计已核实价格，未知价格不作为零元计入；库存、运费与税费请在商品页确认。</p></div>'+brands.map(brand=>'<section class="closet-brand"><div class="closet-brand__heading"><h3>'+E(brand)+'</h3><span>'+items.filter(i=>brandOf(i)===brand).length+' 件</span></div>'+items.filter(i=>brandOf(i)===brand).map(closetItem).join('')+'</section>').join('');
}
function savedLooks(data){return data.length?'<div class="closet-saved-grid">'+data.map(p=>'<div class="closet-saved"><a href="#/p/'+E(p.id)+'">'+C.image(p)+'<span>'+E(title(p))+'</span>'+imageLabel(p)+'</a><button class="closet-saved__remove" data-action="save" data-id="'+E(p.id)+'" aria-label="移除本地收藏 '+E(title(p))+'">'+C.icon('close',15)+'</button></div>').join('')+'</div>':C.empty('这里还没有本地收藏','点击书签保存资料，收藏不会同步到 Instagram。','#/explore','浏览来源记录');}
V.renderCloset=function(){
const saved=list(S.get('saves')).map(U.post).filter(p=>p&&validUrl(p.sourceUrl)),items=list(S.get('closet')).map(U.item).filter(Boolean),tab=A.state.closetTab==='items'?'items':'looks';
return page('closet',heading('YOUR LOCAL REFERENCE ARCHIVE','我的衣橱','仅保存在此浏览器<br>不与 Instagram 同步')+'<p class="editor-intro">分别收藏造型图片与单品。购买同款时先核对原帖单品名和官网链接；仅视觉相似的记录会明确标注。</p><div class="closet-tabs" role="tablist" aria-label="本地衣橱内容">'+[['looks','收藏的造型',saved.length],['items','单品资料',items.length]].map(([id,label,count])=>'<button role="tab" class="'+(tab===id?'is-active':'')+'" aria-selected="'+(tab===id)+'" data-action="closet-tab" data-tab="'+id+'">'+label+' <span>'+count+'</span></button>').join('')+'</div><div class="closet-layout" data-tab="'+tab+'"><section class="closet-panel closet-panel--looks"><div class="section-title"><h2>收藏的造型 <span>'+saved.length+'</span></h2><small class="closet-source-count">'+originals(saved).length+' 篇原帖</small>'+(saved.length?'<button class="text-link" data-action="clear-closet" data-kind="saves">清空收藏</button>':'')+'</div>'+savedLooks(saved)+'</section><section class="closet-panel closet-panel--items"><div class="section-title"><h2>单品资料 <span>'+items.length+'</span></h2>'+(items.length?'<button class="text-link" data-action="clear-closet" data-kind="closet">清空单品</button>':'')+'</div>'+closetItems(items)+'</section></div>');
};
V.renderAbout=function(){
const data=looks(),active=new Set(data.map(p=>p.bloggerId)).size,captured=String(A.data.capturedAt||'').slice(0,10),coverage=sources().length+' 个来源，其中 '+active+' 个有合格造型；'+lookSummary(data);
return page('about',heading('ABOUT / SOURCES & EXACT ITEMS','先核对原帖，再找到真同款。',lookSummary(data)+'<br>'+(captured?'资料采集：'+E(captured):'采集时间未标明'))+'<div class="about-intro"><span class="about-mark">'+C.icon('hanger',64)+'</span><div><p class="eyebrow">JAPAN × KOREA / STYLE REFERENCES</p><p>FITGRAM 把真实穿搭图片、原帖证据和已核对的单品页面整理在一起，帮助你从一套造型追溯到具体衣服。当前以 CORTIS、BOYNEXTDOOR、RIIZE 的官方原帖，以及高粉日本创作者和已核实品牌单品为参考。</p><p class="about-coverage">当前收录：'+E(coverage)+'。</p></div></div><div class="about-sections"><section><span class="eyebrow">01 / LOOKS & SOURCE POSTS</span><h2>一篇原帖，可以包含多套造型。</h2><p>页面按造型组织图片。同一篇原帖中的不同图片或不同造型可以单独成卡，因此造型数量不等于独立原帖数量。原帖按永久链接去重，造型标注所引用的原帖图片序号；没有序号依据时明确显示未注明。</p><p>来源主页、原帖链接与图片位置共同说明出处。策展账号的发布者不一定是摄影师或出镜者，署名以原帖为准；原页面也可能更新、删除或转为私密。</p></section><section><span class="eyebrow">02 / FIND THE EXACT ITEM</span><h2>把型号依据，与外观相似分开。</h2><p>“原帖明示单品”表示原文提供了名称或目录编号；零售目录名不自动等于制造品牌。“品牌已确认”只确认到品牌，“视觉判断”则不确认品牌和型号。只有原帖单品与官网名称、颜色等信息核对一致时，才标记官网对应关系并提供同款详情入口。</p><p>购买前可沿单品条目的原帖依据与官网链接复核型号、颜色和尺码。没有证实的材质、身高、气温、价格和互动数据保持未核实；本站风格、场景与搭配文案属于编辑观察。</p></section><section><span class="eyebrow">03 / ORIGINAL CURRENCY</span><h2>价格保留原币种，未知项留空。</h2><p>已核实的官网价格显示原币种，例如KRW韩元；衣橱按币种分别小计，不自动换算人民币，也不把韩元数值当作人民币。小计只包含已有可用价格的单品，未核实项不作为零元计入，不能当作整套造型的完整预算。</p><p>价格和库存是记录时的页面信息，具体颜色、尺码、运费、税费及能否购买，请在商品页确认。单品依据帮助查找同款，不代表尺码、真伪鉴定或购买推荐。</p></section><section><span class="eyebrow">04 / PHOTO RIGHTS & LOCAL ACTIONS</span><h2>照片属于原作者，收藏留在本地。</h2><p>图片、原文、人物肖像及品牌标志的权利属于各自的摄影师、创作者、出镜者或权利人。资料索引不转移这些权利；公开发布、商业使用或进一步传播应取得所需授权。图片速览只是本地静态照片切换，不是原作者发布的视频。</p><p>本地喜欢、收藏、衣橱与来源追踪仅保存在当前浏览器，不会登录或操作Instagram账号。清除浏览器数据会移除记录；存储不可用时使用本次会话内存。公开互动数字只展示已核实的采集记录，不是实时数据。</p></section><section class="about-disclaimer"><span class="eyebrow">05 / SOURCE RELATIONSHIP</span><h2>原帖与商品页，是最终核对入口。</h2><p>FITGRAM 不代表Instagram或收录来源，也不表示合作、赞助或背书。具体信息与商品可用状态以来源原帖和对应商品页为准；视觉相似的记录不会标成已确认的同款。</p></section></div><div class="about-links"><a href="#/bloggers">查看来源图鉴 '+C.icon('arrow-right',16)+'</a><a href="#/explore">浏览造型与单品 '+C.icon('arrow-right',16)+'</a></div>');
};
function reelAction(action,icon,label,p){const active=S.has(action==='like'?'likes':'saves',p.id),state=action==='like'?'is-liked':'is-saved';return '<button class="reel-action '+(active?state:'')+'" data-action="'+action+'" data-id="'+E(p.id)+'" aria-label="'+label+'" aria-pressed="'+active+'">'+C.icon(icon,26)+'<span>'+label+'</span></button>';}
function reelCard(p,index,total){
const b=U.blogger(p.bloggerId)||{},hasSecond=list(p.images).length>1;
return '<section class="reel" data-reel="'+index+'" aria-label="图片速览 '+(index+1)+'：'+E(title(p))+'"><div class="reel-stage"><div class="reel-frames">'+C.image(p,0,'reel-frame reel-frame--first')+(hasSecond?C.image(p,1,'reel-frame reel-frame--second'):'')+'</div><div class="reel-shade"></div><header class="reel-header"><div><span class="eyebrow">PHOTO REFERENCES / NOT A VIDEO</span><span>'+String(index+1).padStart(2,'0')+' / '+String(total).padStart(2,'0')+'</span></div><button class="icon-button reel-play" data-action="reel-play" aria-label="暂停图片速览" aria-pressed="false">'+C.icon('pause',22)+'</button></header><div class="reel-copy"><a class="reel-account" href="#/blogger/'+E(b.id)+'">'+C.avatar(b,32,false)+'<strong>'+E(b.handle||b.name||'来源记录')+'</strong>'+verified(b)+'</a><h2>'+E(title(p))+'</h2>'+imageLabel(p)+'<p>'+E(String(p.caption||'原始说明请查看来源页面。').slice(0,90))+'</p><a class="reel-details" href="#/p/'+E(p.id)+'">查看来源与单品依据 '+C.icon('arrow-right',16)+'</a>'+external(p.sourceUrl,'打开原帖','reel-source-link')+'<div class="reel-audio">'+C.icon('volume-off',13)+'<span>静态照片速览 · 无音轨 · 图片版权归原作者</span></div></div><span class="reel-progress"></span></div><aside class="reel-actions">'+reelAction('like','heart','本地喜欢',p)+reelAction('save','bookmark','本地收藏',p)+'<button class="reel-action" data-action="share" data-id="'+E(p.id)+'" aria-label="复制造型资料链接">'+C.icon('share',26)+'<span>复制链接</span></button></aside></section>';
}
V.renderReels=function(){const data=looks();return '<div class="reels-page"><h1 class="sr-only">来源图片速览</h1><p class="reels-hint">'+C.icon('arrow-down',15)+'<span>上下滑动查看来源照片。</span></p><div class="reels-scroller" tabindex="0" aria-label="来源图片速览，使用上下方向键切换">'+(data.length?data.map((p,i)=>reelCard(p,i,data.length)).join(''):C.empty('尚无可速览的来源图片','仅展示已有原帖链接的入库内容。','#/bloggers','查看来源图鉴'))+'</div></div>';};
V.toggleReel=function(button){const reel=button.closest('.reel');if(!reel)return;const paused=reel.classList.toggle('is-paused');button.innerHTML=C.icon(paused?'play':'pause',22);button.setAttribute('aria-label',paused?'播放图片速览':'暂停图片速览');button.setAttribute('aria-pressed',paused);};
V.mountExtra=function(route){
if(route!=='reels'&&route!=='#/reels')return;const scroller=document.querySelector('.reels-scroller'),reels=[...document.querySelectorAll('.reel')];if(!scroller||!reels.length)return;
reelObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-current',entry.isIntersecting&&entry.intersectionRatio>=.65)),{root:scroller,threshold:.65});reels.forEach(reel=>reelObserver.observe(reel));
reelKeyHandler=function(event){if(!['ArrowUp','ArrowDown'].includes(event.key)||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||document.body.classList.contains('is-locked'))return;event.preventDefault();const current=Math.round(scroller.scrollTop/scroller.clientHeight),next=Math.max(0,Math.min(reels.length-1,current+(event.key==='ArrowDown'?1:-1)));scroller.scrollTo({top:next*scroller.clientHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
document.addEventListener('keydown',reelKeyHandler);
};
V.cleanupExtra=function(){if(reelObserver)reelObserver.disconnect();reelObserver=null;if(reelKeyHandler)document.removeEventListener('keydown',reelKeyHandler);reelKeyHandler=null;};
})(window.App);
