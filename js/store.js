/* 受保护的本地存储，失败时自动降级内存；不影响任何界面操作。 */
(function(A){
  'use strict';
  const defaults={
    likes:[],saves:[],catalogSaves:[],referenceSaves:[],closet:[],comments:{
    }
    ,theme:'light',recent:[],seenStories:[],following:[]
  }
  ;
  const cache={
  }
  ;
  A.store={
    get:function(key){
      if(Object.prototype.hasOwnProperty.call(cache,key))return cache[key];
      try{
        const raw=localStorage.getItem('fitgram.'+key);
        let parsed=raw===null?defaults[key]:JSON.parse(raw);
        const fallback=defaults[key];
        if(Array.isArray(fallback)&&!Array.isArray(parsed))parsed=[];
        if(fallback&&typeof fallback==='object'&&!Array.isArray(fallback)&&(!parsed||typeof parsed!=='object'||Array.isArray(parsed)))parsed={
        }
        ;
        if(typeof fallback==='string'&&typeof parsed!=='string')parsed=fallback;
        cache[key]=parsed;
      }
      catch(e){
        cache[key]=defaults[key];
      }
      return cache[key]===undefined?null:cache[key];
    }
    ,set:function(key,value){
      cache[key]=value;
      try{
        localStorage.setItem('fitgram.'+key,JSON.stringify(value));
      }
      catch(e){
      }
      return value;
    }
    ,toggle:function(key,id){
      const values=[...(this.get(key)||[])];
      const i=values.indexOf(id);
      if(i<0)values.push(id);
      else values.splice(i,1);
      this.set(key,values);
      return i<0;
    }
    ,has:function(key,id){
      return (this.get(key)||[]).includes(id);
    }
  }
  ;
  document.documentElement.dataset.theme=A.store.get('theme')==='dark'?'dark':'light';
}
)(window.App);
