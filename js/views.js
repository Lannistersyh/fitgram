/* 首页与发现页：编辑信息流、即时搜索、多组组合筛选与渐进加载。 */
(function(A){
  'use strict';
  const V=A.views,U=A.utils,C=A.components,S=A.store,E=U.escape;
  const filters=A.state.filters={
    query:'',styles:[],temps:[],scenes:[],sort:'latest',region:'all',officialOnly:false,groupsOnly:false
  }
  ;
  let observer;
  const styleOptions=['City Boy','Clean Fit','Gorpcore','Ivy/Preppy','Y2K 复古','日系工装','韩系极简','街头廓形','All Grey 全灰','无性别 Archive'];
  const tempOptions=['15-20','10-15','5-10','0-5','-5-0','unknown'];
  const scenes=['通勤','约会','周末咖啡','街拍','旅行','户外','演出/夜出'];
  V.renderSkeleton=function(){
    return '<div class="page"><div class="skeleton skeleton--title"></div><div class="skeleton-stories">'+Array.from({
      length:7
    }
    ,()=>'<div class="skeleton skeleton--avatar"></div>').join('')+'</div><div class="skeleton skeleton--post"></div></div>';
  }
  ;
  function renderRail(){
    const top=[...A.data.posts].sort((a,b)=>evidenceScore(b)-evidenceScore(a)).slice(0,5);
    return '<aside class="home-rail" aria-label="原帖与单品证据"><div class="rail-self"><span class="my-avatar">F</span><div><strong>你的日常衣橱</strong><p class="muted">好造型，从收藏开始。</p></div><a href="#/closet" class="text-link">打开</a></div><section class="rail-section"><div class="rail-heading"><strong>已核对的官方同款</strong><a href="#/trends">查看全部</a></div>'+top.map((p,i)=>{
      const b=U.blogger(p.bloggerId);
      return '<a class="rank-look" href="#/p/'+p.id+'"><span class="rank-look__number">0'+(i+1)+'</span>'+C.image(p,0,'rank-look__image')+'<span><strong>'+E(p.styles[0])+'</strong><small>'+E(b.handle)+' · '+E(U.sourceKind(b.sourceKind))+'</small></span>'+C.icon('arrow-right',14)+'</a>';
    }
    ).join('')+'</section><section class="rail-note"><span class="eyebrow">THE STYLE NOTE / 01</span><h3>相似的衣服，<br>不同的穿衣方式。</h3><p>并排看原帖里的衣长、裤脚和叠穿，把具体的搭配关系看清楚。</p><a href="#/compare">并排看两套造型 '+C.icon('arrow-right',15)+'</a></section><div class="rail-links"><a href="#/bloggers">来源图鉴</a><a href="#/about">关于</a><a href="#/trends">造型观察</a></div><p class="rail-legal">真实原帖图片 · 原作者保留版权<br>型号与价格仅按证据填写。</p><p class="rail-legal">FITGRAM · SOURCE ARCHIVE</p></aside>';
  }
  V.homePosts=function(){
    let p=[...A.data.posts].sort((a,b)=>(b.feedPriority||0)-(a.feedPriority||0)||String(b.date||'').localeCompare(String(a.date||''))||a.id.localeCompare(b.id));
    if(A.state.feedRegion&&A.state.feedRegion!=='all')p=p.filter(p=>U.blogger(p.bloggerId).region===A.state.feedRegion);
    if(A.state.feedTab==='groups')p=p.filter(p=>U.blogger(p.bloggerId).sourceKind==='group');
    if(A.state.feedTab==='following')p=p.filter(p=>S.has('following',p.bloggerId));
    return p;
  }
  ;
  V.renderHome=function(){
    A.state.feedCount=9;
    const posts=V.homePosts();
    return '<div class="page page--home"><header class="page-heading home-heading"><div><p class="eyebrow">REAL LOOKS / SOURCE ARCHIVE</p><h1>日韩男生秋冬穿搭灵感图鉴</h1><p class="home-heading__desc">CORTIS 等年轻男团 × 高粉日本创作者。<span>Japanese × Korean Menswear · Traceable Sources</span></p><a class="text-link" href="#/explore" data-action="shop-looks">查看有官方同款的造型 '+C.icon('arrow-right',14)+'</a></div><a class="issue-label" href="#/compare">TOKYO<br><span>×</span> SEOUL<br><small>A/W · REAL LOOKS</small></a></header><a class="home-catalog-link" href="#/catalog"><span><small>THE ITEM ATLAS / NEW</small><strong>分类图鉴：从参考照片找到真实单品</strong>28 张穿搭参考 + '+(window.FITGRAM_CATALOG?.items.length||54)+' 件真实单品，按衣服、场景和姿势慢慢看。</span>'+C.icon('arrow-right',20)+'</a><div class="home-layout"><section class="feed-column" aria-label="穿搭信息流">'+C.renderStoryStrip()+'<div class="feed-controls"><div class="feed-tabs"><button data-action="feed-tab" data-tab="all" class="'+(!['following','groups'].includes(A.state.feedTab)?'is-active':'')+'">造型精选</button><button data-action="feed-tab" data-tab="groups" class="'+(A.state.feedTab==='groups'?'is-active':'')+'">男团参考</button><button data-action="feed-tab" data-tab="following" class="'+(A.state.feedTab==='following'?'is-active':'')+'">本地追踪</button></div><div class="region-tabs" aria-label="穿搭地区">'+[['all','全部'],['jp','日系'],['kr','韩系']].map(([id,label])=>'<button data-action="feed-region" data-region="'+id+'" class="'+((A.state.feedRegion||'all')===id?'is-active':'')+'">'+label+'</button>').join('')+'</div></div><div class="feed" id="feed">'+(posts.length?posts.slice(0,9).map(C.renderPostCard).join(''):C.empty('追踪你喜欢的穿衣方式','从来源图鉴开始，追踪喜欢的账号。','#/bloggers','查看来源'))+'</div><div id="feed-sentinel" class="feed-end">'+(posts.length>9?'继续向下，发现下一套造型':posts.length?'这次的造型都在这里了。':'')+'</div></section>'+renderRail()+'</div>'+U.footer()+'</div>';
  }
  ;
  V.mountHome=function(){
    observer=new IntersectionObserver(entries=>{
      if(!entries[0].isIntersecting)return;
      const posts=V.homePosts(),start=A.state.feedCount;
      if(start>=posts.length)return;
      document.getElementById('feed').insertAdjacentHTML('beforeend',posts.slice(start,start+9).map(C.renderPostCard).join(''));
      A.state.feedCount+=9;
      if(A.state.feedCount>=posts.length){
        observer.disconnect();
        document.getElementById('feed-sentinel').innerHTML='<span class="feed-end__check">'+C.icon('check',30)+'</span><strong>当前入库造型已全部展示</strong><button class="text-link" data-action="top">返回顶部</button>';
      }
    }
    ,{
      rootMargin:'300px'
    }
    );
    const sentinel=document.getElementById('feed-sentinel');
    if(sentinel)observer.observe(sentinel);
  }
  ;
  V.cleanupHome=function(){
    if(observer)observer.disconnect();
  }
  ;
  function renderFilterGroup(key,title,options){
    return '<div class="filter-group"><span class="filter-group__label">'+title+'</span><div class="filter-group__options">'+options.map(value=>'<button class="chip '+(filters[key].includes(value)?'is-selected':'')+'" data-action="filter" data-key="'+key+'" data-value="'+E(value)+'" aria-pressed="'+filters[key].includes(value)+'">'+E(key==='temps'?U.temp(value):value)+'</button>').join('')+'</div></div>';
  }
  V.filterPosts=function(){
    const q=filters.query.trim().toLowerCase();
    return A.data.posts.filter(p=>{
      const b=U.blogger(p.bloggerId);
      const text=[p.title,p.caption,p.location,...p.tags,...p.styles,...p.items.map(x=>{
        const i=U.item(x.itemId);
        return i?i.name+' '+(i.brand||'')+' '+(i.modelName||''):'';
      }
      ),b.handle,b.name,b.city].join(' ').toLowerCase();
      return(!filters.groupsOnly||b.sourceKind==='group')&&(!filters.officialOnly||p.items.some(x=>U.item(x.itemId)?.officialProductVerified===true))&&(!q||text.includes(q))&&(!filters.styles.length||filters.styles.some(v=>p.styles.includes(v)))&&(!filters.temps.length||filters.temps.includes(p.tempBand||'unknown'))&&(!filters.scenes.length||filters.scenes.some(v=>p.scenes.includes(v)))&&(filters.region==='all'||b.region===filters.region);
    }
    ).sort((a,b)=>filters.sort==='hot'?evidenceScore(b)-evidenceScore(a):filters.sort==='saves'?(S.has('saves',b.id)?1:0)-(S.has('saves',a.id)?1:0):String(b.date||'').localeCompare(String(a.date||''))||a.id.localeCompare(b.id));
  }
  ;
  function evidenceScore(post) {
    return post.items.reduce((total,entry)=>total+({exact:3,brand:1,visual:0}[U.item(entry.itemId)?.identification]||0),0);
  }
  function renderResults() {
    const posts=V.filterPosts(), identified=posts.reduce((sum,p)=>sum+p.items.filter(entry=>U.item(entry.itemId)?.identification==='exact').length,0);
    return '<div class="result-meta"><p><strong>'+posts.length+' 套造型</strong><span> · '+new Set(posts.map(p=>p.sourceUrl)).size+' 条原帖 · '+identified+' 项原帖明示单品</span></p><span class="eyebrow">REAL LOOKS, REAL SOURCES</span></div>'+(posts.length?C.renderGrid(posts):C.empty('还没找到合拍的造型','这个组合暂时没有原帖。温度不明的内容可以选「原帖未标温度」。',null,'重置筛选'));
  }
  V.renderExplore=function(){
    return '<div class="page page--explore"><header class="page-heading"><div><p class="eyebrow">EXPLORE THE FITS</p><h1>发现下一套，日常好造型。</h1></div><p class="page-heading__meta">'+A.data.posts.length+' 套真实造型 · '+new Set(A.data.posts.map(p=>p.sourceUrl)).size+' 条原帖<br>'+A.data.bloggers.length+' 个来源账号</p></header><label class="search-box">'+C.icon('search',21)+'<input id="explore-search" type="search" autocomplete="off" placeholder="试试「蓝色夹克」「TONYWACK」或原帖型号" aria-label="搜索来源、风格、单品、品牌或标签" value="'+E(filters.query)+'"><kbd>/</kbd></label><section class="filter-panel" aria-label="造型筛选">'+renderFilterGroup('styles','风格',styleOptions)+renderFilterGroup('temps','温度',tempOptions)+renderFilterGroup('scenes','场景',scenes)+'<div class="filter-bottom"><div class="region-tabs">'+[['all','全部地区'],['jp','日本'],['kr','韩国']].map(([value,label])=>'<button data-action="explore-region" data-region="'+value+'" class="'+(filters.region===value?'is-active':'')+'">'+label+'</button>').join('')+'</div><button class="chip '+(filters.groupsOnly?'is-selected':'')+'" data-action="groups-filter" aria-pressed="'+filters.groupsOnly+'">只看男团参考</button><button class="chip '+(filters.officialOnly?'is-selected':'')+'" data-action="official-filter" aria-pressed="'+filters.officialOnly+'">只看有官方同款</button><button class="text-link" data-action="reset-filters">'+C.icon('refresh',13)+' 清除筛选</button><label class="sort-select">排序 <select id="explore-sort" aria-label="造型排序"><option value="latest" '+(filters.sort==='latest'?'selected':'')+'>原帖日期</option><option value="hot" '+(filters.sort==='hot'?'selected':'')+'>型号证据优先</option><option value="saves" '+(filters.sort==='saves'?'selected':'')+'>本地收藏优先</option></select></label></div></section><section id="explore-results" aria-live="polite">'+renderResults()+'</section>'+U.footer()+'</div>';
  }
  ;
  V.updateExplore=function(){
    const results=document.getElementById('explore-results');
    if(results)results.innerHTML=renderResults();
    document.querySelectorAll('[data-action="filter"]').forEach(b=>{
      const selected=filters[b.dataset.key].includes(b.dataset.value);
      b.classList.toggle('is-selected',selected);
      b.setAttribute('aria-pressed',selected);
    }
    );
    document.querySelectorAll('[data-action="groups-filter"]').forEach(b=>{b.classList.toggle('is-selected',filters.groupsOnly);b.setAttribute('aria-pressed',filters.groupsOnly);});
    document.querySelectorAll('[data-action="official-filter"]').forEach(b=>{b.classList.toggle('is-selected',filters.officialOnly);b.setAttribute('aria-pressed',filters.officialOnly);});
    document.querySelectorAll('[data-action="explore-region"]').forEach(b=>b.classList.toggle('is-active',b.dataset.region===filters.region));
  }
  ;
  V.resetFilters=function(){
    Object.assign(filters,{
      query:'',styles:[],temps:[],scenes:[],sort:'latest',region:'all',officialOnly:false,groupsOnly:false
    }
    );
    const input=document.getElementById('explore-search');
    if(input)input.value='';
    const sort=document.getElementById('explore-sort');
    if(sort)sort.value='latest';
    V.updateExplore();
  }
  ;
}
)(window.App);
