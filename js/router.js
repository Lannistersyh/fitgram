/* file:// 可用的 hash 路由；详情保留背景页面、滚动位置和打开前的焦点。 */
(function (A) {
  'use strict';
  const V = A.views, U = A.utils;
  const titles = {'/':'日韩男生秋冬穿搭灵感图鉴','/catalog':'分类图鉴','/catalog/japan':'日系新选 · 20 套穿搭','/catalog/douyin':'原抖音穿搭选辑','/catalog/history':'潮流历史图集','/catalog/leather':'皮包专题','/catalog/blazers':'西装外套款式课','/explore':'发现','/closet':'我的衣橱','/compare':'日韩对照','/trends':'造型观察','/bloggers':'来源图鉴','/reels':'造型速览','/about':'关于'};
  let first = true;

  function renderPage(route) {
    const path = route.split('/').filter(Boolean), name = path[0] || 'home';
    if (name === 'tag') {
      A.state.filters.query = decodeURIComponent(path.slice(1).join('/')).replace(/^#/, '');
      return V.renderExplore();
    }
    if (name === 'home') return V.renderHome();
    if (name === 'catalog') return V.renderCatalog(path[1],path[2]);
    if (name === 'explore') return V.renderExplore();
    if (name === 'blogger') return V.renderBlogger(path[1]);
    const views = {bloggers:'renderBloggers',compare:'renderCompare',trends:'renderTrends',closet:'renderCloset',about:'renderAbout',reels:'renderReels'};
    if (views[name]) return V[views[name]]();
    return '<div class="page"><h1>这条街，暂时没有造型。</h1>'+A.components.empty('页面没有找到','回到首页，继续寻找穿衣灵感。','#/','回到首页')+'</div>';
  }

  function mount(route) {
    if (route === '/') V.mountHome();
    if (route.startsWith('/catalog')) { A.catalog.mount(); A.atlas.mount(); A.world.mount(); A.history.mount(); A.leather.mount(); A.tailoring.mount(); }
    if (V.mountExtra) V.mountExtra(route.replace(/^\//, ''));
  }

  function cleanup() {
    V.cleanupHome();
    if (V.cleanupExtra) V.cleanupExtra();
  }

  function updateNavigation(route) {
    const japanReference=route.startsWith('/catalog/reference/')&&(window.FITGRAM_JAPAN?.looks||[]).some(p=>route==='/catalog/reference/'+p.id);
    const section = ['/catalog/japan','/catalog/history','/catalog/leather','/catalog/blazers'].find(p=>route.startsWith(p))||(japanReference?'/catalog/japan':null);
    document.querySelectorAll('[data-route]').forEach(el => {
      const active = route === el.dataset.route || (el.dataset.route === '/catalog' && route.startsWith('/catalog/') && (!section || !el.closest('#desktop-nav'))) || (section && el.dataset.route === section) || (el.dataset.route === '/bloggers' && route.startsWith('/blogger/'));
      el.classList.toggle('is-active', active);
      if (active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
  }

  function updateMeta(route) {
    updateNavigation(route);
    const reference=route.startsWith('/catalog/reference/')?[...(window.FITGRAM_JAPAN?.looks||[]),...(window.FITGRAM_REFERENCES?.looks||[])].find(p=>p.id===route.split('/')[3]):null;
    document.title = 'FITGRAM · ' + (reference?.title || titles[route] || (route.startsWith('/catalog/japan/')?'日系新选 · 20 套穿搭':route.startsWith('/catalog/blazers/')?'西装外套款式课':route.startsWith('/catalog/leather/')?'皮包专题':route.startsWith('/catalog/history/')?'潮流历史图集':route.startsWith('/catalog/')?'分类图鉴':'穿搭图鉴'));
    A.store.set('recent', [route, ...(A.store.get('recent') || []).filter(x => x !== route)].slice(0, 12));
  }

  function openDetail(route) {
    A.closePanel();
    if (!A.state.route) {
      A.state.previousRoute = '#/';
      A.state.backgroundRoute = '/';
      document.getElementById('main').innerHTML = renderPage('/');
      mount('/');
    } else if (!A.state.route.startsWith('/p/')) {
      A.state.previousRoute = '#' + A.state.route;
    }
    A.state.route = route;
    A.details.open(route.slice(3));
    document.title = 'FITGRAM · ' + (U.post(route.slice(3))?.title || '穿搭详情');
  }

  function commitPage(route, preserveScroll) {
    cleanup();
    const y = window.scrollY;
    A.state.route = route;
    A.state.backgroundRoute = route;
    try {
      document.getElementById('main').innerHTML = renderPage(route);
    } catch (error) {
      console.error(error);
      document.getElementById('main').innerHTML = '<div class="page"><h1>这套造型暂时没整理好</h1><p>请返回首页再试一次。</p><a class="button" href="#/">返回首页</a></div>';
    }
    mount(route);
    updateMeta(route);
    if (preserveScroll) window.scrollTo({top:y,behavior:'instant'});
    else {
      window.scrollTo({top:0,behavior:'instant'});
      if (!first) document.getElementById('main').focus({preventScroll:true});
    }
    if (route.startsWith('/catalog')) { A.catalog.jump(); A.leather.jump(); A.tailoring.jump(); }
    first = false;
  }

  A.router = {
    render:function (preserveScroll) {
      let route = location.hash.slice(1) || '/';
      if (!route.startsWith('/')) route = '/';
      if (route.startsWith('/p/')) { openDetail(route); return; }
      const returnToBackground = A.state.route?.startsWith('/p/') && route === A.state.backgroundRoute;
      A.details.cleanup();
      A.stories.cleanup();
      A.closePanel();
      if (returnToBackground) {
        A.state.route = route;
        updateMeta(route);
        return;
      }
      commitPage(route, preserveScroll);
    },
    init:function () {
      window.addEventListener('hashchange', () => A.router.render());
      A.router.render();
    }
  };
})(window.App);
