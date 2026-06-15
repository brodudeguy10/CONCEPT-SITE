/* ============================================================
   TIMESCAPES — shared application layer (vanilla, no build)
   One source of truth for data, modules, nav/footer and the
   per-page initialisers. Loaded with `defer` on every page.
   ============================================================ */
(function(){
'use strict';

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE   = window.matchMedia('(pointer: fine)').matches;
const $  = (s,c)=> (c||document).querySelector(s);
const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------------- shared data / links ---------------- */
const EBAY="https://www.ebay.com/str/timescapesllc?widget_ver=artemis&media=COPY&utm_source=ig&utm_medium=social&utm_content=link_in_bio";
const IG_BRAND="https://www.instagram.com/timescapesllc/";
const IG_OWNER="https://www.instagram.com/ardevas09/";

const WATCHES = [
  /* ---- currently in stock (real eBay item links) ---- */
  {id:'speedy', folder:'watch-8', frames:8,  brand:'Omega',    name:'Speedmaster 38mm “Milano Cortina”', ref:'522.30.38.50.04.001', spec:'Steel · Chronograph · Cortina 2026', badge:'Just in', cover:7,
    ebay:'https://www.ebay.com/itm/198384693306?itmmeta=01KV4A7GR5NZSC59KAJ2Q6X5QM&hash=item2e30a6303a:g:taEAAeSwQdhqF5ns'},
  {id:'premier',folder:'watch-9', frames:8,  brand:'Breitling',name:'Premier B01 Chronograph 42',        ref:'AB0145221B1A1',       spec:'Steel · Black Dial · Box & Papers', badge:'Just in', cover:7,
    ebay:'https://www.ebay.com/itm/198384371067?epid=26059670774&itmmeta=01KV4A7GR5X3268ZN1BADP8CB9&hash=item2e30a1457b:g:zisAAeSw8iBqF2fo'},
  {id:'avi',    folder:'watch-10',frames:11, brand:'Breitling',name:'Super AVI B04 46 “Corsair”',        ref:'AB04451A1C1X1',       spec:'Steel · Blue Dial · Chrono GMT', badge:'Just in', cover:5,
    ebay:'https://www.ebay.com/itm/198384399349?itmmeta=01KV4A7GR5A1YQZFKWHXN2FAQN&hash=item2e30a1b3f5:g:jXYAAeSwb-JqF20h'},
  /* ---- sold (kept up as the archive / the flex) ---- */
  {id:'gmt',  folder:'watch-1', frames:8,  brand:'Rolex',    name:'GMT-Master II “Rootbeer”', ref:'126715CHNR', spec:'Everose Gold · GMT · Cerachrom', badge:'Sold', sold:true},
  {id:'sea',  folder:'watch-2', frames:11, brand:'Omega',    name:'Seamaster Diver 300M',     ref:'210.62.42', spec:'Titanium · Sedna Gold · Green', badge:'Sold', sold:true},
  {id:'p904b',folder:'watch-3', frames:6,  brand:'Panerai',  name:'Luminor Due 42mm',         ref:'PAM00904',  spec:'Steel · Sunburst · Suede',     badge:'Sold', sold:true},
  {id:'p904t',folder:'watch-4', frames:6,  brand:'Panerai',  name:'Luminor Due · Textile',    ref:'PAM00904',  spec:'Steel · Sunburst · Textile',   badge:'Sold', sold:true, card:false},
  {id:'p1218',folder:'watch-5', frames:8,  brand:'Panerai',  name:'Luminor Chrono 44mm',      ref:'PAM01218',  spec:'Steel · White · Blue Rubber',  badge:'Sold', sold:true},
  {id:'navi', folder:'watch-6', frames:6,  brand:'Breitling',name:'Navitimer B01 Chrono 43',  ref:'UB0121',    spec:'Steel · Two-Tone · Slide Rule', badge:'Sold', sold:true},
  {id:'007',  folder:'watch-7', frames:8,  brand:'Omega',    name:'Seamaster 300M · 007',     ref:'210.92.42', spec:'Ceramic · “No Time to Die”',    badge:'Sold', sold:true},
];
const framePath=(w,i)=>`assets/watches/${w.folder}/${String(i).padStart(2,'0')}.jpg`;
const fmt=n=>'$'+n.toLocaleString('en-US');
const byId=id=>WATCHES.find(w=>w.id===id);
const cardWatches=()=>WATCHES.filter(w=>w.card!==false);
const inStock=()=>WATCHES.filter(w=>!w.sold && w.card!==false);
const soldList=()=>WATCHES.filter(w=>w.sold && w.card!==false);
const ourWatches=()=>[...inStock(), ...soldList()];   // in-stock first, then sold
const coverPath=w=>framePath(w, w.cover||1);
function feedImages(){ const out=[]; WATCHES.forEach(w=>{ for(let i=1;i<=w.frames;i++) out.push({w,src:framePath(w,i)}); }); return out; }
const ALLFEED=feedImages();

/* ---------------- reveal on scroll (the single ambient effect) ---------------- */
let _revObs;
function observeReveals(root){
  if(REDUCE){ $$('[data-reveal]',root||document).forEach(el=>el.classList.add('in')); return; }
  if(!_revObs) _revObs=new IntersectionObserver((es)=>es.forEach(en=>{
    if(en.isIntersecting){ en.target.classList.add('in'); _revObs.unobserve(en.target); }
  }),{threshold:.14, rootMargin:'0px 0px -7% 0px'});
  $$('[data-reveal]',root||document).forEach(el=>{ if(!el.classList.contains('in')) _revObs.observe(el); });
}

/* ---------------- number counters ---------------- */
function countUp(el,to,suffix,dur){
  const f=n=>n.toLocaleString('en-US');
  if(REDUCE){ el.textContent=f(to)+(suffix||''); return; }
  const start=performance.now();
  (function fr(t){ const k=clamp((t-start)/dur,0,1), e=1-Math.pow(1-k,3);
    el.textContent=f(Math.round(to*e))+(suffix||''); if(k<1)requestAnimationFrame(fr); })(start);
}
function initStats(el){
  if(!el) return;
  const o=new IntersectionObserver((es)=>es.forEach(en=>{ if(en.isIntersecting){
    $$('[data-count]',en.target).forEach(b=>countUp(b,+b.dataset.count,b.dataset.suffix||'',1600));
    o.unobserve(en.target);} }),{threshold:.5});
  o.observe(el);
}

/* ---------------- video perf (play only on screen) ---------------- */
function initVideoPerf(){
  const vids=$$('video'); if(!vids.length) return;
  const o=new IntersectionObserver((es)=>es.forEach(en=>{
    const v=en.target;
    if(en.isIntersecting){ if(v.dataset.manual!=='paused'){ const p=v.play(); if(p&&p.catch)p.catch(()=>{}); } }
    else v.pause();
  }),{threshold:.15});
  vids.forEach(v=>o.observe(v));
}

/* ============================================================
   SPIN VIEWER  (signature interaction — drag, loupe, loops)
   ============================================================ */
function buildSpinViewer(el, watch, opts){
  opts = opts || {};
  const N = watch.frames;
  const urls = Array.from({length:N},(_,i)=>framePath(watch, i+1));
  let frame=0, loaded=0;

  el.innerHTML = `
    <div class="spin__frames">${urls.map((u,i)=>
      `<img src="${u}" alt="${watch.brand} ${watch.name}, angle ${i+1} of ${N}" draggable="false" ${i===0?'':'loading="lazy"'}>`).join('')}</div>
    <div class="spin__loupe"></div>
    <div class="spin__count" aria-live="polite">01 / ${String(N).padStart(2,'0')}</div>
    <div class="spin__nav">
      <button type="button" data-d="-1" aria-label="Previous angle">‹</button>
      <button type="button" data-d="1" aria-label="Next angle">›</button>
    </div>
    <div class="spin__hint"><span class="swipe">⟷</span> Drag to spin</div>
    <div class="spin__bar"><i></i></div>
    <div class="spin__loading">Loading…</div>`;

  const imgs=$$('.spin__frames img',el), loupe=$('.spin__loupe',el),
        count=$('.spin__count',el), loading=$('.spin__loading',el), bar=$('.spin__bar i',el);

  function show(i){
    frame=((i%N)+N)%N;
    imgs.forEach((im,k)=>im.classList.toggle('is-active',k===frame));
    count.textContent=String(frame+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');
    bar.style.width=((frame+1)/N*100)+'%';
    if(loupe.style.opacity!=='0' && el.classList.contains('loupe-on')) loupe.style.backgroundImage=`url("${urls[frame]}")`;
  }
  show(0);

  urls.forEach(u=>{ const im=new Image(); const done=()=>{ if(++loaded>=N) loading.classList.add('gone'); }; im.onload=done; im.onerror=done; im.src=u; });
  setTimeout(()=>loading.classList.add('gone'),2600);

  const step=()=>Math.max(7, el.clientWidth/(N*1.25));
  let dragging=false,startX=0,startFrame=0,lastX=0,lastT=0,vel=0,idleTimer=null,raf=null;

  function onDown(e){ dragging=true;startX=e.clientX;startFrame=frame;lastX=e.clientX;lastT=performance.now();vel=0;
    el.classList.add('touched'); el.setPointerCapture&&el.setPointerCapture(e.pointerId);
    loupe.style.opacity='0'; el.classList.remove('loupe-on'); cancelIdle(); cancelAnimationFrame(raf); }
  function onMove(e){
    if(dragging){ const dx=e.clientX-startX; show(startFrame+Math.round(dx/step()));
      const now=performance.now(),dt=now-lastT; if(dt>0){ vel=(e.clientX-lastX)/dt; lastX=e.clientX; lastT=now; } }
    else if(opts.loupe!==false && FINE && !REDUCE){ updateLoupe(e); }
  }
  function onUp(e){ if(!dragging)return; dragging=false; el.releasePointerCapture&&el.releasePointerCapture(e.pointerId);
    if(!REDUCE && Math.abs(vel)>0.35) momentum(); else scheduleIdle();
    if(opts.loupe!==false && FINE && !REDUCE && e.pointerType!=='touch') updateLoupe(e); }
  function momentum(){ let v=vel*step()*0.9, acc=0;
    (function fr(){ v*=0.92; acc+=v*16;
      if(Math.abs(acc)>=step()){ const k=Math.round(acc/step()); show(frame+k); acc-=k*step(); }
      if(Math.abs(v)>0.02) raf=requestAnimationFrame(fr); else scheduleIdle(); })(); }
  function updateLoupe(e){ const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(x<0||y<0||x>r.width||y>r.height){ loupe.style.opacity='0'; el.classList.remove('loupe-on'); return; }
    const zoom=2.2,lw=loupe.offsetWidth; el.classList.add('loupe-on');
    loupe.style.backgroundImage=`url("${urls[frame]}")`;
    loupe.style.backgroundSize=(r.width*zoom)+'px '+(r.height*zoom)+'px';
    loupe.style.backgroundPosition=`${-(x*zoom-lw/2)}px ${-(y*zoom-lw/2)}px`;
    loupe.style.transform=`translate(${x-lw/2}px,${y-lw/2}px)`; }
  function onLeave(){ loupe.style.opacity='0'; el.classList.remove('loupe-on'); if(!dragging) scheduleIdle(); }

  el.addEventListener('pointerdown',onDown);
  window.addEventListener('pointermove',onMove,{passive:true});
  window.addEventListener('pointerup',onUp);
  el.addEventListener('pointerleave',onLeave);
  $$('.spin__nav button',el).forEach(b=>b.addEventListener('click',ev=>{ ev.stopPropagation(); el.classList.add('touched'); cancelIdle(); show(frame+parseInt(b.dataset.d,10)); }));

  el.setAttribute('tabindex','0'); el.setAttribute('role','group');
  el.setAttribute('aria-label',watch.brand+' '+watch.name+' — drag or use arrow keys to view angles');
  el.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'){show(frame-1);el.classList.add('touched');}
    else if(e.key==='ArrowRight'){show(frame+1);el.classList.add('touched');} });

  function scheduleIdle(){ if(REDUCE)return; cancelIdle(); idleTimer=setTimeout(idleNudge, opts.autorotate?1600:4000); }
  function cancelIdle(){ clearTimeout(idleTimer); cancelAnimationFrame(raf); }
  function idleNudge(){
    if(dragging)return;
    if(opts.autorotate){ let last=performance.now();
      (function spin(now){ if(dragging)return; if(now-last>=560){ show(frame+1); last=now; } raf=requestAnimationFrame(spin); })(last); }
    else { let t=0; const base=frame;
      (function nudge(){ if(dragging)return; t+=0.05; const o=Math.round(Math.sin(t)*1.5); show(base+o);
        if(t<Math.PI) raf=requestAnimationFrame(nudge); else show(base); })(); }
  }
  const io=new IntersectionObserver((ents)=>ents.forEach(en=>{ if(en.isIntersecting){ scheduleIdle(); if(!opts.autorotate) io.disconnect(); } }),{threshold:.4});
  io.observe(el);
  return { show };
}

/* ============================================================
   LIVE TICKING WATCH  (SVG, real local time, day / lume)
   ============================================================ */
const NS="http://www.w3.org/2000/svg";
function shade(hex,amt){let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');
  let r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
  r=clamp(r+amt,0,255);g=clamp(g+amt,0,255);b=clamp(b+amt,0,255);
  return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');}
function watchSVG(o){
  const C=200,R=190; let markers="";
  for(let i=0;i<60;i++){const a=(i/60)*Math.PI*2,major=(i%5===0),r1=major?150:158,r2=168,w=major?5:1.6;
    const x1=C+Math.sin(a)*r1,y1=C-Math.cos(a)*r1,x2=C+Math.sin(a)*r2,y2=C-Math.cos(a)*r2;
    markers+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${major?o.accent:'#6b6357'}" stroke-width="${w}" stroke-linecap="round" opacity="${major?.95:.55}"/>`;}
  return `<svg viewBox="0 0 400 400" xmlns="${NS}">
    <defs>
      <radialGradient id="gd-${o.id}" cx="38%" cy="30%" r="80%">
        <stop offset="0%" stop-color="${shade(o.dial,18)}"/><stop offset="70%" stop-color="${o.dial}"/><stop offset="100%" stop-color="${shade(o.dial,-22)}"/></radialGradient>
      <linearGradient id="gb-${o.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f1ddab"/><stop offset="35%" stop-color="#c9a24b"/><stop offset="65%" stop-color="#8a6a2c"/><stop offset="100%" stop-color="#e8d5a8"/></linearGradient>
    </defs>
    <circle cx="${C}" cy="${C}" r="${R}" fill="url(#gb-${o.id})"/>
    <circle cx="${C}" cy="${C}" r="174" fill="${shade(o.dial,-30)}"/>
    <circle cx="${C}" cy="${C}" r="170" fill="url(#gd-${o.id})"/>
    ${markers}
    <rect x="262" y="${C-15}" width="34" height="30" rx="2" fill="${shade(o.dial,-40)}" stroke="${o.accent}" stroke-width="1.4"/>
    <text x="279" y="${C+6}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="20" fill="${o.hands}">${o.date}</text>
    <text x="${C}" y="138" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="24" font-weight="600" letter-spacing="1.5" fill="${o.accent}">TIMESCAPES</text>
    <text x="${C}" y="262" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="10" letter-spacing="4" fill="#7a7264">AUTOMATIC</text>
    <g data-h></g><g data-m></g><g data-s></g>
    <circle cx="${C}" cy="${C}" r="9" fill="${o.accent}"/>
    <circle cx="${C}" cy="${C}" r="3.5" fill="${shade(o.dial,-30)}"/>
  </svg>`;
}
function buildLiveWatch(faceEl, chipEl, toggleEl){
  if(!faceEl) return;
  const PAL={ day:{dial:'#10100f',accent:'#c9a24b',hands:'#f2ede3',sec:'#c98a4b'},
              lume:{dial:'#0b1410',accent:'#7ee0a8',hands:'#bdeccf',sec:'#7ee0a8'} };
  let mode='day',hH,mH,sH; const C=200;
  function render(){
    const p=PAL[mode];
    faceEl.innerHTML=watchSVG({id:'live',dial:p.dial,accent:p.accent,hands:p.hands,date:new Date().getDate(),sec:p.sec});
    hH=$('[data-h]',faceEl);mH=$('[data-m]',faceEl);sH=$('[data-s]',faceEl);
    hH.innerHTML=`<rect x="${C-4.5}" y="${C-95}" width="9" height="112" rx="4.5" fill="${p.hands}"/>`;
    mH.innerHTML=`<rect x="${C-3}" y="${C-135}" width="6" height="152" rx="3" fill="${p.hands}"/>`;
    sH.innerHTML=`<rect x="${C-1.2}" y="${C-150}" width="2.4" height="185" rx="1.2" fill="${p.sec}"/><circle cx="${C}" cy="${C+38}" r="6" fill="${p.sec}"/>`;
  }
  render();
  function tick(){
    const now=new Date(), ms=REDUCE?0:now.getMilliseconds();
    const s=now.getSeconds()+ms/1000, m=now.getMinutes()+s/60, h=(now.getHours()%12)+m/60;
    if(hH){ hH.setAttribute('transform',`rotate(${h*30} ${C} ${C})`); mH.setAttribute('transform',`rotate(${m*6} ${C} ${C})`); sH.setAttribute('transform',`rotate(${s*6} ${C} ${C})`); }
    if(chipEl) chipEl.innerHTML='Live · <b>'+now.toLocaleTimeString('en-US',{hour12:false})+'</b>';
    REDUCE?setTimeout(tick,1000):requestAnimationFrame(tick);
  }
  tick();
  if(toggleEl) toggleEl.addEventListener('click',()=>{ mode=mode==='day'?'lume':'day'; toggleEl.textContent=mode==='day'?'Lume':'Day'; render(); });
}

/* ============================================================
   PHOTO LIGHTBOX  (filterable by brand/watch) — injected once
   ============================================================ */
let LB=null;
function ensurePhotoLightbox(){
  if(LB) return;
  const el=document.createElement('div');
  el.className='lightbox'; el.id='lightbox'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Photo gallery');
  el.innerHTML=`
    <div class="lb__bar"><div class="lb__filters" id="lbFilters"></div><button class="lb__close" id="lbClose" aria-label="Close gallery">✕</button></div>
    <div class="lb__stage"><button class="lb__arrow" id="lbPrev" aria-label="Previous photo">‹</button><img class="lb__img" id="lbImg" alt=""><button class="lb__arrow" id="lbNext" aria-label="Next photo">›</button></div>
    <div class="lb__thumbs" id="lbThumbs"></div>`;
  document.body.appendChild(el);
  LB={el,img:$('#lbImg',el),thumbs:$('#lbThumbs',el),filters:$('#lbFilters',el),list:[],idx:0,filter:'all'};
  function buildFilters(){
    const chips=[{k:'all',label:'All'}].concat(WATCHES.map(w=>({k:w.folder,label:w.brand+' '+w.ref})));
    LB.filters.innerHTML=chips.map(c=>`<button class="lb__chip${c.k===LB.filter?' active':''}" data-k="${c.k}">${c.label}</button>`).join('');
    $$('.lb__chip',LB.filters).forEach(b=>b.addEventListener('click',()=>{ LB.filter=b.dataset.k; LB.idx=0; apply(); }));
  }
  function apply(){
    $$('.lb__chip',LB.filters).forEach(b=>b.classList.toggle('active',b.dataset.k===LB.filter));
    LB.list=(LB.filter==='all')?ALLFEED.slice():ALLFEED.filter(t=>t.w.folder===LB.filter);
    LB.idx=clamp(LB.idx,0,LB.list.length-1);
    LB.thumbs.innerHTML=LB.list.map((t,i)=>`<img src="${t.src}" data-i="${i}" alt="thumbnail" loading="lazy">`).join('');
    $$('img',LB.thumbs).forEach(im=>im.addEventListener('click',()=>go(+im.dataset.i)));
    go(LB.idx);
  }
  function go(i){ if(!LB.list.length)return; LB.idx=((i%LB.list.length)+LB.list.length)%LB.list.length;
    const t=LB.list[LB.idx]; LB.img.src=t.src; LB.img.alt=t.w.brand+' '+t.w.name+' — Ref. '+t.w.ref;
    $$('img',LB.thumbs).forEach((im,k)=>{ im.classList.toggle('active',k===LB.idx); if(k===LB.idx) im.scrollIntoView({block:'nearest',inline:'center'}); }); }
  function close(){ el.classList.remove('open'); document.body.style.overflow=''; }
  LB._open=(filter,src)=>{ LB.filter=filter||'all'; buildFilters(); apply(); if(src){ const k=LB.list.findIndex(t=>t.src===src); if(k>=0) go(k); } el.classList.add('open'); document.body.style.overflow='hidden'; };
  LB._go=go; LB._close=close;
  $('#lbClose',el).addEventListener('click',close);
  $('#lbPrev',el).addEventListener('click',()=>go(LB.idx-1));
  $('#lbNext',el).addEventListener('click',()=>go(LB.idx+1));
  el.addEventListener('click',e=>{ if(e.target===el) close(); });
  document.addEventListener('keydown',e=>{ if(!el.classList.contains('open'))return;
    if(e.key==='Escape')close(); if(e.key==='ArrowLeft')go(LB.idx-1); if(e.key==='ArrowRight')go(LB.idx+1); });
}
function lbOpen(filter,src){ ensurePhotoLightbox(); LB._open(filter,src); }

/* ============================================================
   MEDIA LIGHTBOX  (garage clips + the film) — injected once
   ============================================================ */
let MLB=null;
function ensureMediaLightbox(){
  if(MLB) return;
  const el=document.createElement('div');
  el.className='mlb'; el.id='mediaLB'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Enlarged media');
  el.innerHTML=`<div class="mlb__ambient" aria-hidden="true"><video id="mlbAmbVideo" muted loop playsinline></video><img id="mlbAmbImg" alt=""></div>
    <button class="mlb__close" id="mlbClose" aria-label="Close">✕</button>
    <div class="mlb__stage"><video id="mlbVideo" loop playsinline controls></video><img id="mlbImg" alt=""></div>
    <div class="mlb__cap" id="mlbCap"></div>`;
  document.body.appendChild(el);
  MLB={el,vid:$('#mlbVideo',el),img:$('#mlbImg',el),cap:$('#mlbCap',el),ambVid:$('#mlbAmbVideo',el),ambImg:$('#mlbAmbImg',el)};
  function close(){ el.classList.remove('open'); MLB.vid.pause(); if(MLB.ambVid) MLB.ambVid.pause(); document.body.style.overflow=''; }
  MLB._close=close;
  $('#mlbClose',el).addEventListener('click',close);
  el.addEventListener('click',e=>{ if(e.target===el) close(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&el.classList.contains('open')) close(); });
}
function mediaOpen(o){
  ensureMediaLightbox();
  MLB.cap.textContent=o.cap||'';
  if(o.type==='video'){
    MLB.img.classList.remove('show'); MLB.vid.src=o.src; MLB.vid.classList.add('show'); MLB.vid.muted=false;
    const p=MLB.vid.play(); if(p&&p.catch)p.catch(()=>{ MLB.vid.muted=true; MLB.vid.play().catch(()=>{}); });
    MLB.ambImg.classList.remove('show'); MLB.ambImg.removeAttribute('src');
    if(!REDUCE){ MLB.ambVid.src=o.src; MLB.ambVid.classList.add('show'); MLB.ambVid.play().catch(()=>{}); } else { MLB.ambVid.classList.remove('show'); }
  } else {
    MLB.vid.classList.remove('show'); MLB.vid.pause(); MLB.vid.removeAttribute('src'); MLB.img.src=o.src; MLB.img.classList.add('show');
    MLB.ambVid.classList.remove('show'); MLB.ambVid.pause(); MLB.ambVid.removeAttribute('src');
    MLB.ambImg.src=o.src; MLB.ambImg.classList.add('show');
  }
  MLB.el.classList.add('open'); document.body.style.overflow='hidden';
}

/* ============================================================
   COMPARISON SLIDER
   ============================================================ */
function initComparison(cmp){
  const top=$('.top',cmp), div=$('.cmp__divider',cmp); if(!top||!div) return;
  let drag=false;
  function set(x){ const r=cmp.getBoundingClientRect(); const p=clamp((x-r.left)/r.width,0,1)*100; top.style.clipPath=`inset(0 0 0 ${p}%)`; div.style.left=p+'%'; }
  cmp.addEventListener('pointerdown',e=>{ drag=true; cmp.setPointerCapture(e.pointerId); set(e.clientX); });
  cmp.addEventListener('pointermove',e=>{ if(drag) set(e.clientX); });
  cmp.addEventListener('pointerup',()=>drag=false);
  cmp.addEventListener('pointercancel',()=>drag=false);
}

/* ============================================================
   GARAGE SWITCHER  (owner page)
   ============================================================ */
function initGarage(){
  const stage=$('#garageStage'); if(!stage) return;
  const vid=$('#garageVideo'),img=$('#garagePhoto'),tag=$('#garageTag'),chips=$('#garageChips'),zoom=$('#garageZoom');
  const GARAGE=[
    {label:'F8 · Drive',   tag:'Ferrari F8 · @ardevas09',   type:'video', src:'assets/garage/g3.mp4'},
    {label:'F8 · Rollers', tag:'Ferrari F8 · rolling shot', type:'video', src:'assets/garage/g1.mp4'},
    {label:'F8 · Detail',  tag:'Ferrari F8 · up close',     type:'video', src:'assets/garage/g2.mp4'},
    {label:'On the move',  tag:'Out driving · @ardevas09',  type:'video', src:'assets/garage/g4.mp4'},
    {label:'The Raptor',   tag:'Ford Raptor · 1,000 miles', type:'photo', src:'assets/lifestyle/drive.jpg'},
  ];
  let cur=0;
  chips.innerHTML=GARAGE.map((g,i)=>`<button class="gchip${i===0?' active':''}" data-i="${i}">${g.label}</button>`).join('');
  function select(i){ cur=i; const g=GARAGE[i];
    $$('.gchip',chips).forEach(c=>c.classList.toggle('active',+c.dataset.i===i));
    tag.textContent=g.tag;
    if(g.type==='video'){ img.classList.remove('show'); if(vid.getAttribute('src')!==g.src) vid.src=g.src; vid.dataset.manual='play'; vid.classList.add('show'); const p=vid.play(); if(p&&p.catch)p.catch(()=>{}); }
    else { vid.classList.remove('show'); vid.dataset.manual='paused'; vid.pause(); img.classList.add('show'); }
  }
  $$('.gchip',chips).forEach(c=>c.addEventListener('click',()=>select(+c.dataset.i)));
  function enlarge(){ const g=GARAGE[cur]; mediaOpen({type:g.type,src:g.src,cap:g.tag}); }
  stage.addEventListener('click',()=>enlarge());
  if(zoom) zoom.addEventListener('click',e=>{ e.stopPropagation(); enlarge(); });
  select(0);
}

/* ============================================================
   BACK TO TOP  (single nav aid)
   ============================================================ */
function initBackToTop(){
  const btn=document.createElement('button');
  btn.className='totop'; btn.setAttribute('aria-label','Back to top'); btn.innerHTML='↑';
  document.body.appendChild(btn);
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:REDUCE?'auto':'smooth'}));
  let ticking=false;
  window.addEventListener('scroll',()=>{ if(ticking)return; ticking=true;
    requestAnimationFrame(()=>{ btn.classList.toggle('show', window.scrollY>window.innerHeight*0.7); ticking=false; }); },{passive:true});
}

