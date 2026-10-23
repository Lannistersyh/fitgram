/* 国别风格图鉴：真实商品组成编辑搭配，七类单品与来源互相可查。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,S=A.store,E=U.escape;
  const slotNames={bag:'包包',shoes:'鞋子',top:'上衣',outerwear:'外套',pants:'裤子',jewelry:'首饰',accessory:'配饰'};
  const slotCategory={bag:'bags',shoes:'shoes',top:'tops',outerwear:'outerwear',pants:'pants',jewelry:'jewelry',accessory:'accessories'};
  const state=A.state.world={query:'',slot:'all',saved:false};
  const data=()=>window.FITGRAM_WORLD||{countries:[],styles:[],verifiedAt:''};
  const products=()=>window.FITGRAM_CATALOG?.items||[];
  const product=id=>products().find(p=>p.id===id);
  const style=id=>data().styles.find(s=>s.id===id);
  const country=id=>data().countries.find(c=>c.id===id);
  const route=id=>'#/catalog/world'+(id?'/'+id:'');
  const productRoute=p=>'#/catalog/all/'+p.category;
  const amount=p=>Number.isFinite(p.price)&&p.currency?p.price.toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+p.currency:'价格未取得';
  const isSaved=s=>S.has('worldSaves',s.id);
  const image=(p,alt,cls='')=>p?'<img class="'+cls+'" src="'+E(p.image)+'" alt="'+E(alt||p.name)+'" width="360" height="450" loading="lazy" decoding="async">':'';
  function countryTabs(active){return '<nav class="world-countries" aria-label="国家筛选">'+[['all','全部国家'],...data().countries.map(c=>[c.id,c.name])].map(([id,name])=>'<a href="'+route(id==='all'?'':id)+'" '+((active||'all')===id?'aria-current="page"':'')+'>'+E(name)+'<span>'+(id==='all'?data().styles.length:data().styles.filter(s=>s.countryId===id).length)+'</span></a>').join('')+'</nav>';}
  function saveButton(s){return '<button class="world-save '+(isSaved(s)?'is-saved':'')+'" data-action="world-save" data-id="'+E(s.id)+'" aria-pressed="'+isSaved(s)+'" aria-label="'+(isSaved(s)?'取消收藏':'收藏风格')+' '+E(s.name)+'">'+C.icon('bookmark',17)+'</button>';}
  function board(s,large){
    const order=large?['outerwear','top','pants','shoes','bag','jewelry','accessory']:['outerwear','top','pants','shoes'];
    return '<div class="world-board '+(large?'world-board--full':'')+'">'+order.map(slot=>{const pick=s.slots.find(x=>x.slot===slot),p=product(pick?.itemId);return p?'<a class="world-board__'+slot+'" href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'" title="'+E(slotNames[slot]+'：'+p.brand+' '+p.name)+'">'+image(p,p.brand+' '+p.name)+(large?'<span>'+E(slotNames[slot])+'</span>':'')+'</a>':'';}).join('')+'</div>';
  }
  function card(s){
    const c=country(s.countryId);
    return '<article class="world-style-card" data-world-style="'+E(s.id)+'"><div class="world-style-card__visual">'+board(s,false)+saveButton(s)+'<span class="world-style-card__country">'+E(c?.english||'')+' / '+String(s.order||1).padStart(2,'0')+'</span></div><div class="world-style-card__text"><p class="eyebrow">'+E(s.english)+'</p><h2><a href="'+route(s.id)+'">'+E(s.name)+'</a></h2><p>'+E(s.summary)+'</p><div class="world-signatures">'+s.signatures.slice(0,3).map(t=>'<span>'+E(t)+'</span>').join('')+'</div><a class="world-open" href="'+route(s.id)+'">看完整七类搭配 '+C.icon('right',16)+'</a></div></article>';
  }
  function note(){return '<section class="world-note"><strong>把国家当作风格入口</strong><p>这些路线按服装传统、当地品牌实践与当前系列整理；搭配由本站编辑选择。每种配齐七类单品，穿衣时先选衣、裤、鞋，再按场景加包、首饰或配饰。商品可跨风格使用，品牌归属、生产地和风格来源分别看具体资料。</p><p>商品图片来自对应品牌或零售商，官网记录保留原币种，库存与配送以商店为准。衣服不预设适用于同一季节，请结合温度选内外层。核验日期 '+E(data().verifiedAt)+'</p></section>';}
  function filtered(list){const q=state.query.trim().toLowerCase();return list.filter(s=>(!state.saved||isSaved(s))&&(!q||[s.name,s.english,s.summary,s.silhouette,country(s.countryId)?.name||'',...s.signatures,...s.slots.map(x=>{const p=product(x.itemId);return p?[p.name,p.brand,p.color,p.model].join(' '):'';})].join(' ').toLowerCase().includes(q)));}
  function renderIndex(id){
    const c=country(id),list=data().styles.filter(s=>!c||s.countryId===c.id);
    A.state.worldCountry=c?.id||'all';
    const featured=(c?list:data().styles.filter(s=>s.order===1)).slice(0,4);
    return '<div class="page page--world">'+A.atlas.navigation('world')+'<header class="world-hero"><div><p class="eyebrow">THE WORLD WARDROBE / '+E(c?.english||'COUNTRY & STYLE')+'</p><h1>'+(c?E(c.name)+'，三种穿法。':'换一种风格，<br>看见另一种自己。')+'</h1><p>'+E(c?.intro||'美国、英国、法国与意大利。每国三种轮廓鲜明的路线，从包到鞋，把一身衣服看完整。')+'</p><div class="world-hero__facts"><span>'+data().countries.length+' 个国家</span><span>'+data().styles.length+' 种风格</span><span>每种 7 类单品</span></div></div><div class="world-hero__pieces">'+featured.map(s=>{const p=product(s.slots.find(x=>x.slot==='outerwear')?.itemId);return p?'<a href="'+route(s.id)+'">'+image(p,s.name+' · '+p.name)+'<span>'+E(country(s.countryId)?.name||'')+' / '+E(s.name)+'</span></a>':'';}).join('')+'</div></header>'+countryTabs(c?.id)+'<div class="world-toolbar"><label class="catalog-search">'+C.icon('search',17)+'<input type="search" id="world-search" aria-label="搜索国家、风格、品牌或单品" placeholder="找学院、工装、机能、品牌…" value="'+E(state.query)+'"></label><button class="chip" data-action="world-saved" aria-pressed="'+state.saved+'">只看收藏风格</button><span id="world-count" role="status" aria-live="polite"></span></div>'+(c?comparison(list):'<p class="world-intro">先比较上身结构与裤型，再看鞋和包如何改变气质。每张图里的单品都能点开查看。</p>')+'<div class="world-style-grid" id="world-style-grid"></div>'+note()+U.footer()+'</div>';
  }
  function comparison(list){return '<div class="world-comparison" aria-label="三种风格差异">'+list.map(s=>'<a href="'+route(s.id)+'"><strong>'+E(s.name)+'</strong><span>'+E(s.silhouette)+'</span><small>'+s.palette.map(E).join(' / ')+'</small></a>').join('')+'</div>';}
  function slotCard(s,x){
    const p=product(x.itemId);if(!p)return '';return '<article class="world-piece" id="world-piece-'+E(x.slot)+'" data-world-slot="'+E(x.slot)+'"><p class="world-piece__slot">'+E(slotNames[x.slot])+' / '+String(s.slots.indexOf(x)+1).padStart(2,'0')+'</p><a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'">'+image(p,p.brand+' '+p.name)+'</a>'+(p.imageKind==='worn'||p.imageKind==='styled'?'<p class="world-image-type">'+E(p.imageType)+'</p>':'')+'<p class="world-piece__brand">'+E(p.brand)+'</p><h3>'+E(p.name)+'</h3><p class="world-piece__why">'+E(x.why)+'</p><p class="world-piece__price">'+E(amount(p))+'</p><a class="world-piece__link" href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'">单品详情 · 收藏 · 官网 '+C.icon('right',14)+'</a></article>';
  }
  function renderDetail(s){
    const c=country(s.countryId),peers=data().styles.filter(x=>x.countryId===s.countryId&&x.id!==s.id);
    state.slot='all';
    return '<div class="page page--world-detail">'+A.atlas.navigation('world')+'<div class="world-breadcrumb"><a href="'+route(c.id)+'">'+C.icon('left',14)+' '+E(c.name)+'的三种风格</a><span>'+E(c.english)+' / '+String(s.order||1).padStart(2,'0')+'</span></div><header class="world-style-heading"><div><p class="eyebrow">'+E(s.english)+'</p><h1>'+E(s.name)+'</h1><p>'+E(s.summary)+'</p></div>'+saveButton(s)+'</header><div class="world-look">'+board(s,true)+'<div class="world-look__notes"><p class="eyebrow">THE SILHOUETTE</p><h2>'+E(s.silhouette)+'</h2><div class="world-palette">'+s.palette.map(t=>'<span>'+E(t)+'</span>').join('')+'</div><ul>'+s.signatures.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul><p>'+E(s.styling)+'</p><div class="world-difference"><strong>让这套风格更明确</strong><p>'+E(s.avoid)+'</p></div><small>真实商品图组成的编辑搭配板 · 点击单品可查看资料</small></div></div><section class="world-piece-section"><div class="section-title"><h2>从包包到配饰，七类配齐</h2><span class="muted">按自身场景选穿</span></div><div class="world-slot-tabs" aria-label="单品类别"><button data-action="world-slot" data-slot="all" aria-pressed="true">全部 7 件</button>'+Object.entries(slotNames).map(([id,label])=>'<button data-action="world-slot" data-slot="'+id+'" aria-pressed="false">'+label+'</button>').join('')+'</div><div class="world-piece-grid" id="world-piece-grid">'+s.slots.map(x=>slotCard(s,x)).join('')+'</div></section><section class="world-evidence"><h2>这条路线的来处与当前线索</h2><p>以下品牌资料提供服装传统或当前系列依据；本页七件搭配为本站编辑选择。</p><div>'+s.sources.map(ref=>'<article><a href="'+E(U.safeURL(ref.url))+'" target="_blank" rel="noopener noreferrer">'+E(ref.title)+' '+C.icon('external',13)+'</a><p>'+E(ref.note)+'</p></article>').join('')+'</div></section><section class="world-peers"><h2>换一条'+E(c.name)+'路线</h2>'+comparison(peers)+'</section>'+note()+U.footer()+'</div>';
  }
  function related(id){const list=data().styles.filter(s=>s.slots.some(x=>x.itemId===id));return list.length?'<div class="world-product-links"><strong>把这件放进一种风格</strong>'+list.map(s=>'<a href="'+route(s.id)+'">'+E(country(s.countryId)?.name+' · '+s.name)+' '+C.icon('right',12)+'</a>').join('')+'</div>':'';}
  A.world={
    render:function(id){const s=style(id);if(s)return renderDetail(s);if(id&&!country(id))return '<div class="page">'+C.empty('这个风格暂未收录','从国家入口选择已经整理的路线。',route(),'返回国家风格')+'</div>';return renderIndex(id);},
    related,
    update:function(){const grid=document.getElementById('world-style-grid');if(!grid)return;const list=filtered(data().styles.filter(s=>A.state.worldCountry==='all'||s.countryId===A.state.worldCountry));grid.innerHTML=list.length?list.map(card).join(''):C.empty('当前没有符合条件的风格','可以搜索另一品牌或清除筛选。',route(),'清除筛选').replace('href="'+route()+'"','href="'+route()+'" data-action="world-reset"');document.getElementById('world-count').textContent=list.length+' 种风格';document.querySelectorAll('[data-action="world-saved"]').forEach(b=>b.setAttribute('aria-pressed',state.saved));},
    save:function(id){const s=style(id);if(!s)return;const added=S.toggle('worldSaves',id);if(document.getElementById('world-style-grid')&&state.saved)this.update();else document.querySelectorAll('[data-action="world-save"][data-id="'+id+'"]').forEach(b=>b.outerHTML=saveButton(s));A.toast(added?'已收藏这条风格路线':'已取消风格收藏');},
    setSlot:function(slot){state.slot=slot==='all'||Object.hasOwn(slotNames,slot)?slot:'all';document.querySelectorAll('[data-world-slot]').forEach(p=>p.hidden=state.slot!=='all'&&p.dataset.worldSlot!==state.slot);document.querySelectorAll('[data-action="world-slot"]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.slot===state.slot));},
    mount:function(){this.update();}
  };
  document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='world-save')A.world.save(b.dataset.id);if(a==='world-saved'){state.saved=!state.saved;A.world.update();}if(a==='world-slot')A.world.setSlot(b.dataset.slot);if(a==='world-reset'){e.preventDefault();state.saved=false;state.query='';if(location.hash===route())A.router.render();else location.hash=route();}});
  document.addEventListener('input',e=>{if(e.target.id==='world-search'){state.query=e.target.value;A.world.update();}});
})(window.App);
