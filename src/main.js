const TOTAL=1020, FPS=30, W=1280, H=720;
const canvas=document.getElementById('stage'), ctx=canvas.getContext('2d');
const scrub=document.getElementById('scrub'), tc=document.getElementById('tc'), phaseLabel=document.getElementById('phaseLabel'), detail=document.getElementById('phaseDetail');
const PHASES=[
 {id:1,start:0,end:149,title:'Reveal',sub:'0–5s · Frames 0–149',head:'Establish the full assembly',body:'Two adsorbent vessels sit upstream of the cold box. One is on feed. One is in a different state. The cold box is downstream and cold. Nothing in this phase claims a geometry. It establishes order: purify first, cool second.',bullets:['Feed enters from the left (cyan transport).','Vessels are neutral material. Color is an explanatory overlay, not emission.','Camera makes a measured three-quarter push toward the active vessel.']},
 {id:2,start:150,end:299,title:'Remove H₂O + CO₂',sub:'5–10s · Frames 150–299',head:'Sectional close-up: what the bed holds',body:'Inside the active vessel, water and carbon dioxide are retained on the adsorbent while the bulk gas passes. The drawing is a cutaway, not a material specification. Bed depth, media, and cycle settings vary and are not shown.',bullets:['White / pale dots: H₂O and CO₂ approaching the bed.','Gold hold markers: retained on the solid phase.','Cyan stream leaving: depleted in those species, not certified pure.']},
 {id:3,start:300,end:509,title:'Track purified feed',sub:'10–17s · Frames 300–509',head:'Follow the causal pathway to the cold box',body:'The camera tracks the purified stream along the primary pathway. Inputs, outputs, and control overlays stay visually distinct so the viewer does not confuse transport (cyan) with actuation (gold) or state (violet).',bullets:['Cyan: mass transport. Gold: valve actuation moments.','Violet: control / state signal, not a flow.','No flow rate, pressure, or temperature is numbered. None was supplied.']},
 {id:4,start:510,end:749,title:'Regeneration (separate state)',sub:'17–25s · Frames 510–749',head:'The off-line vessel resets. Conceptually.',body:'While one vessel adsorbs, the other can be regenerated: a warm purge flows in reverse and carries desorbed water and CO₂ out to a separate outlet. This is a state concept, not a recipe. No temperature, purge rate, or timing instruction is given or implied.',bullets:['Gold wash: energy input (qualitative). Reverse arrows: purge direction.','Violet badge: vessel state changed. The two vessels are never shown doing the same job at once.','Inset is qualitative. The bed unloads. It does not prove a regenerated endpoint.']},
 {id:5,start:750,end:1019,title:'Protect downstream',sub:'25–34s · Frames 750–1019',head:'Pull back: why the cold box cares',body:'At low temperature, residual water and CO₂ would freeze out and restrict or damage downstream passages. Removing them upstream protects that equipment. The film ends on a stable overview with limits still visible, because protection is conditional on the bed state, not a permanent guarantee.',bullets:['Ghost outline (left of cold box): what freeze-out would threaten, shown as risk, not as an event.','Purified path stays open. Retained species stay accounted for.','End frame holds. No claim of total removal. No operating instruction.']},
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const phaseOf=f=>PHASES.find(p=>f>=p.start&&f<=p.end)||PHASES[0];
const local=(f,p)=>clamp((f-p.start)/(p.end-p.start),0,1);
const pseudo=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};

