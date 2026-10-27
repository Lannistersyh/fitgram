/* 十个真实剪裁样本：领型、扣法、材质与比例；商品和收藏共用原有目录。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,S=A.store,E=U.escape,T=A.seasons;
  const groups={foundation:'基础剪裁',texture:'材质变化',hybrid:'混合设计',evening:'晚宴款式'};
  const lapels={notch:'平驳领',peak:'戗驳领',shawl:'青果领'};
  const closures={single:'单排扣',double:'双排扣',hidden:'隐藏门襟'};
  const state=A.state.tailoring={query:'',group:'all',lapel:'all',season:'auto',saved:false,left:'single-breasted',right:'double-breasted',mode:'packshot',focusId:null};
  const data=()=>window.FITGRAM_TAILORING||{lessons:[],readingSteps:[],pairs:[]};
  const lessons=()=>data().lessons;
  const catalog=()=>window.FITGRAM_CATALOG?.items||[];
  const product=id=>catalog().find(p=>p.id===id);
  const lesson=id=>lessons().find(l=>l.id===id);
  const isSaved=l=>S.has('catalogSaves',l.productId);
  const route=id=>'#/catalog/blazers'+(id?'/'+id:'');
  const price=p=>p.price===null?'官网价格未取得':p.price.toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+p.currency;
  const season=()=>state.season==='auto'?T.seasonFor(T.today()):state.season==='all'?null:state.season;
  const seasonal=l=>l.seasons.length===4?'跨季场合参考':l.seasons.map(s=>T.names[s]).join(' / ');
  const textLink=(href,text,attrs='')=>'<a class="text-link" href="'+E(href)+'" '+attrs+(href.startsWith('#/catalog/blazers/')?' data-blazer-jump="'+E(href.split('/').pop())+'"':'')+'>'+E(text)+' '+C.icon('right',13)+'</a>';
  function saveButton(l){return '<button class="blazer-save '+(isSaved(l)?'is-saved':'')+'" data-action="blazer-save" data-id="'+l.id+'" aria-pressed="'+isSaved(l)+'" aria-label="'+(isSaved(l)?'取消收藏':'收藏款式')+'：'+E(l.title)+'">'+C.icon('bookmark',17)+'</button>';}
  function filtered(){
    const q=state.query.trim().toLowerCase(),s=season();
    return lessons().filter(l=>{
      const p=product(l.productId);
      return (state.group==='all'||l.group===state.group)&&(state.lapel==='all'||l.lapel===state.lapel)&&(!state.saved||isSaved(l))&&(!q||[l.title,l.focus,l.fabric,l.length,p.brand,p.name,p.sku,p.material,...l.points].join(' ').toLowerCase().includes(q));
    }).map((l,index)=>({l,index})).sort((a,b)=>(s?Number(b.l.seasons.includes(s))-Number(a.l.seasons.includes(s)):0)||a.index-b.index).map(x=>x.l);
  }
  function pairing(l){
    return '<div class="blazer-pairing"><h3>用已有单品练习</h3><p>'+E(l.tryIt)+'</p><div>'+l.pairingIds.map(id=>{
      const p=product(id);return '<a href="#/catalog/all/'+p.category+'" data-catalog-jump="'+p.id+'"><img src="'+E(p.image)+'" alt="'+E(p.name)+'" loading="lazy" width="72" height="90"><span>'+E(p.brand)+'<b>'+E(p.name)+'</b></span></a>';
    }).join('')+'</div></div>';
  }
  function card(l){
    const p=product(l.productId),number=String(lessons().indexOf(l)+1).padStart(2,'0');
    return '<article class="blazer-card" id="blazer-'+l.id+'" data-blazer-id="'+l.id+'"><div class="blazer-card__visual"><button data-action="catalog-preview" data-id="'+p.id+'" aria-label="放大 '+E(l.title)+' 的单品图"><img src="'+E(p.image)+'" alt="'+E(p.brand+' '+p.name+' / '+p.color)+'" loading="lazy" width="720" height="900"></button><span class="blazer-card__number">LOOK / '+number+'</span>'+saveButton(l)+(p.wearImage?'<button class="catalog-wear" data-action="catalog-preview-worn" data-id="'+p.id+'">看上身图</button>':'')+'</div><div class="blazer-card__body"><p class="eyebrow">'+E(p.brand)+' / '+E(groups[l.group])+'</p><h2>'+E(l.title)+'</h2><div class="blazer-card__tags"><span>'+E(seasonal(l))+'</span><span>'+E(closures[l.closure])+'</span><span>'+E(l.pockets)+'</span></div><p class="blazer-focus">'+E(l.focus)+'</p><ul class="blazer-points">'+l.points.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul><dl class="blazer-facts"><div><dt>肩胸</dt><dd>'+E(l.shoulder)+'</dd></div><div><dt>衣长</dt><dd>'+E(l.length)+'</dd></div><div><dt>面料</dt><dd>'+E(p.material)+'</dd></div></dl>'+pairing(l)+'<details class="blazer-source"><summary>商品、价格与来源</summary><p>'+E(p.model)+'<br>'+E(p.sku)+' · '+E(p.color)+'</p><p><strong>'+E(price(p))+'</strong> · 核验 '+E(p.verifiedAt)+'</p><p>'+E(p.availability)+'</p>'+(p.sourceCaveat?'<p>'+E(p.sourceCaveat)+'</p>':'')+C.externalLink(p.productUrl,'品牌官网 · 款式与库存','text-link')+'<p>'+textLink('#/catalog/all/outerwear','在完整目录中查看','data-catalog-jump="'+p.id+'"')+'</p></details></div></article>';
  }
  function comparisonSide(l,side){
    const p=product(l.productId),worn=state.mode==='worn'&&!!p.wearImage;
    return '<article class="blazer-compare__side"><label>'+side+' 侧款式<select id="blazer-compare-'+(side==='左'?'left':'right')+'">'+lessons().map(x=>'<option value="'+x.id+'" '+(x.id===l.id?'selected':'')+'>'+E(x.title)+'</option>').join('')+'</select></label><button class="blazer-compare__photo" data-action="'+(worn?'catalog-preview-worn':'catalog-preview')+'" data-id="'+p.id+'" aria-label="放大对照 '+E(l.title)+'"><img src="'+E(worn?p.wearImage:p.image)+'" alt="'+E(p.name+(worn?' · 品牌上身图':' · 单品图'))+'" width="500" height="625" loading="lazy"></button><p class="blazer-compare__caption">'+E(p.brand)+' · '+(worn?'品牌上身图':state.mode==='worn'?'暂无独立上身图，显示单品图':'单品图')+'</p><h3>'+E(l.title)+'</h3><dl>'+[['领口',lapels[l.lapel]],['门襟',closures[l.closure]],['肩胸',l.shoulder],['衣长',l.length],['面料',l.fabric]].map(([k,v])=>'<div><dt>'+E(k)+'</dt><dd>'+E(v)+'</dd></div>').join('')+'</dl>'+textLink(route(l.id),'去看这一课')+'</article>';
  }
  function comparison(){
    return '<div class="blazer-compare__toolbar"><div class="blazer-compare__presets" role="group" aria-label="快速选择对照款式">'+data().pairs.map((p,i)=>'<button data-action="blazer-pair" data-index="'+i+'" aria-pressed="'+(state.left===p.left&&state.right===p.right)+'">'+E(p.title)+'</button>').join('')+'</div><div class="blazer-compare__modes" role="group" aria-label="对照图片类型">'+[['packshot','单品图'],['worn','上身图']].map(([id,label])=>'<button data-action="blazer-mode" data-mode="'+id+'" aria-pressed="'+(state.mode===id)+'">'+label+'</button>').join('')+'</div></div><p class="blazer-compare__note">'+E(data().pairs.find(p=>p.left===state.left&&p.right===state.right)?.note||'先比较领口与门襟，再看肩胸和衣长。品牌图中的尺码、身高和穿法不同，比例结合各自尺寸表判断。')+'</p><div class="blazer-compare__grid">'+comparisonSide(lesson(state.left),'左')+comparisonSide(lesson(state.right),'右')+'</div>';
  }
  function select(id,label,options){return '<label>'+label+'<select id="blazer-'+id+'">'+options.map(([key,name])=>'<option value="'+key+'" '+(state[id]===key?'selected':'')+'>'+E(name)+'</option>').join('')+'</select></label>';}
  function filters(){
    return '<div class="blazer-controls"><label class="catalog-search">'+C.icon('search',17)+'<input type="search" id="blazer-search" value="'+E(state.query)+'" placeholder="找领型、材质、品牌或货号…" aria-label="搜索西装款式"></label>'+select('group','学习方向',[['all','全部方向'],...Object.entries(groups)])+select('lapel','领型',[['all','全部领型'],...Object.entries(lapels)])+select('season','季节优先',[['auto','当下 · '+T.names[T.seasonFor(T.today())]+'季'],...T.keys.map(s=>[s,T.names[s]+'季在前']),['all','按学习顺序']])+'<button class="chip" data-action="blazer-saved" aria-pressed="'+state.saved+'">只看收藏</button><button class="text-link" data-action="blazer-reset">清除筛选</button></div><p class="blazer-results" id="blazer-count" role="status" aria-live="polite"></p>';
  }
  function scrollTo(element){if(element)window.scrollTo({top:element.getBoundingClientRect().top+window.scrollY-85,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  A.tailoring={
    render:function(id){
      state.focusId=lesson(id)?id:null;
      if(state.focusId)Object.assign(state,{query:'',group:'all',lapel:'all',saved:false});
      return '<div class="page page--blazers">'+A.atlas.navigation('tailoring')+'<header class="blazer-hero"><div><p class="eyebrow">THE TAILORING STUDY / 10 REAL PIECES</p><h1>先看懂一件<br>西装外套。</h1><p>从领型、扣法到肩胸、衣长，<br>用 '+lessons().length+' 个真实样本，慢慢看清差别。</p><button class="text-link" data-action="blazer-compare-jump">试试两款并排对照 '+C.icon('down',14)+'</button></div><div class="blazer-hero__photos">'+['single-breasted','tweed','cropped'].map(id=>lesson(id)).map(l=>'<a href="'+route(l.id)+'" data-blazer-jump="'+l.id+'"><img src="'+E(product(l.productId).image)+'" alt="'+E(l.title)+'" width="300" height="400"><span>'+E(l.title)+'</span></a>').join('')+'</div></header><section class="blazer-reading" aria-label="如何看一件西装外套">'+data().readingSteps.map((s,i)=>'<article><span>0'+(i+1)+'</span><h2>'+E(s.title)+'</h2><p>'+E(s.text)+'</p></article>').join('')+'</section><section class="blazer-comparison" id="blazer-comparison"><div class="section-title"><h2>摆在一起，差别更清楚。</h2><span class="muted">可切换款式与上身图</span></div><div id="blazer-compare-content"></div></section><section class="blazer-lessons" aria-labelledby="blazer-lessons-title"><div class="section-title"><h2 id="blazer-lessons-title">逐款学习</h2><span class="muted">8 款新增 · 2 款已有资料</span></div><p class="blazer-intro">'+E(data().intro)+'</p>'+filters()+'<div class="blazer-grid" id="blazer-grid"></div></section><dialog id="catalog-preview" class="catalog-preview" aria-labelledby="catalog-preview-title"></dialog><aside class="catalog-source-note"><strong>资料与搭配说明</strong><p>单品图与上身图来自对应品牌商品页，完整保留服装轮廓。价格按来源地区与各卡片核验日期记录；新学习说明不会更新旧商品的价格。款式分类、季节与裤鞋搭配为本站编辑观察。两件混合设计分别说明原品牌定位；正式晚宴仍结合邀请要求选择完整着装。</p></aside>'+U.footer()+'</div>';
    },
    mount:function(){if(!document.getElementById('blazer-grid'))return;this.update();this.compare();},
    update:function(){const grid=document.getElementById('blazer-grid');if(!grid)return;const list=filtered();grid.innerHTML=list.length?list.map(card).join(''):C.empty('当前没有符合条件的款式','可以清除领型、方向或搜索条件。',route(),'清除筛选').replace('href="'+route()+'"','href="'+route()+'" data-action="blazer-reset"');document.getElementById('blazer-count').textContent=list.length+' 个样本'+(season()?' · '+T.names[season()]+'季在前':' · 学习顺序');document.querySelector('[data-action="blazer-saved"]')?.setAttribute('aria-pressed',state.saved);const auto=document.querySelector('#blazer-season option[value="auto"]');if(auto)auto.textContent='当下 · '+T.names[T.seasonFor(T.today())]+'季';},
    compare:function(focus){const el=document.getElementById('blazer-compare-content');if(!el)return;el.innerHTML=comparison();if(focus)el.querySelector(focus)?.focus({preventScroll:true});},
    save:function(id){const l=lesson(id);if(!l)return;const added=S.toggle('catalogSaves',l.productId);if(state.saved)this.update();else document.querySelectorAll('[data-action="blazer-save"][data-id="'+id+'"]').forEach(b=>b.outerHTML=saveButton(l));A.toast(added?'已加入共用单品清单':'已取消收藏此款');},
    jump:function(){if(state.focusId&&document.getElementById('blazer-grid'))scrollTo(document.getElementById('blazer-'+state.focusId));},
    relatedProduct:function(id){const l=lessons().find(x=>x.productId===id);return l?'<div class="blazer-related">'+textLink(route(l.id),'学习这款：'+l.title)+'</div>':'';},
    entry:function(){return '<aside class="blazer-entry"><div><strong>西装外套，单独学一学。</strong><p>10 个剪裁样本 · 领型、扣法、面料与比例</p></div>'+textLink(route(),'进入款式课')+'</aside>';}
  };
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-blazer-jump]');if(link&&location.hash===link.getAttribute('href')&&lesson(link.dataset.blazerJump)){e.preventDefault();A.router.render(true);}
    const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;
    if(action==='blazer-save')A.tailoring.save(b.dataset.id);
    if(action==='blazer-saved'){state.saved=!state.saved;A.tailoring.update();}
    if(action==='blazer-reset'){e.preventDefault();Object.assign(state,{query:'',group:'all',lapel:'all',season:'auto',saved:false});if(state.focusId)location.hash=route();else A.router.render(true);}
    if(action==='blazer-mode'&&['packshot','worn'].includes(b.dataset.mode)){state.mode=b.dataset.mode;A.tailoring.compare('[data-mode="'+state.mode+'"]');}
    if(action==='blazer-pair'){const pair=data().pairs[Number(b.dataset.index)];if(pair){state.left=pair.left;state.right=pair.right;A.tailoring.compare('[data-index="'+b.dataset.index+'"]');}}
    if(action==='blazer-compare-jump')scrollTo(document.getElementById('blazer-comparison'));
  });
  document.addEventListener('input',e=>{if(e.target.id==='blazer-search'){state.query=e.target.value;A.tailoring.update();}});
  document.addEventListener('change',e=>{
    for(const key of ['group','lapel','season'])if(e.target.id==='blazer-'+key){state[key]=e.target.value;A.tailoring.update();}
    for(const side of ['left','right'])if(e.target.id==='blazer-compare-'+side&&lesson(e.target.value)){const other=side==='left'?'right':'left',previous=state[side];state[side]=e.target.value;if(state[other]===state[side])state[other]=previous;A.tailoring.compare('#blazer-compare-'+side);}
  });
})(window.App);
