(function(){
  let dragonUrl=null;

  function mountDragon(url){
    dragonUrl=url;
    document.documentElement.style.setProperty('--dragon-real', `url("${url}")`);
    document.documentElement.classList.add('dragon-ready');

    const hero=document.querySelector('.hero');
    if(hero && !hero.querySelector('.dragonArt')){
      const img=new Image();
      img.className='dragonArt';
      img.alt='';
      img.decoding='async';
      img.src=url;
      hero.prepend(img);
    }

    const top=document.querySelector('.top');
    if(top && !top.querySelector('.dragonTopArt')){
      const img=new Image();
      img.className='dragonTopArt';
      img.alt='';
      img.decoding='async';
      img.src=url;
      top.prepend(img);
    }
  }

  function setDragon(bytes,mime='image/webp'){
    const url=URL.createObjectURL(new Blob([bytes],{type:mime}));
    mountDragon(url);
    window.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
  }

  async function fetchSequential(prefix,ext,maxParts){
    const parts=[];
    for(let i=0;i<maxParts;i++){
      const r=await fetch(`/assets/${prefix}${i}.${ext}?v=10`,{cache:'no-store'});
      if(!r.ok){
        if(i===0) throw new Error(`${prefix}0 missing`);
        break;
      }
      const t=(await r.text()).trim();
      if(!t) break;
      parts.push(t);
    }
    if(!parts.length) throw new Error(`${prefix} unavailable`);
    return parts.join('').replace(/\s+/g,'');
  }

  function decodeBase64(b64){
    const bin=atob(b64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    return bytes;
  }

  async function loadDragon(){
    try{
      const legacy=await fetchSequential('dragon-real-','b64',20);
      setDragon(decodeBase64(legacy),'image/webp');
      return;
    }catch(err){
      console.warn('dragon-real unavailable',err);
    }

    try{
      const compressed=await fetchSequential('dragon-chunk-','txt',40);
      setDragon(decodeBase64(compressed),'image/webp');
      return;
    }catch(err){
      console.warn('dragon chunks unavailable',err);
    }

    mountDragon('/assets/dragon.svg?v=10');
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadDragon,{once:true});
  }else{
    loadDragon();
  }
})();
