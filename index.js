/* Wave animation */
const canvas = document.getElementById('wave-canvas');
const ctx = canvas.getContext('2d');
let ww, wh;
function resizeCanvas() {
  ww = canvas.width = window.innerWidth;
  wh = canvas.height = document.getElementById('home').offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
 
const waves = [
  { y:.65, amplitude:28, speed:.012, color:'rgba(14,124,123,0.25)', offset:0 },
  { y:.72, amplitude:22, speed:.018, color:'rgba(23,195,178,0.18)', offset:1 },
  { y:.80, amplitude:18, speed:.025, color:'rgba(10,61,98,0.45)',   offset:2 },
  { y:.87, amplitude:14, speed:.03,  color:'rgba(3,25,46,0.7)',     offset:3 },
];
let wt = 0;
function drawWaves() {
  ctx.clearRect(0,0,ww,wh);
  waves.forEach(w => {
    const baseY = wh * w.y;
    ctx.beginPath(); ctx.moveTo(0, baseY);
    for (let x=0; x<=ww; x+=4) {
      ctx.lineTo(x, baseY + Math.sin((x*.008) + wt*w.speed*60 + w.offset) * w.amplitude);
    }
    ctx.lineTo(ww,wh); ctx.lineTo(0,wh); ctx.closePath();
    ctx.fillStyle = w.color; ctx.fill();
  });
  wt += .016;
  requestAnimationFrame(drawWaves);
}
drawWaves();
 
/* Counters */
function animateCounters() {
  document.querySelectorAll('.counter-num').forEach(el => {
    const target = +el.dataset.target;
    let cur = 0;
    const step = target / 60;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = Math.round(cur);
      if (cur >= target) clearInterval(t);
    }, 20);
  });
}
setTimeout(animateCounters, 400);
