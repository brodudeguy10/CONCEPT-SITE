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
  // fluted steel bezel (alternating bright / dark facets)
  let flute="";
  for(let i=0;i<90;i++){ const a=(i/90)*Math.PI*2, s=Math.sin(a), c=-Math.cos(a);
    flute+=`<line x1="${(C+s*172).toFixed(1)}" y1="${(C+c*172).toFixed(1)}" x2="${(C+s*183).toFixed(1)}" y2="${(C+c*183).toFixed(1)}" stroke="${i%2?'#595c63':'#f2f4f7'}" stroke-width="2.3" opacity=".6"/>`; }
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

    <!-- polished steel case + fluted bezel -->
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
  var C=280, D=function(a){return a*Math.PI/180;}, F=function(n){return n.toFixed(1);};

  // ---- sunburst ----
  var sun='';
  for(var i=0;i<280;i++){var a=i*(360/280),lt=i%2===0;
    sun+='<line x1="'+F(C+Math.cos(D(a))*15)+'" y1="'+F(C+Math.sin(D(a))*15)+'" x2="'+F(C+Math.cos(D(a))*196)+'" y2="'+F(C+Math.sin(D(a))*196)+'" stroke="'+(lt?'#fff':'#000')+'" stroke-width="1.3" stroke-opacity="'+(lt?0.026:0.05)+'"/>';}

  // ---- machined fluted bezel: fine facets ----
  var flute='', Nf=84;
  for(var f=0;f<Nf;f++){var a0=f*(360/Nf), a1=a0+(360/Nf)*0.86, ri=213, ro=253, lt2=f%2===0;
    flute+='<path d="M '+F(C+Math.cos(D(a0))*ri)+' '+F(C+Math.sin(D(a0))*ri)+' L '+F(C+Math.cos(D(a0))*ro)+' '+F(C+Math.sin(D(a0))*ro)+' L '+F(C+Math.cos(D(a1))*ro)+' '+F(C+Math.sin(D(a1))*ro)+' L '+F(C+Math.cos(D(a1))*ri)+' '+F(C+Math.sin(D(a1))*ri)+' Z" fill="'+(lt2?'#e3e8eb':'#33373a')+'" fill-opacity="'+(lt2?0.42:0.5)+'"/>';}

  // ---- minute track ----
  var tk='';
  for(var m=0;m<60;m++){var ma=m*6-90,five=m%5===0,rO=200,rI=five?186:193;
    tk+='<line x1="'+F(C+Math.cos(D(ma))*rI)+'" y1="'+F(C+Math.sin(D(ma))*rI)+'" x2="'+F(C+Math.cos(D(ma))*rO)+'" y2="'+F(C+Math.sin(D(ma))*rO)+'" stroke="#cfd3c5" stroke-opacity="'+(five?0.92:0.42)+'" stroke-width="'+(five?2:1)+'" stroke-linecap="round"/>';}

  // ---- raised applied indices (SLIMMED) ----
  var idx='';
  for(var h=0;h<12;h++){ if(h===3){continue;}
    var ha=h*30-90, cx=C+Math.cos(D(ha))*166, cy=C+Math.sin(D(ha))*166;
    if(h===0){
      var ux=Math.cos(D(ha)),uy=Math.sin(D(ha)),px=-uy,py=ux;
      var tx=cx-ux*3,ty=cy-uy*3, blx=cx+ux*16+px*10,bly=cy+uy*16+py*10, brx=cx+ux*16-px*10,bry=cy+uy*16-py*10;
      idx+='<polygon points="'+F(tx+2)+','+F(ty+3.5)+' '+F(blx+2)+','+F(bly+3.5)+' '+F(brx+2)+','+F(bry+3.5)+'" fill="#000" opacity="0.6" filter="url(#blur2)"/>';
      idx+='<polygon points="'+F(tx)+','+F(ty)+' '+F(blx)+','+F(bly)+' '+F(brx)+','+F(bry)+'" fill="url(#lume)" stroke="#e7ebed" stroke-width="1.5" class="lume"/>';
    } else {
      idx+='<g transform="rotate('+(ha+90)+' '+F(cx)+' '+F(cy)+')">';
      idx+='<rect x="'+F(cx-5.5)+'" y="'+F(cy-10)+'" width="11" height="31" rx="2.5" fill="#000" opacity="0.5" filter="url(#blur2)"/>';
      idx+='<rect x="'+F(cx-5.5)+'" y="'+F(cy-14)+'" width="11" height="30" rx="2.5" fill="url(#idxMetal)"/>';
      idx+='<rect x="'+F(cx-3.5)+'" y="'+F(cy-12)+'" width="7" height="26" rx="1.8" fill="url(#lume)" class="lume"/>';
      idx+='<rect x="'+F(cx-5.5)+'" y="'+F(cy-14)+'" width="11" height="2.2" rx="1.1" fill="#fff" fill-opacity="0.75"/>';
      idx+='</g>';
    }
  }

  // ---- faceted dauphine/sword hands (slim) ----
  function sword(L, hw, baseY, lumeF){
    var tipY=C-L, shY=C-L*0.52, bY=C+baseY;
    var left ='M '+C+' '+F(tipY)+' L '+F(C-hw)+' '+F(shY)+' L '+F(C-hw*0.4)+' '+F(bY)+' L '+C+' '+F(bY)+' Z';
    var right='M '+C+' '+F(tipY)+' L '+F(C+hw)+' '+F(shY)+' L '+F(C+hw*0.4)+' '+F(bY)+' L '+C+' '+F(bY)+' Z';
    var s='<path d="'+left+'" fill="url(#handLight)"/><path d="'+right+'" fill="url(#handDark)"/>';
    s+='<line x1="'+C+'" y1="'+F(tipY)+'" x2="'+C+'" y2="'+F(bY)+'" stroke="#ffffff" stroke-opacity="0.55" stroke-width="0.8"/>';
    var lw=hw*lumeF, lTipY=C-L*0.84, lShY=C-L*0.5, lbY=C+baseY*0.2;
    var lume='M '+C+' '+F(lTipY)+' L '+F(C+lw)+' '+F(lShY)+' L '+F(C+lw*0.45)+' '+F(lbY)+' L '+F(C-lw*0.45)+' '+F(lbY)+' L '+F(C-lw)+' '+F(lShY)+' Z';
    s+='<path d="'+lume+'" fill="url(#lume)" class="lume"/>';
    return s;
  }
  var hourHand='<g id="lwHour" transform="rotate(0 280 280)">'+sword(124,7.5,15,0.55)+'</g>';
  var minHand ='<g id="lwMin" transform="rotate(0 280 280)">'+sword(186,5.8,15,0.55)+'</g>';
  var secHand ='<g id="lwSec" transform="rotate(0 280 280)">'
    +'<rect x="278.4" y="92" width="3.2" height="160" fill="#c9472f"/>'
    +'<circle cx="280" cy="150" r="10" fill="none" stroke="#c9472f" stroke-width="3.4"/>'
    +'<circle cx="280" cy="150" r="6.2" fill="url(#lume)" class="lume"/>'
    +'<rect x="276.4" y="290" width="7.2" height="46" rx="3.6" fill="#c9472f"/></g>';

  // ---- crown ----
  var crown='<g transform="translate(548 280)"><rect x="-7" y="-19" width="22" height="38" rx="3" fill="url(#crownG)"/>';
  for(var k=0;k<8;k++){crown+='<rect x="'+F(-6+k*2.65)+'" y="-19" width="1.2" height="38" fill="#2a2d2f" opacity="0.55"/>';}
  crown+='<rect x="-11" y="-10" width="6" height="20" rx="2" fill="url(#crownG)"/></g>';

  var svg=''
  +'<svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" aria-label="Live watch showing the current time">'
  +'<defs>'
    +'<radialGradient id="dialBase" cx="46%" cy="40%" r="66%"><stop offset="0%" stop-color="#2b2d29"/><stop offset="40%" stop-color="#181916"/><stop offset="78%" stop-color="#0a0b09"/><stop offset="100%" stop-color="#040503"/></radialGradient>'
    +'<radialGradient id="dialLight" cx="33%" cy="26%" r="52%"><stop offset="0%" stop-color="#fff" stop-opacity="0.13"/><stop offset="55%" stop-color="#fff" stop-opacity="0.025"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="dialVig" cx="50%" cy="50%" r="50%"><stop offset="64%" stop-color="#000" stop-opacity="0"/><stop offset="92%" stop-color="#000" stop-opacity="0.4"/><stop offset="100%" stop-color="#000" stop-opacity="0.72"/></radialGradient>'
    +'<linearGradient id="caseSteel" x1="0.12" y1="0" x2="0.9" y2="1"><stop offset="0%" stop-color="#f6f8f9"/><stop offset="19%" stop-color="#aeb4b8"/><stop offset="37%" stop-color="#5f656a"/><stop offset="53%" stop-color="#dfe3e6"/><stop offset="71%" stop-color="#787e82"/><stop offset="100%" stop-color="#2d3134"/></linearGradient>'
    +'<radialGradient id="bezelSteel" cx="50%" cy="34%" r="64%"><stop offset="0%" stop-color="#d4d8db"/><stop offset="52%" stop-color="#7c8287"/><stop offset="84%" stop-color="#c6cbce"/><stop offset="100%" stop-color="#3f4346"/></radialGradient>'
    +'<linearGradient id="idxMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#eef2f5"/><stop offset="45%" stop-color="#a9afb3"/><stop offset="100%" stop-color="#777d81"/></linearGradient>'
    +'<radialGradient id="lume" cx="50%" cy="42%" r="66%"><stop offset="0%" stop-color="#eef3df"/><stop offset="100%" stop-color="#bcc79e"/></radialGradient>'
    +'<linearGradient id="handLight" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0%" stop-color="#fafcfd"/><stop offset="55%" stop-color="#d4d9dd"/><stop offset="100%" stop-color="#aab0b4"/></linearGradient>'
    +'<linearGradient id="handDark" x1="0" y1="0" x2="1" y2="0.3"><stop offset="0%" stop-color="#90979b"/><stop offset="50%" stop-color="#6b7175"/><stop offset="100%" stop-color="#44494d"/></linearGradient>'
    +'<radialGradient id="cap" cx="40%" cy="34%" r="66%"><stop offset="0%" stop-color="#f5f7f9"/><stop offset="52%" stop-color="#9ca2a6"/><stop offset="100%" stop-color="#383c3f"/></radialGradient>'
    +'<linearGradient id="crownG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#3d4144"/><stop offset="50%" stop-color="#d2d6d9"/><stop offset="100%" stop-color="#43474a"/></linearGradient>'
    +'<linearGradient id="glassGlow" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.36"/><stop offset="55%" stop-color="#fff" stop-opacity="0.05"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>'
    +'<linearGradient id="sweepG" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="50%" stop-color="#fff" stop-opacity="0.15"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>'
    +'<radialGradient id="arTint" cx="74%" cy="80%" r="46%"><stop offset="0%" stop-color="#6f7bd0" stop-opacity="0.14"/><stop offset="100%" stop-color="#6f7bd0" stop-opacity="0"/></radialGradient>'
    +'<radialGradient id="refl2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff" stop-opacity="0.14"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>'
    +'<filter id="metal" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.085" numOctaves="3" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" result="bump"/><feSpecularLighting in="bump" surfaceScale="3" specularConstant="1" specularExponent="16" lighting-color="#ffffff" result="spec"><fePointLight x="190" y="55" z="190"/></feSpecularLighting><feComposite in="spec" in2="SourceAlpha" operator="in" result="sp"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sp"/></feMerge></filter>'
    +'<filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.7"/></filter>'
    +'<filter id="handShadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="2" dy="3.6" stdDeviation="3" flood-color="#000000" flood-opacity="0.55"/></filter>'
    +'<filter id="lumeOn" x="-130%" y="-130%" width="360%" height="360%"><feGaussianBlur stdDeviation="3.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    +'<filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>'
    +'<clipPath id="dialClip"><circle cx="280" cy="280" r="206"/></clipPath>'
  +'</defs>'

  +'<ellipse cx="282" cy="304" rx="252" ry="252" fill="#000000" opacity="0.6" filter="url(#softShadow)"/>'
  +'<circle cx="280" cy="280" r="268" fill="url(#caseSteel)"/>'
  +'<circle cx="280" cy="280" r="268" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2"/>'
  +'<circle cx="280" cy="280" r="251" fill="#000" opacity="0.5" filter="url(#blur2)"/>'
  +'<circle cx="280" cy="280" r="250" fill="#0a0b09"/>'
  +crown
  +'<circle cx="280" cy="280" r="246" fill="url(#bezelSteel)" filter="url(#metal)"/>'
  +'<g>'+flute+'</g>'
  +'<path d="M 116 116 A 246 246 0 0 1 444 116" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="8" stroke-linecap="round" filter="url(#blur2)"/>'
  +'<path d="M 150 470 A 246 246 0 0 0 470 360" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="5" stroke-linecap="round" filter="url(#blur2)"/>'
  +'<circle cx="280" cy="280" r="210" fill="none" stroke="#000000" stroke-opacity="0.65" stroke-width="4"/>'
  +'<circle cx="280" cy="280" r="207" fill="none" stroke="#000000" stroke-opacity="0.6" stroke-width="10" filter="url(#blur2)"/>'
  +'<circle cx="280" cy="280" r="206" fill="url(#dialBase)"/>'
  +'<g clip-path="url(#dialClip)">'+sun+'<circle cx="280" cy="280" r="206" fill="url(#dialLight)"/><circle cx="280" cy="280" r="206" fill="url(#dialVig)"/></g>'
  +'<g>'+tk+'</g>'
  +'<g>'+idx+'</g>'
  +'<g><rect x="378" y="266" width="36" height="28" rx="2.5" fill="#000" opacity="0.5" transform="translate(2,3)" filter="url(#blur2)"/>'
  +'<rect x="378" y="266" width="36" height="28" rx="2.5" fill="#ece9e2"/>'
  +'<rect x="378" y="266" width="36" height="28" rx="2.5" fill="none" stroke="#cacecf" stroke-width="2"/>'
  +'<rect x="378" y="266" width="36" height="28" rx="2.5" fill="none" stroke="#000" stroke-opacity="0.55" stroke-width="1"/>'
  +'<text id="lwDate" x="396" y="286" text-anchor="middle" font-family="Mulish,system-ui,sans-serif" font-size="19" font-weight="700" fill="#191a18">00</text></g>'
  +'<text x="280" y="162" text-anchor="middle" font-family="Macaria,Georgia,serif" font-size="20" letter-spacing="3.4" fill="#e8ead9">TIMESCAPES</text>'
  +'<text x="280" y="181" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="9" letter-spacing="3.2" fill="#9aa089">AUTOMATIC</text>'
  +'<text x="280" y="396" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="9.5" letter-spacing="3.6" fill="#cfd5c4">SAVEDRA</text>'
  +'<text x="280" y="414" text-anchor="middle" font-family="ui-monospace,Menlo,monospace" font-size="8.5" letter-spacing="3.2" fill="#8f9580">200M · 660FT</text>'
  +'<g filter="url(#handShadow)">'+hourHand+minHand+secHand+'</g>'
  +'<circle cx="280" cy="280" r="13" fill="url(#cap)"/><circle cx="280" cy="280" r="13" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="1"/><circle cx="275" cy="275" r="3.4" fill="#fff" fill-opacity="0.75"/>'
  +'<g clip-path="url(#dialClip)">'
    +'<g id="lwGlare">'
      +'<ellipse cx="188" cy="158" rx="160" ry="126" fill="url(#glassGlow)" transform="rotate(-18 188 158)"/>'
      +'<path d="M 98 248 A 202 202 0 0 1 250 94" fill="none" stroke="#ffffff" stroke-opacity="0.5" stroke-width="7" stroke-linecap="round" filter="url(#blur2)"/>'
      +'<path d="M 112 264 A 202 202 0 0 1 266 110" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="3" stroke-linecap="round" filter="url(#blur2)"/>'
      +'<ellipse cx="372" cy="392" rx="70" ry="48" fill="url(#refl2)" transform="rotate(-18 372 392)"/>'
    +'</g>'
    +'<rect x="-70" y="0" width="120" height="560" fill="url(#sweepG)" class="glass-sweep"/>'
    +'<circle cx="280" cy="280" r="206" fill="url(#arTint)"/>'
    +'<path d="M 372 98 A 206 206 0 0 1 462 282" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="2.5" stroke-linecap="round" filter="url(#blur2)"/>'
  +'</g>'
  +'<circle cx="280" cy="280" r="206" fill="none" stroke="#ffffff" stroke-opacity="0.13" stroke-width="1.5"/>'
  +'</svg>';

  faceEl.innerHTML=svg;
  var hourH=faceEl.querySelector('#lwHour'), minH=faceEl.querySelector('#lwMin'),
      secH=faceEl.querySelector('#lwSec'), dateT=faceEl.querySelector('#lwDate'),
      glare=faceEl.querySelector('#lwGlare');

  /* nudge a repaint once the reveal opacity transition finishes — SVG filters
     can otherwise render stale inside an element that fades in */
  if(!REDUCE){
    var rp=faceEl.closest('[data-reveal]');
    if(rp){
      var rpH=function(e){ if(e.propertyName==='opacity'||e.propertyName==='transform'){ faceEl.getBoundingClientRect(); rp.removeEventListener('transitionend',rpH); } };
      rp.addEventListener('transitionend',rpH);
      setTimeout(function(){ faceEl.getBoundingClientRect(); rp.removeEventListener('transitionend',rpH); },1500);
    }
  }

  /* real-time, 8-beat mechanical sweep */
  function tick(){
    var now=new Date(), ms=REDUCE?0:now.getMilliseconds();
    var mm=now.getMinutes()+now.getSeconds()/60+ms/60000, hh=(now.getHours()%12)+mm/60, sec;
    if(REDUCE){ sec=now.getSeconds(); }
    else { var BPS=8, t=(now.getSeconds()+ms/1000)*BPS, b=Math.floor(t), into=t-b; sec=(b+(1-Math.pow(1-into,3)))/BPS; }
    if(hourH){ hourH.setAttribute('transform','rotate('+(hh*30)+' 280 280)');
               minH.setAttribute('transform','rotate('+(mm*6)+' 280 280)');
               secH.setAttribute('transform','rotate('+(sec*6)+' 280 280)'); }
    if(dateT) dateT.textContent=String(now.getDate()).padStart(2,'0');
    if(chipEl) chipEl.innerHTML='Live · <b>'+now.toLocaleTimeString('en-US',{hour12:false})+'</b>';
    REDUCE?setTimeout(tick,1000):requestAnimationFrame(tick);
  }
  tick();

  /* lume toggle (wired to the existing #lumeToggle button) */
  var lumeOn=false;
  if(toggleEl) toggleEl.addEventListener('click',function(){
    lumeOn=!lumeOn; toggleEl.textContent=lumeOn?'Day':'Lume';
    var ls=faceEl.querySelectorAll('.lume');
    for(var j=0;j<ls.length;j++){
      if(lumeOn){ ls[j].setAttribute('filter','url(#lumeOn)'); ls[j].setAttribute('fill','#c9f5a8'); }
      else { ls[j].removeAttribute('filter'); ls[j].setAttribute('fill','url(#lume)'); }
    }
  });

  /* gentle 3D tilt toward the cursor + glare parallax (kept from your original) */
  if(!REDUCE && FINE){
    var wrap=faceEl.closest('.livewatch')||faceEl, raf=null;
    wrap.addEventListener('pointermove',function(e){
      var r=faceEl.getBoundingClientRect(); if(!r.width) return;
      var dx=clamp((e.clientX-(r.left+r.width/2))/(r.width/2),-1,1),
          dy=clamp((e.clientY-(r.top+r.height/2))/(r.height/2),-1,1);
      if(raf) cancelAnimationFrame(raf);
      raf=requestAnimationFrame(function(){
        faceEl.style.transform='rotateX('+(-dy*9).toFixed(2)+'deg) rotateY('+(dx*9).toFixed(2)+'deg)';
        if(glare) glare.setAttribute('transform','translate('+(-dx*22).toFixed(1)+' '+(-dy*22).toFixed(1)+')');
      });
    });
    wrap.addEventListener('pointerleave',function(){ if(raf) cancelAnimationFrame(raf); faceEl.style.transform=''; if(glare) glare.setAttribute('transform','translate(0 0)'); });
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
      <a class="btn btn--gold" href="${EBAY}" target="_blank" rel="noopener">View on eBay ↗</a>
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
  document.title=`${w.brand} ${w.name} · Timescapes`;
  const more=ourWatches().filter(x=>x.id!==w.id).slice(0,3);
  const soldTag = w.sold ? '<span class="sold-tag">Sold</span>' : '';
  const availDD = w.sold ? '<dd class="dd-sold">Sold</dd>' : '<dd class="dd-stock">Available now</dd>';
 const contactHref = `owner.html?watch=${encodeURIComponent(w.brand+' '+w.name+' — Ref. '+w.ref)}#contact`;
  const cta = w.sold
    ? `<a class="btn btn--ghost" href="inventory.html">See what's in stock →</a><a class="btn btn--ghost" href="${contactHref}">Ask about a similar piece</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`
    : `<a class="btn btn--gold" href="${w.ebay}" target="_blank" rel="noopener">See it on eBay ↗</a><a class="btn btn--ghost" href="${contactHref}">Contact about this watch</a><button class="btn btn--ghost" id="openGallery">View gallery</button>`;
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
