const nodes=[...document.querySelectorAll('.node')];
const feed=document.getElementById('feed');
const selected=document.getElementById('selected');
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
  const row=document.createElement('div');row.innerHTML='<b>ROUTE</b> '+key.toUpperCase()+' selected';feed.prepend(row);
}));
document.getElementById('ping').onclick=()=>{
  const row=document.createElement('div');row.innerHTML='<b>NETWORK</b> HUB → NODES → ACK';feed.prepend(row);
};
document.getElementById('reset').onclick=()=>{
  nodes.forEach(x=>x.classList.remove('active'));
  selected.textContent='Velg en node for å inspisere forbindelsen.';
  feed.innerHTML='<div><b>CORE</b> ready</div><div><b>ROUTES</b> 6 registered</div><div><b>STATE</b> listening</div>';
};

const canvas=document.getElementById('network'),ctx=canvas.getContext('2d');
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