// ---------- drawing helpers ----------
function rr(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function label(x,y,text,color='#e8eef6',align='left'){ if(!document.getElementById('showLabels').checked)return; ctx.save();ctx.font='600 13px "Space Grotesk",sans-serif';const w=ctx.measureText(text).width+16;ctx.fillStyle='rgba(6,12,22,.88)';ctx.strokeStyle='#2b3d5e';rr(align==='left'?x:x-w,y-14,w,24,7);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.textAlign='left';ctx.fillText(text,(align==='left'?x:x-w)+8,y+3);ctx.restore()}
function leader(x1,y1,x2,y2,color='#5b7294'){ctx.save();ctx.strokeStyle=color;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x1,y1,3,0,7);ctx.fill();ctx.restore()}
function vessel(x,y,w,h,opts={}){const {active=false,regen=false,section=false,fill=0.6}=opts;
 // shell
 ctx.save(); rr(x,y,w,h,42); ctx.fillStyle='#344257';ctx.fill();ctx.strokeStyle=active?'#00E5FF':regen?'#9D4EDD':'#5b7294';ctx.lineWidth=active||regen?3:2;ctx.stroke();ctx.clip();
 // interior bed
 const bedY=y+h*0.28, bedH=h*0.52;
 ctx.fillStyle=section?'#22314a':'#26354d';ctx.fillRect(x,bedY,w,bedH);
 // adsorbent grains deterministic
 for(let i=0;i<110;i++){const gx=x+8+pseudo(i*3+ (active?1:9))*(w-16), gy=bedY+8+pseudo(i*7+2)*(bedH-16);ctx.fillStyle=i%5?'#425a78':'#546e8e';ctx.beginPath();ctx.arc(gx,gy,3.2,0,7);ctx.fill()}
 // retained species (gold holds) appear with fill level
 const holds=Math.floor(90*fill);
 for(let i=0;i<holds;i++){const gx=x+10+pseudo(i*11+5)*(w-20), gy=bedY+10+pseudo(i*13+8)*(bedH-20);ctx.fillStyle='#FFD166';ctx.beginPath();ctx.arc(gx,gy,2.4,0,7);ctx.fill()}
 // head spaces
 ctx.fillStyle='rgba(0,229,255,.08)';ctx.fillRect(x,y,w,h*0.28);ctx.fillStyle='rgba(0,229,255,.10)';ctx.fillRect(x,y+h*0.8,w,h*0.2);
 if(section){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.setLineDash([6,6]);ctx.strokeRect(x+8,bedY,w-16,bedH);ctx.setLineDash([])}
 ctx.restore();
 // caps / nozzles
 ctx.fillStyle='#425a78';ctx.fillRect(x+w/2-10,y-16,20,16);ctx.fillRect(x+w/2-10,y+h,20,16);
 // state badge
 const badge=active?'ADSORBING':regen?'REGENERATING':'STANDBY / SWITCH';
 ctx.save();ctx.font='800 10px "JetBrains Mono",monospace';ctx.fillStyle=active?'#00E5FF':regen?'#c99aff':'#93a3b8';ctx.textAlign='center';ctx.fillText(badge,x+w/2,y+h+36);ctx.restore();
}
function pipe(x1,y1,x2,y2,color='#00E5FF',wdt=8,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle='#22314a';ctx.lineWidth=wdt+6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=wdt;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore()}
function valve(x,y,angle=0,gold=false){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=gold?'#FFD166':'#425a78';ctx.strokeStyle='#0B1019';ctx.beginPath();ctx.moveTo(-13,-9);ctx.lineTo(13,9);ctx.lineTo(13,-9);ctx.lineTo(-13,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.save();ctx.fillStyle=gold?'#FFD166':'#7f95b0';ctx.fillRect(x-2,y-22,4,14);ctx.beginPath();ctx.arc(x,y-24,6,0,7);ctx.fill();ctx.restore()}
function particle(x,y,r,color){ctx.save();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore()}
function coldBox(x,y,w,h,protectedLevel=1){ctx.save();rr(x,y,w,h,18);ctx.fillStyle='#1a2639';ctx.fill();ctx.strokeStyle='#5b7294';ctx.lineWidth=2;ctx.stroke();ctx.clip();
 // exchanger fins
 for(let i=0;i<9;i++){const fx=x+22+i*((w-44)/8);ctx.strokeStyle=i%2?'#2e435f':'#3b5578';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(fx,y+24);ctx.lineTo(fx,y+h-70);ctx.stroke()}
 // cold gradient
 const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'rgba(0,229,255,.16)');g.addColorStop(1,'rgba(0,229,255,.02)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
 // protected passage
 ctx.strokeStyle=`rgba(0,229,255,${0.35+0.5*protectedLevel})`;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+18,y+h-42);ctx.lineTo(x+w-18,y+h-42);ctx.stroke();
 ctx.restore();ctx.save();ctx.font='800 11px "JetBrains Mono",monospace';ctx.fillStyle='#9fdfff';ctx.fillText('COLD BOX',x+14,y+22);ctx.font='600 10px "JetBrains Mono",monospace';ctx.fillStyle='#7f95b0';ctx.fillText('low-temperature equipment',x+14,y+38);ctx.restore()}
