/* 应用命名空间、转义、来源链接与未知值格式化；真实来源不补造数字。 */
(function () {
  'use strict';
  const A = window.App = {data:window.FITGRAM_DATA || {},state:{},utils:{},components:{},views:{}};
  const U = A.utils;
  U.escape = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  U.number = n => n == null || !Number.isFinite(Number(n)) ? '未核实' : n >= 10000 ? (Math.floor(n / 1000) / 10).toFixed(1) + '万' : Number(n).toLocaleString('zh-CN');
  U.money = n => n == null || !Number.isFinite(Number(n)) ? '价格未核实' : '¥' + Number(n).toLocaleString('zh-CN');
  U.relative = date => date ? String(date).slice(0, 10) : '发布日期未核实';
  U.blogger = id => A.data.bloggers.find(b => b.id === id);
  U.post = id => A.data.posts.find(p => p.id === id);
  U.item = id => A.data.items.find(i => i.id === id);
  U.temp = t => ({'15-20':'15～20℃','10-15':'10～15℃','5-10':'5～10℃','0-5':'0～5℃','-5-0':'−5～0℃',unknown:'原帖未标温度'}[t] || '原帖未标温度');
  U.sourceKind = kind => ({creator:'个人创作者',curation:'街拍合集',magazine:'杂志媒体',brand:'品牌官方',group:'男团官方'}[kind] || '来源账号');
  U.safeURL = value => /^https?:\/\//i.test(String(value || '')) ? String(value) : '';
  U.imageFallback = function (img) {
    const step = Number(img.dataset.fallback || 0);
    img.dataset.fallback = step + 1;
    if (step === 0 && img.dataset.remote) { img.src = img.dataset.remote; return; }
    if (step < 2) { img.src = img.dataset.placeholder || 'assets/placeholder/neutral.svg'; return; }
    img.onerror = null;
  };
  U.copy = function (value) {
    const fallback = () => {
      const input = document.createElement('textarea');
      input.value = value; input.className = 'sr-only'; document.body.append(input); input.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (error) {}
      input.remove(); A.toast(ok ? '已复制到剪贴板' : '请手动复制：' + value);
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(value).then(() => A.toast('已复制到剪贴板'), fallback);
    else fallback();
  };
  U.debounce = function (fn, ms) {
    let timer;
    return function () { clearTimeout(timer); const args = arguments; timer = setTimeout(() => fn.apply(null, args), ms); };
  };
  U.footer = () => '<footer class="footer"><div class="footer__links"><a href="#/about">关于与来源说明</a><a href="#/compare">日韩对照</a><a href="#/bloggers">来源图鉴</a><a href="#/trends">造型观察</a></div><p>本地穿搭资料索引。图片版权归原作者及品牌所有，每套均保留来源链接。单品按证据标注为已确认型号、仅确认品牌或视觉判断；未核实的型号、材质、价格和互动量不补造。收藏与评论只保存在本机，不会同步到 Instagram。</p><div class="footer__wordmark">FITGRAM · REAL LOOKS, TRACEABLE SOURCES</div></footer>';
})();
