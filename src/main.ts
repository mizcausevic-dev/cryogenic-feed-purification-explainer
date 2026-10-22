import './style.css'

const TOTAL = 1020, FPS = 30
const C = { bg:'#0B1019', mat:'#344257', mat2:'#263449', line:'#5b6f8c', bone:'#E8EEF6', mut:'#8fa0b5', cyan:'#00E5FF', gold:'#FFD166', violet:'#9D4EDD', red:'#ff5d73' }

const chapters = [
  { start:0,   end:149,  time:'0–5s',   title:'Reveal the purification assembly', desc:'Compressed feed approaches two adsorbent vessels upstream of the cold box. One vessel is shown on stream. The other is shown in a separate state. Vessel count and arrangement are conceptual. Plants vary.' },
  { start:150, end:299,  time:'5–10s',  title:'Remove selected water and CO₂', desc:'Sectional close-up. Water and carbon dioxide are preferentially held on adsorbent surfaces inside the bed while the bulk gas passes. Breakthrough is a limit, not a guarantee. No total-removal claim is made.' },
  { start:300, end:509,  time:'10–17s', title:'Track the purified feed', desc:'Cyan follows the primary causal pathway toward heat exchange and the cold box. Gold marks energy exchange. Violet marks valve and cycle control. Inputs, outputs, and control stay visually separate.' },
  { start:510, end:749,  time:'17–25s', title:'Regeneration, shown conceptually', desc:'The off-stream vessel is regenerated as a concept only: a heated or purge stream in reverse direction helps release held contaminants to a waste outlet. No recipe, temperature, pressure, flow, or timing is specified. Adsorbents and cycles vary.' },
  { start:750, end:1019, time:'25–34s', title:'Protect downstream cold equipment', desc:'Pull back to the system. Removing freeze-prone water and CO₂ before deep cooling reduces a known freeze-out and blockage pathway in narrow low-temperature passages. Residual risk, losses, and uncertainty remain visible. This is a mechanism, not a safety certification.' },
]
const chapOf = (f:number)=> chapters.findIndex(c=>f>=c.start&&f<=c.end)

