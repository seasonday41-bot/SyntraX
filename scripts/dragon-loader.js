(function(){
  async function loadRealDragon(){
    try{
      const parts=await Promise.all(Array.from({length:10},(_,i)=>
        fetch(`/assets/dragon-real-${i}.b64?v=7`,{cache:'force-cache'}).then(r=>{
          if(!r.ok) throw new Error(`dragon chunk ${i}`);
          return r.text();
        })
      ));
      const b64=parts.join('').replace(/\s+/g,'');
      const bin=atob(b64);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
      document.documentElement.style.setProperty('--dragon-real',`url("${url}")`);
      document.documentElement.classList.add('dragon-ready');
      window.addEventListener('pagehide',()=>URL.revokeObjectURL(url),{once:true});
    }catch(err){
      console.warn('SyntraX real dragon asset unavailable',err);
    }
  }
  loadRealDragon();
})();
