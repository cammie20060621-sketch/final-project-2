const TRASH = ['🛍️','🧴','🚬','💀','🪣','⚗️','🗑️','🥤','🪤'];
const OCEAN  = ['🐠','🐡','🦈','🐙','🪸','🐬','🦑','🐟','🦀','🐚','🐋','🦭'];
const GRID   = 48;

let gScore=0, gCleaned=0, gTimer=30, gRunning=false, gIntvl=null, gSpawn=null;
const cells=[];
let bestScore = parseInt(localStorage.getItem('ow-best')||'0');

function updateBest() {
  const el = document.getElementById('bestDisplay');
  el.textContent = bestScore > 0 ? bestScore + ' pts' : '—';
}
updateBest();

function buildGrid() {
  const g = document.getElementById('ocean-grid'); g.innerHTML=''; cells.length=0;
  for(let i=0;i<GRID;i++){
    const d=document.createElement('div'); d.className='ocean-cell empty';
    d.onclick=()=>cellClick(i); g.appendChild(d); cells.push({el:d,type:'empty'});
  }
}

function setCell(i,type) {
  const c=cells[i]; c.type=type;
  if(type==='trash'){ c.el.textContent=TRASH[Math.floor(Math.random()*TRASH.length)]; c.el.className='ocean-cell trash'; }
  else if(type==='fish'){ c.el.textContent=OCEAN[Math.floor(Math.random()*OCEAN.length)]; c.el.className='ocean-cell fish'; }
  else { c.el.textContent=''; c.el.className='ocean-cell empty'; }
}

function spawnItems() {
  const empty=cells.map((c,i)=>c.type==='empty'?i:-1).filter(i=>i>=0);
  if(!empty.length) return;
  const idx=empty[Math.floor(Math.random()*empty.length)];
  setCell(idx, Math.random()<0.48?'trash':'fish');
}

function cellClick(i) {
  if(!gRunning) return;
  const c=cells[i]; if(c.type==='empty') return;
  c.el.classList.add('pop'); setTimeout(()=>c.el.classList.remove('pop'),200);
  const msg=document.getElementById('game-msg');
  if(c.type==='trash'){ gScore+=10; gCleaned++; msg.textContent='✅ Trash removed! +10 pts'; msg.className=''; setCell(i,'empty'); }
  else if(c.type==='fish'){ gScore=Math.max(0,gScore-5); msg.textContent='❌ That\'s a sea creature! -5 pts'; msg.className='bad'; }
  document.getElementById('g-score').textContent=gScore;
  document.getElementById('g-cleaned').textContent=gCleaned;
}

function startGame() {
  if(gRunning) return;
  gScore=0; gCleaned=0; gTimer=30; gRunning=true;
  buildGrid();
  ['g-score','g-cleaned'].forEach(id=>document.getElementById(id).textContent=0);
  document.getElementById('g-timer').textContent=30;
  document.getElementById('game-msg').textContent='🌊 Clean up the ocean!';
  document.getElementById('game-msg').className='';
  document.getElementById('startBtn').disabled=true;
  document.getElementById('resetBtn').disabled=false;
  document.getElementById('timerBox').classList.remove('urgent');
  for(let k=0;k<10;k++) spawnItems();
  gSpawn=setInterval(spawnItems,1100);
  gIntvl=setInterval(()=>{
    gTimer--; document.getElementById('g-timer').textContent=gTimer;
    if(gTimer<=10) document.getElementById('timerBox').classList.add('urgent');
    if(gTimer<=0) endGame();
  },1000);
}

function endGame() {
  gRunning=false; clearInterval(gIntvl); clearInterval(gSpawn);
  document.getElementById('startBtn').disabled=false;
  document.getElementById('resetBtn').disabled=true;
  document.getElementById('timerBox').classList.remove('urgent');
  if(gScore>bestScore){ bestScore=gScore; localStorage.setItem('ow-best',bestScore); updateBest(); }
  const msg = gScore>=100 ? `🏆 Ocean Hero! ${gCleaned} pieces cleaned, ${gScore} pts! Amazing!`
             : gScore>=50  ? `⭐ Great job! ${gCleaned} cleaned, ${gScore} pts! Keep it up!`
             : `🌱 ${gScore} pts — practice makes perfect! The ocean still needs you.`;
  document.getElementById('game-msg').textContent=msg;
  document.getElementById('game-msg').className='';
}

function resetGame() {
  gRunning=false; clearInterval(gIntvl); clearInterval(gSpawn);
  gScore=0; gCleaned=0; gTimer=30;
  buildGrid();
  ['g-score','g-cleaned'].forEach(id=>document.getElementById(id).textContent=0);
  document.getElementById('g-timer').textContent=30;
  document.getElementById('game-msg').textContent='Press Start to clean the ocean! 🌊';
  document.getElementById('game-msg').className='';
  document.getElementById('startBtn').disabled=false;
  document.getElementById('resetBtn').disabled=true;
  document.getElementById('timerBox').classList.remove('urgent');
}
buildGrid();
