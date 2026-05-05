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
  { y: 0.65, amplitude: 28, speed: 0.012, color: 'rgba(14,124,123,0.25)', offset: 0 },
  { y: 0.72, amplitude: 22, speed: 0.018, color: 'rgba(23,195,178,0.18)', offset: 1 },
  { y: 0.80, amplitude: 18, speed: 0.025, color: 'rgba(10,61,98,0.45)', offset: 2 },
  { y: 0.87, amplitude: 14, speed: 0.03,  color: 'rgba(3,25,46,0.7)',    offset: 3 },
];

let wt = 0;
function drawWaves() {
  ctx.clearRect(0, 0, ww, wh);
  waves.forEach(w => {
    const baseY = wh * w.y;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= ww; x += 4) {
      const y = baseY + Math.sin((x * 0.008) + wt * w.speed * 60 + w.offset) * w.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(ww, wh); ctx.lineTo(0, wh); ctx.closePath();
    ctx.fillStyle = w.color;
    ctx.fill();
  });
  wt += 0.016;
  requestAnimationFrame(drawWaves);
}
drawWaves();

/* ─── NAV BURGER ─── */
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

/* ─── COUNTERS ─── */
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

/* ─── SCROLL OBSERVER ─── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      if (e.target.id === 'home') animateCounters();
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.problem-card, .solution-item').forEach(el => observer.observe(el));
observer.observe(document.getElementById('home'));
// Trigger counters on load too
setTimeout(animateCounters, 500);

/* stagger solutions */
document.querySelectorAll('.solution-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.12) + 's';
});
document.querySelectorAll('.problem-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.08) + 's';
});

/* ─── GAME ─── */
const TRASH = ['🛍️','🧴','🚬','💀','🪣','⚗️','🗑️'];
const OCEAN  = ['🐠','🐡','🦈','🐙','🪸','🐬','🦑','🐟','🦀','🐚'];
const GRID_SIZE = 48;

let gScore = 0, gCleaned = 0, gTimer = 30, gRunning = false, gInterval = null, gSpawnInterval = null;
const cells = [];

function buildGrid() {
  const grid = document.getElementById('ocean-grid');
  grid.innerHTML = '';
  cells.length = 0;
  for (let i = 0; i < GRID_SIZE; i++) {
    const d = document.createElement('div');
    d.className = 'ocean-cell';
    d.dataset.i = i;
    d.onclick = () => cellClick(i);
    grid.appendChild(d);
    cells.push({ el: d, type: 'empty' });
  }
}

function setCell(i, type) {
  const c = cells[i];
  c.type = type;
  if (type === 'trash') {
    c.el.textContent = TRASH[Math.floor(Math.random() * TRASH.length)];
    c.el.className = 'ocean-cell trash';
  } else if (type === 'fish') {
    c.el.textContent = OCEAN[Math.floor(Math.random() * OCEAN.length)];
    c.el.className = 'ocean-cell fish';
  } else {
    c.el.textContent = '';
    c.el.className = 'ocean-cell';
  }
}

function spawnItems() {
  const empty = cells.map((c, i) => c.type === 'empty' ? i : -1).filter(i => i >= 0);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  const isTrash = Math.random() < 0.45;
  setCell(idx, isTrash ? 'trash' : 'fish');
}

function cellClick(i) {
  if (!gRunning) return;
  const c = cells[i];
  c.el.classList.add('click-anim');
  setTimeout(() => c.el.classList.remove('click-anim'), 200);
  if (c.type === 'trash') {
    gScore += 10; gCleaned++;
    document.getElementById('game-msg').textContent = '✅ Great! You removed trash! +10 pts';
    setCell(i, 'empty');
  } else if (c.type === 'fish') {
    gScore = Math.max(0, gScore - 5);
    document.getElementById('game-msg').textContent = '❌ Oops! That\'s a sea creature! -5 pts';
  }
  document.getElementById('g-score').textContent = gScore;
  document.getElementById('g-cleaned').textContent = gCleaned;
}

