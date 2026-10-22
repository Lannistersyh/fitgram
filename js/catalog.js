/* 真实单品图鉴：国际审美选品与大陆购买清单共用卡片，来源和价格各自保留。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,S=A.store,E=U.escape;
  const labels={shoes:'皮鞋',pants:'裤子',shirts:'衬衫',outerwear:'外套',jewelry:'男士首饰'};
  const state=A.state.catalog={scope:'international',category:'all',query:'',saved:false,buying:'all',itemType:'all'};
  const items=()=>window.FITGRAM_CATALOG?.items||[];
  const international=p=>p.collection==='international';
  const inScope=p=>state.scope==='international'?international(p):!international(p);
  const scoped=()=>items().filter(inScope);
  const globalView=()=>state.scope==='international';
  const money=p=>Number.isFinite(p.price)&&p.currency?Number(p.price).toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+p.currency:'官网价格未取得';
  const saved=p=>S.has('catalogSaves',p.id);
  const prefs=()=>window.FITGRAM_CATALOG?.preferences||{market:'中国大陆',currency:'CNY',min:1000,max:3000};
  const mainland=p=>!international(p)&&['verified','catalog'].includes(p.mainlandStatus)&&p.currency==='CNY';
  const inBudget=p=>mainland(p)&&Number.isFinite(p.price)&&p.price>=prefs().min&&p.price<=prefs().max;
  const channel=p=>p.storeName||p.market+'官网';
  const buyLabel=p=>international(p)?'品牌官网 · 查看款式':p.purchaseMode==='official-store-search'?'官方旗舰店查款':p.mainlandStatus==='catalog'?'大陆型号与购买指引':mainland(p)?'大陆购买入口':'海外型号参考';
  const skuLabel=p=>p.skuType==='retailer'?'零售商编号':p.skuType==='website'?'官网款式标识':'货号';
  const route=(scope,category='all')=>'#/catalog/'+(scope==='international'?'international'+(category==='all'?'':'/'+category):category);
  const productRoute=p=>route(international(p)?'international':'mainland',p.category);
  function budgetLabel(p){
    if(international(p))return '国际审美参考';
    if(inBudget(p))return '预算内优先';
    if(mainland(p)&&p.price<prefs().min)return '基础补充款';
    if(mainland(p)&&p.price>prefs().max)return '超出常用预算';
    return '大陆渠道待核实';
  }
  function scopeSummary(){
    const list=scoped();
    if(globalView())return '<div class="catalog-editor-note"><p class="eyebrow">SHAPE / TEXTURE / PROPORTION</p><strong>先看设计，再决定要不要拥有。</strong><p>圆钝皮鞋、带垂感的衬衫、有肩线的外套，加一处银饰。借鉴的是轮廓、材质和搭配方式。</p><div><span>'+list.length+' 款真实单品</span><span>'+new Set(list.map(p=>p.brand)).size+' 个品牌</span><span>保留官网原币种</span></div></div>';
    const cn=list.filter(mainland).length,within=list.filter(inBudget).length;
    return '<div class="catalog-budget-note"><div><span class="eyebrow">YOUR BUYING PREFERENCES</span><strong>中国大陆购买 · 单件 ¥1,000–3,000 为主</strong><p>适合搭配的低价基础款仍保留，目录价与实际库存分别说明。</p></div><div><span><b>'+within+'</b> 款在常用预算内</span><span>'+cn+' 款已核实大陆渠道信息</span></div></div>';
  }
  function typeConfig(){
    if(state.category==='shoes')return {key:'shoeType',options:[['derby','系带皮鞋'],['loafer','乐福鞋'],['boots','靴子'],['other','穆勒 / 其他']]};
    if(state.category==='jewelry')return {key:'jewelryType',options:[['ring','戒指'],['necklace','项链'],['bracelet','手链 / 手镯'],['earring','耳饰']]};
    if(state.category==='outerwear')return {key:'outerwearType',options:[['jacket','短外套'],['coat','长外套']]};
    return null;
  }
  function typeFilters(){
    const cfg=typeConfig();if(!cfg)return '';
    const list=scoped().filter(p=>p.category===state.category),options=[['all',state.category==='shoes'?'全部鞋型':'全部款式'],...cfg.options.filter(([type])=>list.some(p=>p[cfg.key]===type))];
    return '<div class="catalog-shoe-filters" aria-label="款式筛选">'+options.map(([type,label])=>'<button class="chip '+(state.itemType===type?'is-selected':'')+'" data-action="'+(state.category==='shoes'?'catalog-shoe-type':'catalog-item-type')+'" data-type="'+type+'" aria-pressed="'+(state.itemType===type)+'">'+label+'</button>').join('')+'</div>';
  }
  function saveButton(p){return '<button class="catalog-save '+(saved(p)?'is-saved':'')+'" data-action="catalog-save" data-id="'+E(p.id)+'" aria-pressed="'+saved(p)+'" aria-label="'+(saved(p)?'移出购买清单：':'加入购买清单：')+E(p.name)+'">'+C.icon('bookmark',18)+'</button>';}
  function material(p){return p.material||p.upperMaterial||'';}
  function card(p,i){
    const mat=material(p),isGlobal=international(p);
    return '<article class="product-card product-card--'+E(p.category)+'" id="product-'+E(p.id)+'">'+
      '<div class="product-card__visual"><span class="product-card__number">'+String(i+1).padStart(2,'0')+' / '+E(labels[p.category])+'</span>'+saveButton(p)+
      '<button class="product-card__image" data-action="catalog-preview" data-id="'+E(p.id)+'" aria-label="放大查看 '+E(p.name)+'"><img src="'+E(p.image)+'" alt="'+E(p.brand+' '+p.model+' · '+p.color)+'" loading="lazy" decoding="async" width="720" height="900"></button>'+(p.wearImage?'<button class="catalog-wear" data-action="catalog-preview-worn" data-id="'+E(p.id)+'">看上身图</button>':'')+'</div>'+
      '<div class="product-card__body"><p class="product-card__brand">'+E(p.brand)+'</p><h2>'+E(p.name)+'</h2><p class="product-card__model">'+E(p.model)+'</p><p class="product-card__sku">'+E(skuLabel(p))+' '+E(p.sku)+' · '+E(p.color)+'</p>'+
      '<div class="product-card__tags">'+p.tags.map(t=>'<span>'+E(t)+'</span>').join('')+'</div><p class="product-card__reason">'+E(p.reason)+'</p>'+
      '<div class="product-card__price"><strong>'+E(money(p))+'</strong><span>'+E(channel(p))+'</span><span class="catalog-budget-tag '+(inBudget(p)?'is-priority':'')+'">'+E(budgetLabel(p))+'</span></div>'+
      '<details class="product-card__details"><summary>'+(isGlobal?'看设计 · 怎么搭':'怎么搭 · 购买前看')+' '+C.icon('chevron-down',14)+'</summary><dl><dt>搭配建议</dt><dd>'+E(p.styling)+'</dd>'+
      (mat?'<dt>'+(p.category==='shoes'?'鞋面材质 · 商品页资料':'材质与规格 · 商品页资料')+'</dt><dd>'+E(mat)+'</dd>':'')+
      '<dt>'+(p.category==='jewelry'?'佩戴参考':'试穿重点')+'</dt><dd>'+E(p.fitNote)+'</dd><dt>官网记录与来源</dt><dd>'+E(p.mainlandNote||'')+(p.mainlandNote?'<br>':'')+E(p.availability)+'<br>核验日期 '+E(p.verifiedAt)+' · 图片来自品牌或官方零售商商品页。</dd></dl>'+
      '<button class="text-link" data-action="catalog-copy" data-id="'+E(p.id)+'">复制款名与编号</button></details><a class="product-card__buy" href="'+E(U.safeURL(p.purchaseUrl||p.productUrl))+'" target="_blank" rel="noopener noreferrer">'+E(buyLabel(p))+' '+C.icon('external',15)+'</a></div></article>';
  }
  function filtered(){
    const q=state.query.trim().toLowerCase(),cfg=typeConfig();
    const list=scoped().filter(p=>(state.category==='all'||p.category===state.category)&&(!cfg||state.itemType==='all'||p[cfg.key]===state.itemType)&&(!state.saved||saved(p))&&(state.buying!=='budget'||inBudget(p))&&(state.buying!=='mainland'||mainland(p))&&(!q||[p.brand,p.name,p.model,p.sku,p.color,p.material||p.upperMaterial||'',...p.tags].join(' ').toLowerCase().includes(q)));
    return globalView()?(state.category==='all'?list.sort((a,b)=>(a.editorialOrder||0)-(b.editorialOrder||0)):list):list.sort((a,b)=>Number(inBudget(b))-Number(inBudget(a))||Number(mainland(b))-Number(mainland(a)));
  }
  function shortlist(){
    const list=items().filter(saved),totals={};list.forEach(p=>{if(Number.isFinite(p.price)&&p.currency)totals[p.currency]=(totals[p.currency]||0)+p.price;});
    return '<div class="catalog-shortlist__heading"><div><span class="eyebrow">YOUR SAVED PIECES</span><h2>我的单品清单 <span>'+list.length+'</span></h2></div><button class="text-link" data-action="catalog-saved" aria-pressed="'+state.saved+'">'+(state.saved?'显示当前选品':'只看已收藏')+'</button></div>'+
      (list.length?'<div class="catalog-shortlist__items">'+list.map(p=>'<a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'"><img src="'+E(p.image)+'" alt="" width="48" height="60"><span><strong>'+E(p.name)+'</strong><small>'+E(p.brand+' · '+p.sku)+'</small></span></a>').join('')+'</div><p class="catalog-shortlist__total">商品记录价小计：'+Object.entries(totals).map(([currency,price])=>'<strong>'+E(money({price,currency}))+'</strong>').join(' / ')+'</p><p class="catalog-fine">按币种分别相加，未换汇；未含运费、税费及无价格商品。收藏保存在当前浏览器。</p>':'<p class="catalog-fine">点商品图右上角的书签，留下想参考或想试穿的款式。国际选品和大陆清单可以一起收藏。</p>');
  }
  function recipePrice(r){
    const products=r.items.map(id=>items().find(p=>p.id===id));if(!products.every(p=>p&&p.currency==='CNY'&&Number.isFinite(p.price)))return '';
    return '<p class="catalog-recipe__price">三件记录价合计 <strong>'+E(money({price:products.reduce((sum,p)=>sum+p.price,0),currency:'CNY'}))+'</strong></p>';
  }
  function recipes(){
    const sets=globalView()?window.FITGRAM_CATALOG?.internationalOutfits||[]:window.FITGRAM_CATALOG?.outfits||[];
    return sets.length?'<section class="catalog-recipes"><div class="section-title"><h2>'+(globalView()?'把单品放回一身衣服里':'从这三套开始搭')+'</h2><span class="muted">编辑搭配建议</span></div><div class="catalog-recipes__grid">'+sets.map((r,i)=>'<article><span class="eyebrow">LOOK / 0'+(i+1)+'</span><h3>'+E(r.name)+'</h3>'+recipePrice(r)+'<div class="catalog-recipe__images '+(globalView()?'catalog-recipe__images--four':'')+'">'+r.items.map(id=>items().find(p=>p.id===id)).filter(Boolean).map(p=>'<a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'" title="'+E(p.name)+'"><img src="'+E(p.image)+'" alt="'+E(p.name)+'" loading="lazy"><span>'+E(p.name)+'</span></a>').join('')+'</div><p>'+E(r.note)+'</p></article>').join('')+'</div></section>':'';
  }
  function toolbar(){
    return '<div class="catalog-toolbar"><label class="catalog-search">'+C.icon('search',18)+'<input id="catalog-search" type="search" placeholder="搜索品牌、款名、材质、货号…" value="'+E(state.query)+'" aria-label="搜索商品品牌款名材质或货号"></label><button class="catalog-list-filter" data-action="catalog-saved" aria-pressed="'+state.saved+'">'+C.icon('bookmark',15)+'<span>只看收藏</span></button>'+
      (globalView()?'':'<label class="catalog-buying-filter"><span class="sr-only">购买地区和预算筛选</span><select id="catalog-buying">'+[['all','全部选品'],['budget','只看 ¥1,000–3,000'],['mainland','只看大陆入口']].map(([value,label])=>'<option value="'+value+'" '+(state.buying===value?'selected':'')+'>'+label+'</option>').join('')+'</select></label>')+'<span id="catalog-count" role="status" aria-live="polite"></span></div>';
  }
  function clearFilters(){state.query='';state.saved=false;state.buying='all';state.itemType='all';}
  A.views.renderCatalog=function(category,subCategory){
    const scope=category==='international'||!category?'international':'mainland',next=scope==='international'?(subCategory||'all'):category;
    if(scope!==state.scope||next!==state.category){state.itemType='all';if(scope!==state.scope)clearFilters();}
    state.scope=scope;state.category=Object.hasOwn(labels,next)||next==='all'?next:'all';
    const list=scoped(),intl=globalView(),categories=Object.keys(labels).filter(c=>list.some(p=>p.category===c));
    return '<div class="page page--catalog page--catalog-'+E(state.category)+' '+(intl?'page--catalog-international':'')+'">'+
      '<header class="catalog-hero"><div><p class="eyebrow">THE ITEM ATLAS / '+(intl?'INTERNATIONAL EDIT':'MAINLAND EDIT')+'</p><h1>'+(intl?'眼光可以走得更远。':state.category==='shoes'?'先选一双喜欢的皮鞋。':'把喜欢的风格，<br>穿到自己身上。')+'</h1><p>'+(intl?'鞋、衬衫、外套与首饰。<br>从真实单品里，看轮廓、质感和一身衣服的关系。':'皮鞋、裤子、衬衫，各 10 款。<br>从真实商品开始，搭一套你愿意天天穿的衣服。')+'</p></div><div class="catalog-hero__index"><span>'+(intl?'THE INTERNATIONAL SELECTION':'THE MAINLAND SHOPPING LIST')+'</span><b>'+list.length+'</b><small>REAL PIECES / PERSONAL STYLE</small></div></header>'+
      '<nav class="catalog-scope-tabs" aria-label="选品方向"><a href="'+route('international')+'" '+(intl?'aria-current="page"':'')+'>国际审美选品 <span>'+items().filter(international).length+'</span></a><a href="'+route('mainland','shoes')+'" '+(!intl?'aria-current="page"':'')+'>大陆购买清单 <span>'+items().filter(p=>!international(p)).length+'</span></a></nav>'+
      scopeSummary()+'<nav class="catalog-tabs" aria-label="单品类别">'+[['all','全部'],...categories.map(c=>[c,labels[c]])].map(([id,label])=>'<a href="'+route(state.scope,id)+'" class="'+(state.category===id?'is-active':'')+'" '+(state.category===id?'aria-current="page"':'')+'>'+label+'<span>'+list.filter(p=>id==='all'||p.category===id).length+'</span></a>').join('')+'</nav>'+typeFilters()+toolbar()+
      '<div class="catalog-grid" id="catalog-grid"></div><aside class="catalog-shortlist" id="catalog-shortlist" aria-label="本地单品清单">'+shortlist()+'</aside>'+recipes()+'<dialog id="catalog-preview" class="catalog-preview" aria-labelledby="catalog-preview-title"></dialog>'+
      '<div class="catalog-source-note"><strong>关于选品与来源</strong><p>图片来自品牌官网或官方零售商商品页，版权归品牌及摄影师。款名、材质、颜色、编号与图片对应具体来源；搭配观察为本站编辑判断，不代表已证实的艺人同款。国际选品保留官网原币种，作为设计与搭配参考，不承诺向大陆配送或有货。大陆清单保留原有预算偏好，目录价与实际成交价分别说明。各卡片注明核验日期，最终价格和库存以商店为准。</p></div>'+U.footer()+'</div>';
  };
  A.catalog={
    update:function(){
      const grid=document.getElementById('catalog-grid');if(!grid)return;const list=filtered();
      grid.innerHTML=list.length?list.map(card).join(''):C.empty(state.saved?'当前选品没有收藏':'没有找到这款单品','可以换个品牌、材质或货号，也可以清除筛选查看当前选品。',route(state.scope),'清除筛选').replace('href="'+route(state.scope)+'"','href="'+route(state.scope)+'" data-action="catalog-reset"');
      document.getElementById('catalog-count').textContent=(state.saved?'已收藏 · ':'')+list.length+' 件';document.querySelectorAll('[data-action="catalog-saved"]').forEach(b=>b.setAttribute('aria-pressed',state.saved));
    },
    preview:function(id,mode){
      const p=items().find(p=>p.id===id),dialog=document.getElementById('catalog-preview');if(!p||!dialog)return;
      const worn=mode==='worn'&&p.wearImage;
      dialog.innerHTML='<form method="dialog"><button class="icon-button" aria-label="关闭商品大图">'+C.icon('close',23)+'</button></form><img src="'+E(worn?p.wearImage:p.image)+'" alt="'+E(p.name+' · '+p.color+(worn?' · 品牌上身参考':''))+'"><div><p class="eyebrow">'+E(p.brand)+'</p><h2 id="catalog-preview-title">'+E(p.name)+'</h2><p>'+E(p.model)+'<br>'+E(skuLabel(p))+' '+E(p.sku)+' · '+E(p.color)+'</p>'+(p.wearImage?'<div class="catalog-preview__switch" aria-label="图片类型"><button data-action="catalog-preview" data-id="'+E(p.id)+'" aria-pressed="'+!worn+'">单品图</button><button data-action="catalog-preview-worn" data-id="'+E(p.id)+'" aria-pressed="'+!!worn+'">品牌上身图</button></div><p class="catalog-fine">同款、同色的品牌展示；穿着比例请结合自身尺寸判断。</p>':'')+'<a class="product-card__buy" href="'+E(U.safeURL(p.purchaseUrl||p.productUrl))+'" target="_blank" rel="noopener noreferrer">'+E(buyLabel(p))+' '+C.icon('external',15)+'</a></div>';if(!dialog.open)dialog.showModal();
    },
    setType:function(type){const cfg=typeConfig();state.itemType=type==='all'||cfg?.options.some(([id])=>id===type)?type:'all';this.update();document.querySelectorAll('[data-action="catalog-shoe-type"],[data-action="catalog-item-type"]').forEach(b=>{const active=b.dataset.type===state.itemType;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',active);});},
    shoeType:function(type){this.setType(type);},
    reset:function(){clearFilters();const hash=route(state.scope);if(location.hash!==hash)location.hash=hash;else A.router.render();},
    buying:function(value){state.buying=['all','budget','mainland'].includes(value)?value:'all';this.update();},
    search:function(query){state.query=query;this.update();},
    toggleSaved:function(){state.saved=!state.saved;this.update();document.getElementById('catalog-shortlist').innerHTML=shortlist();},
    save:function(id){const p=items().find(p=>p.id===id);if(!p)return;const added=S.toggle('catalogSaves',id);if(state.saved)this.update();else document.querySelectorAll('[data-action="catalog-save"][data-id="'+id+'"]').forEach(b=>b.outerHTML=saveButton(p));document.getElementById('catalog-shortlist').innerHTML=shortlist();A.toast(added?'已加入本地单品清单':'已移出单品清单');},
    copy:function(id){const p=items().find(p=>p.id===id);if(p)U.copy(p.brand+' '+p.model+'\n'+skuLabel(p)+'：'+p.sku+'\n颜色：'+p.color+'\n'+(p.purchaseUrl||p.productUrl));},
    jump:function(){const id=A.state.catalogJump;if(!id)return;document.getElementById('product-'+id)?.scrollIntoView({block:'start',behavior:'instant'});A.state.catalogJump=null;},
    mount:function(){if(A.state.catalogJump){clearFilters();const select=document.getElementById('catalog-buying');if(select)select.value='all';const input=document.getElementById('catalog-search');if(input)input.value='';document.querySelectorAll('[data-action="catalog-shoe-type"],[data-action="catalog-item-type"]').forEach(b=>{const active=b.dataset.type==='all';b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',active);});document.getElementById('catalog-shortlist').innerHTML=shortlist();}this.update();}
  };
  document.addEventListener('click',event=>{const a=event.target.closest('[data-catalog-jump]');if(!a)return;A.state.catalogJump=a.dataset.catalogJump;if(a.hash===location.hash){event.preventDefault();A.catalog.mount();A.catalog.jump();}});
})(window.App);