function arrow(x1,y1,x2,y2,color){ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-10*Math.cos(a-0.45),y2-10*Math.sin(a-0.45));ctx.lineTo(x2-10*Math.cos(a+0.45),y2-10*Math.sin(a+0.45));ctx.closePath();ctx.fill();ctx.restore()}
function inset(f,p){ if(!document.getElementById('showInset').checked)return; const x=910,y=512,w=330,h=150;ctx.save();rr(x,y,w,h,12);ctx.fillStyle='rgba(6,12,22,.92)';ctx.fill();ctx.strokeStyle='#2b3d5e';ctx.stroke();ctx.fillStyle='#FFD166';ctx.font='800 10px "JetBrains Mono",monospace';ctx.fillText('QUALITATIVE INSET · NO UNITS · NOT MEASURED',x+12,y+20);
 ctx.strokeStyle='#3a4f6e';ctx.beginPath();ctx.moveTo(x+18,y+h-22);ctx.lineTo(x+w-14,y+h-22);ctx.moveTo(x+18,y+h-22);ctx.lineTo(x+18,y+34);ctx.stroke();
 ctx.fillStyle='#93a3b8';ctx.font='11px "Space Grotesk"';
 let title='',curve=t=>t;
 if(p.id===2){title='Bed loading rises as H₂O / CO₂ are retained →';curve=t=>1-Math.exp(-2.4*t)}
 if(p.id===3){title='Purified stream proceeds. Bed loading keeps rising slowly →';curve=t=>0.45+0.35*t}
 if(p.id===4){title='Regeneration: bed loading falls as species desorb →';curve=t=>Math.exp(-2.2*t)}
 if(p.id===5){title='Downstream risk falls when upstream removal is working →';curve=t=>Math.exp(-2*t)}
 if(p.id===1){title='System order: purify upstream, cool downstream →';curve=t=>t*0.6}
 ctx.fillText(title,x+12,y+42);
 ctx.strokeStyle=p.id===4?'#9D4EDD':'#00E5FF';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=60;i++){const t=i/60,px=x+18+t*(w-36),py=y+h-22-curve(t)*(h-72);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.stroke();
 // progress dot
 const t=local(f,p),px=x+18+t*(w-36),py=y+h-22-curve(t)*(h-72);particle(px,py,5,'#FFD166');
 ctx.fillStyle='#718198';ctx.font='10px "JetBrains Mono"';ctx.fillText('time in phase →',x+w-110,y+h-6);ctx.save();ctx.translate(x+10,y+h-50);ctx.rotate(-Math.PI/2);ctx.fillText('relative amount →',0,0);ctx.restore();ctx.restore()}

