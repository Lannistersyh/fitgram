/* 可复用图标、头像、媒体与社交卡片；动态文本先转义。 */
(function(A){
  'use strict';
  const C=A.components,U=A.utils,E=U.escape;
  const paths={
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    compass:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
    film:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M4 8h16M9 3l3 5m3-5 3 5"/><path d="m10 12 5 3-5 3Z"/>',
    message:'<path d="M21 3 9.5 14.5M21 3l-6.5 18-5-6.5L3 9.5Z"/>',
    heart:'<path d="M20.8 4.7a5.4 5.4 0 0 0-7.6 0L12 5.9l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.7a5.4 5.4 0 0 0 0-7.6Z"/>',
    create:'<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M12 7v10M7 12h10"/>',
    bookmark:'<path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17l-7-5Z"/>',
    comment:'<path d="M21 11.5a9 9 0 0 1-9 9 9.3 9.3 0 0 1-4.2-1L3 21l1.5-4.8a9.3 9.3 0 0 1-1-4.2 9 9 0 1 1 17.5-.5Z"/>',
    share:'<path d="m14 4 7 7-7 7v-4c-5 0-8 2-11 6 0-8 4-12 11-12Z"/>',
    more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',left:'<path d="m15 5-7 7 7 7"/>',right:'<path d="m9 5 7 7-7 7"/>',up:'<path d="m5 15 7-7 7 7"/>',down:'<path d="m5 9 7 7 7-7"/>',
    volume:'<path d="M11 4 6 8H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',mute:'<path d="M11 4 6 8H3v8h3l5 4ZM16 9l5 6m0-6-5 6"/>',play:'<path d="m8 4 12 8-12 8Z"/>',pause:'<path d="M8 5v14M16 5v14"/>',
    hanger:'<path d="M9 6a3 3 0 1 1 5 2.2c-1.3 1-2 1.4-2 2.8L3 17a1 1 0 0 0 .6 1.8h16.8A1 1 0 0 0 21 17l-9-6M7 15h5"/>',
    filter:'<path d="M4 6h16M7 12h10M10 18h4"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',check:'<path d="m5 12 4 4L19 6"/>',refresh:'<path d="M20 8a8 8 0 1 0 .2 7M20 3v5h-5"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5"/>',moon:'<path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',trash:'<path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',external:'<path d="M14 3h7v7M21 3 11 13M10 3H3v18h18v-7"/>',star:'<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z"/>'
  }
  ;
  paths.edit='<path d="m16 3 5 5-12 12-6 1 1-6ZM14 5l5 5"/>';
  paths.layers='<path d="m12 3 10 5-10 5L2 8ZM2 12l10 5 10-5M2 16l10 5 10-5"/>';
  const aliases={
    'arrow-right':'right','arrow-left':'left','chevron-right':'right','chevron-left':'left','arrow-up':'up','arrow-down':'down','chevron-down':'down','volume-off':'mute','plus-square':'create',save:'bookmark',closet:'hanger',explore:'compass',reels:'film',notifications:'heart',plus:'create',users:'user',location:'pin',verified:'check',settings:'filter',send:'message'
  }
  ;
  C.icon=function(name,size=24){
    return '<svg class="icon icon--'+E(name)+'" width="'+Number(size)+'" height="'+Number(size)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[aliases[name]||name]||paths.info)+'</svg>';
  }
  ;
  // 外部来源只允许 HTTP(S)，避免数据字段变成可执行链接。
  C.safeUrl=function(value){
    return /^https?:\/\/[^\s<>"']+$/i.test(String(value||''))?String(value):'';
  };
  C.externalLink=function(url,label,className=''){
    const safe=C.safeUrl(url);
    return safe?'<a class="'+E(className)+'" href="'+E(safe)+'" target="_blank" rel="noopener noreferrer">'+E(label)+C.icon('external',11)+'</a>':'<span class="source-unverified">来源链接未核实</span>';
  };
  C.verified=function(blogger){
    return blogger&&blogger.verified===true?'<span class="verified" title="采集时已核实的平台认证" aria-label="采集时已核实的平台认证">'+C.icon('check',10)+'</span>':'';
  };
  C.sourceKind=function(blogger){
    return ({creator:'个人创作者',curation:'穿搭选辑',magazine:'时尚媒体',brand:'品牌账号',group:'男团官方'})[(blogger||{}).sourceKind]||'来源账号';
  };
  C.sourceDate=function(post){
    const date=post.sourceDate||post.date;
    return date&&/^\d{4}-\d{2}-\d{2}/.test(String(date))?String(date).slice(0,10).replace(/-/g,'.'):'发布日期未核实';
  };
  C.sourceLink=function(post,label='查看原帖'){
    return C.externalLink(post.sourceUrl,label,'post-source-link');
  };
  C.sourceImageNumber=function(post,index=0){
    const images=post.images||[],evidence=(post.imageEvidence||[]).find(entry=>entry.localFile===images[index])||(post.imageEvidence||[])[index]||{};
    const value=(post.sourceImageIndices||[])[index]??evidence.sourceImageIndex??(index===0?post.sourceImageIndex:null),number=Number(value);
    return Number.isInteger(number)&&number>0?number:null;
  };
  C.sourceImageLabel=function(post,index=0){
    const number=C.sourceImageNumber(post,index);return number?'原帖第'+number+'张':'原帖图序未核实';
  };
  C.carouselLabel=function(post,index=0){
    const length=(post.images||[]).length;return C.sourceImageLabel(post,index)+(length>1?' · 本页 '+(index+1)+'/'+length:'');
  };
  C.sourceImageBadge=function(post,index=0,className=''){
    return '<span class="source-image-badge '+E(className)+'" data-source-image-label>'+E(C.sourceImageLabel(post,index))+'</span>';
  };
  C.focusLabel=function(post){
    const explicit=post.focusPerson||post.focusPosition||post.subjectPosition;
    if(typeof explicit==='string'&&explicit.trim())return explicit.startsWith('重点分析')?explicit:'重点分析：'+explicit;
    const positions={左侧:0,右侧:0,中间:0,中央:0},title=String(post.title||'').match(/^(左侧|右侧|中间|中央)[｜|：:]/);
    (post.items||[]).forEach(entry=>{const name=String((U.item(entry.itemId)||entry).name||''),match=name.match(/^(左侧|右侧|中间|中央)/);if(match)positions[match[1]]++;});
    const position=title?title[1]:Object.keys(positions).sort((a,b)=>positions[b]-positions[a])[0];
    return title||positions[position]>0?'重点分析：'+(position==='中央'?'画面中央人物':'合照'+position+'人物'):'';
  };
  C.collectionSummary=function(posts=A.data.posts||[]){
    const sources=new Set(posts.map(post=>post.originalSourceCode||post.sourceCode||post.code||post.sourceUrl).filter(Boolean));
    return posts.length+' 套造型 · '+sources.size+' 条原帖';
  };
  C.localComments=function(id){
    const stored=A.store.get('comments'),comments=stored&&Array.isArray(stored[id])?stored[id]:[];
    return comments.filter(comment=>comment&&comment.scope==='local-analysis');
  };
  C.likeText=function(post){return A.store.has('likes',post.id)?'已加入本地喜欢':'喜欢这套造型';};
  C.renderLikeStatus=function(post){
    const known=typeof post.likes==='number'&&Number.isFinite(post.likes)&&post.likes>=0;
    return '<span data-local-like-state="'+E(post.id)+'">'+C.likeText(post)+'</span><small class="post-card__platform-count">'+(known?'原帖 '+U.number(post.likes)+' 次喜欢 · 采集时记录':'原帖互动尚未核实')+'</small>';
  };
  function avatarPlaceholder(b){
    const letter=String(b.handle||b.name||'F').replace('@','').charAt(0).toUpperCase();
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e7e8e3"/><path d="M0 25h100M0 50h100M0 75h100M25 0v100M50 0v100M75 0v100" stroke="#d5d8cf" stroke-width=".5"/><text x="50" y="62" fill="#72796b" text-anchor="middle" font-family="Arial,sans-serif" font-size="34">'+E(letter)+'</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  C.avatar=function(blogger,size=32,story=false){
    const b=blogger||{handle:'F'},seen=A.store.has('seenStories',b.id),placeholder=avatarPlaceholder(b);
    return '<span class="avatar'+(story?' avatar--story':'')+(seen?' is-seen':'')+'" style="--avatar-size:'+Number(size)+'px"><img src="'+E(b.avatar||b.avatarLocal||placeholder)+'" data-remote="'+E(b.avatarRemote||'')+'" data-placeholder="'+E(placeholder)+'" onerror="App.utils.imageFallback(this)" width="'+Number(size)+'" height="'+Number(size)+'" alt="'+E((b.handle||b.name||'来源账号')+' 的头像')+'" loading="lazy"></span>';
  };
  C.aspect=function(post,index=0){
    const dimensions=(post.imageDimensions||[])[index]||{},parts=String(post.aspect||'4:5').split(/[:/]/);
    const width=Number(dimensions.width||post.imageWidth||parts[0]),height=Number(dimensions.height||post.imageHeight||parts[1]);
    return Number.isFinite(width)&&Number.isFinite(height)&&width>0&&height>0?width/height:.8;
  };
  C.image=function(post,index=0,className=''){
    const p=post||{},images=p.images||[],i=Math.max(0,Math.min(index,images.length-1)),placeholder=p.placeholder||'assets/placeholder/neutral.svg';
    const ratio=C.aspect(p,i),height=1350,width=Math.round(height*ratio);
    const base=(p.altTexts||[])[i]||(i===0?p.alt:'')||p.title||'来源原帖中的穿搭照片',focus=C.focusLabel(p),position=C.sourceImageLabel(p,i);
    const alt=[base,focus&&!String(base).includes(focus)?focus:'',!String(base).includes(position)?position:''].filter(Boolean).join('；');
    return '<img class="look-image '+(Math.abs(ratio-1)<.01?'look-image--square ':'')+E(className)+'" src="'+E(images[i]||placeholder)+'" data-post-id="'+E(p.id)+'" data-image-index="'+i+'" data-remote="'+E((p.remoteImages||[])[i]||'')+'" data-placeholder="'+E(placeholder)+'" onerror="App.utils.imageFallback(this)" width="'+width+'" height="'+height+'" loading="lazy" decoding="async" alt="'+E(alt)+'">';
  };
  C.renderPostHeader=function(post){
    const b=U.blogger(post.bloggerId)||{},handle=post.sourceHandle||b.handle||'来源账号';
    const meta=[C.sourceKind(b),post.lookContext||post.location].filter(Boolean).join(' · ');
    return '<header class="post-card__header"><a href="#/blogger/'+E(b.id)+'" aria-label="查看 '+E(handle)+'">'+C.avatar(b,32)+'</a><div class="post-card__identity"><div><a class="post-card__handle" href="#/blogger/'+E(b.id)+'">'+E(handle)+'</a>'+C.verified(b)+'</div><span class="post-card__location">'+E(meta)+'</span></div>'+C.sourceLink(post,'原帖')+'<button class="icon-button" data-action="more-post" data-id="'+E(post.id)+'" aria-label="更多来源与造型操作">'+C.icon('more')+'</button></header>';
  };
  C.renderActions=function(post,detail=false){
    const id=E(post.id),liked=A.store.has('likes',post.id),saved=A.store.has('saves',post.id);
    return '<div class="post-card__actions"><button class="icon-button'+(liked?' is-liked':'')+'" data-action="like" data-id="'+id+'" aria-label="'+(liked?'取消本地喜欢':'加入本地喜欢')+'" aria-pressed="'+liked+'">'+C.icon('heart')+'</button><button class="icon-button" data-action="comment" data-id="'+id+'" aria-label="查看并添加本站笔记">'+C.icon('comment')+'</button><button class="icon-button" data-action="share" data-id="'+id+'" aria-label="分享这套造型">'+C.icon('share')+'</button>'+(detail?'':'<a class="post-card__details" href="#/p/'+id+'">穿搭分析 '+C.icon('right',12)+'</a>')+'<button class="icon-button post-card__save'+(saved?' is-saved':'')+'" data-action="save" data-id="'+id+'" aria-label="收藏到本地衣橱" aria-pressed="'+saved+'">'+C.icon('bookmark')+'</button></div>';
  };
  C.renderCarousel=function(post,index=0){
    const length=(post.images||[]).length;if(length<2)return C.sourceImageBadge(post,index);
    return '<button class="carousel-arrow carousel-arrow--left" data-action="carousel" data-id="'+E(post.id)+'" data-index="'+index+'" data-direction="-1" aria-label="上一张">'+C.icon('left',16)+'</button><button class="carousel-arrow carousel-arrow--right" data-action="carousel" data-id="'+E(post.id)+'" data-index="'+index+'" data-direction="1" aria-label="下一张">'+C.icon('right',16)+'</button><span class="post-card__counter" data-source-image-label>'+E(C.carouselLabel(post,index))+'</span><span class="carousel-dots" aria-hidden="true">'+post.images.map((_,i)=>'<i class="'+(i===index?'is-active':'')+'"></i>').join('')+'</span>';
  };
  function renderPreviewComments(post){
    return C.localComments(post.id).slice(0,2).map(c=>'<p class="post-card__comment"><strong>我的本地笔记</strong> '+E(c.text)+'</p>').join('');
  }
  function renderPostMeta(post){
    const credit=post.sourceCredit||post.sourceHandle||'原帖来源';
    return '<div class="post-card__provenance"><span>'+E(C.sourceDate(post))+' · '+E(C.sourceImageLabel(post))+'</span>'+C.sourceLink(post,'核对原帖')+'</div><p class="post-card__credit">图片来源：'+E(credit)+' · 中文内容为本站视觉分析</p>';
  }
  function renderCardTitle(post){
    const focus=C.focusLabel(post);return '<div class="post-card__look-title"><strong>'+E(post.title||'穿搭视觉笔记')+'</strong>'+(focus?'<small>'+E(focus)+'</small>':'')+'</div>';
  }
  C.renderPostCard=function(post){
    const id=E(post.id),notes=C.localComments(post.id).length,temp=post.tempBand&&post.tempBand!=='unknown'&&post.temperatureType!=='unverified'?'<span class="post-card__temperature">'+C.icon('layers',12)+' '+E(U.temp(post.tempBand))+' · 搭配建议</span>':'';
    return '<article class="post-card" data-post-id="'+id+'">'+C.renderPostHeader(post)+'<div class="post-card__media">'+C.image(post)+temp+C.renderCarousel(post)+'</div>'+C.renderActions(post)+'<div class="post-card__body">'+renderCardTitle(post)+'<p class="post-card__likes">'+C.renderLikeStatus(post)+'</p><div class="post-card__caption"><strong class="post-card__analysis-label">视觉分析</strong> '+E(post.caption)+'</div><button class="post-card__more" data-action="caption" data-id="'+id+'" aria-expanded="false">更多</button><p class="post-card__tags">'+(post.tags||[]).map(t=>'<a href="#/tag/'+encodeURIComponent(t.replace(/^#/,''))+'">'+E(t)+'</a>').join(' ')+'</p><button class="post-card__all-comments" data-action="comment" data-id="'+id+'">'+(notes?'查看 '+notes+' 条本地笔记':'写下你的穿搭笔记')+'</button>'+renderPreviewComments(post)+renderPostMeta(post)+'</div></article>';
  };
  C.renderGrid=function(posts){
    return '<div class="post-grid">'+posts.map(p=>'<a class="grid-card" href="#/p/'+E(p.id)+'" aria-label="查看 '+E(p.title)+' 的来源与分析">'+C.image(p)+C.sourceImageBadge(p,0,'source-image-badge--grid')+'<span class="grid-card__label">'+E((p.styles||[])[0]||'穿搭分析')+'</span><span class="grid-card__overlay"><span>'+C.icon('layers',19)+'查看分析</span><span>'+C.icon('bookmark',19)+(A.store.has('saves',p.id)?'已本地收藏':'本地收藏')+'</span></span>'+((p.images||[]).length>1?'<span class="grid-card__multiple">'+C.icon('copy',16)+'</span>':'')+'</a>').join('')+'</div>';
  };
  C.renderStoryStrip=function(){
    const bloggers=(A.data.bloggers||[]).filter(b=>(A.data.posts||[]).some(p=>p.bloggerId===b.id)).slice(0,8);
    const source=[{id:'self',label:(A.store.get('saves')||[]).length?'我的收藏':'开始收藏'},...bloggers.map(b=>({id:b.id,label:String(b.handle||b.name).replace('@',''),blogger:b})),{id:'city-edit',label:'城市穿搭',symbol:'CITY'},{id:'cold-edit',label:'叠穿笔记',symbol:'A/W'}];
    return '<section class="story-strip" aria-label="造型速览"><div class="story-strip__heading"><span class="eyebrow">LOOK DIGEST</span><span>造型速览</span><small>'+E(C.collectionSummary())+'</small></div><div class="story-strip__list">'+source.map(s=>'<button class="story-bubble'+(s.id==='self'?' story-bubble--self':'')+'" data-action="story" data-blogger="'+s.id+'" aria-label="打开 '+E(s.label)+' 造型速览">'+(s.blogger?C.avatar(s.blogger,58,true):'<span class="story-bubble__editorial '+(A.store.has('seenStories',s.id)?'is-seen':'')+'"><span>'+(s.id==='self'?C.icon('bookmark',23):E(s.symbol))+'</span></span>')+'<span class="story-bubble__name">'+E(s.label)+'</span></button>').join('')+'</div></section>';
  };
  C.empty=function(title,desc,href,label){
    return '<div class="empty-state"><svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden="true"><rect x="22" y="9" width="76" height="82" rx="7" stroke="currentColor" stroke-width="1.2"/><path d="M42 37a18 18 0 0 1 36 0M36 61l24-17 24 17a3 3 0 0 1-2 5H38a3 3 0 0 1-2-5Z" stroke="currentColor" stroke-width="1.2"/><path d="M11 30h20M21 20v20m68 38h20m-10-10v20" stroke="currentColor" stroke-width="1.2"/></svg><h2>'+E(title)+'</h2><p>'+E(desc)+'</p>'+(href?'<a class="button button--primary" href="'+E(href)+'">'+E(label||'去发现页逛逛')+'</a>':'<button class="button button--primary" data-action="reset-filters">'+E(label||'重置筛选')+'</button>')+'</div>';
  };
  C.skeleton=function(){
    return '<div class="post-card skeleton-card" aria-label="正在加载来源选辑" aria-busy="true"><div class="skeleton skeleton--header"></div><div class="skeleton skeleton--image"></div><div class="skeleton skeleton--line"></div><div class="skeleton skeleton--line skeleton--short"></div></div>';
  };
})(window.App);
