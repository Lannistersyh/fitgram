/* 潮流历史图集：档案图、文化线索与当前选品分别记录，按讨论年代浏览。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,S=A.store,E=U.escape;
  const state=A.state.history={country:'all',era:'all',query:'',saved:false};
  const data=()=>window.FITGRAM_HISTORY||{chapters:[],verifiedAt:''};
  const chapters=()=>data().chapters.slice().sort((a,b)=>a.year-b.year||a.id.localeCompare(b.id));
  const countries=()=>window.FITGRAM_WORLD?.countries||[];
  const country=id=>countries().find(c=>c.id===id);
  const styles=()=>window.FITGRAM_WORLD?.styles||[];
  const products=()=>window.FITGRAM_CATALOG?.items||[];
  const chapter=id=>data().chapters.find(p=>p.id===id);
  const route=id=>'#/catalog/history'+(id?'/'+id:'');
  const kind=p=>({'archive-photo':'历史照片','museum-object':'馆藏实物','brand-archive':'品牌档案'}[p.imageKind]||'档案图像');
  const isSaved=p=>S.has('historySaves',p.id);
  const external=(url,label)=>'<a href="'+E(U.safeURL(url))+'" target="_blank" rel="noopener noreferrer">'+E(label)+' '+C.icon('external',13)+'</a>';
  const picture=(p,lazy=true)=>'<img src="'+E(p.image)+'" alt="'+E(p.imageAlt)+'" loading="'+(lazy?'lazy':'eager')+'" decoding="async" width="800" height="1000">';
  function saveButton(p){
    return '<button class="history-save '+(isSaved(p)?'is-saved':'')+'" data-action="history-save" data-id="'+E(p.id)+'" aria-pressed="'+isSaved(p)+'" aria-label="'+(isSaved(p)?'取消收藏':'收藏历史章节')+'：'+E(p.title)+'">'+C.icon('bookmark',18)+'</button>';
  }
  function countryTabs(){
    return '<nav class="history-countries" aria-label="历史图集国家">'+[['all','全部国家'],...countries().map(c=>[c.id,c.name])].map(([id,name])=>'<a href="'+route(id==='all'?'':id)+'" '+(state.country===id?'aria-current="page"':'')+'>'+E(name)+'<span>'+data().chapters.filter(p=>id==='all'||p.countryId===id).length+'</span></a>').join('')+'</nav>';
  }
  function eras(){
    const list=chapters();if(!list.length)return [];
    const first=Math.floor(Math.min(...list.map(p=>p.year))/10)*10,last=Math.floor(Math.max(...list.map(p=>p.endYear))/10)*10;
    const years=[];for(let y=first;y<=last;y+=10)if(list.some(p=>p.year<=y+9&&p.endYear>=y))years.push(y);
    return years;
  }
  function filters(){
    return '<div class="history-controls"><label class="catalog-search">'+C.icon('search',17)+'<input id="history-search" type="search" value="'+E(state.query)+'" placeholder="找年代、工装、摇滚、品牌…" aria-label="搜索历史章节、风格或品牌"></label><label class="history-era"><span class="sr-only">选择讨论年代</span><select id="history-era"><option value="all">全部年代</option>'+eras().map(y=>'<option value="'+y+'" '+(String(y)===state.era?'selected':'')+'>'+y+' 年代</option>').join('')+'</select></label><button class="chip" data-action="history-saved" aria-pressed="'+state.saved+'">只看收藏</button><button class="text-link history-reset" data-action="history-reset">清除筛选</button></div><div class="history-results"><p>按章节讨论年代排序 · 图片年代另行标注</p><span id="history-count" role="status" aria-live="polite"></span></div>';
  }
  function filtered(){
    const q=state.query.trim().toLowerCase(),era=Number(state.era);
    return chapters().filter(p=>(state.country==='all'||p.countryId===state.country)&&(state.era==='all'||p.year<=era+9&&p.endYear>=era)&&(!state.saved||isSaved(p))&&(!q||[p.title,p.period,p.summary,p.story,p.today,p.credit,country(p.countryId)?.name,...p.signatures,...p.styleIds.map(id=>{const s=styles().find(s=>s.id===id);return s?[s.name,s.english].join(' '):'';}),...p.productIds.map(id=>{const x=products().find(x=>x.id===id);return x?[x.brand,x.name].join(' '):'';})].join(' ').toLowerCase().includes(q)));
  }
  function card(p){
    return '<article class="history-card" data-history-chapter="'+E(p.id)+'"><div class="history-card__time"><span>'+E(p.period)+'</span><span>'+E(country(p.countryId)?.name)+'</span></div><div class="history-card__visual"><a href="'+route(p.id)+'" aria-label="阅读 '+E(p.title)+'">'+picture(p)+'</a>'+saveButton(p)+'</div><div class="history-card__caption"><span>'+E(kind(p))+' · '+E(p.imageDate)+'</span><h2><a href="'+route(p.id)+'">'+E(p.title)+'</a></h2><p>'+E(p.summary)+'</p><a class="history-open" href="'+route(p.id)+'">看历史图与今天的穿法 '+C.icon('right',15)+'</a></div></article>';
  }
  function note(){
    return '<section class="history-note"><h2>沿着图像读风格</h2><p>照片、馆藏服装和品牌档案分别标注。章节年代用于组织阅读，图片年代按来源记录；不同路线常在同一时期并存，也会跨国流动。今天的搭配由本站编辑关联，可以借鉴轮廓与细节。</p><p>每章保留图片出处、署名与事实来源，历史图像的权利信息依来源说明记录。资料整理于 '+E(data().verifiedAt)+'。</p></section>';
  }
  function renderIndex(id){
    const c=country(id);state.country=c?.id||'all';
    const list=chapters().filter(p=>!c||p.countryId===c.id),featured=list.slice(0,3);
    return '<div class="page page--history">'+A.atlas.navigation('history')+'<header class="history-hero"><div class="history-hero__text"><p class="eyebrow">THE STYLE ARCHIVE / '+E(c?.english||'PAST & PRESENT')+'</p><h1>'+(c?E(c.name)+'的穿衣线索，<br>留在时间里。':'潮流有来处，<br>穿搭有线索。')+'</h1><p>从真实历史图像出发，看一件衣服怎样进入日常。<br>沿着年代、轮廓与细节，找到今天可以参考的穿法。</p><div class="history-hero__facts"><span>'+list.length+' 个历史章节</span><span>'+(c?'1':countries().length)+' 个国家</span><span>历史图像 → 当前搭配</span></div></div><div class="history-hero__images">'+featured.map(p=>'<a href="'+route(p.id)+'">'+picture(p,false)+'<span>'+E(p.period)+'<small>'+E(kind(p))+'</small></span></a>').join('')+'</div></header>'+countryTabs()+filters()+'<div class="history-grid" id="history-grid"></div>'+note()+U.footer()+'</div>';
  }
  function productCard(p,note){
    const href='#/catalog/all/'+p.category;
    return '<article class="history-product"><a href="'+href+'" data-catalog-jump="'+E(p.id)+'"><img src="'+E(p.image)+'" alt="'+E(p.brand+' '+p.name)+'" loading="lazy" width="360" height="450"><span>'+E(p.brand)+'</span><h3>'+E(p.name)+'</h3></a>'+(note?'<p class="history-product__note">'+E(note)+'</p>':'')+(p.imageKind==='worn'||p.imageKind==='styled'?'<p class="history-product__type">'+E(p.imageType)+'</p>':'')+'<a class="history-product__link" href="'+href+'" data-catalog-jump="'+E(p.id)+'">查看单品与来源 '+C.icon('right',13)+'</a></article>';
  }
  function linkedStyles(p){
    const list=p.styleIds.map(id=>styles().find(s=>s.id===id)).filter(Boolean);
    return list.length?'<div class="history-style-links">'+list.map(s=>'<a href="#/catalog/world/'+E(s.id)+'"><span>'+E(country(s.countryId)?.name)+' / '+E(s.english)+'</span><strong>'+E(s.name)+'</strong><small>'+E(s.silhouette)+' '+C.icon('right',13)+'</small></a>').join('')+'</div>':'';
  }
  function sourceInfo(p){
    return '<figcaption class="history-photo-credit"><div><span>'+E(kind(p))+'</span><strong>'+E(p.imageDate)+'</strong></div><p>'+E(p.imageAlt)+'</p><p>'+E(p.credit)+'</p><p>'+E(p.rights)+'</p>'+external(p.imageSource,'查看图片出处')+'</figcaption>';
  }
  function pager(p){
    const list=chapters(),i=list.findIndex(x=>x.id===p.id),prev=list[i-1],next=list[i+1];
    const link=(x,label,cls)=>x?'<a class="'+cls+'" href="'+route(x.id)+'"><span>'+label+' · '+E(x.period)+'</span><strong>'+E(x.title)+'</strong></a>':'<span></span>';
    return '<nav class="history-pager" aria-label="按年代继续阅读">'+link(prev,'上一章','history-pager__prev')+link(next,'下一章','history-pager__next')+'</nav>';
  }
  function renderDetail(p){
    const c=country(p.countryId),picks=p.productIds.map(id=>products().find(x=>x.id===id)).filter(Boolean).slice(0,3);
    return '<div class="page page--history-detail">'+A.atlas.navigation('history')+'<nav class="history-breadcrumb" aria-label="历史图集路径"><a href="'+route()+'">'+C.icon('left',14)+' 历史图集</a><a href="'+route(p.countryId)+'">'+E(c?.name)+'的章节</a><span>'+E(p.period)+'</span></nav><header class="history-heading"><div><p class="eyebrow">'+E(c?.english)+' / THE STYLE ARCHIVE</p><h1>'+E(p.title)+'</h1><p>'+E(p.summary)+'</p></div>'+saveButton(p)+'</header><div class="history-detail"><figure class="history-photo"><button data-action="history-preview" data-id="'+E(p.id)+'" aria-label="放大历史图：'+E(p.title)+'">'+picture(p,false)+'<span>'+C.icon('search',15)+' 放大图像</span></button>'+sourceInfo(p)+'</figure><div class="history-story"><section><p class="eyebrow">THE CONTEXT / '+E(p.period)+'</p><h2>先看它所处的时代</h2><p>'+E(p.story)+'</p></section><section><h2>值得留下的细节</h2><ul>'+p.signatures.map(t=>'<li>'+E(t)+'</li>').join('')+'</ul></section><section class="history-today"><p class="eyebrow">BRING IT INTO TODAY</p><h2>把线索穿进今天</h2><p>'+E(p.today)+'</p></section>'+linkedStyles(p)+(p.notes?'<p class="history-image-note">'+E(p.notes)+'</p>':'')+'</div></div>'+(picks.length?'<section class="history-current"><div class="section-title"><h2>今天可以参考的单品</h2><span>编辑关联</span></div><p>按轮廓、配色或用途关联的当前选品，供重新搭配参考；这些商品并非图中历史原物的同款。</p><div class="history-product-grid">'+picks.map(item=>productCard(item,p.productNotes?.[item.id])).join('')+'</div></section>':'')+'<section class="history-sources"><p class="eyebrow">SOURCES & READING</p><h2>顺着出处继续看</h2><div>'+p.sources.map(s=>'<article>'+external(s.url,s.label)+'<p>'+E(s.supports)+'</p></article>').join('')+'</div></section>'+pager(p)+note()+'<dialog class="history-preview" id="history-preview" aria-labelledby="history-preview-title"></dialog>'+U.footer()+'</div>';
  }
  function relatedStyle(id){
    const list=chapters().filter(p=>p.styleIds.includes(id));if(!list.length)return '';
    return '<section class="history-related-style"><div><p class="eyebrow">THE ARCHIVE BEHIND THE LOOK</p><h2>这条风格的历史线索</h2></div><div>'+list.map(p=>'<a href="'+route(p.id)+'">'+picture(p)+'<span><small>'+E(p.period)+' · '+E(kind(p))+'</small><strong>'+E(p.title)+'</strong><span>阅读历史章节 '+C.icon('right',13)+'</span></span></a>').join('')+'</div></section>';
  }
  function relatedProduct(id){
    const list=chapters().filter(p=>p.productIds.includes(id));if(!list.length)return '';
    return '<div class="history-product-links"><strong>沿着单品看历史</strong>'+list.map(p=>'<a href="'+route(p.id)+'">'+E(p.period)+' · '+E(p.title)+' '+C.icon('right',12)+'</a>').join('')+'<p>按设计线索关联。</p></div>';
  }
  A.history={
    render:function(id){const p=chapter(id);if(p)return renderDetail(p);if(id&&!country(id))return '<div class="page">'+A.atlas.navigation('history')+C.empty('这个历史章节还未收录','从年代或国家入口继续浏览已有图像。',route(),'返回历史图集')+'</div>';return renderIndex(id);},
    mount:function(){this.update();},
    relatedStyle,relatedProduct,
    update:function(){
      const grid=document.getElementById('history-grid');if(!grid)return;
      const list=filtered();grid.innerHTML=list.length?list.map(card).join(''):C.empty('当前筛选没有历史章节','试试其他年代或国家，也可以清除筛选。',route(),'清除筛选').replace('href="'+route()+'"','href="'+route()+'" data-action="history-reset"');
      document.getElementById('history-count').textContent=list.length+' 个章节';
      document.querySelectorAll('[data-action="history-saved"]').forEach(b=>b.setAttribute('aria-pressed',state.saved));
    },
    reset:function(){Object.assign(state,{country:'all',era:'all',query:'',saved:false});if(location.hash===route())A.router.render();else location.hash=route();},
    save:function(id){const p=chapter(id);if(!p)return;const added=S.toggle('historySaves',id);if(state.saved&&document.getElementById('history-grid'))this.update();else document.querySelectorAll('[data-action="history-save"][data-id="'+id+'"]').forEach(b=>b.outerHTML=saveButton(p));A.toast(added?'已收藏这个历史章节':'已取消收藏历史章节');},
    preview:function(id){
      const p=chapter(id),dialog=document.getElementById('history-preview');if(!p||!dialog)return;
      dialog.innerHTML='<form method="dialog"><button class="icon-button" aria-label="关闭历史图大图">'+C.icon('close',23)+'</button></form><img src="'+E(p.image)+'" alt="'+E(p.imageAlt)+'"><div><h2 id="history-preview-title">'+E(p.title)+'</h2><p>'+E(kind(p))+' · '+E(p.imageDate)+'</p><p>'+E(p.credit)+' · '+E(p.rights)+'</p>'+external(p.imageSource,'查看图片出处')+'</div>';if(!dialog.open)dialog.showModal();
    }
  };
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;
    if(a==='history-save')A.history.save(b.dataset.id);
    if(a==='history-saved'){state.saved=!state.saved;A.history.update();}
    if(a==='history-preview')A.history.preview(b.dataset.id);
    if(a==='history-reset'){e.preventDefault();A.history.reset();}
  });
  document.addEventListener('input',e=>{if(e.target.id==='history-search'){state.query=e.target.value;A.history.update();}});
  document.addEventListener('change',e=>{if(e.target.id==='history-era'){state.era=e.target.value;A.history.update();}});
})(window.App);