// ---------- main draw ----------
function draw(f){
 const p=phaseOf(f), t=local(f,p);
 ctx.clearRect(0,0,W,H);
 // bg
 const bg=ctx.createRadialGradient(640,340,80,640,340,760);bg.addColorStop(0,'#101b2e');bg.addColorStop(1,'#0B1019');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;for(let x=0;x<W;x+=44){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=44){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

 // camera
 let scale=1, fx=640, fy=360;
 if(p.id===1){scale=lerp(1,1.22,smooth(t));fx=lerp(640,470,smooth(t));fy=360}
 if(p.id===2){scale=lerp(1.22,2.05,smooth(clamp(t*1.4,0,1)));fx=lerp(470,390,smooth(t));fy=360}
 if(p.id===3){scale=1.45;fx=lerp(420,860,smooth(t));fy=350}
 if(p.id===4){scale=lerp(1.5,1.35,smooth(t));fx=590;fy=360}
 if(p.id===5){scale=lerp(1.3,1,smooth(clamp(t*1.6,0,1)));fx=lerp(700,640,smooth(t));fy=360}
 ctx.save();ctx.translate(W/2,H/2);ctx.scale(scale,scale);ctx.translate(-fx,-fy);

 // pipes (layout)
 pipe(50,360,250,360); pipe(250,360,300,300); pipe(250,360,300,430);
 // vessel outlets to manifold
 pipe(505,360,700,360); pipe(700,360,860,360);
 // regeneration vent (violet dashed concept)
 ctx.save();ctx.setLineDash([8,8]);pipe(590,190,590,90,'#9D4EDD',5,.8);ctx.restore();

 // vessels: A left active early, B right
 const aActive = p.id<=3, bRegen = p.id===4;
 vessel(300,180,130,340,{active:aActive&&p.id!==4, section:p.id===2, fill:p.id===1?0.25+0.3*t:p.id===2?0.35+0.5*t:p.id===3?0.85:0.9});
 vessel(505,180,130,340,{active:p.id===5, regen:bRegen, fill:bRegen?0.9-0.65*t:0.3});
 // cold box
 coldBox(860,170,360,380, p.id===5?0.6+0.4*t:0.7);

 // valves gold at actuation moments
 valve(250,360,0,p.id===3&&t>0.1&&t<0.3); valve(700,360,0,p.id===3&&t>0.6&&t<0.8); valve(590,120,Math.PI/2,bRegen);

 // inlet particles
 const showParticles = p.id!==4 || true;
 for(let i=0;i<26;i++){
   const speed = p.id===3? 0.0016:0.0011;
   let prog = ((f*speed)+(pseudo(i)*0.9))%1;
   let x,y,color,r=4;
   const isContam = i%3!==0; // many contaminants in raw feed, fewer after bed
   if(p.id===2){
     // approach bed, contaminants stop in bed
     const px=lerp(70,360,prog), inBed=px>315&&px<425;
     x=px; y=300+ pseudo(i*3)*120 + Math.sin(f*0.05+i)*4;
     if(isContam && px>330){ x=330+pseudo(i*9)*70; y=300+pseudo(i*5)*150; color='#FFD166'; r=3.5; if(prog>0.85){/*held*/} }
     else color='#00E5FF';
     if(px>430) color='#00E5FF';
   } else if(p.id===4){
     // vessel A continues, B purge reverse (show on B side)
     if(i<13){ x=lerp(50,840,prog); y=360+Math.sin(i*2+f*0.04)*10; color='#00E5FF'; }
     else { // reverse purge in B: bottom to top
       const q=((f*0.0014)+pseudo(i))%1; x=570+Math.sin(i+f*0.03)*22; y=lerp(500,105,q); color=q>0.7?'#FFD166':'#c99aff'; r=4; }
   } else {
     x=lerp(50,1180,prog); y=360+Math.sin(i*1.7+f*0.04)*12;
     // after vessel (x>450) contaminants removed in active phases
     if(x>450 && x<840) color='#00E5FF';
     else if(x<=450) color=isContam?'#e8eef6':'#00E5FF';
     else color='#00E5FF';
     if(p.id===5 && x>860) y=lerp(y,505,0.6);
   }
   particle(x,y,r,color);
   if(p.id===2 && i<6 && isContam){ctx.save();ctx.font='700 9px "JetBrains Mono"';ctx.fillStyle='#fff';ctx.fillText(i%2?'H₂O':'CO₂',x+6,y-6);ctx.restore()}
 }

 // regeneration gold energy wash on B
 if(p.id===4){ctx.save();ctx.globalAlpha=0.12+0.08*Math.sin(f*0.08);ctx.fillStyle='#FFD166';rr(505,180,130,340,42);ctx.fill();ctx.restore(); arrow(660,500,660,220,'#FFD166'); label(672,340,'warm purge (concept)','#FFD166'); label(500,70,'to regeneration outlet','#c99aff');}
 // freeze-risk ghost in phase 5
 if(p.id===5){ctx.save();ctx.globalAlpha=0.35+0.15*Math.sin(f*0.05);ctx.strokeStyle='#e8eef6';ctx.setLineDash([6,6]);rr(872,185,90,110,10);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#e8eef6';ctx.font='700 10px "JetBrains Mono"';ctx.fillText('IF UNTREATED:',882,205);ctx.fillText('freeze-out risk',882,220);ctx.fillText('(risk, not event)',882,235);ctx.restore(); label(880,580,'passage stays open when feed is purified','#00E5FF');}

 // labels per phase
 if(document.getElementById('showLabels').checked){
   if(p.id===1){label(50,320,'compressed feed in');label(300,150,'adsorbent vessel A');label(505,150,'adsorbent vessel B');label(880,150,'cold box (downstream)');leader(365,180,365,165);leader(1040,170,1040,155)}
   if(p.id===2){label(180,210,'sectional view · bed interior');label(440,300,'H₂O / CO₂ retained','#FFD166');label(440,470,'purified gas leaves','#00E5FF');leader(430,310,395,330);leader(430,460,410,430)}
   if(p.id===3){label(720,320,'purified feed → cold box','#00E5FF');label(690,390,'valve actuation','#FFD166');label(180,600,'control / state (violet) is not a flow','#c99aff')}
   if(p.id===4){label(300,150,'vessel A: still adsorbing','#00E5FF');label(505,150,'vessel B: regenerating','#c99aff')}
   if(p.id===5){label(300,150,'purification upstream');label(880,150,'protected downstream');}
 }
 // violet control line
 ctx.save();ctx.strokeStyle='rgba(157,78,221,.75)';ctx.setLineDash([5,6]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(365,560);ctx.lineTo(365,600);ctx.lineTo(570,600);ctx.lineTo(570,560);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#c99aff';ctx.font='700 10px "JetBrains Mono"';ctx.fillText(p.id===4?'CONTROL: B REGENERATING · A ON FEED':'CONTROL: VALVE / CYCLE STATE',390,618);ctx.restore();

 ctx.restore(); // camera

 // phase banner
 ctx.save();rr(18,16,560,64,12);ctx.fillStyle='rgba(6,12,22,.9)';ctx.fill();ctx.strokeStyle='#2b3d5e';ctx.stroke();ctx.fillStyle='#FFD166';ctx.font='800 11px "JetBrains Mono"';ctx.fillText(`PHASE ${p.id}/5 · ${p.sub}`,32,38);ctx.fillStyle='#fff';ctx.font='700 19px "Space Grotesk"';ctx.fillText(p.head,32,62);ctx.restore();
 inset(f,p);
 // progress bar
 ctx.save();ctx.fillStyle='#1a2942';rr(18,H-22,W-36,8,4);ctx.fill();ctx.fillStyle='#00E5FF';rr(18,H-22,(W-36)*(f/(TOTAL-1)),8,4);ctx.fill();PHASES.forEach(ph=>{const x=18+(W-36)*(ph.start/(TOTAL-1));ctx.fillStyle='#FFD166';ctx.fillRect(x,H-24,2,12)});ctx.restore();
 updatePanel(f,p);
}
function updatePanel(f,p){
 tc.textContent=`f ${String(f).padStart(4,'0')} / 1019  ·  ${(f/FPS).toFixed(2)}s / 34.00s`;
 phaseLabel.textContent=`PHASE ${p.id} · ${p.title.toUpperCase()} · ${p.sub}`;
 if(updatePanel._last!==p.id){updatePanel._last=p.id;detail.innerHTML=`<h2>${p.id}. ${p.head}</h2><p>${p.body}</p><ul>${p.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;document.querySelectorAll('.phases button').forEach((b,i)=>b.classList.toggle('active',i===p.id-1))}
}
// controls
let frame=0, playing=false, last=performance.now(), acc=0;
const playBtn=document.getElementById('playBtn');
function setFrame(f){frame=clamp(Math.round(f),0,TOTAL-1);scrub.value=frame;draw(frame)}
playBtn.onclick=()=>{playing=!playing;playBtn.textContent=playing?'⏸ Pause':'▶ Play';last=performance.now()};
document.getElementById('prevF').onclick=()=>{playing=false;playBtn.textContent='▶ Play';setFrame(frame-1)};
document.getElementById('nextF').onclick=()=>{playing=false;playBtn.textContent='▶ Play';setFrame(frame+1)};
scrub.oninput=e=>{playing=false;playBtn.textContent='▶ Play';setFrame(+e.target.value)};
document.getElementById('exportBtn').onclick=()=>{const a=document.createElement('a');a.download=`cryo-feed-frame-${String(frame).padStart(4,'0')}.png`;a.href=canvas.toDataURL('image/png');a.click()};
const phasesEl=document.getElementById('phases');
PHASES.forEach(p=>{const b=document.createElement('button');b.innerHTML=`<b>${p.id}. ${p.title}</b>${p.sub}`;b.onclick=()=>setFrame(p.start);phasesEl.appendChild(b)});
function loop(now){const dt=(now-last)/1000;last=now;if(playing){acc+=dt*FPS*(+document.getElementById('speed').value);while(acc>=1){acc--;frame=(frame+1)%TOTAL}scrub.value=frame;draw(frame)}requestAnimationFrame(loop)}
if(matchMedia('(prefers-reduced-motion: reduce)').matches){playing=false}else{playing=true;playBtn.textContent='⏸ Pause'}
setFrame(0);requestAnimationFrame(loop);
