/* 季节日历验收：时区、跨年、闰日、四季边界与编辑标注的一致性。 */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),sandbox={window:{App:{utils:{escape:String}}}};
vm.createContext(sandbox);
for(const name of ['reference-data.js','seasons.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',name),'utf8'),sandbox);
const T=sandbox.window.App.seasons,looks=sandbox.window.FITGRAM_REFERENCES.looks;
const source=JSON.parse(fs.readFileSync(path.join(root,'assets/research/reference-seasons.json'),'utf8'));
assert.equal(source.length,28);assert.equal(new Set(source.map(p=>p.id)).size,28);
for(const p of looks){
 const guide=source.find(g=>g.id===p.id);assert(guide);
 const {id,...expected}=guide;assert.equal(JSON.stringify(p.seasonGuide),JSON.stringify(expected));
 assert(guide.seasons.every(s=>T.keys.includes(s)));assert(guide.seasons.includes(guide.primary));
 assert.equal(new Set(guide.seasons).size,guide.seasons.length);assert(guide.note.length>12);
}
for(const [date,expected] of Object.entries({'2026-01-01':'winter','2026-02-28':'winter','2026-03-01':'spring','2026-05-31':'spring','2026-06-01':'summer','2026-08-31':'summer','2026-09-01':'autumn','2026-11-30':'autumn','2026-12-01':'winter','2027-01-01':'winter'}))assert.equal(T.seasonFor(date),expected,date);
assert(T.parse('2000-02-29'));assert(T.parse('2028-02-29'));
for(const date of ['1900-02-29','2026-02-29','2026-04-31','2026-00-01','2026-13-01','2026-10-00','2026-1-1','2101-01-01','1899-12-31','',null])assert.equal(T.parse(date),null,String(date));
assert.equal(T.today(new Date('2026-10-26T15:59:59Z')),'2026-10-26');
assert.equal(T.today(new Date('2026-10-26T16:00:00Z')),'2026-10-27');
assert.equal(T.today(new Date('2026-12-31T16:00:00Z')),'2027-01-01');
assert.equal(T.context({date:'2026-07-12',season:null}).season,'summer');
assert.equal(T.context({date:'2026-07-12',season:'winter'}).season,'winter');
const counts={};
for(const s of T.keys){
 const sorted=T.prioritize(looks,s);assert.equal(sorted.length,28);assert.equal(new Set(sorted.map(p=>p.id)).size,28);
 let seenSecondary=false,seenOther=false;
 for(const p of sorted){if(!T.matches(p,s))seenOther=true;else assert(!seenOther,'应季必须排在非应季之前');if(p.seasonGuide.primary!==s)seenSecondary=true;else assert(!seenSecondary,'本季主标注必须排在跨季标注之前');}
 const others=sorted.filter(p=>!T.matches(p,s)).map(p=>p.id);assert.equal(JSON.stringify(others),JSON.stringify(looks.filter(p=>!T.matches(p,s)).map(p=>p.id)),'余下照片保持原顺序');
 counts[s]=looks.filter(p=>T.matches(p,s)).length;assert(counts[s]>0);
}
assert.equal(T.prioritize(looks,'autumn')[0].id,'03');assert.equal(T.prioritize(looks,'winter')[0].id,'28');
assert(!T.matches(looks.find(p=>p.id==='02'),'winter'));
const html=T.render({date:'2000-02-29',season:null,calendarMonth:null},looks);
assert.equal((html.match(/data-action="atlas-date"/g)||[]).length,42);
assert(html.includes('data-date="2000-02-29" aria-label="2000年2月29日" aria-pressed="true"'));
assert(!html.includes('data-date="2000-02-30"'));
console.log(JSON.stringify({passed:true,references:looks.length,seasonCounts:counts,timeZone:'Asia/Shanghai',dateBoundaries:'passed',leapYears:'passed',stablePriority:'passed'},null,2));
