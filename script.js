const TARGET = 1000000000000000000n;
const START = 0n;
const STORAGE_KEY = 'laser-score-rush-v1';

const scoreEl = document.getElementById('score');
const remainingEl = document.getElementById('remaining');
const remainingLabel = document.getElementById('remainingLabel');
const scoreWrap = document.getElementById('scoreWrap');
const statusEl = document.getElementById('statusMessage');
const shotsEl = document.getElementById('shotsLabel');
const progressEl = document.getElementById('progressFill');
const captionEl = document.getElementById('progressCaption');
const gun = document.getElementById('gun');
const muzzle = document.getElementById('gunMuzzle');
const laserLayer = document.getElementById('laserLayer');
const victory = document.getElementById('victory');
const formatter = new Intl.NumberFormat('en-US');

let score = START;
let shots = 0;
let gunTimer;
let victoryShown = false;
let victoryTimer;

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && /^-?\d+$/.test(saved.score)) score = BigInt(saved.score);
  if (saved && Number.isSafeInteger(saved.shots) && saved.shots >= 0) shots = saved.shots;
} catch (_) { /* Start fresh if saved data is unavailable. */ }

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: score.toString(), shots })); } catch (_) {}
}

function fitScore() {
  scoreEl.style.fontSize = '58px';
  const naturalWidth = scoreEl.scrollWidth;
  if (naturalWidth > scoreWrap.clientWidth) {
    scoreEl.style.fontSize = `${58 * (scoreWrap.clientWidth - 4) / naturalWidth}px`;
  }
}

function updateDisplay() {
  scoreEl.textContent = formatter.format(score).replace('-', '−');
  scoreEl.classList.toggle('is-negative', score < 0n);
  scoreEl.setAttribute('aria-label', `Current score: ${formatter.format(score)}`);
  const remaining = TARGET - score;
  remainingEl.textContent = remaining > 0n ? formatter.format(remaining) : '0';
  remainingLabel.textContent = remaining > 0n ? 'TO THE FINISH' : 'FINISH LINE REACHED';
  shotsEl.textContent = `${formatter.format(shots)} ${shots === 1 ? 'shot' : 'shots'} fired`;
  if (remaining > 0n) {
    captionEl.textContent = remaining <= 300n ? 'The final 300' : remaining <= 1000n ? 'The final stretch' : 'Every shot counts';
    statusEl.textContent = score < 0n ? 'Below zero' : remaining === 1n ? 'One more shot' : 'Ready to fire';
  } else {
    captionEl.textContent = 'Target cleared';
    statusEl.textContent = 'Finish line reached';
  }
  // The visible progress meter follows the final 1,000 points, where each shot matters.
  progressEl.style.width = `${remaining >= 1000n ? 0 : remaining <= 0n ? 100 : Number(1000n - remaining) / 10}%`;
  fitScore();
}

function fireLaser(isPositive) {
  const from = muzzle.getBoundingClientRect();
  const to = scoreEl.getBoundingClientRect();
  const x1 = from.left + from.width / 2;
  const y1 = from.top + from.height / 2;
  const x2 = to.left + to.width / 2;
  // Keep the beam and impact clear of the digits so the score stays readable.
  const y2 = to.top - 32;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const color = isPositive ? '#b6f36a' : '#ff7188';

  const beam = document.createElement('div');
  beam.className = 'laser-beam';
  beam.style.cssText = `left:${x1}px;top:${y1}px;width:${length}px;--angle:${angle}rad;--beam:${color}`;
  laserLayer.appendChild(beam);

  const impact = document.createElement('div');
  impact.className = 'laser-impact';
  impact.style.cssText = `left:${x2}px;top:${y2}px;--beam:${color}`;
  setTimeout(() => laserLayer.appendChild(impact), 135);
  setTimeout(() => { beam.remove(); impact.remove(); }, 580);

  gun.classList.remove('kick');
  void gun.offsetWidth;
  gun.classList.add('kick');
  clearTimeout(gunTimer);
  gunTimer = setTimeout(() => gun.classList.remove('kick'), 270);

}

function changeScore(amount) {
  const before = score;
  score += amount;
  if (score < TARGET) {
    victoryShown = false;
    clearTimeout(victoryTimer);
  }
  shots++;
  updateDisplay();
  persist();
  fireLaser(amount > 0n);
  if (before < TARGET && score >= TARGET && !victoryShown) {
    victoryShown = true;
    victoryTimer = setTimeout(() => {
      victory.classList.add('show');
      victory.setAttribute('aria-hidden', 'false');
      document.getElementById('keepPlaying').focus();
    }, 400);
  }
}

document.getElementById('plusButton').addEventListener('click', () => changeScore(1n));
document.getElementById('minusButton').addEventListener('click', () => changeScore(-1n));
document.querySelectorAll('[data-change]').forEach(button => {
  button.addEventListener('click', () => changeScore(BigInt(button.dataset.change)));
});
document.getElementById('jumpButton').addEventListener('click', () => {
  clearTimeout(victoryTimer);
  score = TARGET - 300n;
  victoryShown = false;
  updateDisplay();
  persist();
  statusEl.textContent = '300 to go';
});
document.getElementById('resetButton').addEventListener('click', () => {
  clearTimeout(victoryTimer);
  score = START;
  shots = 0;
  victoryShown = false;
  updateDisplay();
  persist();
  statusEl.textContent = 'Reset to zero';
});
document.getElementById('keepPlaying').addEventListener('click', () => {
  victory.classList.remove('show');
  victory.setAttribute('aria-hidden', 'true');
  document.getElementById('plusButton').focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && victory.classList.contains('show')) {
    document.getElementById('keepPlaying').click();
    return;
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || victory.classList.contains('show')) return;
  if (event.key === '+' || event.key === '=') { event.preventDefault(); changeScore(1n); }
  if (event.key === '-' || event.key === '_') { event.preventDefault(); changeScore(-1n); }
});

updateDisplay();
new ResizeObserver(fitScore).observe(scoreWrap);
document.fonts.ready.then(fitScore);
