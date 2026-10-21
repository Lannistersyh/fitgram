/* 造型速览：公开来源图片选辑，八秒进度与本地阅读记忆。 */
(function(A){
  'use strict';
  const C=A.components,U=A.utils,E=U.escape;
  let root=null,sourceList=[],sourceIndex=0,postIndex=0,elapsed=0,lastTick=0,frame=0,paused=false,returnFocus=null,handlers=null;
  function buildSources(){
    const posts=A.data.posts||[],bloggers=A.data.bloggers||[],saved=posts.filter(post=>A.store.has('saves',post.id));
    const city=posts.filter(p=>(p.scenes||[]).some(scene=>scene==='街拍'||scene==='周末咖啡'));
    const cold=posts.filter(p=>p.tempBand==='0-5'||p.tempBand==='-5-0');
    return [{id:'self',title:saved.length?'我的本地收藏':'编辑精选',subtitle:saved.length?'你在这台设备收藏的造型。':'浏览公开原帖，收集穿搭灵感。',posts:(saved.length?saved:posts).slice(0,3)},...bloggers.map(b=>({id:b.id,title:b.handle,subtitle:C.sourceKind(b)+' · 来源选辑',blogger:b,posts:posts.filter(p=>p.bloggerId===b.id).slice(0,3)})),{id:'city-edit',title:'城市穿搭 · CITY LOOKS',subtitle:'观察比例、配色与日常场景。',posts:(city.length?city:posts).slice(0,3)},{id:'cold-edit',title:'叠穿笔记 · LAYER NOTES',subtitle:'从可见细节，理解内外层次。',posts:(cold.length?cold:posts).slice(0,3)}].filter(source=>source.posts.length);
  }
  function markSeen(source){
    if(!A.store.has('seenStories',source.id))A.store.set('seenStories',[...(A.store.get('seenStories')||[]),source.id]);
    document.querySelectorAll('[data-action="story"][data-blogger="'+source.id+'"] .avatar,[data-action="story"][data-blogger="'+source.id+'"] .story-bubble__editorial').forEach(element=>element.classList.add('is-seen'));
  }
  function renderPlayer(){
    const source=sourceList[sourceIndex],post=source.posts[postIndex],b=source.blogger||U.blogger(post.bloggerId);
    markSeen(source);
    root.innerHTML='<div class="story-backdrop"><div class="story-brand"><span>FITGRAM</span><small>PUBLIC LOOK DIGEST</small></div><button class="story-close icon-button" data-action="story-close" aria-label="关闭造型速览">'+C.icon('close',28)+'</button><section class="story-player'+(paused?' is-paused':'')+'" role="dialog" aria-modal="true" aria-label="'+E(source.title)+' 造型速览" tabindex="-1">'+renderProgress(source)+renderHeader(source,post,b)+'<div class="story-player__image">'+C.image(post)+'</div><button class="story-tap story-tap--previous" data-action="story-prev" aria-label="上一套造型"></button><button class="story-tap story-tap--next" data-action="story-next" aria-label="下一套造型"></button>'+renderCopy(source,post)+'<button class="story-nav story-nav--previous" data-action="story-prev" aria-label="上一套">'+C.icon('left',20)+'</button><button class="story-nav story-nav--next" data-action="story-next" aria-label="下一套">'+C.icon('right',20)+'</button></section><p class="story-help">← → 切换 · 空格暂停 · Esc 关闭 <span>8 秒自动换图 · 原帖图片选辑</span></p></div>';
    const dialog=root.querySelector('[role="dialog"]');if(dialog)dialog.focus();elapsed=0;lastTick=0;
  }
  function renderProgress(source){
    return '<div class="story-progress" aria-label="造型速览进度">'+source.posts.map((_,index)=>'<progress max="8000" value="'+(index<postIndex?'8000':'0')+'" aria-label="第 '+(index+1)+' 套"></progress>').join('')+'</div>';
  }
  function renderHeader(source,post,blogger){
    return '<header class="story-player__header">'+C.avatar(blogger,32)+'<div><strong>'+E(source.title)+'</strong><small>'+E(C.sourceDate(post))+' · '+E(C.sourceImageLabel(post))+'</small></div><button class="icon-button" data-action="story-toggle" aria-label="'+(paused?'播放':'暂停')+'" aria-pressed="'+paused+'">'+C.icon(paused?'play':'pause',20)+'</button></header>';
  }
  function renderCopy(source,post){
    const focus=C.focusLabel(post);
    return '<div class="story-player__copy"><span class="story-player__tag">'+E((post.styles||[])[0]||'LOOK ANALYSIS')+' / 视觉分析</span><h2>'+E(post.title)+'</h2>'+(focus?'<p class="story-player__focus">'+E(focus)+'</p>':'')+'<p>'+E(source.subtitle)+'</p><div class="story-player__source">'+C.sourceLink(post,'查看原帖来源 · '+C.sourceImageLabel(post))+'</div><button class="story-player__look" data-action="story-look" data-id="'+E(post.id)+'">看这套穿搭分析 '+C.icon('arrow-right',16)+'</button></div>';
  }
  function advance(direction){
    postIndex+=direction;
    if(postIndex>=sourceList[sourceIndex].posts.length){
      sourceIndex++;
      postIndex=0;
    }
    if(postIndex<0){
      sourceIndex--;
      if(sourceIndex>=0)postIndex=sourceList[sourceIndex].posts.length-1;
    }
    if(sourceIndex<0){
      sourceIndex=0;
      postIndex=0;
    }
    if(sourceIndex>=sourceList.length){
      A.stories.close();
      return;
    }
    renderPlayer();
  }
  function tick(time){
    if(!root||!root.children.length)return;
    if(lastTick&&!paused&&!document.hidden)elapsed+=Math.min(time-lastTick,100);
    lastTick=time;
    const progress=root.querySelectorAll('.story-progress progress')[postIndex];
    if(progress)progress.value=Math.min(elapsed,8000);
    if(elapsed>=8000){
      advance(1);
      if(!root.children.length)return;
    }
    frame=requestAnimationFrame(tick);
  }
  function toggle(){
    paused=!paused;
    const button=root.querySelector('[data-action="story-toggle"]');
    button.innerHTML=C.icon(paused?'play':'pause',20);
    button.setAttribute('aria-label',paused?'播放':'暂停');
    button.setAttribute('aria-pressed',String(paused));
    root.querySelector('.story-player').classList.toggle('is-paused',paused);
  }
  function handleClick(event){
    if(event.target===root.querySelector('.story-backdrop')){
      A.stories.close();
      return;
    }
    const button=event.target.closest('[data-action]');
    if(!button)return;
    event.stopPropagation();
    const action=button.dataset.action;
    if(action==='story-close')A.stories.close();
    else if(action==='story-toggle')toggle();
    else if(action==='story-prev')advance(-1);
    else if(action==='story-next')advance(1);
    else if(action==='story-look'){
      const id=button.dataset.id;
      A.stories.close();
      location.hash='#/p/'+id;
    }
  }
  function trapFocus(event){
    const elements=[...root.querySelectorAll('button:not([disabled]),a[href]')].filter(element=>element.getClientRects().length),first=elements[0],last=elements[elements.length-1];
    if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){
      event.preventDefault();
      last.focus();
    }
    else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){
      event.preventDefault();
      first.focus();
    }
  }
  function handleKey(event){
    if(event.key==='Escape'){
      event.preventDefault();
      event.stopPropagation();
      A.stories.close();
    }
    else if(event.key==='ArrowLeft'){
      event.preventDefault();
      advance(-1);
    }
    else if(event.key==='ArrowRight'){
      event.preventDefault();
      advance(1);
    }
    else if(event.key===' '){
      event.preventDefault();
      toggle();
    }
    else if(event.key==='Tab')trapFocus(event);
  }
  function cleanup(){
    cancelAnimationFrame(frame);
    if(handlers){
      root.removeEventListener('click',handlers.click);
      document.removeEventListener('keydown',handlers.key);
      handlers=null;
    }
    if(root)root.innerHTML='';
    if(!document.getElementById('overlay-root').children.length)document.body.classList.remove('is-locked');
  }
  A.stories={
    open:function(bloggerId,index=0){
      cleanup();
      root=document.getElementById('story-root');
      sourceList=buildSources();
      if(!sourceList.length){
        if(A.toast)A.toast('造型速览正在整理');
        return;
      }
      sourceIndex=Math.max(0,sourceList.findIndex(source=>source.id===bloggerId));
      postIndex=Math.max(0,Math.min(index,sourceList[sourceIndex].posts.length-1));
      paused=false;
      returnFocus=document.activeElement;
      document.body.classList.add('is-locked');
      renderPlayer();
      handlers={
        click:handleClick,key:handleKey
      }
      ;
      root.addEventListener('click',handlers.click);
      document.addEventListener('keydown',handlers.key);
      frame=requestAnimationFrame(tick);
    }
    ,
    close:function(){
      const focus=returnFocus;
      cleanup();
      if(focus&&focus.isConnected)focus.focus();
    }
    ,
    cleanup:cleanup
  }
  ;
}
)(window.App);
