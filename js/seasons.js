/* 穿搭日历：北京时间、北半球月份与可见穿着层次；不推断原帖拍摄季节。 */
(function(A){
  'use strict';
  const E=A.utils.escape,keys=['spring','summer','autumn','winter'];
  const names={spring:'春',summer:'夏',autumn:'秋',winter:'冬'};
  const ranges={spring:'3–5 月',summer:'6–8 月',autumn:'9–11 月',winter:'12–2 月'};
  const pad=n=>String(n).padStart(2,'0');
  function today(now=new Date()){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get=key=>parts.find(p=>p.type===key).value;
    return get('year')+'-'+get('month')+'-'+get('day');
  }
  function parse(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;
    const [year,month,day]=value.split('-').map(Number),date=new Date(Date.UTC(year,month-1,day));
    return year>=1900&&year<=2100&&date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?date:null;
  }
  const iso=date=>date.getUTCFullYear()+'-'+pad(date.getUTCMonth()+1)+'-'+pad(date.getUTCDate());
  function seasonFor(value){const date=parse(value);if(!date)return null;return keys[Math.floor((date.getUTCMonth()+10)%12/3)];}
  function context(state){
    const date=parse(state.date)?state.date:today(),season=keys.includes(state.season)?state.season:seasonFor(date);
    return {date,season,manual:!!state.date||keys.includes(state.season)};
  }
  function label(p){return (p.seasonGuide?.seasons||[]).map(s=>names[s]).join(' / ');}
  const matches=(p,season)=>(p.seasonGuide?.seasons||[]).includes(season);
  function prioritize(list,season){
    const rank=p=>p.seasonGuide?.primary===season?0:matches(p,season)?1:2;
    return list.map((p,index)=>({p,index})).sort((a,b)=>rank(a.p)-rank(b.p)||a.index-b.index).map(x=>x.p);
  }
  function calendar(state){
    const ctx=context(state),selected=parse(ctx.date),view=parse(state.calendarMonth)||new Date(Date.UTC(selected.getUTCFullYear(),selected.getUTCMonth(),1));
    const year=view.getUTCFullYear(),month=view.getUTCMonth(),first=new Date(Date.UTC(year,month,1)),start=1-(first.getUTCDay()+6)%7;
    const current=today(),prev=iso(new Date(Date.UTC(year,month-1,1))),next=iso(new Date(Date.UTC(year,month+1,1)));
    const dateLabel=value=>{const [y,m,d]=value.split('-').map(Number);return y+'年'+m+'月'+d+'日';};
    return '<details class="atlas-calendar"><summary aria-label="打开穿搭日历，已选 '+dateLabel(ctx.date)+'"><span>'+ctx.date.replaceAll('-',' / ')+'</span><span>选日期 ▾</span></summary><div class="atlas-calendar__panel"><div class="atlas-calendar__month"><button data-action="atlas-month" data-date="'+prev+'" aria-label="上个月" '+(!parse(prev)?'disabled':'')+'>←</button><strong>'+year+' 年 '+(month+1)+' 月</strong><button data-action="atlas-month" data-date="'+next+'" aria-label="下个月" '+(!parse(next)?'disabled':'')+'>→</button></div><label class="atlas-date-input">跳转日期<input type="date" id="atlas-date" min="1900-01-01" max="2100-12-31" value="'+ctx.date+'"></label><div class="atlas-calendar__week" aria-hidden="true">'+['一','二','三','四','五','六','日'].map(d=>'<span>'+d+'</span>').join('')+'</div><div class="atlas-calendar__days" role="group" aria-label="'+year+'年'+(month+1)+'月，选择日期">'+Array.from({length:42},(_,index)=>{
      const day=new Date(Date.UTC(year,month,start+index)),value=iso(day);
      return '<button data-action="atlas-date" data-date="'+value+'" aria-label="'+dateLabel(value)+'" aria-pressed="'+(value===ctx.date)+'" '+(value===current?'aria-current="date" ':'')+(!parse(value)?'disabled ':'')+'class="'+(day.getUTCMonth()!==month?'is-other-month':'')+'">'+day.getUTCDate()+'</button>';
    }).join('')+'</div><p>按北京时间显示今天</p></div></details>';
  }
  function render(state,list){
    const ctx=context(state),name=names[ctx.season],count=list.filter(p=>matches(p,ctx.season)).length;
    return '<section class="atlas-season" aria-labelledby="atlas-season-title"><div class="atlas-season__heading"><div><p class="eyebrow">穿搭日历 · SEASONAL EDIT</p><h2 id="atlas-season-title">'+name+(count===1?'装，先看叠穿。':'装，先看这几套。')+'</h2><p id="atlas-season-status" role="status" aria-live="polite">'+(ctx.manual?'自选参考':'随今天自动更新')+' · '+name+'季 '+ranges[ctx.season]+' · '+count+' 张适合本季</p></div><div class="atlas-season__date">'+calendar(state)+'<button class="text-link" data-action="atlas-today">回到今天</button></div></div><div class="atlas-season__bottom"><div class="atlas-season__tabs" role="group" aria-label="优先展示的穿搭季节">'+keys.map(s=>'<button data-action="atlas-season" data-season="'+s+'" aria-pressed="'+(ctx.season===s)+'"><strong>'+names[s]+'</strong><span>'+ranges[s]+'</span><small>'+list.filter(p=>matches(p,s)).length+' 张</small></button>').join('')+'</div><label class="atlas-season__only"><input type="checkbox" id="atlas-season-only" '+(state.seasonOnly?'checked':'')+'>只看'+name+'季</label></div><p class="atlas-season__note">默认应季在前，其余照片仍保留。按北半球月份与可见穿着层次整理，厚薄可随当地气温调整。</p></section>';
  }
  A.seasons={keys,names,ranges,today,parse,iso,seasonFor,context,label,matches,prioritize,render};
})(window.App);
