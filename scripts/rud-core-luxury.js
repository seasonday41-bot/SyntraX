(() => {
  const POINT={0:['1','6'],5:['1','6'],1:['2','7'],6:['2','7'],2:['3','8'],7:['3','8'],3:['4','9'],8:['4','9'],4:['5','0'],9:['5','0']};
  const arr=x=>Array.isArray(x)?x:(x?[x]:[]);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtScore=v=>Number.isFinite(Number(v))?Number(v).toFixed(2):'-';
  function pointOf(s){return String(s||'').replace(/\D/g,'').split('').reduce((n,d)=>n+Number(d),0)%10}
  function deriveCandidates(r){
    const top=String(r?.source_top3||'').padStart(3,'0').slice(-3),bottom=String(r?.source_bottom2||'').padStart(2,'0').slice(-2);
    const bc=top.slice(-2),de=bottom,pt=pointOf(bc),pb=pointOf(de);
    return{slots:[...(POINT[pt]||[]),...(POINT[pb]||[])],pointTop:pt,pointBottom:pb,bc,de};
  }
  function metaOf(r){return r?.metadata||{}}
  function shadowOf(r){return metaOf(r)?.shadow||{}}
  function dataOf(r){
    const m=metaOf(r),sh=shadowOf(r),ctx=sh.context||{},cov=ctx.pointRud4||ctx.rudCoverage||{};
    const fallback=deriveCandidates(r);
    const slots=arr(m.rud_candidate4||cov.candidateSlots).map(String);
    const ranking=arr(m.rud_candidate_ranking||cov.aiRanking);
    return{slots:(slots.length?slots:fallback.slots).slice(0,4),ranking};
  }
  function rowFor(d,ranking){return ranking.find(x=>String(x?.digit)===String(d))||{digit:String(d),temperature:{state:'CANDIDATE'}}}
  function stateClass(s){return String(s||'').toLowerCase().replace(/[^a-z]/g,'')||'candidate'}
  function candidateHtml(d,ranking,selected){
    const row=rowFor(d,ranking),state=String(row?.temperature?.state||'CANDIDATE').toUpperCase(),score=row?.finalScore;
    return `<div class="rud-candidate ${selected.includes(String(d))?'selected ':''}${stateClass(state)}"><span class="score">${score==null?'':esc(fmtScore(score))}</span><span class="n">${esc(d)}</span><span class="state">${esc(state)}</span></div>`;
  }
  function ensureCard(){
    if(document.getElementById('rudLuxury'))return document.getElementById('rudLuxury');
    const host=document.querySelector('.hotHero')||document.querySelector('.command')||document.getElementById('result');
    if(!host||!host.parentNode)return null;
    const sec=document.createElement('section');sec.id='rudLuxury';sec.className='rud-lux';
    sec.innerHTML=`<div class="rud-lux-inner">
      <div class="rud-lux-head"><div><div class="rud-lux-kicker">SYNTRAX • PRIMARY ENGINE</div><div class="rud-lux-title">RUD CORE</div></div><div class="rud-lux-live"><i></i>HISTORY AI</div></div>
      <div class="rud-lux-candidate-label"><span>RUD CANDIDATE 4</span><em>AI คัด 2 จากย้อนหลัง 5/10 งวด</em></div>
      <div id="luxCandidates" class="rud-lux-candidates"></div>
      <div class="rud-lux-core"><div class="rud-orb main"><label>RUD MAIN</label><b id="luxMain">-</b><small id="luxMainState">AI</small></div><div class="rud-orb sub"><label>RUD SUB</label><b id="luxSub">-</b><small id="luxSubState">AI</small></div></div>
      <div class="rud-lux-evidence"><div class="rud-evi hot"><span>HOT</span><b id="luxHot">-</b><small id="luxHotSub">5 งวด</small></div><div class="rud-evi"><span>WARM</span><b id="luxWarm">-</b><small id="luxWarmSub">10 งวด</small></div><div class="rud-evi"><span>COLD</span><b id="luxCold">-</b><small id="luxColdSub">gap</small></div><div class="rud-evi flow"><span>FLOW</span><b id="luxFlow">-</b><small id="luxFlowSub">Market Follow</small></div></div>
      <div class="rud-lux-lock">AI RUD ที่ชนะ <b id="luxLock">-</b> ถูกล็อกเข้า WIN6 ทั้งคู่ • อีก 4 ตัว + Reserve คำนวณตามระบบปกติ</div>
      <div class="rud-lux-win"><span>FINAL WIN6</span><b id="luxWin6">-</b><em>Reserve <strong id="luxReserve">-</strong></em></div>
    </div>`;
    host.parentNode.insertBefore(sec,host);return sec;
  }
  function set(id,v){const n=document.getElementById(id);if(n)n.textContent=v==null?'-':String(v)}
  function render(r){
    const card=ensureCard();if(!card||!r)return;
    const d=dataOf(r),selected=String(r.rud||'').split('').filter(x=>/\d/.test(x)).slice(0,2),main=selected[0]||'-',sub=selected[1]||'-',mainRow=rowFor(main,d.ranking),subRow=rowFor(sub,d.ranking),mt=mainRow.temperature||{},st=subRow.temperature||{};
    const c=document.getElementById('luxCandidates');if(c)c.innerHTML=d.slots.map(x=>candidateHtml(x,d.ranking,selected)).join('');
    set('luxMain',main);set('luxSub',sub);set('luxMainState',String(mt.state||'AI').toUpperCase());set('luxSubState',String(st.state||'AI').toUpperCase());
    set('luxHot',fmtScore(mt.hotScore));set('luxWarm',fmtScore(mt.warmScore));set('luxCold',mt.gap==null?'-':`GAP ${mt.gap}`);set('luxFlow',fmtScore(mainRow.bcdeFlow));
    set('luxHotSub',mt.presence5==null?'5 งวด':`พบ ${mt.presence5}/5`);set('luxWarmSub',mt.presence10==null?'10 งวด':`พบ ${mt.presence10}/10`);set('luxColdSub',mt.coldScore==null?'gap':`score ${fmtScore(mt.coldScore)}`);set('luxFlowSub',mainRow.marketScore==null?'Market Follow':`market ${fmtScore(mainRow.marketScore)}`);
    set('luxLock',selected.length?selected.join(' • '):'-');set('luxWin6',String(r.win6||'').split('').join(' • ')||'-');set('luxReserve',r.reserve7||'-');card.classList.toggle('has-data',selected.length===2);
  }
  function schedule(){requestAnimationFrame(()=>{try{if(typeof current!=='undefined'&&current)render(current)}catch(e){}})}
  function start(){ensureCard();const result=document.getElementById('result');if(result){new MutationObserver(schedule).observe(result,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['style']});}schedule();setTimeout(schedule,350);setTimeout(schedule,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