/* ============================================================
   NAV + FOOTER  (single source of truth)
   ============================================================ */
function navHTML(page){
  const a=(href,label,key)=>`<a href="${href}" class="${(page===key||(key==='inventory'&&page==='watch'))?'active':''}">${label}</a>`;
  return `<div class="container nav__row">
    <a href="index.html" class="brand" aria-label="Timescapes home"><img src="assets/logo.png" alt="Timescapes">Timescapes</a>
    <nav class="nav__links" id="navLinks" aria-label="Primary">
      ${a('index.html','Home','home')}
      ${a('inventory.html','Our Watches','inventory')}
      ${a('owner.html','The Owner','owner')}
    </nav>
    <div class="nav__cta">
      <a class="btn btn--gold" href="${EBAY}" target="_blank" rel="noopener">View on eBay ↗</a>
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>`;
}
function footerHTML(){
  return `<div class="container">
    <div class="foot__row">
      <div class="foot__brand">
        <div class="fb-top"><img src="assets/logo.png" alt="Timescapes">Timescapes</div>
        <p>Watches looked after and priced fair. A few good ones at a time, shot in real light, live on eBay and Instagram.</p>
      </div>
      <div class="foot__links">
        <div class="foot__col"><h5>Explore</h5>
          <a href="index.html">Home</a><a href="inventory.html">Our Watches</a><a href="owner.html">The Owner</a></div>
        <div class="foot__col"><h5>Find us</h5>
          <a href="${EBAY}" target="_blank" rel="noopener">eBay Store</a>
          <a href="${IG_BRAND}" target="_blank" rel="noopener">@timescapesllc</a>
          <a href="${IG_OWNER}" target="_blank" rel="noopener">@ardevas09</a></div>
      </div>
    </div>
    <div class="foot__bottom">
      <small>© 2026 Timescapes LLC</small>
      <small>Concept site · a front-end showcase</small>
    </div>
  </div>`;
}
function renderChrome(page){
  const nav=$('[data-nav]'); if(nav){ nav.classList.add('nav'); nav.innerHTML=navHTML(page); }
  const foot=$('[data-footer]'); if(foot) foot.innerHTML=footerHTML();
  const menuBtn=$('#menuBtn'), navLinks=$('#navLinks');
  if(menuBtn&&navLinks){
    menuBtn.addEventListener('click',()=>{ const o=navLinks.classList.toggle('open'); menuBtn.setAttribute('aria-expanded',String(o)); });
    $$('#navLinks a').forEach(l=>l.addEventListener('click',()=>{ navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }));
  }
}