function startGame() {
  if (gRunning) return;
  gScore = 0; gCleaned = 0; gTimer = 30; gRunning = true;
  buildGrid();
  document.getElementById('g-score').textContent = 0;
  document.getElementById('g-cleaned').textContent = 0;
  document.getElementById('g-timer').textContent = 30;
  document.getElementById('game-msg').textContent = '🌊 Clean up the ocean!';
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;

  // initial spawn
  for (let k = 0; k < 10; k++) spawnItems();

  gSpawnInterval = setInterval(spawnItems, 1200);
  gInterval = setInterval(() => {
    gTimer--;
    document.getElementById('g-timer').textContent = gTimer;
    if (gTimer <= 0) endGame();
  }, 1000);
}

function endGame() {
  gRunning = false;
  clearInterval(gInterval);
  clearInterval(gSpawnInterval);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
  const msg = gScore >= 100
    ? `🏆 Amazing! You cleaned ${gCleaned} pieces and scored ${gScore} pts! Ocean hero!`
    : gScore >= 50
    ? `⭐ Good job! ${gCleaned} pieces cleaned. Score: ${gScore}. Keep going!`
    : `🌱 You scored ${gScore} pts. Practice makes perfect — the ocean needs you!`;
  document.getElementById('game-msg').textContent = msg;
}

function resetGame() {
  gRunning = false;
  clearInterval(gInterval);
  clearInterval(gSpawnInterval);
  gScore = 0; gCleaned = 0; gTimer = 30;
  buildGrid();
  document.getElementById('g-score').textContent = 0;
  document.getElementById('g-cleaned').textContent = 0;
  document.getElementById('g-timer').textContent = 30;
  document.getElementById('game-msg').textContent = 'Press Start to clean the ocean! 🌊';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
}

buildGrid();

/* ─── QUIZ ─── */
const questions = [
  {
    q: "How much plastic waste enters the ocean every year?",
    opts: ["1 million tonnes","5 million tonnes","11 million tonnes","20 million tonnes"],
    ans: 2,
    fact: "An estimated 11 million metric tons of plastic flow into the ocean annually — equivalent to dumping a garbage truck of plastic every minute."
  },
  {
    q: "What percentage of the world's oxygen is produced by ocean phytoplankton?",
    opts: ["10%","30%","50%","70%"],
    ans: 2,
    fact: "Ocean phytoplankton produces about 50% of Earth's oxygen through photosynthesis — making the ocean our planetary lungs."
  },
  {
    q: "Which SDG focuses on 'Life Below Water'?",
    opts: ["SDG 6","SDG 12","SDG 14","SDG 17"],
    ans: 2,
    fact: "SDG 14 calls for conservation and sustainable use of the oceans, seas, and marine resources for sustainable development."
  },
  {
    q: "Approximately how long does a plastic bottle take to decompose in the ocean?",
    opts: ["10 years","50 years","200 years","450 years"],
    ans: 3,
    fact: "A plastic bottle can take up to 450 years to decompose in the ocean, leaching harmful chemicals throughout its degradation."
  },
  {
    q: "What does SDG 12 stand for?",
    opts: ["Sustainable Cities","Climate Action","Responsible Consumption & Production","Clean Energy"],
    ans: 2,
    fact: "SDG 12 aims to ensure sustainable consumption and production patterns, reducing waste and environmental impact globally."
  },
  {
    q: "What percentage of coral reefs are threatened by human activities?",
    opts: ["10%","25%","50%","75%"],
    ans: 2,
    fact: "About 50% of shallow-water coral reefs have already been lost, with human activity — warming, pollution, overfishing — being the primary driver."
  },
  {
    q: "Which is NOT a solution for reducing ocean plastic pollution?",
    opts: ["Using reusable bags","Buying more fast fashion","Participating in beach clean-ups","Supporting extended producer responsibility"],
    ans: 1,
    fact: "Fast fashion is one of the biggest sources of microplastic pollution. Each wash of synthetic clothing releases thousands of plastic fibers into waterways."
  },
  {
    q: "How much of global CO₂ emissions does the ocean absorb?",
    opts: ["10%","20%","30%","50%"],
    ans: 2,
    fact: "The ocean absorbs about 30% of the CO₂ produced by humans, acting as a crucial carbon sink — but this causes ocean acidification."
  },
  {
    q: "What fraction of the world's fish stocks are overfished at unsustainable levels?",
    opts: ["1 in 10","1 in 5","1 in 3","1 in 2"],
    ans: 2,
    fact: "According to the FAO, over 34% (roughly 1 in 3) of the world's fish stocks are fished at biologically unsustainable levels."
  },
  {
    q: "Which everyday action has the LEAST impact on ocean sustainability?",
    opts: ["Reducing seafood consumption","Changing phone wallpaper","Refusing single-use plastics","Supporting marine protection policies"],
    ans: 1,
    fact: "Changing your phone wallpaper has virtually no environmental impact, while the other choices directly reduce ocean pollution and habitat destruction."
  }
];

