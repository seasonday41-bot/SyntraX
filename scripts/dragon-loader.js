(function(){
  const setDragon = (bytes, mime='image/webp') => {
    const url = URL.createObjectURL(new Blob([bytes], {type:mime}));
    document.documentElement.style.setProperty('--dragon-real', `url("${url}")`);
    document.documentElement.classList.add('dragon-ready');
    window.addEventListener('pagehide', () => URL.revokeObjectURL(url), {once:true});
  };

  async function fetchSequential(prefix, ext, maxParts){
    const parts=[];
    for(let i=0;i<maxParts;i++){
      const r=await fetch(`/assets/${prefix}${i}.${ext}?v=9`, {cache:'no-store'});
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
      // Prefer the compressed image chunks created for SyntraX.
      const compressed=await fetchSequential('dragon-chunk-', 'txt', 40);
      setDragon(decodeBase64(compressed));
      return;
    }catch(err){
      console.warn('Compressed dragon unavailable; falling back', err);
    }

    try{
      const legacy=await fetchSequential('dragon-real-', 'b64', 20);
      setDragon(decodeBase64(legacy));
    }catch(err){
      console.warn('SyntraX dragon asset unavailable', err);
      // Last-resort vector asset already in the repo.
      document.documentElement.style.setProperty('--dragon-real', 'url("/assets/dragon.svg?v=9")');
      document.documentElement.classList.add('dragon-ready');
    }
  }

  loadDragon();
})();