/* ---------------- card markup (shared) ---------------- */
function cardHTML(w){
  const badge = w.sold ? '<span class="card__badge sold">Sold</span>'
                       : (w.badge==='Just in' ? '<span class="card__badge">Just in</span>' : '');
  return `<a class="card${w.sold?' is-sold':''}" href="watch.html?id=${w.id}" data-reveal data-brand="${w.brand}" data-status="${w.sold?'sold':'stock'}" aria-label="${w.brand} ${w.name}${w.sold?' (sold)':''}">
    <div class="card__media">
      <img src="${coverPath(w)}" alt="${w.brand} ${w.name}" loading="lazy">
      ${badge}
    </div>
    <div class="card__info">
      <div class="card__brand">${w.brand} · ${w.ref}</div>
      <div class="card__name">${w.name}</div>
      <div class="card__spec">${w.spec}</div>
    </div>
  </a>`;
}

/* ============================================================
   PAGE INITIALISERS
   ============================================================ */
function initHome(){
  buildLiveWatch($('#liveWatch'), $('#liveTime'), $('#lumeToggle'));
  const feat=$('#featuredCards');
  if(feat){ feat.innerHTML=inStock().map(cardHTML).join(''); observeReveals(feat); }
  const fg=$('#feedGrid');
  if(fg){
    const picks=['speedy','avi','premier','gmt'].map(byId).filter(Boolean);
    fg.innerHTML=picks.map(w=>`<div class="feed__tile" data-src="${coverPath(w)}"><img src="${coverPath(w)}" alt="${w.brand} ${w.name}" loading="lazy"></div>`).join('');
    $$('.feed__tile',fg).forEach(t=>t.addEventListener('click',()=>lbOpen('all',t.dataset.src)));
  }
  initStats($('#homeStats'));
}
function initInventory(){
  const grid=$('#inventoryGrid'); if(!grid) return;
  const ws=ourWatches();
  grid.innerHTML=ws.map(cardHTML).join(''); observeReveals(grid);
  const fbar=$('#filters');
  if(fbar){
    const brands=[...new Set(ws.map(w=>w.brand))];
    const chips=[{k:'all',l:'All'},{k:'stock',l:'In stock'},{k:'sold',l:'Sold'}].concat(brands.map(b=>({k:'brand:'+b,l:b})));
    fbar.innerHTML=chips.map((c,i)=>`<button class="filter${i===0?' active':''}" data-k="${c.k}">${c.l}</button>`).join('');
    $$('.filter',fbar).forEach(btn=>btn.addEventListener('click',()=>{
      $$('.filter',fbar).forEach(b=>b.classList.toggle('active',b===btn));
      const k=btn.dataset.k;
      const applyHides=()=>{ $$('.card',grid).forEach(card=>{ let show=true;
        if(k==='stock') show=card.dataset.status==='stock';
        else if(k==='sold') show=card.dataset.status==='sold';
        else if(k.indexOf('brand:')===0) show=card.dataset.brand===k.slice(6);
        card.classList.toggle('hide',!show); }); };
      if(REDUCE){ applyHides(); return; }
      grid.style.opacity='0';
      setTimeout(()=>{ applyHides(); grid.style.opacity='1'; }, 220);
    }));
  }
  const cmp=$('#cmp'); if(cmp) initComparison(cmp);
  const galBtn=$('#openGallery'); if(galBtn) galBtn.addEventListener('click',()=>lbOpen('all'));
}
function initWatch(){
  const root=$('#watchRoot'); if(!root) return;
  const id=new URLSearchParams(location.search).get('id');
  const w=byId(id)||WATCHES[0];
  document.title=`${w.brand} ${w.name} — Timescapes`;
  const more=ourWatches().filter(x=>x.id!==w.id).slice(0,3);
  const soldTag = w.sold ? '<span class="sold-tag">Sold</span>' : '';
  const availDD = w.sold ? '<dd class="dd-sold">Sold</dd>' : '<dd class="dd-stock">Available now</dd>';
  const cta = w.sold
    ? `<a class="btn btn--ghost" href="inventory.html">See what's in stock →</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`
    : `<a class="btn btn--gold" href="${w.ebay}" target="_blank" rel="noopener">See it on eBay ↗</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`;
  root.innerHTML=`
  <section class="detail${w.sold?' detail--sold':''}"><div class="container">
    <a class="detail__back" href="inventory.html">← Back to all watches</a>
    <div class="detail__grid">
      <div class="detail__spin" data-reveal><div class="spin" id="detailSpin"></div></div>
      <div class="detail__info" data-reveal data-delay="1">
        <div class="detail__brand">${w.brand} · Ref. ${w.ref} ${soldTag}</div>
        <h1 class="detail__name">${w.name}</h1>
        ${w.sold?'<p class="sold-note">This one\'s already gone, but we keep it up. What\'s actually available is in the lineup below.</p>':''}
        <p class="detail__spec-line">${w.spec}. Grab it and drag to spin it around, or hover to zoom right in.</p>
        <dl class="specs">
          <div><dt>Brand</dt><dd>${w.brand}</dd></div>
          <div><dt>Reference</dt><dd>${w.ref}</dd></div>
          <div><dt>Specification</dt><dd>${w.spec}</dd></div>
          <div><dt>Availability</dt>${availDD}</div>
        </dl>
        <div class="detail__cta">${cta}</div>
      </div>
    </div>
    <div class="detail__gallery" data-reveal>
      <span class="eyebrow">Every angle</span>
      <div class="gallery-strip" id="galleryStrip" style="margin-top:22px"></div>
    </div>
  </div></section>
  <section class="more"><div class="container">
    <div class="sec-head">
      <div><span class="eyebrow" data-reveal>${w.sold?'Available now':'Keep looking'}</span><h2 class="display" data-reveal data-delay="1">${w.sold?'In stock right now':'More from the collection'}</h2></div>
      <a class="more-link" href="inventory.html">All watches ↗</a>
    </div>
    <div class="cards cards--3" id="moreCards">${more.map(cardHTML).join('')}</div>
  </div></section>`;

  buildSpinViewer($('#detailSpin'), w, {loupe:true, autorotate:true});
  // gallery strip
  const strip=$('#galleryStrip');
  strip.innerHTML=Array.from({length:w.frames},(_,i)=>`<img src="${framePath(w,i+1)}" data-src="${framePath(w,i+1)}" alt="${w.brand} ${w.name}, angle ${i+1}" loading="lazy">`).join('');
  $$('img',strip).forEach(im=>im.addEventListener('click',()=>lbOpen(w.folder,im.dataset.src)));
  $('#openGallery').addEventListener('click',()=>lbOpen(w.folder));
  observeReveals(root);
}
function initOwner(){
  initStats($('#stats'));
  initGarage();
  const stills=$('#garageStills');
  if(stills){
    stills.innerHTML=Array.from({length:6},(_,i)=>{ const src=`assets/garage/photos/car-${String(i+1).padStart(2,'0')}.jpg`;
      return `<button class="feed__tile" data-src="${src}" aria-label="Enlarge photo"><img src="${src}" alt="From the garage, a Porsche" loading="lazy"></button>`; }).join('');
    $$('.feed__tile',stills).forEach(t=>t.addEventListener('click',()=>mediaOpen({type:'photo',src:t.dataset.src,cap:'From the garage'})));
  }
  const open=()=>mediaOpen({type:'video',src:'assets/brand-film.mp4',cap:'Timescapes · the brand film'});
  const fp=$('#filmPlay'), fb=$('#filmBg'); if(fp) fp.addEventListener('click',open); if(fb) fb.addEventListener('click',open);
}

