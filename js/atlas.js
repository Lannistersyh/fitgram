/* 照片与真实商品共用分类；穿搭观察和商品证据分别展示。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,E=U.escape,S=A.store,T=A.seasons;
  const labels={shirts:'衬衫',tops:'针织 / 上衣',pants:'裤子',outerwear:'外套',shoes:'鞋履',bags:'包包',jewelry:'首饰',accessories:'配件'};
  const state=A.state.atlas={collection:'all',indexVisited:false,category:'all',query:'',scene:'all',pose:'all',styleFamily:'all',volume:'all',saved:false,date:null,season:null,seasonOnly:false,calendarMonth:null};
  const data=()=>window.FITGRAM_REFERENCES||{looks:[],source:{}};
  const japan=()=>window.FITGRAM_JAPAN||{looks:[],sources:[]};
  const allLooks=()=>[...japan().looks,...data().looks];
  const looks=()=>state.collection==='japan'?japan().looks:state.collection==='douyin'?data().looks:allLooks();
  const products=()=>window.FITGRAM_CATALOG?.items||[];
  const get=id=>allLooks().find(p=>p.id===id);
  const catRoute=(category=state.category,collection=state.collection)=> '#/catalog/'+(collection==='all'?'atlas':collection)+(category==='all'?'':'/'+category);
  const productRoute=p=>'#/catalog/all'+(p.category?'/'+p.category:'');
  const photoRoute=p=>'#/catalog/reference/'+p.id;
  const isSaved=p=>S.has('referenceSaves',p.id);
  const external=(url,text)=>C.externalLink(url,text,'text-link');
  function navigation(mode){
    const all=products(),links=[['learning','#/learn','搭配原理',window.FITGRAM_BALANCE?.lessons.length||0],['japan','#/catalog/japan','日系新选',japan().looks.length],['tailoring','#/catalog/blazers','西装款式',window.FITGRAM_TAILORING?.lessons.length||0],['leather','#/catalog/leather','皮包专题',window.FITGRAM_LEATHER?.selectedIds.length||0],['history','#/catalog/history','潮流历史',window.FITGRAM_HISTORY?.chapters.length||0],['world','#/catalog/world','风格地图',window.FITGRAM_WORLD?.styles.length||0],['references','#/catalog','穿搭图鉴',allLooks().length],['all','#/catalog/all','单品图鉴',all.length],['international','#/catalog/international','国际选品',all.filter(p=>p.collection==='international').length],['mainland','#/catalog/shoes','大陆清单',all.filter(p=>!p.collection).length],['reference','#/catalog/new','照片查款',all.filter(p=>p.collection==='reference').length]];
    return '<nav class="atlas-navigation" aria-label="分类图鉴栏目">'+links.filter(x=>x[3]).map(([id,href,label,count])=>'<a href="'+href+'" '+(mode===id?'aria-current="page"':'')+'>'+label+'<span>'+count+'</span></a>').join('')+'</nav>';
  }
  function douyinNote(){
    const s=data().source;
    return '<section class="catalog-source-note atlas-source"><strong>原抖音选辑 · 28 张参考的出处</strong><p>'+E(s.notice)+'</p><p>选辑发布于 '+E(s.publishedAt)+' · 整理于 '+E(s.verifiedAt)+' · '+external(s.sourceUrl,'查看抖音原帖')+'</p><details><summary>查看原帖的 8 张拼图</summary><div class="atlas-source-sheets">'+(s.collages||[]).map(c=>'<button data-action="atlas-collage" data-id="'+c.index+'" aria-label="查看原帖第 '+c.index+' 张拼图"><img src="'+E(c.image)+'" alt="原帖拼图 '+c.index+'" loading="lazy" width="2160" height="'+c.height+'"><span>原帖 '+c.index+(c.index===1?' · 封面（重复图）':' · 四宫格')+'</span></button>').join('')+'</div><p>封面中的 12 格已包含在后面 28 张大图中，图鉴按 28 张不重复照片收录。图片版权归原作者，保留原帖便于追溯。</p></details></section>';
  }
  function japanNote(){
    if(!japan().looks.length)return '';
    return '<section class="catalog-source-note atlas-source"><strong>日系新选 · Instagram 发布原帖</strong><p>每套保留发布账号、原帖与轮播序号，图片逐张查看后收录。款式、季节和近似选品由本站整理；图片由相应账号公开发布，摄影署名以原帖为准。</p><div class="atlas-japan-sources">'+japan().sources.map(s=>'<div>'+external(s.profileUrl,'@'+s.handle)+'<span>'+E(s.followersDisplay||'粉丝量未核实')+' · 收录快照 '+E(s.observedAt)+'</span></div>').join('')+'</div><p>选图比较主单品、比例、叠穿与配色，排除同套换角度、只有颜色变化及宣传拼图。具体区别写在每套详情中。</p></section>';
  }
  function sourceNote(collection=state.collection){return collection==='japan'?japanNote():collection==='douyin'?douyinNote():japanNote()+douyinNote();}
  function collections(){
    return '<nav class="atlas-collections" aria-label="参考图片分组">'+[['all','全部参考',allLooks().length],['japan','日系新选',japan().looks.length],['douyin','原抖音选辑',data().looks.length]].map(([id,label,count])=>'<a href="'+catRoute('all',id)+'" '+(id===state.collection?'aria-current="page"':'')+'>'+label+'<span>'+count+'</span></a>').join('')+'</nav>';
  }
  function photoAction(p){return p.collection==='japan'?external(p.provenance.sourceUrl,'查看 Instagram 原帖'):'<button data-action="atlas-collage" data-id="'+p.provenance.sourceCollage+'">查看来源拼图</button>';}
  function provenance(p){
    const v=p.provenance;
    if(p.collection==='japan')return '<div class="atlas-provenance"><b>发布账号 @'+E(v.handle)+' · 原帖第 '+v.photoIndex+' 张</b><p>'+(v.postedAt?'发布于 '+E(v.postedAt):'发布日期未核实')+' · 收录 '+E(v.collectedAt)+'<br>来源图片 '+v.sourceWidth+' × '+v.sourceHeight+' px；本站完整等比例缩小展示。</p>'+(p.captionNote?'<p>'+E(p.captionNote)+'</p>':'')+external(v.sourceUrl,'打开 Instagram 发布原帖')+'</div>';
    return '<div class="atlas-provenance"><b>原帖第 '+v.sourceCollage+' 张拼图 · '+E(v.position)+'</b><p>裁切来源 '+v.originalCropWidth+' × '+v.originalCropHeight+' px；本站展示图 900 px 宽。独立摄影原图尚未找到。</p>'+external(data().source.sourceUrl,'幸福小孩儿 · 抖音选辑原帖')+'</div>';
  }
  function distinction(p){return p.collection==='japan'?'<section class="atlas-distinction"><h2>搭配公式</h2><p class="atlas-formula">'+E(p.formula)+'</p><details><summary>这套与其他造型的区别</summary><p>'+E(p.distinctReason)+'</p></details></section>':'';}
  function saveButton(p){return '<button class="atlas-save '+(isSaved(p)?'is-saved':'')+'" data-action="atlas-save" data-id="'+p.id+'" aria-pressed="'+isSaved(p)+'" aria-label="'+(isSaved(p)?'取消收藏':'收藏参考')+' '+E(p.title)+'">'+C.icon('bookmark',17)+'</button>';}
  function seasonBadge(p){return '<span class="atlas-season-badge">'+E(T.label(p))+'款</span>';}
  function heroImages(){
    const season=T.context(state).season,candidates=looks().filter(p=>T.matches(p,season)).sort((a,b)=>(a.heroPriority||100)-(b.heroPriority||100)),list=T.prioritize(candidates,season).slice(0,3);
    return list.length?list.map(p=>'<a href="'+photoRoute(p)+'"><img src="'+E(p.thumbnail)+'" alt="'+E(p.title)+'" width="360" height="480"><span>'+p.id+' · '+E(T.label(p))+'</span></a>').join(''):'<p class="atlas-hero__empty">本组暂无'+T.names[season]+'季标注，<br>可以切换季节继续看。</p>';
  }
  function card(p){
    return '<article class="atlas-card" data-reference="'+p.id+'"><div class="atlas-card__visual"><a href="'+photoRoute(p)+'" aria-label="查看参考 '+p.id+'：'+E(p.title)+'"><img src="'+E(p.thumbnail)+'" alt="'+E(p.garments.join('、')+'；'+p.scene+'，'+p.pose)+'" loading="lazy" decoding="async" width="360" height="480"></a><span class="atlas-card__number">REF / '+p.id+'</span>'+saveButton(p)+'</div><a class="atlas-card__caption" href="'+photoRoute(p)+'"><div><span>'+E(p.scene)+' · '+E(p.pose)+'</span><span>'+p.matches.length+(p.collection==='japan'?' 条选品 / 对照':' 件近似选品')+'</span></div><h2>'+E(p.title)+'</h2>'+(p.collection==='japan'?'<p class="atlas-card__origin">'+E(p.styleFamily)+' · @'+E(p.provenance.handle)+'</p>':'')+A.balance.badge(p.id)+'<p>'+seasonBadge(p)+' '+p.categories.slice(0,3).map(c=>E(labels[c])).join(' / ')+'</p></a></article>';
  }
  function filtered(){
    const q=state.query.trim().toLowerCase();
    const season=T.context(state).season;
    return T.prioritize(looks().filter(p=>(!A.state.atlasProduct||p.matches.some(m=>m.itemId===A.state.atlasProduct))&&(state.category==='all'||p.categories.includes(state.category))&&(state.scene==='all'||p.scene===state.scene)&&(state.pose==='all'||p.pose===state.pose)&&(state.styleFamily==='all'||p.styleFamily===state.styleFamily)&&(state.volume==='all'||A.balance.guide(p.id)?.overall===state.volume)&&(!state.saved||isSaved(p))&&(!state.seasonOnly||T.matches(p,season))&&(!q||[p.id,p.title,p.palette,p.analysis,p.styleFamily,p.provenance.handle,p.captionNote,p.formula,A.balance.search(p.id),T.label(p),...p.searchTerms,...p.garments,...p.categories.map(c=>labels[c])].join(' ').toLowerCase().includes(q))),season);
  }
  function volumeFilter(){return '<label><span>量感</span><select id="atlas-volume"><option value="all">全部量感</option>'+Object.entries(A.balance.overall).map(([key,label])=>'<option value="'+key+'" '+(state.volume===key?'selected':'')+'>'+E(label)+'</option>').join('')+'</select></label>';}
  function filters(){
    const select=(key,label)=>'<label><span>'+label+'</span><select id="atlas-'+key+'"><option value="all">全部'+label+'</option>'+[...new Set(looks().map(p=>p[key]).filter(Boolean))].map(v=>'<option value="'+E(v)+'" '+(state[key]===v?'selected':'')+'>'+E(v)+'</option>').join('')+'</select></label>';
    return (A.state.atlasProduct?'<div class="atlas-active-filter">关联商品：'+E(products().find(p=>p.id===A.state.atlasProduct)?.name||'')+' <button class="text-link" data-action="atlas-reset">查看全部参考</button></div>':'')+'<nav class="catalog-tabs atlas-categories" aria-label="参考图服装类别">'+[['all','全部照片'],...Object.entries(labels)].map(([id,label])=>'<a href="'+catRoute(id)+'" '+(state.category===id?'aria-current="page" class="is-active"':'')+'>'+label+'<span>'+looks().filter(p=>id==='all'||p.categories.includes(id)).length+'</span></a>').join('')+'</nav><div class="atlas-controls"><label class="catalog-search">'+C.icon('search',17)+'<input type="search" id="atlas-search" value="'+E(state.query)+'" placeholder="找白衬衫、格纹、宽裤、皮鞋…" aria-label="搜索参考图的服装颜色或款式"></label>'+select('scene','场景')+select('pose','姿势')+(state.collection!=='douyin'?select('styleFamily','路线')+volumeFilter():'')+'<button class="chip" data-action="atlas-saved" aria-pressed="'+state.saved+'">只看收藏</button></div><div class="atlas-results"><p>按照片中可见的款式分类；一张图可以属于多个类别。</p><span id="atlas-count" role="status" aria-live="polite"></span></div>';
  }
  function renderIndex(category,collection='all'){
    if(collection!==state.collection){A.state.atlasProduct=null;Object.assign(state,{query:'',scene:'all',pose:'all',styleFamily:'all',volume:'all',saved:false});}
    state.indexVisited=true;
    state.collection=['all','japan','douyin'].includes(collection)?collection:'all';
    state.category=Object.hasOwn(labels,category)?category:'all';
    return '<div class="page page--atlas">'+navigation(state.collection==='japan'?'japan':'references')+'<header class="atlas-hero"><div><p class="eyebrow">THE STYLE & ITEM ATLAS</p><h1>'+(state.collection==='japan'?'日系的不同面貌，<br>一套套看清楚。':'从一张喜欢的照片，<br>找到穿衣的线索。')+'</h1><p>'+looks().length+' 张真实参考，按衣服、季节和比例拆开看。<br>'+(state.collection==='japan'?'从 Instagram 原帖取图，保留各套之间的差别。':'日系新选与原选辑放在一起，慢慢建立自己的衣橱。')+'</p><a href="#/catalog/all" class="text-link">浏览全部 '+products().length+' 件真实单品 '+C.icon('right',15)+'</a></div><div class="atlas-hero__images" id="atlas-hero-images">'+heroImages()+'</div></header>'+collections()+'<div id="atlas-season-root">'+T.render(state,looks())+'</div>'+(state.category==='outerwear'?A.tailoring.entry():'')+filters()+'<div class="atlas-grid" id="atlas-grid"></div>'+sourceNote()+'<dialog class="atlas-preview" id="atlas-preview" aria-label="参考图片大图"></dialog>'+U.footer()+'</div>';
  }
  function productCard(m,lookId){
    const p=products().find(x=>x.id===m.itemId);if(!p)return '';
    return '<article class="atlas-match"><a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'"><img src="'+E(p.image)+'" alt="'+E(p.name)+'" width="200" height="250" loading="lazy"><span>'+E(p.brand)+'</span><h3>'+E(p.name)+'</h3></a><p>'+E(m.note)+'</p>'+A.balance.matchNote(lookId,m.itemId)+'<a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'" class="text-link">看单品与购买资料 '+C.icon('right',13)+'</a></article>';
  }
  function renderDetail(id){
    const p=get(id);if(!p)return '<div class="page">'+C.empty('这张参考图没有找到','返回图鉴继续查看真实照片。','#/catalog','返回分类图鉴')+'</div>';
    const group=p.collection==='japan'?japan().looks:data().looks,number=group.findIndex(x=>x.id===p.id),prev=group[number-1],next=group[number+1],collection=p.collection==='japan'?'japan':'douyin';
    const back=catRoute(state.category,state.indexVisited&&state.collection==='all'?'all':collection);
    return '<div class="page page--reference">'+navigation(collection==='japan'?'japan':'references')+'<div class="atlas-detail-nav"><a href="'+back+'" class="text-link">'+C.icon('left',15)+' 返回参考图鉴</a><div>'+(prev?'<a href="'+photoRoute(prev)+'" aria-label="上一张参考图">'+C.icon('left',18)+'</a>':'')+'<span>'+String(number+1).padStart(2,'0')+' / '+group.length+'</span>'+(next?'<a href="'+photoRoute(next)+'" aria-label="下一张参考图">'+C.icon('right',18)+'</a>':'')+'</div></div><div class="atlas-detail"><div class="atlas-detail__photo"><button data-action="atlas-preview" data-id="'+p.id+'" aria-label="放大参考图 '+p.id+'"><img src="'+E(p.image)+'" alt="'+E(p.garments.join('、'))+'" width="900" height="1200"></button>'+saveButton(p)+'<div class="atlas-photo-links"><a href="'+E(p.image)+'" download="FITGRAM-reference-'+p.id+'.jpg">保存这张图 '+C.icon('down',13)+'</a>'+photoAction(p)+'</div></div><div class="atlas-detail__text"><p class="eyebrow">REFERENCE / '+p.id+' · '+E(p.scene)+' / '+E(p.pose)+'</p><h1>'+E(p.title)+'</h1><div class="atlas-detail__tags">'+p.categories.map(c=>'<a href="'+catRoute(c,collection)+'">'+E(labels[c])+'</a>').join('')+'</div><p class="atlas-detail__analysis">'+E(p.analysis)+'</p>'+A.balance.lookGuide(p.id)+distinction(p)+'<section class="atlas-season-guide"><h2>适合季节 · '+E(T.label(p))+'</h2><p>'+E(p.seasonGuide.note)+'</p><p class="catalog-fine">按图中款式整理的穿着参考。</p></section><section><h2>看得见的单品款式</h2><ul>'+p.garments.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul><p class="catalog-fine">款式按照片外观描述；品牌、面料成分与货号没有原始证据时不作确认。</p></section><section><h2>可以照着练的动作</h2><p>'+E(p.poseNote)+'</p></section>'+provenance(p)+'</div></div><section class="atlas-matches"><div class="section-title"><h2>'+(p.collection==='japan'?'选品与款式对照':'按这个思路找单品')+'</h2><span class="muted">近似选品 · 非已证实同款</span></div>'+(p.matches.length?'<div class="atlas-match-grid">'+p.matches.map(m=>productCard(m,p.id)).join('')+'</div>':'<p class="atlas-unmatched">这张图的关键款式尚未找到合适的已核实商品，先保留款式观察。</p>')+(p.searchTerms.length?'<div class="atlas-search-terms"><h3>继续找款的关键词</h3>'+p.searchTerms.map(t=>'<button data-action="atlas-copy" data-text="'+E(t)+'">'+E(t)+' '+C.icon('copy',12)+'</button>').join('')+'<p>复制关键词后到品牌或零售商搜索，核对颜色、版型和细节。</p></div>':'')+'</section>'+sourceNote(collection)+'<dialog class="atlas-preview" id="atlas-preview" aria-label="参考图片大图"></dialog>'+U.footer()+'</div>';
  }
  function related(id){
    const list=allLooks().filter(p=>p.matches.some(m=>m.itemId===id));if(!list.length)return '';
    return '<div class="product-references"><strong>相关参考照片 · '+list.length+'</strong><div>'+list.slice(0,5).map(p=>'<a href="'+photoRoute(p)+'" title="'+E(p.title)+'"><img src="'+E(p.thumbnail)+'" alt="参考 '+p.id+'：'+E(p.title)+'" width="60" height="80" loading="lazy"><span>'+p.id+'</span></a>').join('')+'</div><p>根据款式与配色关联，非照片同款证明。</p>'+(list.length>5?'<button class="text-link" data-action="atlas-product-refs" data-id="'+E(id)+'">查看全部 '+list.length+' 张</button>':'')+'</div>';
  }
  A.atlas={
    navigation,related,
    render:function(id,category,collection){return id?renderDetail(id):renderIndex(category,collection);},
    update:function(){const grid=document.getElementById('atlas-grid');if(!grid)return;const list=filtered();grid.innerHTML=list.length?list.map(card).join(''):C.empty('当前没有符合条件的照片','试试切换季节，或清除收藏、场景与搜索条件。','#/catalog','清除筛选').replace('href="#/catalog"','href="#/catalog" data-action="atlas-reset"');document.getElementById('atlas-count').textContent=list.length+' 张参考 · '+T.names[T.context(state).season]+'季'+(state.seasonOnly?'筛选':'优先');document.querySelectorAll('[data-action="atlas-saved"]').forEach(b=>b.setAttribute('aria-pressed',state.saved));},
    mount:function(){this.update();},
    seasonUI:function(open,focus){
      const root=document.getElementById('atlas-season-root');if(!root)return;
      root.innerHTML=T.render(state,looks());
      if(open)root.querySelector('details').open=true;
      if(focus)root.querySelector(focus)?.focus({preventScroll:true});
      const hero=document.getElementById('atlas-hero-images');if(hero)hero.innerHTML=heroImages();
    },
    date:function(value){if(!T.parse(value))return;state.date=value;state.season=null;state.calendarMonth=null;this.seasonUI(false,'summary');this.update();},
    season:function(value){if(!T.keys.includes(value))return;state.season=value;this.seasonUI(false,'[data-season="'+value+'"]');this.update();},
    today:function(){Object.assign(state,{date:null,season:null,calendarMonth:null});this.seasonUI(false,'[data-action="atlas-today"]');this.update();},
    month:function(value){if(!T.parse(value))return;const previous=state.calendarMonth||T.context(state).date;state.calendarMonth=value;this.seasonUI(true,'[aria-label="'+(value<previous?'上个月':'下个月')+'"]');},
    reset:function(){const target=catRoute('all');A.state.atlasProduct=null;Object.assign(state,{category:'all',query:'',scene:'all',pose:'all',styleFamily:'all',volume:'all',saved:false,date:null,season:null,seasonOnly:false,calendarMonth:null});if(location.hash===target)A.router.render();else location.hash=target;},
    search:function(value){state.query=value;this.update();},
    filter:function(key,value){if(['scene','pose','styleFamily','volume'].includes(key)){state[key]=value;this.update();}},
    saved:function(){state.saved=!state.saved;this.update();},
    save:function(id){const p=get(id);if(!p)return;const added=S.toggle('referenceSaves',id);if(state.saved&&document.getElementById('atlas-grid'))this.update();else document.querySelectorAll('[data-action="atlas-save"][data-id="'+id+'"]').forEach(b=>b.outerHTML=saveButton(p));A.toast(added?'已收藏这张穿搭参考':'已取消收藏参考图');},
    preview:function(id,collage){
      const p=collage?data().source.collages.find(c=>c.index===Number(id)):get(id),dialog=document.getElementById('atlas-preview');if(!p||!dialog)return;
      const title=collage?'原帖第 '+p.index+' 张拼图':p.title;
      dialog.innerHTML='<form method="dialog"><button class="icon-button" aria-label="关闭大图">'+C.icon('close',23)+'</button></form><img src="'+E(p.image)+'" alt="'+E(title)+'"><p>'+E(title)+' · '+(collage?'平台公开拼图':p.collection==='japan'?'Instagram 发布原帖 · 第 '+p.provenance.photoIndex+' 张':'由拼图裁切，非独立摄影原图')+'</p><a href="'+E(p.image)+'" download="FITGRAM-'+(collage?'collage-':'reference-')+id+'.jpg" class="text-link">保存图片 '+C.icon('down',14)+'</a>';if(!dialog.open)dialog.showModal();
    },
    productRefs:function(id){const list=allLooks().filter(p=>p.matches.some(m=>m.itemId===id));if(!list.length)return;Object.assign(state,{collection:'all',category:'all',query:'',scene:'all',pose:'all',styleFamily:'all',volume:'all',saved:false,seasonOnly:false});state.query='';A.state.atlasProduct=id;location.hash='#/catalog/atlas';}
  };
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;
    if(action==='atlas-date')A.atlas.date(b.dataset.date);
    if(action==='atlas-month')A.atlas.month(b.dataset.date);
    if(action==='atlas-season')A.atlas.season(b.dataset.season);
    if(action==='atlas-today')A.atlas.today();
    if(action==='atlas-save')A.atlas.save(b.dataset.id);
    if(action==='atlas-saved')A.atlas.saved();
    if(action==='atlas-preview')A.atlas.preview(b.dataset.id,false);
    if(action==='atlas-collage')A.atlas.preview(b.dataset.id,true);
    if(action==='atlas-copy')U.copy(b.dataset.text);
    if(action==='atlas-reset'){e.preventDefault();A.atlas.reset();}
    if(action==='atlas-product-refs')A.atlas.productRefs(b.dataset.id);
  });
  document.addEventListener('input',e=>{if(e.target.id==='atlas-search'){A.state.atlasProduct=null;A.atlas.search(e.target.value);}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){const calendar=document.querySelector('.atlas-calendar[open]');if(calendar){calendar.open=false;calendar.querySelector('summary').focus();}}});
  document.addEventListener('click',e=>{const calendar=document.querySelector('.atlas-calendar[open]');if(calendar&&!e.target.closest('.atlas-calendar'))calendar.open=false;});
  let lastToday=T.today();
  const refreshDay=()=>{const today=T.today();if(today===lastToday)return;lastToday=today;if(!state.date&&!state.season&&document.getElementById('atlas-season-root')){state.calendarMonth=null;A.atlas.seasonUI(false);A.atlas.update();}if(document.getElementById('blazer-grid'))A.tailoring?.update();};
  window.addEventListener('focus',refreshDay);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
  setInterval(()=>{if(!document.hidden)refreshDay();},60000);
  document.addEventListener('change',e=>{
    if(e.target.id==='atlas-date')A.atlas.date(e.target.value);
    if(e.target.id==='atlas-season-only'){state.seasonOnly=e.target.checked;A.atlas.update();}
    if(['atlas-scene','atlas-pose','atlas-styleFamily','atlas-volume'].includes(e.target.id)){A.state.atlasProduct=null;A.atlas.filter(e.target.id.slice(6),e.target.value);}});
})(window.App);