const clamp=(v:number,a=0,b=1)=>Math.max(a,Math.min(b,v))
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
const ease=(t:number)=>{t=clamp(t);return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
const seg=(f:number,a:number,b:number)=>ease(clamp((f-a)/(b-a)))
function rng(seed:number){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

document.querySelector('#app')!.innerHTML = `
<header class="top">
  <div class="eyebrow">Industrial Gases &amp; Cryogenics · Anatomy in Motion · 014</div>
  <h1>Cryogenic feed purification, <em>explained in motion.</em></h1>
  <p class="lede">Before air gets cold enough to separate, selected water and carbon dioxide have to come out. This 34-second, code-driven explainer follows that one job: adsorb, advance, regenerate conceptually, and protect the cold box. Conceptual schematic. No invented dimensions, settings, or efficiencies.</p>
  <div class="meta">
    <span class="chip"><b>1,020</b> frames</span><span class="chip"><b>30</b> fps</span><span class="chip"><b>34s</b> runtime</span>
    <span class="chip">Canvas 2D · deterministic frame function</span><span class="chip">Qualitative graphs only</span>
    <span class="chip">Reference: Air Products, cryogenic nitrogen plant</span>
  </div>
</header>

<main class="stage-wrap">
  <section class="stage" aria-label="Animation stage">
    <canvas id="cv" width="1280" height="720"></canvas>
    <div class="hud"><span id="hudChap">CH 1 / 5</span><span id="hudFrame">FRAME 0000 / 1019</span></div>
    <div class="controls">
      <button class="primary" id="play">Pause</button>
      <button id="restart">Restart</button>
      <input type="range" id="scrub" min="0" max="1019" value="0" aria-label="Scrub frames"/>
      <select id="speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select>
      <button id="stepB">−1 frame</button><button id="stepF">+1 frame</button>
      <button id="labels" class="on">Labels</button>
      <div class="framebox"><b id="fnum">0000</b> · <span id="tcode">0.00s</span><br/><span id="cname"></span></div>
    </div>
  </section>
  <nav class="chapters" id="chapters"></nav>

  <div class="grid">
    <article class="card">
      <h2 id="chapTitle"></h2><p id="chapDesc"></p>
      <h3>How to read this film</h3>
      <p>Every frame is drawn by one deterministic function, <code>render(frame)</code>. Scrubbing to the same frame always returns the same image. That matters for review: a label, a valve state, or a particle position can be cited by frame number and checked.</p>
      <p>Materials stay neutral. Color is an explanatory overlay, not literal emission. Feed moves left to right. Waste leaves separately. Nothing in the geometry is a product drawing.</p>
      <div class="note"><strong>Technical limit.</strong> Adsorbents and cycles vary by plant and duty. This film shows no regeneration recipe and guarantees no total contaminant removal. It shows the mechanism and the reason the step sits upstream of deep cooling.</div>
      <h3>Product definition, in one screen</h3>
      <div class="kpis">
        <div class="kpi"><b>1. What</b><span>A frame-accurate motion explainer of feed purification before cryogenic separation.</span></div>
        <div class="kpi"><b>2. Who</b><span>Plant engineers, operators in training, technical buyers, and students of industrial gases.</span></div>
        <div class="kpi"><b>3. Why it wins</b><span>It isolates one causal chain and labels only what each scene needs. No decorative fog.</span></div>
        <div class="kpi"><b>4. Structure</b><span>Five chapters: reveal, adsorb, track, regenerate, protect. One canvas, one timeline.</span></div>
        <div class="kpi"><b>5. Discovery</b><span>Search and answer engines via semantic HTML, schema, and a standalone Medium article.</span></div>
        <div class="kpi"><b>6. Engagement</b><span>Scrub, step frame by frame, jump by chapter, toggle labels. The reader drives inspection.</span></div>
        <div class="kpi"><b>7. Conversion</b><span>End card routes to a technical briefing request. No form collects plant or safety data.</span></div>
        <div class="kpi"><b>8. Revenue</b><span>Reusable explainer system for industrial clients. One engine, many mechanisms.</span></div>
        <div class="kpi"><b>9. Launch</b><span>Static build on GitHub Pages. No backend, no secrets, no personal data.</span></div>
      </div>
      <p style="margin-top:12px"><strong style="color:var(--bone)">10. After launch:</strong> add measured plant data only where a client supplies it, replace qualitative insets with cited datasets, and version every change by frame range.</p>
    </article>
    <aside class="card">
      <h2>Legend</h2>
      <div class="legend">
        <div class="leg"><span class="sw" style="background:${C.cyan}"></span> Primary transport or signal (purified feed path)</div>
        <div class="leg"><span class="sw" style="background:${C.gold}"></span> Energy or actuation (cooling duty, regeneration heat/purge)</div>
        <div class="leg"><span class="sw" style="background:${C.violet}"></span> Control or state (valves, cycle switching)</div>
        <div class="leg"><span class="sw" style="background:${C.mat}"></span> Neutral physical material (vessels, piping, cold box)</div>
        <div class="leg"><span class="sw" style="background:${C.bone}"></span> ○ water (shape-coded) &nbsp; ◆ carbon dioxide (shape-coded)</div>
      </div>
      <h3>Accounting kept visible</h3>
      <ul>
        <li>Mass: feed in = purified feed out + held contaminants + regeneration waste out. Held inventory rises on stream and falls in regeneration.</li>
        <li>Energy: gold appears only where duty is exchanged. Nothing glows without a source.</li>
        <li>State: violet appears only at valves and cycle control. A vessel is never shown in two states at once.</li>
      </ul>
      <h3>What this is not</h3>
      <ul><li>Not a certified design or simulation result.</li><li>Not operating instructions for hazardous equipment.</li><li>Not a claim about a specific commercial plant.</li><li>Not to scale. Scale changes are labeled on screen.</li></ul>
      <h3>Reference scope</h3>
      <p>Air Products describes cryogenic nitrogen generation and on-site supply at <a href="https://www.airproducts.com/supply-modes/gen-gas-on-site/onsite-nitrogen-generation/cryogenic-nitrogen-plant" target="_blank" rel="noreferrer">airproducts.com</a>. That page supports the underlying process context. Camera, palette, cutaways, and timing here are original illustration.</p>
    </aside>
  </div>
</main>
<footer class="foot">Built as a single deterministic canvas film. Frame index 0 to 1019 at 30 fps. Time compression and slow motion are labeled where used. Graphs are qualitative schematics, not measured data. End state is a stable system overview by design.<br/>Kinetic Gain LLC · Industrial Gases &amp; Cryogenics series · Repurposes to any pre-treatment mechanism: drying, filtration, guard beds, membranes, or thermal-swing cycles in other verticals.</footer>`

const cv = document.getElementById('cv') as HTMLCanvasElement
const ctx = cv.getContext('2d')!
let frame = 0, playing = true, speed = 1, showLabels = true, last = performance.now(), acc = 0

const chapNav = document.getElementById('chapters')!
chapters.forEach((c,i)=>{ const b=document.createElement('button'); b.className='chapter'; b.innerHTML=`<small>CH ${i+1} · FR ${c.start}–${c.end} · ${c.time}</small><strong>${c.title}</strong>`; b.onclick=()=>{frame=c.start; sync()}; chapNav.appendChild(b) })

function label(x:number,y:number,text:string,sub='',color=C.bone,align:CanvasTextAlign='left'){
  if(!showLabels) return
  ctx.save(); ctx.font='600 15px "Space Grotesk",sans-serif'; ctx.fillStyle=color; ctx.textAlign=align
  ctx.fillText(text,x,y); if(sub){ctx.font='12px "Space Grotesk",sans-serif'; ctx.fillStyle=C.mut; ctx.fillText(sub,x,y+17)} ctx.restore()
}
function leader(x1:number,y1:number,x2:number,y2:number){ if(!showLabels)return; ctx.save(); ctx.strokeStyle='rgba(232,238,246,.35)'; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.restore() }
function pipe(x1:number,y1:number,x2:number,y2:number,color=C.mat,w=14){
  ctx.save(); ctx.strokeStyle=C.line; ctx.lineWidth=w+5; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  ctx.strokeStyle=color; ctx.lineWidth=w; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
  ctx.strokeStyle='rgba(255,255,255,.14)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x1,y1-3); ctx.lineTo(x2,y2-3); ctx.stroke(); ctx.restore()
}
function flowDots(x1:number,y:number,x2:number,f:number,n:number,color:string,spd=1){
  ctx.save(); for(let i=0;i<n;i++){ const t=((f*0.004*spd + i/n)%1); const x=lerp(x1,x2,t); ctx.globalAlpha=.35+.65*Math.sin(t*Math.PI); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y+Math.sin(t*9+i)*2,3.2,0,7); ctx.fill() } ctx.restore()
}
function arrow(x:number,y:number,dir:1|-1,color:string,s=1){
  ctx.save(); ctx.translate(x,y); ctx.scale(dir*s,s); ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(-6,-6); ctx.lineTo(-6,6); ctx.closePath(); ctx.fill(); ctx.restore()
}
function vessel(x:number,y:number,w:number,h:number,name:string,state:string,active:boolean,regen=false){
  ctx.save()
  const g=ctx.createLinearGradient(x,y,x+w,y); g.addColorStop(0,'#2a3850'); g.addColorStop(.5,C.mat); g.addColorStop(1,'#222f45')
  ctx.fillStyle=g; ctx.strokeStyle=active?C.cyan:regen?C.gold:C.line; ctx.lineWidth=active||regen?2.5:1.5
  ctx.beginPath(); ctx.roundRect(x,y,w,h,26); ctx.fill(); ctx.stroke()
  // bed
  const r=rng(7); ctx.save(); ctx.beginPath(); ctx.roundRect(x+10,y+34,w-20,h-68,18); ctx.clip()
  ctx.fillStyle='#1b2740'; ctx.fillRect(x+10,y+34,w-20,h-68)
  for(let i=0;i<110;i++){ const bx=x+16+r()*(w-32), by=y+42+r()*(h-84); ctx.fillStyle=`rgba(120,145,180,${.35+r()*.4})`; ctx.beginPath(); ctx.arc(bx,by,3.4,0,7); ctx.fill() }
  ctx.restore()
  // state band
  ctx.fillStyle=active?C.cyan:regen?C.gold:C.violet; ctx.globalAlpha=.9; ctx.fillRect(x+10,y+h-24,w-20,8); ctx.globalAlpha=1
  ctx.font='700 13px "JetBrains Mono",monospace'; ctx.fillStyle=C.bone; ctx.textAlign='center'; ctx.fillText(name,x+w/2,y+22)
  ctx.font='11px "JetBrains Mono",monospace'; ctx.fillStyle=C.mut; ctx.fillText(state,x+w/2,y+h-32)
  ctx.restore()
}
function valve(x:number,y:number,open:boolean){
  ctx.save(); ctx.translate(x,y); ctx.fillStyle='#1a2740'; ctx.strokeStyle=C.violet; ctx.lineWidth=2
  ctx.beginPath(); ctx.arc(0,0,13,0,7); ctx.fill(); ctx.stroke()
  ctx.strokeStyle=C.violet; ctx.beginPath(); if(open){ctx.moveTo(-7,-7);ctx.lineTo(7,7)}else{ctx.moveTo(-7,7);ctx.lineTo(7,-7)} ctx.stroke(); ctx.restore()
}
function coldBox(x:number,y:number,w:number,h:number,f:number){
  ctx.save(); const g=ctx.createLinearGradient(x,y,x,y+h); g.addColorStop(0,'#2c3c58'); g.addColorStop(1,'#1c2942')
  ctx.fillStyle=g; ctx.strokeStyle=C.line; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect(x,y,w,h,14); ctx.fill(); ctx.stroke()
  ctx.strokeStyle='rgba(0,229,255,.5)'; ctx.lineWidth=2
  for(let i=0;i<4;i++){ const yy=y+34+i*30; ctx.beginPath(); for(let xx=0;xx<=w-36;xx+=6){ const px=x+18+xx, py=yy+Math.sin(xx*.09+i)*5; xx===0?ctx.moveTo(px,py):ctx.lineTo(px,py)} ctx.stroke() }
  ctx.font='700 13px "JetBrains Mono",monospace'; ctx.fillStyle=C.bone; ctx.textAlign='center'; ctx.fillText('COLD BOX',x+w/2,y+20)
  ctx.font='10px "JetBrains Mono",monospace'; ctx.fillStyle=C.mut; ctx.fillText('heat exchange +',x+w/2,y+h-22); ctx.fillText('low-temperature separation',x+w/2,y+h-9)
  // frost guard indicator
  const prot = f>=750 ? seg(f,750,860) : 0
  if(f>=750){ ctx.fillStyle=`rgba(0,229,255,${.25+.5*prot})`; ctx.fillRect(x+14,y+h-42,(w-28)*prot,5) }
  ctx.restore()
}
function inset(x:number,y:number,w:number,h:number,title:string,curve:(t:number)=>number,color:string,prog:number){
  ctx.save(); ctx.fillStyle='rgba(10,16,28,.92)'; ctx.strokeStyle=C.line; ctx.beginPath(); ctx.roundRect(x,y,w,h,12); ctx.fill(); ctx.stroke()
  ctx.font='700 11px "JetBrains Mono",monospace'; ctx.fillStyle=C.bone; ctx.fillText(title,x+12,y+20)
  ctx.font='10px "JetBrains Mono",monospace'; ctx.fillStyle=C.gold; ctx.fillText('QUALITATIVE · NOT MEASURED',x+12,y+36)
  ctx.strokeStyle='rgba(255,255,255,.2)'; ctx.beginPath(); ctx.moveTo(x+14,y+h-20); ctx.lineTo(x+w-12,y+h-20); ctx.moveTo(x+14,y+h-20); ctx.lineTo(x+14,y+46); ctx.stroke()
  ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.beginPath()
  for(let i=0;i<=60*prog;i++){ const t=i/60, px=x+14+t*(w-28), py=(y+h-20)-curve(t)*(h-72); i===0?ctx.moveTo(px,py):ctx.lineTo(px,py) } ctx.stroke()
  ctx.font='10px "Space Grotesk",sans-serif'; ctx.fillStyle=C.mut; ctx.fillText('time →',x+w-52,y+h-6)
  ctx.restore()
}
function banner(text:string,sub:string,a:number){
  ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(7,10,16,.78)'; ctx.strokeStyle=C.line
  const w=ctx.measureText(text).width+340; ctx.beginPath(); ctx.roundRect(640-w/2,596,w,64,12); ctx.fill(); ctx.stroke()
  ctx.font='700 17px "Space Grotesk",sans-serif'; ctx.fillStyle=C.bone; ctx.textAlign='center'; ctx.fillText(text,640,624)
  ctx.font='12px "Space Grotesk",sans-serif'; ctx.fillStyle=C.mut; ctx.fillText(sub,640,646); ctx.restore()
}

function camera(f:number){
  if(f<150){ const t=seg(f,20,149); return {s:lerp(1,1.22,t), x:lerp(640,520,t), y:360} }
  if(f<300) return {s:1.95, x:365, y:345}
  if(f<510){ const t=seg(f,300,509); return {s:1.3, x:lerp(520,880,t), y:340} }
  if(f<750) return {s:1.75, x:610, y:345}
  const t=seg(f,750,900); return {s:lerp(1.45,1,t), x:lerp(640,640,t), y:360}
}

function world(f:number){
  const ch = chapOf(f)
  // pipes backbone
  pipe(70,360,238,360); pipe(412,360,478,360); pipe(652,360,742,360); pipe(742,360,742,360)
  pipe(880,360,1010,360,C.mat,14)
  pipe(478,300,478,220,C.mat,9); pipe(478,220,652,220,C.mat,9) // cross tie conceptual
  // vessels
  const aActive = ch!==3, bRegen = ch===3
  vessel(238,205,174,310,'VESSEL A', aActive?'ON STREAM · ADSORBING':'OFF STREAM', aActive && ch!==3)
  vessel(478,205,174,310,'VESSEL B', bRegen?'REGENERATING · CONCEPTUAL':'STANDBY / OTHER STATE', false, bRegen)
  coldBox(880,205,250,310,f)
  // heat exchanger block between B and cold box
  ctx.save(); ctx.fillStyle='#22314c'; ctx.strokeStyle=C.line; ctx.beginPath(); ctx.roundRect(742,292,138,136,12); ctx.fill(); ctx.stroke()
  ctx.font='700 11px "JetBrains Mono",monospace'; ctx.fillStyle=C.bone; ctx.textAlign='center'; ctx.fillText('MAIN HEAT',820,318); ctx.fillText('EXCHANGER',820,332)
  ctx.strokeStyle=C.gold; ctx.lineWidth=2; for(let i=0;i<3;i++){ctx.beginPath(); ctx.arc(820,378,12+i*11,Math.PI*.15,Math.PI*.85); ctx.stroke()} ctx.restore()
  // valves
  valve(225,360,true); valve(465,360,ch>=2); valve(665,360,true); valve(742,292,false)
  // flows by chapter
  if(ch===0){ flowDots(70,360,880,f,16,C.cyan); if(f>60) flowDots(70,360,238,f,6,'#E8EEF6',.7) }
  if(ch===1){
    // contaminants entering A and sticking
    const r=rng(42)
    for(let i=0;i<26;i++){ const px=250+r()*0, py=0; void px; void py }
    for(let i=0;i<30;i++){
      const rr=rng(100+i); const bx=258+rr()*134, by=250+rr()*210, delay=i/30
      const t=clamp(seg(f,150,290)-delay*.55)
      const sx=lerp(90,bx,t), sy=lerp(360,by,t*.9)
      ctx.save(); ctx.fillStyle= i%2? C.bone:C.gold; ctx.globalAlpha=.9
      if(i%2){ ctx.beginPath(); ctx.arc(sx,sy,4,0,7); ctx.fill() } else { ctx.translate(sx,sy); ctx.rotate(.78); ctx.fillRect(-4,-4,8,8) }
      ctx.restore()
    }
    flowDots(412,360,478,f,5,C.cyan)
    label(250,168,'ADSORBENT BED (SECTION)','porous solid · surface capture, conceptual',C.bone)
    leader(325,180,325,205)
    label(70,300,'FEED IN','carries ○ H₂O + ◆ CO₂',C.bone); label(430,545,'PURIFIED FEED OUT','fewer ○ ◆ shown',C.cyan)
  }
  if(ch===2){ flowDots(70,360,1010,f,22,C.cyan,1.4); arrow(700,345,1,C.cyan); arrow(950,345,1,C.cyan)
    ctx.save(); ctx.strokeStyle=C.violet; ctx.setLineDash([5,5]); ctx.beginPath(); ctx.moveTo(465,347); ctx.lineTo(465,250); ctx.lineTo(610,250); ctx.stroke(); ctx.restore()
    label(500,238,'CYCLE CONTROL','valve state, not a recipe',C.violet)
    label(760,272,'ENERGY EXCHANGE','gold = duty, not temperature',C.gold)
  }
  if(ch===3){
    // reverse gold purge through B + waste out top
    flowDots(652,430,478,f,10,C.gold,-1 as unknown as number)
    for(let i=0;i<14;i++){ const t=((f*.006+i/14)%1); const x=lerp(565,700,t), y=lerp(430,180,t); ctx.save(); ctx.fillStyle=i%2?C.bone:C.gold; ctx.globalAlpha=1-t*.4; if(i%2){ctx.beginPath();ctx.arc(x,y,4,0,7);ctx.fill()}else{ctx.translate(x,y);ctx.rotate(.78);ctx.fillRect(-4,-4,8,8)} ctx.restore() }
    arrow(560,455,-1,C.gold); label(690,165,'TO WASTE / REGEN OUTLET','held ○ ◆ released, conceptual',C.gold)
    label(478,168,'VESSEL B · REGENERATION (CONCEPT)','reverse purge shown · no settings given',C.gold)
    inset(880,80,330,190,'HELD INVENTORY IN B', t=>Math.pow(t,1.4), C.gold, seg(f,530,720))
  }
  if(ch===4){
    flowDots(70,360,1010,f,18,C.cyan)
    label(880,168,'DOWNSTREAM PROTECTION','freeze-prone species reduced upstream',C.cyan); leader(980,180,980,205)
    inset(70,70,330,180,'FREEZE-OUT RISK PATHWAY', t=>1-Math.exp(-3*t), C.cyan, seg(f,770,900))
    if(f>880){ ctx.save(); ctx.fillStyle='rgba(255,93,115,.12)'; ctx.strokeStyle=C.red; ctx.beginPath(); ctx.roundRect(880,540,250,54,10); ctx.fill(); ctx.stroke()
      ctx.font='12px "Space Grotesk",sans-serif'; ctx.fillStyle='#ffb3bc'; ctx.textAlign='center'; ctx.fillText('Residual risk remains: breakthrough, upset,',1005,562); ctx.fillText('instrument error. No guarantee stated.',1005,580); ctx.restore() }
  }
  // inlet / outlet labels global
  if(ch!==1){ label(70,330,'FEED IN','compressed air, conceptual',C.bone); label(1015,330,'TO SEPARATION','inside cold box',C.cyan) }
  label(238,545,'UPSTREAM OF COLD BOX','purification sits before deep cooling',C.mut)
}

function render(f:number){
  ctx.clearRect(0,0,1280,720)
  ctx.fillStyle=C.bg; ctx.fillRect(0,0,1280,720)
  // grid
  ctx.save(); ctx.strokeStyle='rgba(255,255,255,.045)'; ctx.lineWidth=1
  for(let x=0;x<=1280;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,720);ctx.stroke()}
  for(let y=0;y<=720;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1280,y);ctx.stroke()} ctx.restore()

  const cam=camera(f)
  ctx.save(); ctx.translate(640,360); ctx.scale(cam.s,cam.s); ctx.translate(-cam.x,-cam.y)
  world(f); ctx.restore()

  // frame furniture
  const ch=chapOf(f)
  ctx.save(); ctx.font='700 12px "JetBrains Mono",monospace'; ctx.fillStyle=C.cyan; ctx.fillText(`CH ${ch+1}/5 · ${chapters[ch].title.toUpperCase()}`,22,32)
  ctx.font='11px "JetBrains Mono",monospace'; ctx.fillStyle=C.mut; ctx.fillText(`FRAME ${String(f).padStart(4,'0')} / 1019 · ${(f/FPS).toFixed(2)}s · 30 FPS`,22,52)
  ctx.textAlign='right'; ctx.fillStyle=C.mut
  const scaleNote = ch===1?'SCALE: SECTION ENLARGED · NOT TO SCALE': ch===3?'TIME COMPRESSION: CYCLE SHOWN CONCEPTUALLY':'CONCEPTUAL SCHEMATIC · NOT TO SCALE'
  ctx.fillText(scaleNote,1258,32); ctx.fillStyle=C.gold; if(ch===3) ctx.fillText('SLOW / COMPRESSED TIME LABELED',1258,52)
  ctx.restore()
  // progress segments
  ctx.save(); const bw=1236, bx=22, by=692
  chapters.forEach((c,i)=>{ const x=bx+bw*(c.start/1020), w=bw*((c.end-c.start+1)/1020)-4; ctx.fillStyle='rgba(255,255,255,.12)'; ctx.beginPath(); ctx.roundRect(x,by,w,8,4); ctx.fill()
    if(f>=c.start){ ctx.fillStyle= i===ch? C.cyan:C.violet; const p=clamp((f-c.start+1)/(c.end-c.start+1)); ctx.beginPath(); ctx.roundRect(x,by,w*p,8,4); ctx.fill() } })
  ctx.restore()

  if(f<40) banner('WHY PURIFY BEFORE COOLING?','Remove freeze-prone water and CO₂ before narrow cold passages', seg(f,5,35)*(1-seg(f,38,40)+.9))
  if(f>=990){ banner('STABLE SYSTEM OVERVIEW','Purify upstream. Cool downstream. Regenerate the off-stream bed. No total-removal guarantee.', seg(f,990,1010)) }
  syncHud(f)
}

