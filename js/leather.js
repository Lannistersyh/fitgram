/* 皮包专题：品牌定位、包型与实际商品资料分别展示，收藏共用单品衣橱。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,S=A.store,E=U.escape;
  const tiers={everyday:'日常品牌',luxury:'奢侈 / 设计师'};
  const types={crossbody:'斜挎包',shoulder:'肩背包',tote:'托特包',satchel:'翻盖 / 邮差包',briefcase:'公文包',tophandle:'结构手提包',duffel:'波士顿 / 旅行包',backpack:'双肩包'};
  const leathers={smooth:'光面皮',grained:'粒面皮',suede:'麂皮',woven:'编织皮'};
  const state=A.state.leather={tier:'all',type:'all',leather:'all',carry:'all',query:'',saved:false,focusId:null};
  const data=()=>window.FITGRAM_LEATHER||{selectedIds:[],guides:[],pairings:[],verifiedAt:''};
  const catalog=()=>window.FITGRAM_CATALOG?.items||[];
  const all=()=>{const ids=data().selectedIds||[];return ids.length?ids.map(id=>catalog().find(p=>p.id===id)).filter(Boolean):catalog().filter(p=>p.collection==='leather');};
  const product=id=>all().find(p=>p.id===id);
  const styles=()=>window.FITGRAM_WORLD?.styles||[];
  const style=id=>styles().find(s=>s.id===id);
  const route=id=>'#/catalog/leather'+(id&&id!=='all'?'/'+id:'');
  const productRoute=p=>'#/catalog/all/'+p.category;
  const tier=p=>tiers[p.bagTier]||'皮包选品';
  const saved=p=>S.has('catalogSaves',p.id);
  const amount=p=>Number.isFinite(p.price)&&p.currency?p.price.toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+p.currency:'官网价格未取得';
  const external=(url,label,cls='')=>'<a class="'+cls+'" href="'+E(U.safeURL(url))+'" target="_blank" rel="noopener noreferrer">'+E(label)+' '+C.icon('external',13)+'</a>';
  const picture=(p,lazy=true)=>'<img src="'+E(p.image)+'" alt="'+E(p.brand+' '+p.name+' · '+p.color)+'" loading="'+(lazy?'lazy':'eager')+'" decoding="async" width="600" height="750">';
  const scoped=()=>all().filter(p=>state.tier==='all'||p.bagTier===state.tier);
  function saveButton(p){
    return '<button class="leather-save '+(saved(p)?'is-saved':'')+'" data-action="leather-save" data-id="'+E(p.id)+'" aria-pressed="'+saved(p)+'" aria-label="'+(saved(p)?'移出单品清单':'收藏皮包')+'：'+E(p.name)+'">'+C.icon('bookmark',18)+'</button>';
  }
  function tabs(){
    return '<nav class="leather-tiers" aria-label="皮包品牌分组">'+[['all','全部皮包'],...Object.entries(tiers)].map(([id,label])=>'<a href="'+route(id)+'" '+(id===state.tier?'aria-current="page"':'')+'>'+E(label)+'<span>'+all().filter(p=>id==='all'||p.bagTier===id).length+'</span></a>').join('')+'</nav>';
  }
  function featured(list){
    const selected=[];
    for(const key of ['everyday','luxury']){
      const pool=list.filter(p=>p.bagTier===key);
      for(const p of pool){if(selected.filter(x=>x.bagTier===key).length>=2)break;if(!selected.some(x=>x.id===p.id)&&!selected.some(x=>x.bagTier===key&&x.brand===p.brand)&&(!selected.some(x=>x.bagTier===key&&x.bagType===p.bagType)||pool.length<3))selected.push(p);}
    }
    for(const p of list){if(selected.length>=4)break;if(!selected.some(x=>x.id===p.id))selected.push(p);}
    return selected.slice(0,4);
  }
  function hero(){
    const list=scoped(),name=tiers[state.tier],show=featured(list);
    return '<header class="leather-hero"><div class="leather-hero__text"><p class="eyebrow">THE LEATHER BAG EDIT / '+(state.tier==='luxury'?'LUXURY & DESIGNER':state.tier==='everyday'?'EVERYDAY BRANDS':'SHAPE & PROPORTION')+'</p><h1>一只皮包，<br>改变整身比例。</h1><p>'+(name?E(name)+'的皮包选品，从具体包型与穿法开始看。':'日常品牌与奢侈 / 设计师品牌，放在同一双眼睛下看。')+'<br>先选包型、皮面与背法，再看它怎样接上衣服。</p><div class="leather-hero__facts"><span>'+list.length+' 款真实商品</span><span>保留原币种</span><span>主体皮革资料可查</span></div><a class="leather-all-bags" href="#/catalog/all/bags">查看全部包包 '+C.icon('right',14)+'</a><button class="leather-all-bags leather-pairing-jump" data-action="leather-pairings">看搭包对照 '+C.icon('down',14)+'</button></div><div class="leather-hero__pieces">'+show.map(p=>'<a href="'+route(p.id)+'" data-leather-jump="'+E(p.id)+'" aria-label="查看 '+E(p.brand+' '+p.name)+'">'+picture(p,false)+'<span>'+E(p.brand)+'<small>'+E(types[p.bagType]||'皮包')+' / '+E(tier(p))+'</small></span></a>').join('')+'</div></header>';
  }
  function filterSelect(key,label,options){
    return '<label class="leather-select"><span>'+label+'</span><select id="leather-'+key+'" aria-label="筛选'+label+'"><option value="all">全部'+label+'</option>'+options.map(([id,text])=>'<option value="'+E(id)+'" '+(state[key]===id?'selected':'')+'>'+E(text)+'</option>').join('')+'</select></label>';
  }
  function controls(){
    const list=scoped(),carry=[...new Set(list.flatMap(p=>p.carryModes||[]))].map(v=>[v,v]);
    return '<div class="leather-toolbar"><label class="catalog-search">'+C.icon('search',17)+'<input id="leather-search" type="search" value="'+E(state.query)+'" placeholder="找品牌、包型、皮质、颜色…" aria-label="搜索皮包品牌型号材质或颜色"></label><button class="chip" data-action="leather-saved" aria-pressed="'+state.saved+'">只看收藏</button><button class="text-link" data-action="leather-reset">清除筛选</button></div><div class="leather-filters">'+filterSelect('type','包型',Object.entries(types).filter(([id])=>list.some(p=>p.bagType===id)))+filterSelect('leather','皮面',Object.entries(leathers).filter(([id])=>list.some(p=>p.leatherFamily===id)))+filterSelect('carry','背法',carry)+'</div><div class="leather-results"><p>按编辑顺序浏览 · 价格保留来源币种</p><span id="leather-count" role="status" aria-live="polite"></span></div>';
  }
  function filtered(){
    const q=state.query.trim().toLowerCase();
    return scoped().filter(p=>(state.type==='all'||p.bagType===state.type)&&(state.leather==='all'||p.leatherFamily===state.leather)&&(state.carry==='all'||(p.carryModes||[]).includes(state.carry))&&(!state.saved||saved(p))&&(!q||[p.brand,p.name,p.model,p.sku,p.color,p.material,p.reason,p.capacityNote,p.dimensions?.text,types[p.bagType],leathers[p.leatherFamily],...(p.tags||[]),...(p.carryModes||[])].join(' ').toLowerCase().includes(q)));
  }
  function styleLinks(p){
    const list=(p.styleIds||[]).map(style).filter(Boolean);
    return list.length?'<div class="leather-style-links"><span>放进一种穿法</span>'+list.map(s=>'<a href="#/catalog/world/'+E(s.id)+'">'+E(s.name)+' '+C.icon('right',11)+'</a>').join('')+'</div>':'';
  }
  function facts(p){
    const records=[['尺寸',p.dimensions?.text||'官网未单独列出'],['皮面',leathers[p.leatherFamily]||'见商品材质说明'],['背法',(p.carryModes||[]).join(' / ')||'见官网说明']];
    return '<dl class="leather-card__facts">'+records.map(([key,value])=>'<div><dt>'+key+'</dt><dd>'+E(value)+'</dd></div>').join('')+'</dl>';
  }
  function card(p,index){
    return '<article class="leather-card" id="leather-product-'+E(p.id)+'" data-leather-product="'+E(p.id)+'"><div class="leather-card__visual"><span class="leather-card__label">'+E(tier(p))+' / '+String(index+1).padStart(2,'0')+'</span><button class="leather-card__image" data-action="catalog-preview" data-id="'+E(p.id)+'" aria-label="放大查看 '+E(p.name)+'">'+picture(p)+'</button>'+saveButton(p)+(p.wearImage?'<button class="leather-worn" data-action="catalog-preview-worn" data-id="'+E(p.id)+'">看上身比例 '+C.icon('right',12)+'</button>':'')+'</div><div class="leather-card__body">'+(p.imageKind==='worn'||p.imageKind==='styled'?'<p class="leather-card__image-type">'+E(p.imageType||'品牌上身参考')+'</p>':'')+'<p class="leather-card__brand">'+E(p.brand)+(p.brandPosition?'<span>'+E(p.brandPosition)+'</span>':'')+'</p><h2>'+E(p.name)+'</h2><p class="leather-card__model">'+E(p.model)+' · '+E(p.sku)+' · '+E(p.color)+'</p><p class="leather-card__reason">'+E(p.reason)+'</p>'+facts(p)+'<div class="leather-card__price"><strong>'+E(amount(p))+'</strong><span>'+E(p.storeName||p.market+'官网')+'</span>'+(p.catalogAvailable===false?'<span class="leather-card__availability">款式参考 · 来源缺货/停售</span>':'')+'</div><details class="leather-card__details"><summary>皮质、容量与怎么搭 '+C.icon('chevron-down',14)+'</summary><dl><dt>主体材质 · 商品页资料</dt><dd>'+E(p.material||p.materialEvidence?.text||'见官网说明')+'</dd><dt>容量与收纳</dt><dd>'+E(p.capacityNote||'商品页未提供可核对的装载清单。')+'</dd>'+(p.audienceNote?'<dt>原站栏目与使用参考</dt><dd>'+E(p.audienceNote)+'</dd>':'')+'<dt>搭配建议</dt><dd>'+E(p.styling)+'</dd><dt>试背重点</dt><dd>'+E(p.fitNote)+'</dd><dt>来源与状态</dt><dd>'+E(p.availability)+'<br>'+E(p.mainlandNote||'')+'<br>核验日期 '+E(p.verifiedAt||data().verifiedAt)+'</dd><dt>商品图片出处</dt><dd>'+external(p.sourceEvidence?.imagePage||p.productUrl,'查看图片所在页面')+'</dd>'+(p.materialEvidence?.url&&p.materialEvidence.url!==p.productUrl?'<dt>独立材质资料</dt><dd>'+external(p.materialEvidence.url,'查看材质依据')+'</dd>':'')+'</dl></details><div class="leather-card__actions"><a href="'+productRoute(p)+'" data-catalog-jump="'+E(p.id)+'">单品资料 '+C.icon('right',13)+'</a>'+external(p.purchaseUrl||p.productUrl,(p.sourceType||'').includes('retailer')?'查看商品来源':'查看官网')+'</div>'+styleLinks(p)+'</div></article>';
  }
  function pairings(){
    const list=(data().pairings||[]).filter(x=>(x.bagIds||[]).some(product));if(!list.length)return '';
    return '<section class="leather-pairings" id="leather-pairings"><div class="section-title"><div><p class="eyebrow">ONE OUTFIT / TWO BAG DIRECTIONS</p><h2>顺着衣服，挑一只包</h2></div><span>按轮廓与场景比较</span></div><div class="leather-pairings__grid">'+list.map(x=>{const s=style(x.styleId);return '<article><div class="leather-pairing__pieces">'+x.bagIds.map(product).filter(Boolean).map(p=>'<a href="'+route(p.id)+'" data-leather-jump="'+E(p.id)+'">'+picture(p)+'<span>'+E(tier(p))+'</span><strong>'+E(p.brand)+'</strong><small>'+E(types[p.bagType]||'皮包')+' · '+E(amount(p))+'</small></a>').join('')+'</div><h3>'+E(x.title)+'</h3><p>'+E(x.note)+'</p>'+(s?'<a class="leather-pairing__style" href="#/catalog/world/'+E(s.id)+'">配进'+E(s.name)+' '+C.icon('right',13)+'</a>':'')+'</article>';}).join('')+'</div></section>';
  }
  function guides(){
    const list=data().guides||[];if(!list.length)return '';
    return '<section class="leather-guides"><div><p class="eyebrow">BEFORE YOU TRY IT ON</p><h2>看图之后，再看这几件事</h2></div><div>'+list.map((g,i)=>'<article><span>'+String(i+1).padStart(2,'0')+'</span><h3>'+E(g.title)+'</h3><p>'+E(g.text)+'</p></article>').join('')+'</div></section>';
  }
  function note(){
    return '<section class="leather-note"><h2>选品与资料</h2><p>本专题按品牌定位整理为“日常品牌”和“奢侈 / 设计师”，材质、结构与尺寸分别看具体商品资料。主体皮革按具体商品页记录，原有帆布、尼龙及混合材质包继续保留在全部包包目录。</p><p>商品图片来自所列品牌或零售商，版权归品牌及摄影师。价格保留来源地区与币种，库存和配送按对应页面核实；尺寸沿用官网顺序，容量与背法分别记录。搭配建议为本站编辑观察。整理于 '+E(data().verifiedAt)+'。</p><a class="text-link" href="#/catalog/all/bags">查看全部包包 '+C.icon('right',14)+'</a></section>';
  }
  function resetFilters(){Object.assign(state,{type:'all',leather:'all',carry:'all',query:'',saved:false});}
  function render(id){
    const p=product(id);
    if(id&&id!=='all'&&!tiers[id]&&!p)return '<div class="page">'+A.atlas.navigation('leather')+C.empty('这只皮包暂未收录','从包型与背法开始，浏览已经整理的选品。',route(),'返回皮包系列')+'</div>';
    const next=p?p.bagTier:tiers[id]?id:'all';
    if(next!==state.tier)resetFilters();state.tier=next;
    if(p){resetFilters();state.focusId=p.id;}
    return '<div class="page page--leather">'+A.atlas.navigation('leather')+hero()+tabs()+controls()+'<div class="leather-grid" id="leather-grid"></div>'+pairings()+guides()+note()+'<dialog id="catalog-preview" class="catalog-preview" aria-labelledby="catalog-preview-title"></dialog>'+U.footer()+'</div>';
  }
  function relatedProduct(id){
    const p=product(id);if(!p)return '';
    return '<div class="leather-product-links"><strong>皮包专题</strong><a href="'+route(p.id)+'" data-leather-jump="'+E(p.id)+'">'+E(tier(p))+' · 按包型、皮面与背法看 '+C.icon('right',12)+'</a></div>';
  }
  function relatedStyle(id){
    const pool=all().filter(p=>(p.styleIds||[]).includes(id));if(!pool.length)return '';
    const list=featured(pool);
    return '<section class="leather-related"><div><p class="eyebrow">CHANGE THE BAG / KEEP THE SILHOUETTE</p><h2>同一条路线，换只皮包</h2><p>按搭配方向补充的包款，可进入专题看尺寸、皮质和上身比例。</p></div><div class="leather-related__pieces">'+list.map(p=>'<a href="'+route(p.id)+'" data-leather-jump="'+E(p.id)+'">'+picture(p)+'<small>'+E(tier(p))+'</small><strong>'+E(p.brand)+'</strong><span>'+E(p.name)+'</span></a>').join('')+'</div><a class="text-link" href="'+route()+'">浏览皮包系列 '+C.icon('right',14)+'</a></section>';
  }
  A.leather={
    render,relatedProduct,relatedStyle,
    update:function(){
      const grid=document.getElementById('leather-grid');if(!grid)return;
      const list=filtered();grid.innerHTML=list.length?list.map(card).join(''):C.empty('当前没有符合条件的皮包','可放宽包型、皮面或背法，也可以清除筛选。',route(state.tier),'清除筛选').replace('href="'+route(state.tier)+'"','href="'+route(state.tier)+'" data-action="leather-reset"');
      document.getElementById('leather-count').textContent=list.length+' 款皮包';
      document.querySelectorAll('[data-action="leather-saved"]').forEach(b=>b.setAttribute('aria-pressed',state.saved));
    },
    mount:function(){this.update();},
    jump:function(){if(state.focusId){document.getElementById('leather-product-'+state.focusId)?.scrollIntoView({block:'start',behavior:'instant'});state.focusId=null;}},
    save:function(id){const p=product(id);if(!p)return;const added=S.toggle('catalogSaves',id);if(state.saved)this.update();else document.querySelectorAll('[data-action="leather-save"]').forEach(b=>{if(b.dataset.id===id)b.outerHTML=saveButton(p);});A.toast(added?'已加入本地单品清单':'已移出单品清单');},
    reset:function(){resetFilters();if(location.hash===route(state.tier))A.router.render();else location.hash=route(state.tier);}
  };
  document.addEventListener('click',e=>{const link=e.target.closest('[data-leather-jump]');if(link&&link.hash===location.hash){e.preventDefault();resetFilters();A.router.render();return;}const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='leather-save')A.leather.save(b.dataset.id);if(a==='leather-saved'){state.saved=!state.saved;A.leather.update();}if(a==='leather-pairings'){document.getElementById('leather-pairings')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}if(a==='leather-reset'){e.preventDefault();A.leather.reset();}});
  document.addEventListener('input',e=>{if(e.target.id==='leather-search'){state.query=e.target.value;A.leather.update();}});
  document.addEventListener('change',e=>{const key={'leather-type':'type','leather-leather':'leather','leather-carry':'carry'}[e.target.id];if(key){state[key]=e.target.value;A.leather.update();}});
})(window.App);
