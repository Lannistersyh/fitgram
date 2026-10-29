/* 统一桌面、手机与全部栏目：分组、四字命名和单一激活状态。 */
(function(A){
  'use strict';
  const C=A.components,E=A.utils.escape;
  const groups=[
    {label:'穿搭灵感',links:[['/','home','今日灵感'],['/catalog','hanger','穿搭图鉴'],['/catalog/world','compass','风格地图']]},
    {label:'搭配学习',links:[['/learn','layers','搭配原理'],['/learn/pairing','grid','鞋裤搭配'],['/catalog/blazers','hanger','西装款式'],['/catalog/history','film','潮流历史']]},
    {label:'单品衣橱',links:[['/catalog/all','grid','单品图鉴'],['/catalog/leather','bookmark','皮包专题'],['/closet','hanger','我的衣橱']]}
  ];
  const extra=[['/explore','search','发现穿搭'],['/catalog/japan','hanger','日系新选'],['/bloggers','user','来源账号'],['/reels','film','造型速览'],['/compare','layers','日韩对照'],['/trends','compass','造型观察'],['/about','info','关于本站']];
  const mobile=[['/','home','今日灵感'],['/catalog','hanger','穿搭图鉴'],['/learn','layers','搭配学习'],['/catalog/all','grid','单品图鉴'],['/closet','bookmark','我的衣橱']];
  function link([route,icon,label],cls='nav-link'){
    return '<a class="'+cls+'" href="#'+route+'" data-route="'+route+'" aria-label="'+E(label)+'" title="'+E(label)+'">'+C.icon(icon)+'<span>'+E(label)+'</span></a>';
  }
  function root(route){
    if(route.startsWith('/learn/pairing'))return '/learn/pairing';
    if(route.startsWith('/learn'))return '/learn';
    for(const key of ['world','blazers','history','leather'])if(route.startsWith('/catalog/'+key))return '/catalog/'+key;
    if(/^\/catalog\/(all|new|international|shoes|pants|shirts|outerwear|tops|bags|jewelry|accessories)(\/|$)/.test(route))return '/catalog/all';
    if(route.startsWith('/catalog'))return '/catalog';
    if(route.startsWith('/blogger/'))return '/bloggers';
    return route;
  }
  function mobileRoot(route){
    const section=root(route);
    if(['/learn/pairing','/catalog/blazers','/catalog/history'].includes(section))return '/learn';
    if(section==='/catalog/leather')return '/catalog/all';
    if(['/catalog/world','/bloggers','/compare','/trends'].includes(section))return '/catalog';
    if(['/explore','/reels'].includes(section))return '/';
    return section;
  }
  A.navigation={groups,extra,root,mobileRoot,
    mount:function(){
      document.getElementById('desktop-nav').innerHTML=groups.map(g=>'<div class="sidebar-group"><p class="sidebar-group__label">'+g.label+'</p>'+g.links.map(p=>link(p)).join('')+'</div>').join('');
      document.getElementById('mobile-nav').innerHTML=mobile.map(p=>link(p,'mobile-nav__link')).join('');
      document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=C.icon(el.dataset.icon));
    },
    update:function(route){
      document.querySelectorAll('[data-route]').forEach(el=>{
        const expected=el.closest('#mobile-nav')?mobileRoot(route):root(route),active=el.dataset.route===expected;
        el.classList.toggle('is-active',active);if(active)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
      });
    },
    menu:function(){
      return '<div class="navigation-menu">'+[...groups,{label:'继续浏览',links:extra}].map(g=>'<section><h3>'+g.label+'</h3><div>'+g.links.map(p=>link(p,'navigation-menu__link')).join('')+'</div></section>').join('')+'<section><h3>本地工具</h3><div><button data-action="create">'+C.icon('edit',20)+'穿搭笔记</button><button data-action="theme">'+C.icon('sun',20)+'切换主题</button><button data-action="messages">'+C.icon('external',20)+'核对来源</button><button data-action="notifications">'+C.icon('info',20)+'资料状态</button></div></section></div>';
    }
  };
})(window.App);