let qIndex = 0, qScore = 0, answered = false;

function renderQuestion() {
  const q = questions[qIndex];
  answered = false;
  document.getElementById('qNum').textContent = `Question ${qIndex + 1} of ${questions.length}`;
  document.getElementById('qText').textContent = q.q;
  document.getElementById('qFeedback').textContent = '';
  document.getElementById('quiz-next').style.display = 'none';
  document.getElementById('progressFill').style.width = (qIndex / questions.length * 100) + '%';

  const opts = document.getElementById('qOptions');
  opts.innerHTML = '';
  q.opts.forEach((o, i) => {
    const letters = ['A','B','C','D'];
    const d = document.createElement('div');
    d.className = 'quiz-opt';
    d.innerHTML = `<div class="opt-letter">${letters[i]}</div><span>${o}</span>`;
    d.onclick = () => selectAnswer(i, d);
    opts.appendChild(d);
  });
}

function selectAnswer(i, el) {
  if (answered) return;
  answered = true;
  const q = questions[qIndex];
  const allOpts = document.querySelectorAll('.quiz-opt');
  allOpts.forEach(o => o.classList.add('answered'));

  if (i === q.ans) {
    el.classList.add('correct');
    qScore++;
    document.getElementById('qFeedback').innerHTML = `<span style="color:var(--green-ok)">✅ Correct!</span> ${q.fact}`;
  } else {
    el.classList.add('wrong');
    allOpts[q.ans].classList.add('correct');
    document.getElementById('qFeedback').innerHTML = `<span style="color:var(--red-wrong)">❌ Incorrect.</span> The correct answer is <strong>${q.opts[q.ans]}</strong>. ${q.fact}`;
  }

  const btn = document.getElementById('quiz-next');
  btn.style.display = 'inline-block';
  btn.textContent = qIndex < questions.length - 1 ? 'Next Question →' : 'See My Results 🏆';
}

function nextQuestion() {
  qIndex++;
  if (qIndex >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  document.getElementById('quiz-body').style.display = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('progressFill').style.width = '100%';
  document.getElementById('rScore').textContent = `${qScore} / ${questions.length}`;

  if (qScore > 5) {
    document.getElementById('rEmoji').textContent = '🏆';
    document.getElementById('rTitle').textContent = 'Ocean Champion!';
    document.getElementById('rMsg').textContent = `Good job for protecting the environment! 🌊 You scored ${qScore} out of 10. Your knowledge about ocean sustainability and responsible consumption can make a real difference. Keep spreading the word!`;
    document.getElementById('rScore').style.color = 'var(--ocean-cyan)';
  } else {
    document.getElementById('rEmoji').textContent = '🌱';
    document.getElementById('rTitle').textContent = 'Keep Learning!';
    document.getElementById('rMsg').textContent = `Can make more persistent efforts! 💪 You scored ${qScore} out of 10. Every expert was once a beginner — explore our About section to learn more, then try the quiz again!`;
    document.getElementById('rScore').style.color = 'var(--coral)';
  }
}

function restartQuiz() {
  qIndex = 0; qScore = 0;
  document.getElementById('quiz-result').style.display = 'none';
  document.getElementById('quiz-body').style.display = 'block';
  renderQuestion();
}
renderQuestion();
