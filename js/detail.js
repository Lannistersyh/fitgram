/* 帖子详情：单品热点、结构化穿搭说明、评论与可访问模态框。 */
(function(A){
  'use strict';
  const C=A.components,U=A.utils,E=U.escape;
  let root=null,current=null,returnFocus=null,handlers=null,imageIndex=0;
  function renderHotspots(post){
    return (post.items||[]).map((entry,index)=>{
      const item=U.item(entry.itemId)||entry,point=entry.hotspot||{},x=Number(point.x),y=Number(point.y);
      if(!Number.isFinite(x)||!Number.isFinite(y))return '';
      return '<button class="detail-hotspot" data-action="detail-hotspot" data-index="'+index+'" style="--hotspot-x:'+Math.max(0,Math.min(1,x))*100+'%;--hotspot-y:'+Math.max(0,Math.min(1,y))*100+'%" aria-label="查看单品 '+(index+1)+'：'+E(item.name||item.category||'可见单品')+'"><span>'+(index+1)+'</span><span class="detail-hotspot__tooltip">'+E(item.name||item.category||'可见单品')+'</span></button>';
    }).join('');
  }
  function identification(entry,item){
    const supplied=entry.identification||item.identification;
    const evidence=entry.evidenceText||item.evidenceText;
    const level=(supplied==='exact'||supplied==='brand')&&evidence?supplied:'visual';
    const labels={exact:'型号已核对',brand:'品牌已核对 · 型号未核实',visual:'视觉判断 · 品牌 / 型号未核实'};
    return {level,label:labels[level]};
  }
  function renderPrice(item){
    const currency=item.priceCurrency||item.currency||'（币种未核实）';
    if(typeof item.price==='string'&&item.price.trim())return item.price;
    if(typeof item.price==='number'&&Number.isFinite(item.price))return item.price.toLocaleString('zh-CN')+' '+currency;
    if(Number.isFinite(item.priceNumeric))return item.priceNumeric.toLocaleString('zh-CN')+' '+currency;
    if(Number.isFinite(item.priceMin)&&Number.isFinite(item.priceMax))return item.priceMin.toLocaleString('zh-CN')+'～'+item.priceMax.toLocaleString('zh-CN')+' '+currency;
    return '价格未核实';
  }
  function availabilityText(item){
    const states=item.availabilityStates||[],value=item.availability;
    if(value==='mixed-variants'||(states.includes('InStock')&&states.includes('OutOfStock')))return '部分尺码有货，部分尺码缺货';
    return ({InStock:'页面记录为有库存',OutOfStock:'页面记录为缺货',LimitedAvailability:'页面记录为库存有限',PreOrder:'页面记录为预订',BackOrder:'页面记录为待补货',Discontinued:'页面记录为已停售'})[value]||'库存状态未核实';
  }
  function renderProductSnapshot(item,official){
    if(!official)return '';
    const checked=item.verifiedAt?String(item.verifiedAt).replace('T',' ').slice(0,19):'核验时间未提供';
    return '<div class="detail-product-snapshot"><div><span>官网记录价</span><strong>'+E(renderPrice(item))+'</strong></div><div><span>核验时间</span><span>'+E(checked)+'</span></div><div><span>库存记录</span><span>'+E(availabilityText(item))+'</span></div>'+(item.priceBasis?'<p>'+E(item.priceBasis)+'</p>':'')+'<p>价格与库存为核验时的页面记录，当前情况以官方页面为准。</p></div>';
  }
  function renderEvidence(entry,item,post){
    const text=entry.evidenceText||item.evidenceText||'仅根据照片中的可见轮廓、配色与细节分类，未确认品牌及型号。';
    const url=entry.evidenceUrl||item.evidenceUrl||post.sourceUrl;
    return '<div class="detail-item__evidence"><span>识别依据</span><p>'+E(text)+'</p>'+C.externalLink(url,'核对依据','detail-evidence-link')+'</div>';
  }
  function renderItem(entry,index,post){
    const item=U.item(entry.itemId)||entry,id=item.id||entry.itemId,status=identification(entry,item),saved=A.store.has('closet',id);
    const palette=post.palette||[],color=palette[index%palette.length]||'var(--border)';
    const official=item.officialProductVerified===true&&status.level==='exact'?C.safeUrl(item.productUrl):'';
    const brand=status.level==='visual'?'品牌未核实':item.brand||'品牌未核实';
    const model=item.modelName||item.officialPageTitle;
    return '<article class="detail-item detail-item--'+status.level+'" data-item-index="'+index+'"><span class="identification-badge identification-badge--'+status.level+'">'+C.icon(status.level==='visual'?'search':'check',11)+E(status.label)+'</span><button class="detail-item__info" data-action="detail-item" data-index="'+index+'"><span class="detail-item__swatch" style="--item-color:'+E(color)+'">'+(index+1)+'</span><span><small>'+E(brand)+'</small><strong>'+E(item.name||item.category||'可见单品')+'</strong><span class="detail-item__price">'+E(renderPrice(item))+'</span></span></button>'+(model?'<p class="detail-item__model">'+E(model)+'</p>':'')+(entry.note?'<p class="detail-item__note">'+E(entry.note)+'</p>':'')+renderEvidence(entry,item,post)+renderProductSnapshot(item,official)+'<div class="detail-item__buttons"><button class="button button--small '+(saved?'is-saved':'')+'" data-action="add-item" data-id="'+E(id)+'">'+C.icon(saved?'check':'create',13)+(saved?'已加入衣橱':'加入衣橱')+'</button>'+C.externalLink(official||post.sourceUrl,official?'官方同款':'去原帖核对','button button--small button--subtle')+'</div></article>';
  }
  function renderLayers(post){
    const layers=post.layers||[],body=layers.length?'<ol class="detail-layers">'+layers.map((layer,index)=>'<li><span class="detail-layers__number">0'+(index+1)+'</span><strong>'+E(layer.name)+'</strong><p>'+E(layer.desc)+'</p></li>').join('')+'</ol>':'<p class="detail-section__hint">暂未取得可核实的内层信息。</p>';
    return '<section class="detail-section"><div class="detail-section__heading"><span class="eyebrow">VISIBLE LAYERS</span><h2>把叠穿看明白</h2></div>'+body+'</section>';
  }
  function renderItems(post){
    return '<section class="detail-section"><div class="detail-section__heading"><span class="eyebrow">ITEM IDENTIFICATION</span><h2>单品识别 <small>'+(post.items||[]).length+' PIECES</small></h2></div><p class="detail-section__hint">每件单独标注识别程度；点编号，对照照片查看。</p><div class="detail-items">'+(post.items||[]).map((entry,index)=>renderItem(entry,index,post)).join('')+'</div><p class="detail-budget">整套预算 <strong>尚未核实</strong></p><p class="detail-disclaimer">视觉相似无法确认同款。品牌、型号与价格以所列证据和官方页面为准。</p></section>';
  }
  function renderPalette(post){
    if(!(post.palette||[]).length)return '';
    return '<section class="detail-section"><div class="detail-section__heading"><span class="eyebrow">COLOR NOTES</span><h2>照片配色参考</h2></div><p class="detail-section__hint">按服装可见颜色近似记录，点击可复制 HEX。</p><div class="detail-palette">'+post.palette.map(color=>'<button class="detail-palette__color" data-action="copy-color" data-value="'+E(color)+'" style="--swatch-color:'+E(color)+'" aria-label="复制配色 '+E(color)+'"><span></span><small>'+E(color.toUpperCase())+'</small></button>').join('')+'</div></section>';
  }
  function localComments(id){return C.localComments(id);}
  function renderComments(post){
    const comments=localComments(post.id);
    if(!comments.length)return '<p class="detail-comments__empty">把你的观察记在这里，笔记只保存在这台设备。</p>';
    return '<div class="detail-comments__list">'+comments.map(comment=>'<div class="detail-comment"><span class="detail-comment__avatar">我</span><div><p><strong>我的笔记</strong> '+E(comment.text)+'</p><small>'+E(comment.time||'本地保存')+' · 仅此设备</small></div></div>').join('')+'</div>';
  }
  function basisText(value){
    if(Array.isArray(value))return value.filter(part=>typeof part==='string').join('；');
    if(value&&typeof value==='object')return Object.values(value).filter(part=>typeof part==='string').join('；');
    return typeof value==='string'?value:'根据所列原帖的可见服装轮廓、配色与搭配关系分析。';
  }
  function renderProvenance(post){
    const captured=post.capturedAt?String(post.capturedAt).slice(0,10).replace(/-/g,'.'):'未记录';
    return '<section class="detail-provenance"><div class="detail-provenance__heading"><span class="eyebrow">SOURCE & EVIDENCE</span>'+C.sourceLink(post,'查看原帖来源')+'</div><p>'+E(basisText(post.analysisBasis))+'</p><dl><div><dt>图片来源</dt><dd>'+E(post.sourceCredit||post.sourceHandle||'尚未核实')+'</dd></div><div><dt>图像位置</dt><dd>'+E(C.sourceImageLabel(post))+'</dd></div><div><dt>原帖日期</dt><dd>'+E(C.sourceDate(post))+'</dd></div><div><dt>采集日期</dt><dd>'+E(captured)+'</dd></div></dl><p class="detail-provenance__scope">'+E(C.collectionSummary())+'。同一原帖中不同搭配可分别记录。</p></section>';
  }
  function renderBottom(post){
    return '<div class="detail-bottom">'+C.renderActions(post,true)+'<p class="post-card__likes">'+C.renderLikeStatus(post)+'</p><form class="detail-comment-form" data-comment-form><label class="sr-only" for="comment-input">添加本地穿搭笔记</label><input id="comment-input" name="comment" placeholder="记下你的穿搭观察，仅保存本地…" maxlength="300" autocomplete="off" required><button type="submit" data-action="comment-submit">保存</button></form></div>';
  }
  function renderInformation(post){
    const focus=C.focusLabel(post);
    return '<div class="detail-information">'+C.renderPostHeader(post)+'<div class="detail-copy"><p class="eyebrow">LOOK ANALYSIS · 公开来源图鉴</p><h1 id="detail-title">'+E(post.title||'穿搭视觉笔记')+'</h1>'+(focus?'<p class="detail-focus-label">'+E(focus)+'</p>':'')+'<p class="detail-analysis-label">本站中文视觉分析</p><p class="detail-caption">'+E(post.caption)+'</p><div class="detail-tags">'+(post.tags||[]).map(tag=>'<a href="#/tag/'+encodeURIComponent(tag.replace(/^#/,''))+'">'+E(tag)+'</a>').join(' ')+'</div>'+renderProvenance(post)+renderLayers(post)+renderItems(post)+renderPalette(post)+'<section class="detail-section detail-comments"><div class="detail-section__heading"><span class="eyebrow">LOCAL NOTES</span><h2>我的穿搭笔记</h2></div><div data-detail-comments>'+renderComments(post)+'</div></section></div>'+renderBottom(post)+'</div>';
  }
  function renderDialog(post){
    return '<div class="detail-backdrop"><section class="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" tabindex="-1" data-post-id="'+E(post.id)+'"><button class="detail-close icon-button" data-action="detail-close" aria-label="关闭帖子详情">'+C.icon('close')+'</button><div class="detail-media"><div class="detail-image-wrap" style="--look-ratio:'+C.aspect(post)+'">'+C.image(post,0,'detail-image')+renderHotspots(post)+'<span class="detail-media__label">'+E(post.sourceHandle||'SOURCE LOOK')+'<br><strong>'+E(C.sourceImageLabel(post))+'</strong></span>'+renderCarousel(post)+'</div></div>'+renderInformation(post)+'</section></div>';
  }
  function renderCarousel(post){
    if((post.images||[]).length<2)return C.sourceImageBadge(post);
    return '<button class="carousel-arrow carousel-arrow--left" data-action="detail-carousel" data-direction="-1" aria-label="上一张原帖照片">'+C.icon('left',16)+'</button><button class="carousel-arrow carousel-arrow--right" data-action="detail-carousel" data-direction="1" aria-label="下一张原帖照片">'+C.icon('right',16)+'</button><span class="post-card__counter" data-detail-counter>'+E(C.carouselLabel(post))+'</span>';
  }
  function changeImage(direction){
    imageIndex=(imageIndex+direction+current.images.length)%current.images.length;
    root.querySelector('.detail-image').outerHTML=C.image(current,imageIndex,'detail-image');
    root.querySelector('.detail-image-wrap').style.setProperty('--look-ratio',C.aspect(current,imageIndex));
    root.querySelector('[data-detail-counter]').textContent=C.carouselLabel(current,imageIndex);
    root.querySelector('.detail-media__label strong').textContent=C.sourceImageLabel(current,imageIndex);
  }
  function highlight(index,scroll){
    root.querySelectorAll('.detail-hotspot,.detail-item').forEach(element=>element.classList.remove('is-active'));
    const hotspot=root.querySelector('.detail-hotspot[data-index="'+index+'"]'),item=root.querySelector('.detail-item[data-item-index="'+index+'"]');
    if(hotspot)hotspot.classList.add('is-active');
    if(item){
      item.classList.add('is-active');
      if(scroll)item.scrollIntoView({
        block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'
      }
      );
    }
  }
  function handleClick(event){
    if(event.target===root.querySelector('.detail-backdrop')){
      A.details.close();
      return;
    }
    const button=event.target.closest('[data-action]');
    if(!button)return;
    const action=button.dataset.action;
    if(action==='detail-close'){
      event.stopPropagation();
      A.details.close();
    }
    if(action==='detail-hotspot'||action==='detail-item'){
      event.stopPropagation();
      highlight(Number(button.dataset.index),action==='detail-hotspot');
    }
    if(action==='detail-carousel'){
      event.stopPropagation();
      changeImage(Number(button.dataset.direction));
    }
    if(action==='comment-submit'){
      event.stopPropagation();
    }
  }
  function handleSubmit(event){
    if(!event.target.matches('[data-comment-form]'))return;
    event.preventDefault();
    event.stopPropagation();
    const input=event.target.elements.comment,text=input.value.trim();
    if(!text){
      input.focus();
      return;
    }
    const stored=A.store.get('comments'),comments=stored&&typeof stored==='object'&&!Array.isArray(stored)?{
      ...stored
    }
    :{
    }
    ;
    comments[current.id]=[{
      user:'我',text,scope:'local-analysis',time:'刚刚'
    }
    ,...localComments(current.id)];
    A.store.set('comments',comments);
    root.querySelector('[data-detail-comments]').innerHTML=renderComments(current);
    input.value='';
    input.focus();
    if(A.toast)A.toast('笔记已保存到这台设备');
  }
  function handleKeyboard(event){
    if(event.key==='Escape'){
      event.preventDefault();
      event.stopPropagation();
      A.details.close();
      return;
    }
    if(event.key!=='Tab')return;
    const focusable=[...root.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]')].filter(element=>element.getClientRects().length);
    const first=focusable[0],last=focusable[focusable.length-1];
    if(!first)return;
    if(event.shiftKey&&(document.activeElement===first||!root.contains(document.activeElement))){
      event.preventDefault();
      last.focus();
    }
    else if(!event.shiftKey&&(document.activeElement===last||!root.contains(document.activeElement))){
      event.preventDefault();
      first.focus();
    }
  }
  function cleanup(){
    if(handlers){
      root.removeEventListener('click',handlers.click);
      root.removeEventListener('submit',handlers.submit);
      document.removeEventListener('keydown',handlers.key);
      handlers=null;
    }
    if(root)root.innerHTML='';
    current=null;
    if(!document.getElementById('story-root').children.length)document.body.classList.remove('is-locked');
  }
  A.details={
    open:function(id){
      cleanup();
      root=document.getElementById('overlay-root');
      current=U.post(id);
      imageIndex=0;
      returnFocus=document.activeElement;
      if(!current){
        root.innerHTML='<div class="detail-backdrop"><section class="detail-error" role="dialog" aria-modal="true" tabindex="-1">'+C.empty('这套造型暂时找不到','去发现页，再找一点今天的穿搭灵感。','#/explore','去发现页')+'<button class="button" data-action="detail-close">关闭</button></section></div>';
      }
      else root.innerHTML=renderDialog(current);
      document.body.classList.add('is-locked');
      handlers={
        click:handleClick,submit:handleSubmit,key:handleKeyboard
      }
      ;
      root.addEventListener('click',handlers.click);
      root.addEventListener('submit',handlers.submit);
      document.addEventListener('keydown',handlers.key);
      const dialog=root.querySelector('[role="dialog"]');
      if(dialog)dialog.focus();
      if(A.state.focusComment){
        A.state.focusComment=false;
        const input=root.querySelector('#comment-input');
        if(input)input.focus();
      }
    }
    ,
    close:function(){
      const focus=returnFocus;
      cleanup();
      location.hash=A.state.previousRoute||'#/';
      if(focus&&focus.isConnected)focus.focus();
    }
    ,
    cleanup:cleanup,
    renderComments:renderComments
  }
  ;
}
)(window.App);