const fnum=document.getElementById('fnum')!, tcode=document.getElementById('tcode')!, cname=document.getElementById('cname')!
const hudF=document.getElementById('hudFrame')!, hudC=document.getElementById('hudChap')!
const scrub=document.getElementById('scrub') as HTMLInputElement
const chapTitle=document.getElementById('chapTitle')!, chapDesc=document.getElementById('chapDesc')!
let lastChap=-1
function syncHud(f:number){
  fnum.textContent=String(f).padStart(4,'0'); tcode.textContent=(f/FPS).toFixed(2)+'s'
  hudF.textContent=`FRAME ${String(f).padStart(4,'0')} / 1019`; const ch=chapOf(f); hudC.textContent=`CH ${ch+1} / 5 · ${chapters[ch].time}`
  if(ch!==lastChap){ lastChap=ch; cname.textContent=chapters[ch].title; chapTitle.textContent=`${ch+1}. ${chapters[ch].title}`; chapDesc.textContent=chapters[ch].desc
    document.querySelectorAll('.chapter').forEach((el,i)=>el.classList.toggle('active',i===ch)) }
  if(document.activeElement!==scrub) scrub.value=String(f)
}
function sync(){ render(Math.floor(frame)) }
document.getElementById('play')!.addEventListener('click',e=>{ playing=!playing; (e.target as HTMLElement).textContent=playing?'Pause':'Play' })
document.getElementById('restart')!.addEventListener('click',()=>{frame=0;sync()})
document.getElementById('stepF')!.addEventListener('click',()=>{playing=false;(document.getElementById('play') as HTMLElement).textContent='Play';frame=(frame+1)%TOTAL;sync()})
document.getElementById('stepB')!.addEventListener('click',()=>{playing=false;(document.getElementById('play') as HTMLElement).textContent='Play';frame=(frame+TOTAL-1)%TOTAL;sync()})
document.getElementById('labels')!.addEventListener('click',e=>{showLabels=!showLabels;(e.target as HTMLElement).classList.toggle('on',showLabels);sync()})
scrub.addEventListener('input',()=>{frame=+scrub.value;sync()})
document.getElementById('speed')!.addEventListener('change',e=>speed=+(e.target as HTMLSelectElement).value)
addEventListener('keydown',e=>{ if(e.code==='Space'){e.preventDefault();document.getElementById('play')!.click()} if(e.key==='ArrowRight'){frame=Math.min(1019,frame+1);sync()} if(e.key==='ArrowLeft'){frame=Math.max(0,frame-1);sync()} })

function loop(now:number){
  const dt=(now-last)/1000; last=now
  if(playing){ acc+=dt*FPS*speed; while(acc>=1){frame=(frame+1)%TOTAL;acc--} sync() }
  requestAnimationFrame(loop)
}
sync(); requestAnimationFrame(loop)
