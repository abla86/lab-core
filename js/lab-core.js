const nodes=[...document.querySelectorAll('.node')];
const feed=document.getElementById('feed');
const selected=document.getElementById('selected');
const apiBase='/api';
const labels={
  game:'Interactive engines / Game Lab',
  evidence:'Evidence appraisal / Evidence Lab',
  security:'Identity & protocol simulation / Security Lab',
  data:'SQL / query planning / Data Lab',
  devops:'CI/CD graph / DevOps Lab',
  systems:'WASM / workers / Systems Lab'
};
nodes.forEach(n=>n.addEventListener('click',()=>{
  nodes.forEach(x=>x.classList.remove('active')); n.classList.add('active');
  const key=n.dataset.lab;
  selected.textContent=labels[key];
  const row=document.createElement('div');
  const b=document.createElement('b'); b.textContent='ROUTE';
  row.append(b, document.createTextNode(' '+key.toUpperCase()+' selected'));
  feed.prepend(row);
}));
document.getElementById('ping').addEventListener('click',()=>{
  const row=document.createElement('div');
  const b=document.createElement('b'); b.textContent='NETWORK';
  row.append(b, document.createTextNode(' HUB → NODES → ACK'));
  feed.prepend(row);
});
document.getElementById('reset').addEventListener('click',()=>{
  nodes.forEach(x=>x.classList.remove('active'));
  selected.textContent='Velg en node for å inspisere forbindelsen.';
  feed.replaceChildren();
  for (const [label, message] of [['CORE','ready'],['ROUTES','6 registered'],['STATE','listening']]) {
    const row=document.createElement('div');
    const b=document.createElement('b'); b.textContent=label;
    row.append(b, document.createTextNode(' '+message));
    feed.append(row);
  }
});

const canvas=document.getElementById('network');
const ctx=canvas.getContext('2d');
if (!ctx) throw new Error('Canvas 2D context is unavailable');
function resize(){canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=canvas.clientHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);draw()}
function draw(){
  const r=canvas.getBoundingClientRect(),cx=r.width/2,cy=r.height/2;
  ctx.clearRect(0,0,r.width,r.height);
  document.querySelectorAll('.node').forEach(n=>{
    const b=n.getBoundingClientRect(),nr=canvas.getBoundingClientRect();
    const x=b.left-nr.left+b.width/2,y=b.top-nr.top+b.height/2;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle='rgba(147,51,234,.42)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#06b6d4';ctx.fill();
  });
  ctx.beginPath();ctx.arc(cx,cy,105,0,Math.PI*2);ctx.strokeStyle='rgba(192,132,252,.12)';ctx.stroke();
}
addEventListener('resize',resize);resize();
async function refreshBackendState(){
  try {
    const response=await fetch(apiBase+'/health',{headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error('Health request failed');
    const health=await response.json();
    const row=document.createElement('div');
    const b=document.createElement('b'); b.textContent='API';
    row.append(b, document.createTextNode(' '+health.status.toUpperCase()));
    feed.prepend(row);
  } catch {
    const row=document.createElement('div');
    const b=document.createElement('b'); b.textContent='API';
    row.append(b, document.createTextNode(' UNAVAILABLE'));
    feed.prepend(row);
  }
}
refreshBackendState();
