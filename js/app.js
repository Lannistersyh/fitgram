/* 应用入口：事件委托、全局状态反馈、真实内容的本地演示面板。 */
(function(A){
  'use strict';
  const C=A.components,U=A.utils,S=A.store,E=U.escape;
  let toastTimer,panelFocus;
  A.toast=function(message){
    const box=document.getElementById('toast');
    clearTimeout(toastTimer);
    box.textContent=message;
    box.classList.add('is-visible');
    toastTimer=setTimeout(()=>box.classList.remove('is-visible'),2400);
  }
  ;
  function renderNavigation(){A.navigation.mount();}
  A.syncPost=function(id){
    const p=U.post(id);
    if(!p)return;
    const liked=S.has('likes',id),saved=S.has('saves',id);
    document.querySelectorAll('[data-action="like"][data-id="'+id+'"]').forEach(b=>{
      b.classList.toggle('is-liked',liked);
      b.setAttribute('aria-pressed',liked);
      b.setAttribute('aria-label',liked?'取消点赞':'点赞');
    }
    );
    document.querySelectorAll('[data-action="save"][data-id="'+id+'"]').forEach(b=>{
      b.classList.toggle('is-saved',saved);
      b.setAttribute('aria-pressed',saved);
      b.setAttribute('aria-label',saved?'取消收藏':'收藏');
    }
    );
    document.querySelectorAll('[data-local-like-state="'+id+'"]').forEach(el=>el.textContent=C.likeText?C.likeText(p):(liked?'已加入本地喜欢':'喜欢这套造型'));
    document.querySelectorAll('[data-like-count="'+id+'"]').forEach(el=>el.textContent=liked?'已喜欢':'喜欢');
    document.querySelectorAll('[data-save-count="'+id+'"]').forEach(el=>el.textContent=saved?'已收藏':'收藏');
  }
  ;
  function like(id,force,container){
    const was=S.has('likes',id);
    if(!force||!was)S.toggle('likes',id);
    A.syncPost(id);
    if(force&&container){
      const old=container.querySelector('.like-burst');
      if(old)old.remove();
      const heart=document.createElement('span');
      heart.className='like-burst';
      heart.setAttribute('aria-hidden','true');
      heart.innerHTML=C.icon('heart',82);
      container.append(heart);
      setTimeout(()=>heart.remove(),650);
    }
  }
  function save(id){
    const saved=S.toggle('saves',id);
    A.syncPost(id);
    A.toast(saved?'已收藏到「我的衣橱」':'已移出收藏');
    if(A.state.route==='/closet')A.router.render(true);
  }
  A.closePanel=function(){
    const root=document.getElementById('panel-root');
    if(!root.children.length)return;
    root.innerHTML='';
    if(!document.getElementById('overlay-root').children.length&&!document.getElementById('story-root').children.length)document.body.classList.remove('is-locked');
    if(panelFocus&&panelFocus.isConnected)panelFocus.focus({
      preventScroll:true
    }
    );
  }
  ;
  function openPanel(title,html){
    panelFocus=document.activeElement;
    document.getElementById('panel-root').innerHTML='<div class="panel-backdrop" data-action="close-panel"><section class="utility-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title"><header><div><span class="eyebrow">FITGRAM / LOCAL ARCHIVE</span><h2 id="panel-title">'+E(title)+'</h2></div><button class="icon-button" data-action="close-panel" aria-label="关闭面板">'+C.icon('close')+'</button></header><div class="utility-panel__body">'+html+'</div></section></div>';
    document.body.classList.add('is-locked');
    document.querySelector('#panel-root button,#panel-root a,#panel-root input')?.focus();
  }
  function renderMessages(id) {
    const sources = id ? A.data.bloggers.filter(b => b.id === id) : A.data.bloggers;
    return '<p class="panel-intro">打开原账号核对图片标注、评论问答和最新商品信息。这里不会以创作者身份发送消息。</p>' + sources.map(b => '<a class="thread-row" href="'+E(U.safeURL(b.profileUrl))+'" target="_blank" rel="noopener noreferrer">'+C.avatar(b,42)+'<span><strong>'+E(b.handle)+'</strong><small>'+E(U.sourceKind(b.sourceKind))+'</small></span>'+C.icon('external',17)+'</a>').join('');
  }
  function notifications() {
    const posts=A.data.posts, exact=A.data.items.filter(i=>i.identification==='exact').length;
    openPanel('资料状态','<p class="panel-intro">当前本地资料快照，不代表 Instagram 实时动态。</p><div class="panel-menu"><a href="#/bloggers">'+A.data.bloggers.length+' 个真实来源 '+C.icon('arrow-right',16)+'</a><a href="#/explore">'+posts.length+' 套真实造型与分析 '+C.icon('arrow-right',16)+'</a><a href="#/closet">'+S.get('saves').filter(id=>U.post(id)).length+' 套本地收藏 '+C.icon('bookmark',16)+'</a></div><p class="panel-hint">原帖明示单品 '+exact+' 项。其余单品按品牌证据或视觉观察标注，不提供猜测型号。</p>');
  }
  function createPanel(){
    const notes=S.get('notes')||[];
    openPanel('记下今天的穿搭','<p class="panel-intro">一件单品，一个配色，留给下一次出门。</p><form class="create-form" data-form="create"><label>笔记标题<input name="title" placeholder="例如：周末的藏青大衣" required maxlength="50"></label><label>我的叠穿想法<textarea name="text" rows="4" placeholder="内搭 / 中层 / 外层，记下你想尝试的组合…" required maxlength="500"></textarea></label><button class="button button--primary" type="submit">保存本地笔记</button></form><p class="panel-hint">已保存 '+notes.length+' 篇 · 只保存在当前浏览器</p>'+(notes.length?'<div class="local-notes">'+notes.slice(0,5).map(n=>'<article><h3>'+E(n.title)+'</h3><p>'+E(n.text)+'</p></article>').join('')+'</div>':''));
  }
  function confirmClear(kind){
    const key=kind==='saves'?'saves':'closet';
    openPanel('清空'+(key==='saves'?'收藏的造型':'衣橱单品')+'？','<p class="panel-intro">这会移除当前浏览器里全部'+(key==='saves'?'收藏造型':'衣橱单品')+'。你随时可以重新添加。</p><div class="confirm-actions"><button class="button" data-action="close-panel">保留内容</button><button class="button button--danger" data-action="confirm-clear" data-kind="'+key+'">确认清空</button></div>');
  }
  function carousel(button){
    const p=U.post(button.dataset.id);
    if(!p)return;
    const card=button.closest('[data-post-id]');
    if(!card)return;
    const img=card.querySelector('.post-card__image,.post-image,img[data-post-id]')||card.querySelector('.post-card__media img');
    if(!img)return;
    const index=(Number(img.dataset.index||button.dataset.index||0)+Number(button.dataset.direction||1)+p.images.length)%p.images.length;
    img.src=p.images[index];
    img.dataset.index=index;
    img.dataset.fallback='0';
    img.dataset.remote=p.remoteImages?.[index]||p.remoteImages?.[0]||'';
    card.querySelectorAll('[data-action="carousel"]').forEach(b=>b.dataset.index=index);
    const counter=card.querySelector('.post-card__counter,[data-carousel-count]');
    if(counter)counter.textContent=C.carouselLabel(p,index);
    card.querySelectorAll('.carousel-dots i').forEach((el,i)=>el.classList.toggle('is-active',i===index));
  }
  function morePost(id){
    const p=U.post(id);
    openPanel('这套造型','<div class="panel-menu"><a href="#/p/'+id+'">查看完整叠穿清单 '+C.icon('arrow-right',16)+'</a><a href="#/blogger/'+p.bloggerId+'">查看来源主页 '+C.icon('user',16)+'</a><button data-action="share" data-id="'+id+'">复制造型链接 '+C.icon('share',16)+'</button><button data-action="save" data-id="'+id+'">'+(S.has('saves',id)?'移出':'加入')+'我的衣橱 '+C.icon('bookmark',16)+'</button></div>');
  }
  function filter(button){
    const f=A.state.filters,key=button.dataset.key,value=button.dataset.value,i=f[key].indexOf(value);
    if(i<0)f[key].push(value);
    else f[key].splice(i,1);
    A.views.updateExplore();
  }
  function follow(button){
    const on=S.toggle('following',button.dataset.id);
    document.querySelectorAll('[data-action="follow"][data-id="'+button.dataset.id+'"]').forEach(b=>{
      b.textContent=on?'已追踪':'本地追踪';
      b.setAttribute('aria-pressed',on);
      b.classList.toggle('is-following',on);
    }
    );
    A.toast(on?'已在本机追踪此来源':'已取消本地追踪');
  }
  function addItem(button){
    const id=button.dataset.id||button.dataset.itemId;
    if(S.has('closet',id)){
      A.toast('这件单品已经在你的衣橱里');
      return;
    }
    S.toggle('closet',id);
    button.textContent='已加入';
    button.classList.add('is-added');
    A.toast('单品已加入「我的衣橱」');
  }
  const actions={
    'skip-main':()=>document.getElementById('main').focus(),
    like:b=>like(b.dataset.id),save:b=>save(b.dataset.id),share:b=>{
      U.copy(location.href.split('#')[0]+'#/p/'+b.dataset.id);
    }
    ,
    'open-post':b=>location.hash='#/p/'+b.dataset.id,comment:b=>{
      A.state.focusComment=true;
      if(location.hash==='#/p/'+b.dataset.id)document.querySelector('#comment-input,.comment-form input,.comment-form textarea')?.focus();
      else location.hash='#/p/'+b.dataset.id;
    }
    ,
    'feed-tab':b=>{
      A.state.feedTab=b.dataset.tab;
      A.router.render(true);
    }
    ,'feed-region':b=>{
      A.state.feedRegion=b.dataset.region;
      A.router.render(true);
    }
    ,
    'catalog-item-type':b=>A.catalog.setType(b.dataset.type),'catalog-shoe-type':b=>A.catalog.shoeType(b.dataset.type),'catalog-reset':()=>A.catalog.reset(),'catalog-preview-worn':b=>A.catalog.preview(b.dataset.id,'worn'),'catalog-preview':b=>A.catalog.preview(b.dataset.id),'catalog-save':b=>A.catalog.save(b.dataset.id),'catalog-saved':()=>A.catalog.toggleSaved(),'catalog-copy':b=>A.catalog.copy(b.dataset.id),
    'groups-filter':()=>{A.state.filters.groupsOnly=!A.state.filters.groupsOnly;A.views.updateExplore();},'official-filter':()=>{A.state.filters.officialOnly=!A.state.filters.officialOnly;A.views.updateExplore();},'shop-looks':()=>{A.views.resetFilters();A.state.filters.officialOnly=true;if(location.hash==='#/explore')A.router.render();else location.hash='#/explore';},
    filter:filter,'reset-filters':()=>A.views.resetFilters(),'explore-region':b=>{
      A.state.filters.region=b.dataset.region;
      A.views.updateExplore();
    }
    ,
    carousel:carousel,caption:b=>{
      const text=b.closest('.post-card')?.querySelector('.post-card__caption');
      if(text){
        text.classList.toggle('is-expanded');
        b.textContent=text.classList.contains('is-expanded')?'收起':'更多';
        b.setAttribute('aria-expanded',text.classList.contains('is-expanded'));
      }
    }
    ,
    'close-panel':()=>A.closePanel(),messages:()=>openPanel('来源链接',renderMessages()),message:b=>openPanel('原账号',renderMessages(b.dataset.id)),notifications:notifications,create:createPanel,
    'more-post':b=>morePost(b.dataset.id),more:()=>openPanel('全部栏目',A.navigation.menu()),
    follow:follow,'profile-tab':b=>A.views.setProfileTab(b.dataset.id||A.state.route.split('/')[2],b.dataset.tab),'closet-tab':b=>{
      A.state.closetTab=b.dataset.tab;
      A.router.render(true);
    }
    ,
    'add-item':addItem,'demo-buy':()=>A.toast('请使用单品卡中的原帖或官方商品入口核对'),'copy-color':b=>U.copy(b.dataset.value||b.dataset.color),
    'remove-item':b=>{
      S.set('closet',S.get('closet').filter(id=>id!==b.dataset.id));
      A.router.render(true);
      A.toast('已移除这件单品');
    }
    ,'clear-closet':b=>confirmClear(b.dataset.kind),'confirm-clear':b=>{
      S.set(b.dataset.kind,[]);
      A.closePanel();
      A.router.render(true);
      A.toast('已清空');
    }
    ,
    story:b=>A.stories.open(b.dataset.blogger||b.dataset.id,b.dataset.index?Number(b.dataset.index):0),'reel-play':b=>A.views.toggleReel(b),top:()=>window.scrollTo({
      top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'
    }
    ),
    theme:()=>{
      const theme=S.get('theme')==='dark'?'light':'dark';
      S.set('theme',theme);
      document.documentElement.dataset.theme=theme;
      A.toast('已切换为'+(theme==='dark'?'深色':'浅色')+'主题');
    }
  }
  ;
  function onClick(event){
    const button=event.target.closest('[data-action]');
    if(!button)return;
    if(button.classList.contains('panel-backdrop')&&event.target!==button)return;
    const fn=actions[button.dataset.action];
    if(fn){
      event.preventDefault();
      fn(button,event);
    }
  }
  function onSubmit(event){
    const form=event.target;
    if(form.dataset.form==='create'){
      event.preventDefault();
      const data=new FormData(form),title=data.get('title').trim(),text=data.get('text').trim();
      if(!title||!text)return;
      S.set('notes',[{
        title,text
      }
      ,...(S.get('notes')||[])]);
      createPanel();
      A.toast('穿搭笔记已保存到当前浏览器');
    }
  }
  function onKey(event){
    if(event.key==='/'&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){
      const input=document.getElementById('explore-search');
      if(input){
        event.preventDefault();
        input.focus();
      }
    }
    const panel=document.querySelector('.utility-panel');
    if(!panel)return;
    if(event.key==='Escape'){
      event.preventDefault();
      A.closePanel();
    }
    if(event.key==='Tab'){
      const focus=[...panel.querySelectorAll('a,button,input,textarea,select')].filter(e=>!e.disabled);
      if(event.shiftKey&&document.activeElement===focus[0]){
        event.preventDefault();
        focus.at(-1).focus();
      }
      else if(!event.shiftKey&&document.activeElement===focus.at(-1)){
        event.preventDefault();
        focus[0].focus();
      }
    }
  }
  function init(){
    renderNavigation();
    document.addEventListener('click',onClick);
    document.addEventListener('submit',onSubmit);
    document.addEventListener('keydown',onKey);
    document.addEventListener('dblclick',e=>{
      if(!e.target.closest('img'))return;
      const card=e.target.closest('[data-post-id]');
      if(card)like(card.dataset.postId,true,e.target.closest('.post-card__media,.detail-media')||e.target.parentElement);
    }
    );
    document.addEventListener('input',e=>{
      if(e.target.id==='catalog-search')A.catalog.search(e.target.value);
      if(e.target.id==='explore-search'){
        A.state.filters.query=e.target.value;
        A.views.updateExplore();
      }
    }
    );
    document.addEventListener('change',e=>{
      if(e.target.id==='catalog-buying')A.catalog.buying(e.target.value);
      if(e.target.id==='explore-sort'){
        A.state.filters.sort=e.target.value;
        A.views.updateExplore();
      }
    }
    );
    document.getElementById('main').innerHTML=A.views.renderSkeleton();
    setTimeout(()=>A.router.init(),400);
  }
  init();
}
)(window.App);