/* ---------------- QOL motion: image fade-in + nav shadow ---------------- */
function initImgFade(){
  if(REDUCE) return;
  $$('.card__media img, .feed__tile img, .gallery-strip img, .cmp img, .inv-banner img').forEach(img=>{
    if(img.complete && img.naturalWidth>0) return;        // already loaded (cached) — leave visible
    img.style.opacity='0'; img.style.transition='opacity .8s cubic-bezier(.22,.61,.30,1)';
    const show=()=>{ img.style.opacity='1'; };
    img.addEventListener('load',show,{once:true}); img.addEventListener('error',show,{once:true});
  });
}
function initNavScroll(){
  const nav=$('.nav'); if(!nav) return;
  let on=false, ticking=false;
  const upd=()=>{ const s=window.scrollY>16; if(s!==on){ on=s; nav.classList.toggle('scrolled',s); } ticking=false; };
  window.addEventListener('scroll',()=>{ if(!ticking){ ticking=true; requestAnimationFrame(upd); } },{passive:true}); upd();
}

/* ---------------- dynamic copy: a fresh wording every refresh ---------------- */
const COPY={
  heroLead:[
    "A few of the good ones at a time. Rolex, Omega, Panerai, Breitling, shot up close so you know exactly what you're getting. When one grabs you, it's right there on eBay.",
    "Just a handful at once. Rolex, Omega, Panerai, Breitling, photographed properly so nothing hides. See something you like and it's a click away on eBay.",
    "Small batch, big names. Rolex, Omega, Panerai, Breitling, all shot close enough to count the seconds. When something clicks, it's waiting on eBay."
  ],
  statementHead:[
    "Only the pieces that are worth owning, shown the exact way they deserve.",
    "Only watches worth wearing, shown the way they're meant to be seen.",
    "If it isn't worth owning, it isn't here. What's left, we shoot right."
  ],
  statementSub:[
    "No fluff, no filler. Just the watch in real light, from every angle you'd actually want to see.",
    "No props, no tricks. Just the watch in honest light, every angle that matters.",
    "Nothing staged. Real light, real angles, the watch exactly as it sits."
  ],
  whyLead:[
    "It really comes down to two things. The watches are looked after, and the prices are fair. The rest is just noise.",
    "Two things, honestly. The watches are kept right and the prices stay fair. Everything else is noise.",
    "Boils down to this. Clean watches, honest numbers. The rest sorts itself out."
  ],
  feedHead:[ "Straight off the bench", "Fresh off the bench", "Lately, on the bench" ],
  ownerHead:[ "Watches are only half of it.", "The watches are just the start.", "It's not only the watches." ],
  ownerTeaserLead:[
    "Anthony's pushed past five thousand watches in three years, and he still goes over every one like it's going on his own wrist. The garage gets the exact same treatment. Three cars, a bike, all kept spotless.",
    "Five thousand-plus watches in three years, and he still treats each one like it's about to land on his wrist. Same goes for the garage. Three cars, a bike, every one spotless.",
    "Three years, north of five thousand watches, and he still checks them all like they're his own. The garage is no different. Three cars, one bike, kept clean."
  ],
  invLead:[
    "What's in stock sits up top. The rest has already sold, but it stays up as the track record. Open any watch to spin it around in the light.",
    "Available pieces are up top. Everything under them is sold, but we leave it up, call it the receipts. Open any watch to turn it in the light.",
    "In stock first, sold below. We keep the sold ones up so you can see the history. Tap any watch to spin it around."
  ],
  ownerBio:[
    "Three years in and past five thousand watches, Anthony still goes over every single one like it's about to land on his own wrist. The garage runs the same way. Three cars, a bike, all spotless. He actually wears the watches and actually drives the cars. None of it just sits there.",
    "Three years, five thousand-plus watches, and he still inspects each one like it's heading to his own wrist. The garage is the same story. Three cars, a bike, kept spotless. He wears the watches and drives the cars. Nothing here is for show.",
    "Past five thousand watches in three years, and Anthony still treats every one like his own. The cars get the same care. Three of them, plus a bike, all clean. He wears what he sells and drives what he parks. None of it sits idle."
  ]
};
function applyVariants(){
  $$('[data-vary]').forEach(el=>{ const a=COPY[el.dataset.vary];
    if(a&&a.length) el.textContent=a[Math.floor(Math.random()*a.length)]; });
}

/* ============================================================
   BOOT
   ============================================================ */
const page=document.body.dataset.page||'home';
renderChrome(page);
applyVariants();
initBackToTop();
initNavScroll();
if(page==='home') initHome();
else if(page==='inventory') initInventory();
else if(page==='watch') initWatch();
else if(page==='owner') initOwner();
observeReveals();
initVideoPerf();
initImgFade();

/* safety net: if reveals haven't started shortly after load (observer never
   fired, e.g. a stalled render pipeline), un-hide everything so the page is
   never left blank. Timers run independently of the render lifecycle. */
setTimeout(()=>{ if(!document.querySelector('[data-reveal].in')) document.documentElement.classList.add('reveal-fallback'); }, 1600);

})();
