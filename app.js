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
  {id:'dj41', folder:'watch-12',frames:7,  brand:'Rolex',      name:'Datejust 41 “Blue Diamond”', ref:'126334',            spec:'Steel · Fluted White Gold · Blue Diamond', badge:'Sold', sold:true},
  {id:'br03', folder:'watch-11',frames:5,  brand:'Bell & Ross',name:'BR-03 Diver “Full Lum”',     ref:'BR03A-D-LM-CE/SRB',  spec:'Black Ceramic · Full Lume · Diver',        badge:'Sold', sold:true},
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
  const els = $$('[data-reveal]',root||document);
  
  // Immediately mark elements that are already fully or partially in view
  els.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('in');
    }
  });
  
  // Set up the intersection observer for everything else
  // Note: We use a more forgiving rootMargin so elements start animating slightly before they enter the screen
  if(!_revObs) {
    _revObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){ 
          entry.target.classList.add('in'); 
          _revObs.unobserve(entry.target); 
        }
      });
    }, {threshold: 0.05, rootMargin: '0px 0px 50px 0px'}); // Changed -7% negative margin to a positive padding
  }
  
  // Observe any elements that haven't been revealed yet
  els.forEach(el => { 
    if(!el.classList.contains('in')) {
      _revObs.observe(el); 
    } 
  });
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
      `<img src="${u}" alt="${watch.brand} ${watch.name}, angle ${i+1} of ${N}" draggable="false" loading="eager">`).join('')}</div>
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
  el.setAttribute('aria-label',watch.brand+' '+watch.name+'. Drag or use arrow keys to view angles');
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
  const C=200, id=o.id, lume=o.lume||o.hands;
  // sunburst dial grain (radial spokes that catch the sweeping light)
  let sun="";
  for(let i=0;i<120;i++){ const a=(i/120)*Math.PI*2, s=Math.sin(a), c=-Math.cos(a);
    sun+=`<line x1="${(C+s*14).toFixed(1)}" y1="${(C+c*14).toFixed(1)}" x2="${(C+s*150).toFixed(1)}" y2="${(C+c*150).toFixed(1)}" stroke="${shade(o.dial,16)}" stroke-width=".7" opacity=".14"/>`; }
  // faint concentric snailing on the dial
  let snail="";
  for(let r=22;r<=150;r+=11){ snail+=`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${shade(o.dial,12)}" stroke-width=".5" opacity=".07"/>`; }
  // minute track printed on the chapter ring
  let ticks="";
  for(let i=0;i<60;i++){ const a=(i/60)*Math.PI*2, major=(i%5===0), r1=major?150:153, r2=159, w=major?2.2:1;
    ticks+=`<line x1="${(C+Math.sin(a)*r1).toFixed(1)}" y1="${(C-Math.cos(a)*r1).toFixed(1)}" x2="${(C+Math.sin(a)*r2).toFixed(1)}" y2="${(C-Math.cos(a)*r2).toFixed(1)}" stroke="#cbcdc7" stroke-width="${w}" opacity="${major?.78:.42}"/>`; }
  // smooth polished-steel bezel (clean concentric rings, no fluting)
  let flute=`<circle cx="${C}" cy="${C}" r="177" fill="none" stroke="#ffffff" stroke-opacity=".28" stroke-width="1.2"/>`
    +`<circle cx="${C}" cy="${C}" r="174" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1"/>`;
  // applied steel hour indices with bevel highlight + lume (skip 3 for the date, 12 a touch longer)
  let idx="";
  for(let h=0;h<12;h++){ if(h===3) continue;
    const top=C-144, len=(h===0)?22:16, w=8.5, lw=4.5;
    idx+=`<g transform="rotate(${h*30} ${C} ${C})">
      <rect x="${C-w/2-0.7}" y="${top-0.7}" width="${w+1.4}" height="${len+1.4}" rx="2.4" fill="#15130f" opacity=".55"/>
      <rect x="${C-w/2}" y="${top}" width="${w}" height="${len}" rx="2" fill="url(#gs-${id})" stroke="#2a2620" stroke-width=".6"/>
      <rect x="${C-w/2+1.1}" y="${top+1}" width="1.7" height="${len-2}" rx="0.85" fill="#ffffff" opacity=".5"/>
      <rect x="${C-lw/2}" y="${top+3}" width="${lw}" height="${len-6}" rx="${lw/2}" fill="${lume}" opacity=".82"/></g>`; }
  return `<svg viewBox="0 0 400 400" xmlns="${NS}">
    <defs>
      <radialGradient id="gcase-${id}" cx="38%" cy="30%" r="82%">
        <stop offset="0%" stop-color="#ffffff"/><stop offset="36%" stop-color="#d4d7de"/><stop offset="66%" stop-color="#989ba3"/><stop offset="100%" stop-color="#5d6068"/></radialGradient>
      <radialGradient id="gd-${id}" cx="40%" cy="32%" r="82%">
        <stop offset="0%" stop-color="${shade(o.dial,18)}"/><stop offset="55%" stop-color="${o.dial}"/><stop offset="100%" stop-color="${shade(o.dial,-28)}"/></radialGradient>
      <linearGradient id="gb-${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f1f3f6"/><stop offset="24%" stop-color="#b9bcc4"/><stop offset="50%" stop-color="#73767e"/><stop offset="70%" stop-color="#dadce1"/><stop offset="100%" stop-color="#888b94"/></linearGradient>
      <linearGradient id="grh-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#565960"/><stop offset="55%" stop-color="#3b3d42"/><stop offset="100%" stop-color="#2b2d31"/></linearGradient>
      <linearGradient id="gs-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fcfcfe"/><stop offset="46%" stop-color="#cfd0d6"/><stop offset="100%" stop-color="#81838d"/></linearGradient>
      <linearGradient id="gh-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${shade(o.hands,-36)}"/><stop offset="42%" stop-color="${o.hands}"/><stop offset="52%" stop-color="#ffffff"/><stop offset="62%" stop-color="${o.hands}"/><stop offset="100%" stop-color="${shade(o.hands,-46)}"/></linearGradient>
      <radialGradient id="gv-${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="70%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".42"/></radialGradient>
      <radialGradient id="gsh-${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff" stop-opacity=".9"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="gcrys-${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff" stop-opacity=".2"/><stop offset="55%" stop-color="#fff" stop-opacity=".045"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="gar-${id}" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#7ba6dd" stop-opacity=".2"/><stop offset="100%" stop-color="#7ba6dd" stop-opacity="0"/></radialGradient>
      <clipPath id="dc-${id}"><circle cx="${C}" cy="${C}" r="160"/></clipPath>
      <clipPath id="cf-${id}"><circle cx="${C}" cy="${C}" r="184"/></clipPath>
    </defs>

    <!-- polished steel case + smooth bezel -->
    <circle cx="${C}" cy="${C}" r="190" fill="url(#gcase-${id})"/>
    <circle cx="${C}" cy="${C}" r="190" fill="none" stroke="#ffffff" stroke-opacity=".55" stroke-width="1"/>
    <circle cx="${C}" cy="${C}" r="186" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="2"/>
    <circle cx="${C}" cy="${C}" r="183" fill="url(#gb-${id})"/>
    ${flute}
    <circle cx="${C}" cy="${C}" r="171" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="1.4"/>

    <!-- recessed chapter ring + dial -->
    <circle cx="${C}" cy="${C}" r="170" fill="url(#grh-${id})"/>
    <circle cx="${C}" cy="${C}" r="161" fill="${shade(o.dial,-30)}"/>
    <circle cx="${C}" cy="${C}" r="160" fill="url(#gd-${id})"/>
    <g clip-path="url(#dc-${id})">${sun}${snail}</g>
    <circle cx="${C}" cy="${C}" r="160" fill="url(#gv-${id})"/>

    ${ticks}
    ${idx}

    <!-- anti-reflective coating tint catching the lower-left -->
    <g clip-path="url(#dc-${id})" pointer-events="none"><ellipse cx="${C-56}" cy="${C+62}" rx="92" ry="64" fill="url(#gar-${id})"/></g>

    <!-- date window -->
    <rect x="258" y="${C-15}" width="38" height="30" rx="2.5" fill="${shade(o.dial,-58)}" stroke="url(#gs-${id})" stroke-width="1.6"/>
    <rect x="258" y="${C-15}" width="38" height="6" fill="#000" opacity=".18"/>
    <text x="277" y="${C+6}" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="18" font-weight="600" fill="#eceef0">${o.date}</text>

    <!-- printed dial text -->
    <text x="${C}" y="128" text-anchor="middle" font-family="Macaria,Georgia,serif" font-size="21" font-weight="500" letter-spacing="3.5" fill="${o.accent}">TIMESCAPES</text>
    <text x="${C}" y="145" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="7" letter-spacing="3.4" fill="#9a9c92">AUTOMATIC</text>
    <text x="${C}" y="280" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="6.5" letter-spacing="3" fill="#8f9189">SAVEDRA · 200M</text>

    <!-- crown -->
    <rect x="383" y="${C-6}" width="8" height="12" fill="url(#gs-${id})"/>
    <rect x="390" y="${C-9}" width="9" height="18" rx="2.2" fill="url(#gs-${id})" stroke="#2a2620" stroke-width=".5"/>
    <g stroke="#5a5d63" stroke-width=".7" opacity=".7"><line x1="392" y1="${C-7}" x2="392" y2="${C+7}"/><line x1="394.5" y1="${C-8}" x2="394.5" y2="${C+8}"/><line x1="397" y1="${C-7}" x2="397" y2="${C+7}"/></g>

    <g data-h></g><g data-m></g><g data-s></g>

    <circle cx="${C}" cy="${C}" r="7.5" fill="url(#gs-${id})" stroke="#26221c" stroke-width=".6"/>
    <circle cx="${C}" cy="${C}" r="2.6" fill="${shade(o.dial,-40)}"/>

    <!-- sapphire crystal: soft domed glare + bright rim crescent, over everything -->
    <g clip-path="url(#cf-${id})" pointer-events="none">
      <ellipse cx="${C-44}" cy="${C-64}" rx="150" ry="122" fill="url(#gcrys-${id})"/>
      <path d="M ${C-150},${C+10} A 158 158 0 0 1 ${C+92},${C-128}" stroke="#ffffff" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="${C-72}" cy="${C-84}" rx="46" ry="22" fill="#ffffff" opacity=".10"/>
      <g class="dial-sheen">
        <ellipse cx="${C}" cy="${C-118}" rx="120" ry="50" fill="url(#gsh-${id})" opacity=".09"/>
        <ellipse cx="${C}" cy="${C+118}" rx="120" ry="50" fill="url(#gsh-${id})" opacity=".045"/>
      </g>
    </g>
  </svg>`;
}
function buildLiveWatch(faceEl, chipEl, toggleEl){
  if(!faceEl) return;
  const PAL={ day:{dial:'#262626',accent:'#9ba089',hands:'#e7e8ea',sec:'#898c79',lume:'#cdd0c2'},
              lume:{dial:'#14170f',accent:'#aeb893',hands:'#d8ddca',sec:'#aebb8e',lume:'#c6d2a6'} };
  let mode='day',hH,mH,sH; const C=200;
  // light overlays that sit above the dial and survive every re-render
  const glint=document.createElement('div'); glint.className='livewatch__glint'; glint.setAttribute('aria-hidden','true');
  const glare=document.createElement('div'); glare.className='livewatch__glare'; glare.setAttribute('aria-hidden','true');
  function render(){
    const p=PAL[mode];
    faceEl.innerHTML=watchSVG({id:'live',dial:p.dial,accent:p.accent,hands:p.hands,date:new Date().getDate(),sec:p.sec,lume:p.lume});
    // Force a reflow to ensure the SVG is fully painted before the clock starts
    faceEl.offsetHeight;
    hH=$('[data-h]',faceEl);mH=$('[data-m]',faceEl);sH=$('[data-s]',faceEl);
    // hands: polished sword batons with a lume channel + a baked soft shadow (cheaper than a per-frame filter)
    const hp=`M ${C},${C-100} L ${C+5},${C-84} L ${C+3.4},${C+20} L ${C-3.4},${C+20} L ${C-5},${C-84} Z`;
    const mp=`M ${C},${C-148} L ${C+4.2},${C-130} L ${C+2.8},${C+22} L ${C-2.8},${C+22} L ${C-4.2},${C-130} Z`;
    hH.innerHTML=`<path d="${hp}" transform="translate(1.4,2.6)" fill="#000" opacity=".25"/>`
      +`<path d="${hp}" fill="url(#gh-live)" stroke="#15120e" stroke-width=".5"/>`
      +`<rect x="${C-2.6}" y="${C-84}" width="5.2" height="80" rx="2.6" fill="${p.lume}" opacity=".88"/>`;
    mH.innerHTML=`<path d="${mp}" transform="translate(1.4,2.6)" fill="#000" opacity=".25"/>`
      +`<path d="${mp}" fill="url(#gh-live)" stroke="#15120e" stroke-width=".5"/>`
      +`<rect x="${C-2.2}" y="${C-128}" width="4.4" height="120" rx="2.2" fill="${p.lume}" opacity=".88"/>`;
    sH.innerHTML=`<g transform="translate(1.2,2.4)" opacity=".2" fill="#000"><rect x="${C-1.1}" y="${C-150}" width="2.2" height="188" rx="1.1"/><circle cx="${C}" cy="${C+34}" r="6.5"/></g>`
      +`<rect x="${C-1.1}" y="${C-150}" width="2.2" height="188" rx="1.1" fill="${p.sec}"/>`
      +`<circle cx="${C}" cy="${C-118}" r="5" fill="${p.sec}"/><circle cx="${C}" cy="${C-118}" r="2.2" fill="${p.lume}"/>`
      +`<circle cx="${C}" cy="${C+34}" r="6.5" fill="${p.sec}"/><circle cx="${C}" cy="${C+34}" r="2.3" fill="${shade(p.dial,-26)}"/>`;
    faceEl.appendChild(glint); faceEl.appendChild(glare);
     // Force a repaint after the reveal transition to fix SVG gradient rendering
if (!REDUCE) {
  const revealParent = faceEl.closest('[data-reveal]');
  if (revealParent) {
    const handler = function onTransitionEnd(e) {
      // Only act on opacity or transform transitions (the ones used by reveal)
      if (e.propertyName === 'opacity' || e.propertyName === 'transform') {
        // Force a layout recalculation – this triggers a fresh paint
        faceEl.getBoundingClientRect();
        revealParent.removeEventListener('transitionend', handler);
      }
    };
    revealParent.addEventListener('transitionend', handler);
    // Fallback in case transitionend never fires (safety net)
    setTimeout(() => {
      faceEl.getBoundingClientRect();
      revealParent.removeEventListener('transitionend', handler);
    }, 1500);
  }
}
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

  // subtle "real watch under moving light" interaction: the dial tilts gently
  // toward the cursor while a soft highlight tracks the pointer across the glass.
  if(!REDUCE && FINE){
    const wrap=faceEl.closest('.livewatch')||faceEl; let raf=null;
    wrap.addEventListener('pointermove',e=>{
      const r=faceEl.getBoundingClientRect(); if(!r.width) return;
      const px=clamp((e.clientX-r.left)/r.width,0,1), py=clamp((e.clientY-r.top)/r.height,0,1);
      if(raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        faceEl.style.transform=`rotateX(${((0.5-py)*10).toFixed(2)}deg) rotateY(${((px-0.5)*10).toFixed(2)}deg)`;
        glare.style.setProperty('--gx',(px*100).toFixed(1)+'%');
        glare.style.setProperty('--gy',(py*100).toFixed(1)+'%');
      });
      wrap.classList.add('lw-live');
    });
    wrap.addEventListener('pointerleave',()=>{ if(raf) cancelAnimationFrame(raf); faceEl.style.transform=''; wrap.classList.remove('lw-live'); });
  }
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
    const t=LB.list[LB.idx]; LB.img.src=t.src; LB.img.alt=t.w.brand+' '+t.w.name+', Ref. '+t.w.ref;
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
  btn.className='totop'; btn.setAttribute('aria-label','Back to top');
  // a little watch face that also reads as an "up" button: bezel + ticks + crown,
  // with the hands swept up into a chevron/arrow pointing to 12.
  btn.innerHTML=`<svg viewBox="0 0 48 48" aria-hidden="true">
    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/>
    <g stroke="currentColor" stroke-width="1.7" stroke-linecap="round" opacity=".6">
      <line x1="24" y1="6.4" x2="24" y2="9.6"/><line x1="41.6" y1="24" x2="38.4" y2="24"/>
      <line x1="24" y1="41.6" x2="24" y2="38.4"/><line x1="6.4" y1="24" x2="9.6" y2="24"/></g>
    <rect x="42.6" y="21.6" width="4" height="4.8" rx="1.2" fill="currentColor" opacity=".6"/>
    <g class="totop__hands" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 31 V16.5"/><path d="M16.6 23.2 L24 15.4 L31.4 23.2"/></g>
    <circle cx="24" cy="24" r="1.7" fill="currentColor"/>
  </svg>`;
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
    <a href="index.html" class="brand" aria-label="Timescapes home"><img src="assets/brand/icon-green.svg" alt="">Timescapes</a>
<nav class="nav__links" id="navLinks" aria-label="Primary">
      ${a('index.html','Home','home')}
      ${a('inventory.html','Our Watches','inventory')}
      ${a('owner.html','The Owner','owner')}
      ${a('owner.html#contact','Contact','contact')}
    </nav>
    <div class="nav__cta">
      <span class="nav-ebay">
        <a class="btn btn--gold" href="${EBAY}" target="_blank" rel="noopener">View on eBay ↗</a>
        <span class="nav-ebay__watch" aria-hidden="true"><span class="nw-spin"><svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="nwCase" cx="40%" cy="34%" r="70%"><stop offset="0" stop-color="#e9edee"/><stop offset=".55" stop-color="#9aa0a3"/><stop offset="1" stop-color="#41454a"/></radialGradient></defs><circle cx="20" cy="20" r="19" fill="url(#nwCase)"/><circle cx="20" cy="20" r="19" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".6"/><circle cx="20" cy="20" r="15.4" fill="#16170f"/><circle cx="20" cy="20" r="15.4" fill="none" stroke="#898C79" stroke-width="1"/><rect x="19.1" y="6.3" width="1.8" height="3.3" rx=".9" fill="#cdd0c2"/><rect x="30.4" y="19.1" width="3.3" height="1.8" rx=".9" fill="#cdd0c2"/><rect x="19.1" y="30.4" width="1.8" height="3.3" rx=".9" fill="#cdd0c2"/><rect x="6.3" y="19.1" width="3.3" height="1.8" rx=".9" fill="#cdd0c2"/><line x1="20" y1="20" x2="13.6" y2="13.6" stroke="#eef0e6" stroke-width="1.7" stroke-linecap="round"/><line x1="20" y1="20" x2="27.2" y2="12.2" stroke="#eef0e6" stroke-width="1.4" stroke-linecap="round"/><line x1="20" y1="20" x2="20" y2="29" stroke="#898C79" stroke-width=".9" stroke-linecap="round"/><circle cx="20" cy="20" r="1.7" fill="#cdd0c2"/></svg></span></span>
      </span>
      <button class="menu-btn" id="menuBtn" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
    </div>
  </div>`;
}
function footerHTML(){
  return `<div class="container">
    <div class="foot__row">
      <div class="foot__brand">
        <div class="fb-top"><img src="assets/brand/icon-green.svg" alt="">Timescapes</div>
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
      <small>© 2026 Timescapes LLC· Est. 2023</small>
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
/* ---------------- closer trust-metric count-up ---------------- */
function initMetricCounts(){
  var box=$('.ts-client-metrics'); if(!box) return;
  var vals=$$('.ts-metric-val',box); if(!vals.length) return;
  var items=vals.map(function(el){
    var txt=el.textContent.trim(), m=txt.match(/^([\d.]+)(.*)$/);
    if(!m) return null;
    var dec=(m[1].indexOf('.')>=0)?(m[1].split('.')[1].length):0;
    return {el:el, num:parseFloat(m[1]), dec:dec, suffix:m[2]};
  }).filter(Boolean);
  if(!items.length) return;
  function run(){
    items.forEach(function(it){
      if(REDUCE){ it.el.textContent=it.num.toFixed(it.dec)+it.suffix; return; }
      var start=performance.now(), dur=1500;
      (function fr(t){
        var k=clamp((t-start)/dur,0,1), e=1-Math.pow(1-k,3);
        it.el.textContent=(it.num*e).toFixed(it.dec)+it.suffix;
        if(k<1) requestAnimationFrame(fr);
      })(start);
    });
  }
  if(REDUCE){ run(); return; }
  var o=new IntersectionObserver(function(es){ es.forEach(function(en){
    if(en.isIntersecting){ run(); o.unobserve(en.target); } }); },{threshold:.5});
  o.observe(box);
}

/* ---------------- magnetic CTA buttons (very slight) ---------------- */
function initMagnetic(){
  if(REDUCE || !FINE) return;
  $$('.btn--gold').forEach(function(btn){
    if(btn.closest('.nav-ebay')) return;   // the nav button has the peeking watch — leave it
    var raf=null;
    btn.addEventListener('pointermove',function(e){
      var r=btn.getBoundingClientRect();
      var dx=clamp((e.clientX-(r.left+r.width/2))*0.15,-4,4),
          dy=clamp((e.clientY-(r.top+r.height/2))*0.15,-3,3);
      if(raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(function(){ btn.style.transform='translate('+dx.toFixed(1)+'px,'+(dy-2).toFixed(1)+'px)'; });
    });
    btn.addEventListener('pointerleave',function(){ if(raf) cancelAnimationFrame(raf); btn.style.transform=''; });
  });
}

function initHome(){
  buildLiveWatch($('#liveWatch'), $('#liveTime'), $('#lumeToggle'));
  initMetricCounts();
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
  const all=ourWatches();
  const brands=[...new Set(all.map(w=>w.brand))];

  // is anything available for this status + brand pair?
  const has=(status,brand)=>all.some(w=>
    (status==='all' || (status==='stock'&&!w.sold) || (status==='sold'&&w.sold)) &&
    (brand==='all'  || w.brand===brand));

  // shareable state from URL (?status=&brand=&sort=)
  const q=new URLSearchParams(location.search);
  const brandMatch=brands.find(b=>b.toLowerCase()===(q.get('brand')||'').toLowerCase());
  const state={
    status:['stock','sold'].includes(q.get('status'))?q.get('status'):'all',
    brand: brandMatch||'all',
    sort:  ['az'].includes(q.get('sort'))?q.get('sort'):'new'
  };
  // never start on an impossible combo (e.g. a deep-linked sold-only brand under In stock)
  if(state.brand!=='all' && !has(state.status,state.brand)) state.brand='all';

  const bar=$('#filterBar'), sortSel=$('#invSort'), countEl=$('#invCount');
  if(bar){
    const pill=(type,k,l)=>`<button class="filter" data-type="${type}" data-k="${k}">${l}</button>`;
    bar.innerHTML = pill('reset','all','All')
      + pill('status','stock','In stock') + pill('status','sold','Sold')
      + `<span class="filter-div" aria-hidden="true"></span>`
      + brands.map(b=>pill('brand',b,b)).join('');
  }
  if(sortSel) sortSel.value=state.sort;

  const filtered=()=>all.filter(w=>{
      const okS = state.status==='all' || (state.status==='stock'&&!w.sold) || (state.status==='sold'&&w.sold);
      const okB = state.brand==='all'  || w.brand===state.brand;
      return okS && okB;
    }).sort((a,b)=>{
      if(!!a.sold!==!!b.sold) return a.sold?1:-1;                 // in-stock always before sold
      if(state.sort==='az') return (a.brand+' '+a.name).localeCompare(b.brand+' '+b.name);
      return all.indexOf(a)-all.indexOf(b);                      // newest = curated order
    });

  const syncBar=()=>{
    if(!bar) return;
    $$('.filter',bar).forEach(b=>{
      const t=b.dataset.type, k=b.dataset.k; let active=false, off=false;
      if(t==='reset')        active = state.status==='all' && state.brand==='all';
      else if(t==='status'){ active = state.status===k; off = !has(k,state.brand); }
      else if(t==='brand'){  active = state.brand===k;  off = !has(state.status,k); }
      b.classList.toggle('active',active);
      b.disabled = off;                 // greyed + unclickable when the combo is empty
    });
  };
  const syncURL=()=>{
    const p=new URLSearchParams();
    if(state.status!=='all') p.set('status',state.status);
    if(state.brand!=='all')  p.set('brand',state.brand);
    if(state.sort!=='new')   p.set('sort',state.sort);
    const qs=p.toString();
    history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash);
  };
  const paint=(initial)=>{
    const list=filtered();
    if(countEl) countEl.textContent = list.length===all.length ? all.length+' watches' : list.length+' of '+all.length;
    if(!list.length){
      grid.innerHTML='<p class="inv-empty">Nothing matches that combo.<button type="button" id="invClear">Clear filters</button></p>';
      const clr=$('#invClear'); if(clr) clr.addEventListener('click',()=>{ state.status='all'; state.brand='all'; apply(); });
      return;
    }
    grid.innerHTML=list.map(cardHTML).join('');
    if(initial) observeReveals(grid);
    else $$('.card',grid).forEach(c=>c.classList.add('in'));
  };
  function apply(){
    syncBar(); syncURL();
    if(REDUCE){ paint(false); return; }
    grid.style.opacity='0';
    setTimeout(()=>{ paint(false); grid.style.opacity='1'; },200);
  }

  if(bar) bar.addEventListener('click',e=>{
    const b=e.target.closest('.filter'); if(!b || b.disabled) return;
    const t=b.dataset.type, k=b.dataset.k;
    if(t==='reset'){ state.status='all'; state.brand='all'; }
    else if(t==='status'){ state.status = state.status===k?'all':k; if(state.brand!=='all' && !has(state.status,state.brand)) state.brand='all'; }
    else if(t==='brand'){  state.brand  = state.brand===k?'all':k;  if(state.status!=='all' && !has(state.status,state.brand)) state.status='all'; }
    apply();
  });
  if(sortSel) sortSel.addEventListener('change',()=>{ state.sort=sortSel.value; apply(); });

  syncBar(); syncURL(); paint(true);

  const cmp=$('#cmp'); if(cmp) initComparison(cmp);
  const galBtn=$('#openGallery'); if(galBtn) galBtn.addEventListener('click',()=>lbOpen('all'));
}
// Per-watch reference specs. Real, sourced data — empty fields are intentionally omitted, never guessed.
// Unit-specific fields (box & papers, year, condition) are yours to set per piece.
const SPECS = {
  speedy:{movement:'Automatic chronograph (column-wheel)',caliber:'Omega Co-Axial 3330',power:'52 hours',case:'Stainless steel',size:'38 mm',water:'100 m',crystal:'Sapphire, anti-reflective both sides',bezel:'Blue ceramic, white enamel tachymeter',dial:'Varnished white, frosted blue Milano Cortina transfer',strap:'Stainless steel bracelet',functions:'Chronograph · Date',cert:'COSC chronometer'},
  premier:{movement:'Automatic chronograph',caliber:'Breitling B01 (in-house)',power:'70 hours',case:'Stainless steel',size:'42 mm',water:'100 m',crystal:'Sapphire',bezel:'Polished steel, fixed',dial:'Black',functions:'Chronograph · Date',cert:'COSC chronometer',bp:'Box & papers (full set)'},
  avi:{movement:'Automatic chronograph with GMT',caliber:'Breitling B04 (in-house)',power:'70 hours',case:'Stainless steel',size:'46 mm',water:'100 m',crystal:'Sapphire',bezel:'Bidirectional 24-hour',dial:'Blue',functions:'Chronograph · GMT · Date',cert:'COSC chronometer'},
  dj41:{movement:'Automatic',caliber:'Rolex 3235',power:'70 hours',case:'Oystersteel & 18k white gold',size:'41 mm',water:'100 m',crystal:'Sapphire, Cyclops date lens',bezel:'Fluted 18k white gold',dial:'Blue, diamond hour markers',functions:'Date',cert:'Superlative Chronometer (COSC + Rolex)'},
  br03:{movement:'Automatic',caliber:'BR-CAL.302-1',power:'54 hours',case:'Matte black ceramic',size:'42 mm',water:'300 m',crystal:'Sapphire, anti-reflective',bezel:'Unidirectional 60-min, black ceramic',dial:'Full pale-blue Super-LumiNova',strap:'Black rubber + synthetic fabric',functions:'Hours · Minutes · Seconds · Date'},
  gmt:{movement:'Automatic',caliber:'Rolex 3285',power:'70 hours',case:'18k Everose gold',size:'40 mm',water:'100 m',crystal:'Sapphire, Cyclops date lens',bezel:'Cerachrom 24-hour, brown & black',dial:'Black',strap:'Oyster bracelet',functions:'GMT · Date',cert:'Superlative Chronometer (COSC + Rolex)'},
  sea:{movement:'Automatic',power:'55 hours',size:'42 mm',water:'300 m',crystal:'Sapphire, anti-reflective',bezel:'Unidirectional, ceramic diving scale',dial:'Green',functions:'Date',cert:'METAS Master Chronometer'},
  p904b:{movement:'Automatic',caliber:'Panerai P.900',power:'72 hours (3 days)',case:'Stainless steel',size:'42 mm',water:'30 m',crystal:'Sapphire',bezel:'Fixed steel',dial:'Anthracite sunburst',strap:'Suede leather',functions:'Small seconds · Date'},
  p904t:{movement:'Automatic',caliber:'Panerai P.900',power:'72 hours (3 days)',case:'Stainless steel',size:'42 mm',water:'30 m',crystal:'Sapphire',bezel:'Fixed steel',dial:'Anthracite sunburst',strap:'Textile',functions:'Small seconds · Date'},
  p1218:{movement:'Automatic chronograph',caliber:'Panerai P.9200',power:'42 hours',case:'Stainless steel',size:'44 mm',water:'100 m',crystal:'Sapphire, anti-reflective',bezel:'Polished steel, tachymeter rehaut',dial:'White, sandwich',strap:'Blue rubber',functions:'Chronograph · Small seconds'},
  navi:{movement:'Automatic chronograph',caliber:'Breitling B01 (in-house)',power:'70 hours',case:'Stainless steel & 18k red gold',size:'43 mm',water:'30 m',crystal:'Sapphire',bezel:'Bidirectional slide-rule',functions:'Chronograph · Date',cert:'COSC chronometer'},
  '007':{movement:'Automatic',caliber:'Omega Co-Axial Master Chronometer 8806',power:'55 hours',case:'Grade 2 titanium',size:'42 mm',water:'300 m',crystal:'Sapphire, anti-reflective',bezel:'Unidirectional, brown aluminium diving scale',dial:'Brown, broad-arrow military style',strap:'Titanium mesh + NATO',functions:'Central seconds (no date)',cert:'METAS Master Chronometer'}
};
const SPEC_ORDER = [['movement','Movement'],['caliber','Caliber'],['power','Power reserve'],['case','Case'],['size','Diameter'],['water','Water resistance'],['crystal','Crystal'],['bezel','Bezel'],['dial','Dial'],['strap','Bracelet / Strap'],['functions','Functions'],['cert','Certification'],['bp','Box & papers']];

// Real case geometry (mm), sourced per reference. Powers the to-scale "how it wears" drawing.
const DIMS = {
  speedy:{shape:'round',dia:38,l2l:45.2,thick:14.75,lug:20},
  premier:{shape:'round',dia:42,l2l:50,thick:13.6,lug:22},
  avi:{shape:'round',dia:46,l2l:51.5,thick:15.9,lug:24},
  dj41:{shape:'round',dia:41,l2l:47.6,thick:12,lug:21},
  br03:{shape:'square',dia:42,l2l:42,thick:12,lug:24},
  gmt:{shape:'round',dia:40,l2l:47.5,thick:12,lug:20},
  sea:{shape:'round',dia:42,l2l:48.5,thick:13.5,lug:20},
  p904b:{shape:'cushion',dia:42,l2l:49,thick:10.5,lug:22},
  p904t:{shape:'cushion',dia:42,l2l:49,thick:10.5,lug:22},
  p1218:{shape:'cushion',dia:44,l2l:53,thick:15.7,lug:24},
  navi:{shape:'round',dia:43,l2l:50,thick:13.6,lug:22},
  '007':{shape:'round',dia:42,l2l:48.5,thick:13.5,lug:20}
};
function wearsViz(w){
  const d=DIMS[w.id]; if(!d) return '';
  const S=4, cx=158, cy=152, px=430;
  const half=d.dia*S/2, l2lH=d.l2l*S/2, slabH=d.thick*S, slabW=d.dia*S;
  const tick=(x,y)=>`<line x1="${x-4}" y1="${y}" x2="${x+4}" y2="${y}" class="wv-dim"/>`;
  let shape;
  if(d.shape==='square') shape=`<rect x="${cx-half}" y="${cy-half}" width="${slabW}" height="${slabW}" rx="9" class="wv-case"/>`;
  else if(d.shape==='cushion') shape=`<rect x="${cx-half}" y="${cy-half}" width="${slabW}" height="${slabW}" rx="${(half*0.5).toFixed(1)}" class="wv-case"/>`;
  else shape=`<circle cx="${cx}" cy="${cy}" r="${half}" class="wv-case"/>`;
  let env='';
  if(d.shape!=='square' && d.l2l>d.dia+1){
    env=`<rect x="${cx-half}" y="${cy-l2lH}" width="${slabW}" height="${d.l2l*S}" rx="${(half*0.66).toFixed(1)}" class="wv-env"/>`;
    const off=half*0.46, lw=Math.max(d.lug*S*0.3,8);
    [-1,1].forEach(sx=>[-1,1].forEach(sy=>{
      const x=(cx+sx*off-lw/2).toFixed(1), y=(sy<0?cy-l2lH:cy+half-6).toFixed(1);
      env+=`<rect x="${x}" y="${y}" width="${lw.toFixed(1)}" height="${(l2lH-half+6).toFixed(1)}" rx="3" class="wv-lug"/>`;
    }));
  }
  const dlx=52;
  const l2lDim = d.shape==='square' ? '' :
    `<line x1="${dlx}" y1="${(cy-l2lH).toFixed(1)}" x2="${dlx}" y2="${(cy+l2lH).toFixed(1)}" class="wv-dim"/>${tick(dlx,cy-l2lH)}${tick(dlx,cy+l2lH)}<text x="${dlx-9}" y="${cy}" transform="rotate(-90 ${dlx-9} ${cy})" text-anchor="middle" class="wv-num">${d.l2l} lug-to-lug</text>`;
  const diaTxt = d.shape==='square'?`${d.dia} × ${d.dia} mm square`:d.shape==='cushion'?`${d.dia} mm cushion`:`&#216; ${d.dia} mm`;
  const diaLabel=`<text x="${cx}" y="${(cy+l2lH+24).toFixed(1)}" text-anchor="middle" class="wv-num">${diaTxt}</text>`;
  const slabX=px-slabW/2, slabY=cy-slabH/2, rx=Math.min(slabH/2,9);
  const prof=`<rect x="${slabX.toFixed(1)}" y="${slabY.toFixed(1)}" width="${slabW}" height="${slabH}" rx="${rx.toFixed(1)}" class="wv-case"/><path d="M${(slabX+7).toFixed(1)} ${slabY.toFixed(1)} Q${px} ${(slabY-7).toFixed(1)} ${(slabX+slabW-7).toFixed(1)} ${slabY.toFixed(1)}" class="wv-crystal"/>`;
  const tdx=slabX-16;
  const thickDim=`<line x1="${tdx.toFixed(1)}" y1="${slabY.toFixed(1)}" x2="${tdx.toFixed(1)}" y2="${(slabY+slabH).toFixed(1)}" class="wv-dim"/>${tick(tdx,slabY)}${tick(tdx,slabY+slabH)}<text x="${(tdx-7).toFixed(1)}" y="${(cy+3).toFixed(1)}" text-anchor="end" class="wv-num">${d.thick} mm thick</text>`;
  const caps=`<text x="${cx}" y="20" text-anchor="middle" class="wv-cap">FOOTPRINT</text><text x="${px}" y="20" text-anchor="middle" class="wv-cap">PROFILE</text>`;
  const sb=`<line x1="270" y1="288" x2="310" y2="288" class="wv-dim"/>${tick(270,288)}${tick(310,288)}<text x="290" y="282" text-anchor="middle" class="wv-cap">10 MM &#183; TO SCALE</text>`;
  return `<div class="wears"><div class="wears__head"><span class="wears__t">How it wears</span><span class="wears__sub">Drawn to scale. Lug-to-lug and thickness decide wrist presence more than diameter does.</span></div><svg viewBox="0 0 560 300" class="wears__svg" role="img" aria-label="To-scale case: ${d.dia}mm wide, ${d.l2l}mm lug-to-lug, ${d.thick}mm thick">${caps}${env}${shape}${l2lDim}${diaLabel}${prof}${thickDim}${sb}</svg></div>`;
}

function initWatch(){
  const root=$('#watchRoot'); if(!root) return;
  const id=new URLSearchParams(location.search).get('id');
  const w=byId(id)||WATCHES[0];
  document.title=`${w.brand} ${w.name} · Timescapes`;
  const more=ourWatches().filter(x=>x.id!==w.id).slice(0,3);
  const soldTag = w.sold ? '<span class="sold-tag">Sold</span>' : '';
  const availDD = w.sold ? '<dd class="dd-sold">Sold</dd>' : '<dd class="dd-stock">Available now</dd>';
 const contactHref = `owner.html?watch=${encodeURIComponent(w.brand+' '+w.name+' — Ref. '+w.ref)}#contact`;
  const cta = w.sold
    ? `<a class="btn btn--ghost" href="inventory.html">See what's in stock →</a><a class="btn btn--ghost" href="${contactHref}">Ask about a similar piece</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`
    : `<a class="btn btn--gold" href="${w.ebay}" target="_blank" rel="noopener">See it on eBay ↗</a><a class="btn btn--ghost" href="${contactHref}">Contact about this watch</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`;
  const S = SPECS[w.id] || {};
  const BASIC = {movement:1,case:1,size:1,water:1};
  let basicRows = `<div><dt>Brand</dt><dd>${w.brand}</dd></div><div><dt>Reference</dt><dd>${w.ref}</dd></div>`, moreRows='';
  SPEC_ORDER.forEach(function(p){ if(!S[p[0]]) return; const row=`<div><dt>${p[1]}</dt><dd>${S[p[0]]}</dd></div>`; if(BASIC[p[0]]) basicRows+=row; else moreRows+=row; });
  basicRows += `<div><dt>Availability</dt>${availDD}</div>`;
  const wv = wearsViz(w);
  const specBlock = `<dl class="specs">${basicRows}</dl>`
    + ((moreRows || wv) ? `<button class="specs-toggle" id="specsToggle" type="button" aria-expanded="false" aria-controls="specsMore"><span class="specs-toggle__label">Full specification</span><span class="specs-toggle__chev" aria-hidden="true">↓</span></button><div class="specs-more" id="specsMore">${moreRows?`<dl class="specs specs--cont">${moreRows}</dl>`:''}${wv}</div>` : '');
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
        ${specBlock}
        <div class="detail__cta">${cta}</div>
      </div>
      <div class="detail__gallery" data-reveal data-delay="2">
        <span class="eyebrow">Every angle</span>
        <div class="gallery-strip" id="galleryStrip" style="margin-top:16px"></div>
      </div>
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

  // collapsible spec sheet
  const moreWrap=$('#specsMore'), sToggle=$('#specsToggle');
  if(moreWrap && sToggle){
    const sLabel=$('.specs-toggle__label',sToggle);
    sToggle.addEventListener('click',function(){
      const willOpen=!moreWrap.classList.contains('open');
      sToggle.classList.toggle('open',willOpen);
      sToggle.setAttribute('aria-expanded',willOpen?'true':'false');
      if(sLabel) sLabel.textContent=willOpen?'Show less':'Full specification';
      if(REDUCE){ moreWrap.classList.toggle('open',willOpen); moreWrap.style.maxHeight=willOpen?'none':'0px'; return; }
      if(willOpen){ moreWrap.classList.add('open'); moreWrap.style.maxHeight=moreWrap.scrollHeight+'px'; }
      else { moreWrap.style.maxHeight=moreWrap.scrollHeight+'px'; requestAnimationFrame(function(){ moreWrap.classList.remove('open'); moreWrap.style.maxHeight='0px'; }); }
    });
    moreWrap.addEventListener('transitionend',function(e){ if(e.propertyName==='max-height' && moreWrap.classList.contains('open')) moreWrap.style.maxHeight='none'; });
  }

  observeReveals(root);
}
function initOwner(){
  initStats($('#stats'));
  const open=()=>mediaOpen({type:'video',src:'assets/brand-film.mp4',cap:'Timescapes · the brand film'});
  const fp=$('#filmPlay'), fb=$('#filmBg'); if(fp) fp.addEventListener('click',open); if(fb) fb.addEventListener('click',open);
}

/* ---------------- QOL motion: image fade-in + nav shadow ---------------- */
function initImgFade(){
  if(REDUCE) return;
  $$('.card__media img, .feed__tile img, .gallery-strip img, .cmp img, .inv-banner img').forEach(img=>{
    // If already loaded, ensure it's fully opaque (default is 1, but set explicitly)
    if(img.complete && img.naturalWidth > 0) {
      img.style.opacity = '1';
      return;
    }
    img.style.opacity = '0';
    img.style.transition = 'opacity .8s cubic-bezier(.22,.61,.30,1)';
    const show = () => { img.style.opacity = '1'; };
    img.addEventListener('load', show, {once: true});
    img.addEventListener('error', show, {once: true});
  });
}
function initNavScroll(){
  const nav=$('.nav'); if(!nav) return;
  let on=false, ticking=false;
  const upd=()=>{ const s=window.scrollY>16; if(s!==on){ on=s; nav.classList.toggle('scrolled',s); } ticking=false; };
  window.addEventListener('scroll',()=>{ if(!ticking){ ticking=true; requestAnimationFrame(upd); } },{passive:true}); upd();
}

/* Copy lives in the HTML now. Edit the words directly in the .html files and they
   stick — the old data-vary system was removed so nothing overwrites your edits. */

/* ============================================================
   BOOT
   ============================================================ */
const page=document.body.dataset.page||'home';
renderChrome(page);
initBackToTop();
initNavScroll();
if(page==='home') initHome();
else if(page==='inventory') initInventory();
else if(page==='watch') initWatch();
else if(page==='owner') initOwner();
observeReveals();
initVideoPerf();
initImgFade();
initMagnetic();

/* safety net: if reveals haven't started shortly after load (observer never
   fired, e.g. a stalled render pipeline), un-hide everything so the page is
   never left blank. Timers run independently of the render lifecycle. */
setTimeout(()=>{ if(!document.querySelector('[data-reveal].in')) document.documentElement.classList.add('reveal-fallback'); }, 1600);
   // --- FORCE REPAINT OF ALL GRADIENTS (fixes grey SVG + missing background/text gradients) ---
if (!REDUCE) {
  setTimeout(() => {
    // Toggle a zero-impact style on the root to force a full layer rebuild
    document.documentElement.style.transform = 'translateZ(0)';
    // Force layout flush
    void document.documentElement.offsetHeight;
    // Remove it – the paint will stick
    document.documentElement.style.transform = '';
  }, 300);
}

// Global error handler to catch any uncaught exceptions
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error || e.message);
});

})();
