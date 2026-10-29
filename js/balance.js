/* 量感课程、逐套观察与鞋裤练习；真实原帧和商品分别展示。 */
(function(A){
  'use strict';
  const U=A.utils,C=A.components,E=U.escape;
  const data=()=>window.FITGRAM_BALANCE||{lessons:[],guides:[],reviews:[],pairing:{shoes:[],pants:[],pairs:[]}};
  const products=()=>window.FITGRAM_CATALOG?.items||[],looks=()=>window.FITGRAM_JAPAN?.looks||[];
  const state=A.state.balance={shoe:'penny',pants:'straight'};
  const levels={small:'偏小',medium:'适中',large:'偏大',unknown:'未完整显示'};
  const overall={compact:'偏收敛',medium:'适中',full:'偏充足',partial:'局部观察'};
  const roles={reference:'搭配方向',alternative:'换一种搭法',compare:'款式对照'};
  const getGuide=id=>data().guides.find(p=>p.id===id);
  const timeLabel=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  const money=p=>Number.isFinite(p.price)&&p.currency?Number(p.price).toLocaleString('zh-CN',{maximumFractionDigits:2})+' '+p.currency:'价格未核实';
  const itemLink=(p,label)=>'<a class="text-link" href="#/catalog/all/'+p.category+'" data-catalog-jump="'+E(p.id)+'">'+E(label)+' '+C.icon('right',13)+'</a>';
  function source(){const s=data().source;return '<div class="balance-source"><strong>原视频 · '+E(s.author)+'</strong><p>'+C.externalLink(s.url,s.title,'text-link')+'<span> · 收录 '+E(s.collectedAt)+'</span></p><p>画面取自原视频指定时间，保留字幕。本站的观察与选品练习单独整理；量感按照片外观作相对判断。</p></div>';}
  function tabs(id){return '<nav class="balance-tabs" aria-label="搭配原理章节">'+data().lessons.map((p,i)=>'<a href="#/learn/'+p.id+'" '+(id===p.id?'aria-current="page"':'')+'><span>0'+(i+1)+'</span>'+E(p.shortTitle)+'</a>').join('')+'<a href="#/learn/pairing" '+(id==='pairing'?'aria-current="page"':'')+'>'+C.icon('grid',15)+'鞋裤练习</a></nav>';}
  function related(ids){
    return '<div class="balance-look-grid">'+ids.map(id=>{const p=looks().find(p=>p.id===id),g=getGuide(id);return p?'<a href="#/catalog/reference/'+id+'"><img src="'+E(p.thumbnail)+'" alt="'+E(p.title)+'" width="360" height="480" loading="lazy"><span>'+id+' · '+E(p.title)+'</span><p>'+E(g?.summary||'')+'</p></a>':'';}).join('')+'</div>';
  }
  function figure(lesson,key){
    const p=lesson[key],time=timeLabel(p.timeSeconds);
    return '<figure><button data-action="balance-image" data-id="'+lesson.id+'" data-frame="'+key+'" aria-label="放大'+E(p.label)+'"><img src="'+E(p.image)+'" alt="'+E(p.label)+'；原视频 '+time+' 截帧" width="720" height="1280" loading="lazy"><span>'+(key==='before'?'示范 A':'示范 B')+'</span></button><figcaption>'+E(p.label)+'<small>原视频 '+time+'</small></figcaption></figure>';
  }
  function lessonPage(id){
    const p=data().lessons.find(p=>p.id===(id||'volume'));if(!p)return '<div class="page">'+C.empty('这一课还没有整理','先从上下体积开始。','#/learn','返回搭配原理')+'</div>';
    return '<div class="page page--balance">'+A.atlas.navigation('learning')+'<header class="balance-hero"><div><p class="eyebrow">LEARN / VOLUME & LIGHT</p><h1>先看整身，再调一件。</h1><p>从体积、明暗和层次开始，理解单品为什么接得上。</p></div><a class="text-link" href="#/learn/pairing">做一次鞋裤练习 '+C.icon('right',15)+'</a></header>'+tabs(p.id)+'<section class="balance-lesson"><div class="section-title"><div><p class="eyebrow">READ THE LOOK</p><h2>'+E(p.title)+'</h2></div></div><p class="balance-principle">'+E(p.principle)+'</p><p class="balance-credit">原视频：'+E(data().source.author)+' · '+C.externalLink(data().source.url,'查看原帖','text-link')+'</p><div class="balance-frames">'+figure(p,'before')+figure(p,'after')+'</div><div class="balance-reading"><div><h3>对照时看这几处</h3><ol>'+p.observations.map(t=>'<li>'+E(t)+'</li>').join('')+'</ol></div><div class="balance-try"><h3>用自己的衣服试一次</h3><p>'+E(p.tryIt)+'</p><a class="text-link" href="#/learn/pairing">打开鞋裤练习 '+C.icon('right',14)+'</a></div></div><p class="balance-comparison-note">对照记录：'+E(p.comparisonNote)+'</p></section><section class="balance-related"><div class="section-title"><h2>把方法带回真实穿搭</h2><a href="#/catalog/japan" class="text-link">日系新选 '+C.icon('right',13)+'</a></div>'+related(p.relatedLookIds)+'</section>'+source()+'<dialog id="balance-preview" class="atlas-preview" aria-label="课程原帧大图"></dialog>'+U.footer()+'</div>';
  }
  function choices(kind){
    const list=data().pairing[kind==='shoe'?'shoes':'pants'];
    return '<fieldset class="pairing-choices"><legend>'+(kind==='shoe'?'01 · 选一双皮鞋':'02 · 选一条裤子')+'</legend><div>'+list.map(p=>'<button data-action="balance-pick" data-kind="'+kind+'" data-key="'+p.key+'" aria-pressed="'+(state[kind]===p.key)+'"><img src="'+p.image+'" alt="" width="100" height="100"><span>'+E(p.label)+'</span></button>').join('')+'</div></fieldset>';
  }
  function pairingProduct(profile){
    const p=products().find(p=>p.id===profile.itemId);
    return '<article class="pairing-product"><div class="pairing-product__image"><img src="'+E(profile.image)+'" alt="'+E(p.brand+' '+p.name)+'" width="'+profile.imageEvidence.width+'" height="'+profile.imageEvidence.height+'"></div><div><p class="eyebrow">'+E(p.brand)+'</p><h3>'+E(profile.label)+'</h3><p>'+E(profile.note)+'</p><p class="pairing-product__name">'+E(p.name)+'</p><p class="pairing-product__price">'+E(money(p))+'<small>来源记录 '+E(p.verifiedAt)+'</small></p>'+itemLink(p,'看商品与购买资料')+'</div></article>';
  }
  function practice(){
    const pack=data().pairing,shoe=pack.shoes.find(p=>p.key===state.shoe)||pack.shoes[0],pants=pack.pants.find(p=>p.key===state.pants)||pack.pants[0],pair=pack.pairs.find(p=>p.shoeKey===shoe.key&&p.pantsKey===pants.key);
    return '<div class="pairing-products">'+pairingProduct(shoe)+pairingProduct(pants)+'</div><section class="pairing-reading" aria-live="polite"><p class="eyebrow">TRY / '+E(shoe.label)+' + '+E(pants.label)+'</p><h2>'+E(pair.title)+'</h2><p>'+E(pair.relation)+'</p><dl><dt>先看裤脚</dt><dd>'+E(pair.hem)+'</dd><dt>再看上身</dt><dd>'+E(pair.upper)+'</dd></dl></section><section class="balance-related"><div class="section-title"><h2>观察这些真实穿法</h2></div>'+related(pair.lookIds)+'<p class="balance-comparison-note">照片用于理解比例，未声称穿着上方两件商品；具体单品关联见每张详情。</p></section>';
  }
  function pairingPage(){
    return '<div class="page page--balance page--pairing">'+A.atlas.navigation('learning')+'<header class="balance-hero"><div><p class="eyebrow">TRY / SHOES & TROUSERS</p><h1>先选鞋，再看裤脚。</h1><p>三双皮鞋、三条裤子，练习九种体积关系。</p></div><a href="#/learn/shoes" class="text-link">先看原视频对照 '+C.icon('right',15)+'</a></header>'+tabs('pairing')+'<div class="pairing-selectors">'+choices('shoe')+choices('pants')+'</div><div id="pairing-result">'+practice()+'</div><p class="balance-comparison-note">'+E(data().pairing.note)+' 商品图仅去除白边并等比缩小；原始商品图可在购买资料中查看。</p>'+U.footer()+'</div>';
  }
  function parts(g){return '<div class="balance-parts">'+g.parts.map(p=>'<div><span>'+E(p.part)+'<b>'+E(levels[p.level])+'</b></span><small>'+E(p.note)+'</small></div>').join('')+'</div>';}
  A.balance={
    levels,overall,guide:getGuide,
    title:id=>id==='pairing'?'鞋裤搭配':data().lessons.find(p=>p.id===id)?.title,
    render:id=>id==='pairing'?pairingPage():lessonPage(id),
    mount:function(){},
    badge:function(id){const g=getGuide(id);return g?'<p class="atlas-card__balance">画面量感 · '+E(overall[g.overall])+'</p>':'';},
    entry:function(){return '<a class="balance-entry" href="#/learn"><div><p class="eyebrow">LEARN THE RELATION</p><strong>看懂一套，再找单品。</strong><p>从量感、领口与明暗落点，理解这身衣服为什么协调。</p></div>'+C.icon('right',20)+'</a>';},
    search:function(id){const g=getGuide(id);return g?[overall[g.overall],g.summary,g.upperLower,g.footwear,g.neckline,g.layers,g.lightness,g.adjustment].join(' '):'';},
    lookGuide:function(id){
      const g=getGuide(id);if(!g)return '';
      return '<section class="balance-look-guide"><p class="eyebrow">READ / VOLUME & LIGHT</p><h2>这套，怎样接得上</h2><p class="balance-look-guide__summary">'+E(g.summary)+'</p>'+parts(g)+'<dl><dt>上下体积</dt><dd>'+E(g.upperLower)+'</dd><dt>鞋裤关系</dt><dd>'+E(g.footwear)+'</dd></dl><details><summary>继续看领口、内外层与明暗</summary><dl><dt>领口留白</dt><dd>'+E(g.neckline)+'</dd><dt>内外空间</dt><dd>'+E(g.layers)+'</dd><dt>明暗落点</dt><dd>'+E(g.lightness)+'</dd></dl></details><div class="balance-adjust"><strong>换单品时，先调整这里</strong><p>'+E(g.adjustment)+'</p></div>'+(g.limits?'<p class="balance-limit">观察范围：'+E(g.limits)+'</p>':'')+'<a class="text-link" href="#/learn/pairing">去做鞋裤练习 '+C.icon('right',13)+'</a></section>';
    },
    matchNote:function(lookId,itemId){const r=data().reviews.find(p=>p.lookId===lookId&&p.itemId===itemId);return r?'<div class="balance-match-note"><span>'+E(roles[r.kind])+'</span><p>'+E(r.note)+'</p></div>':'';},
    productContext:function(id){
      const p=[...data().pairing.shoes,...data().pairing.pants].find(p=>p.itemId===id);if(!p)return '';
      const kind=data().pairing.shoes.includes(p)?'shoe':'pants';
      return '<div class="balance-product-context"><strong>鞋裤练习 · '+E(p.label)+'</strong><p>'+E(p.note)+'</p><a class="text-link" href="#/learn/pairing" data-balance-'+kind+'="'+p.key+'">拿它试试比例 '+C.icon('right',13)+'</a></div>';
    },
    updatePractice:function(){const root=document.getElementById('pairing-result');if(!root)return;root.innerHTML=practice();document.querySelectorAll('[data-action="balance-pick"]').forEach(b=>b.setAttribute('aria-pressed',state[b.dataset.kind]===b.dataset.key));},
    pick:function(kind,key){const options=data().pairing[kind==='shoe'?'shoes':kind==='pants'?'pants':'none'];if(!options?.some(p=>p.key===key))return;state[kind]=key;this.updatePractice();},
    preview:function(id,key){
      const lesson=data().lessons.find(p=>p.id===id),p=lesson&&['before','after'].includes(key)?lesson[key]:null,dialog=document.getElementById('balance-preview');if(!p||!dialog)return;
      dialog.innerHTML='<form method="dialog"><button class="icon-button" aria-label="关闭课程大图">'+C.icon('close',23)+'</button></form><img src="'+E(p.image)+'" alt="'+E(p.label)+'"><p>'+E(p.label)+' · 原视频 '+timeLabel(p.timeSeconds)+'</p>'+C.externalLink(data().source.url,'查看卡Q因原视频','text-link');dialog.showModal();
    }
  };
  document.addEventListener('click',e=>{
    const link=e.target.closest('[data-balance-shoe],[data-balance-pants]');
    if(link){const kind=link.dataset.balanceShoe?'shoe':'pants',key=link.dataset.balanceShoe||link.dataset.balancePants;state[kind]=key;if(location.hash==='#/learn/pairing'){e.preventDefault();A.balance.updatePractice();}}
    const b=e.target.closest('[data-action]');if(!b)return;
    if(b.dataset.action==='balance-pick')A.balance.pick(b.dataset.kind,b.dataset.key);
    if(b.dataset.action==='balance-image')A.balance.preview(b.dataset.id,b.dataset.frame);
  });
})(window.App);
