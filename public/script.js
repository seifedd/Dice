'use strict';

// ── DOM Elements ─────────────────────────────────────────────────────────────
const player0El        = document.querySelector('.player--0');
const player1El        = document.querySelector('.player--1');
const score0El         = document.getElementById('score--0');
const score1El         = document.getElementById('score--1');
const current0El       = document.getElementById('current--0');
const current1El       = document.getElementById('current--1');
const diceEl           = document.querySelector('.dice');
const btnNew           = document.getElementById('btn-new');
const btnRoll          = document.getElementById('btn-roll');
const btnHold          = document.getElementById('btn-hold');
const leaderboardList  = document.getElementById('leaderboard-list');
const winModal         = document.getElementById('win-modal');
const winnerNameInput  = document.getElementById('winner-name');
const btnSubmitScore   = document.getElementById('btn-submit-score');
const btnSkipScore     = document.getElementById('btn-skip-score');
const modalTitle       = document.getElementById('modal-title');

const WINNING_SCORE = 100;

// ── Game State ────────────────────────────────────────────────────────────────
let scores, currentScore, activePlayer, isPlaying, rollCount, winnerIndex;

function init() {
  scores        = [0, 0];
  currentScore  = 0;
  activePlayer  = 0;
  isPlaying     = true;
  rollCount     = 0;
  winnerIndex   = null;

  score0El.textContent   = 0;
  score1El.textContent   = 0;
  current0El.textContent = 0;
  current1El.textContent = 0;

  diceEl.classList.add('hidden');

  player0El.classList.remove('player--winner');
  player1El.classList.remove('player--winner');
  player0El.classList.add('player--active');
  player1El.classList.remove('player--active');

  winModal.classList.add('hidden');
}

// ── Roll Dice ─────────────────────────────────────────────────────────────────
btnRoll.addEventListener('click', () => {
  if (!isPlaying) return;

  const roll = Math.trunc(Math.random() * 6) + 1;
  rollCount++;

  diceEl.classList.remove('hidden');
  // Remove and re-add so the CSS animation triggers each roll
  diceEl.classList.remove('animated');
  void diceEl.offsetWidth; // reflow trick
  diceEl.src = `dice-${roll}.png`;

  if (roll !== 1) {
    currentScore += roll;
    document.getElementById(`current--${activePlayer}`).textContent = currentScore;
  } else {
    switchPlayer();
  }
});

// ── Hold ──────────────────────────────────────────────────────────────────────
btnHold.addEventListener('click', () => {
  if (!isPlaying) return;

  scores[activePlayer] += currentScore;
  document.getElementById(`score--${activePlayer}`).textContent = scores[activePlayer];

  if (scores[activePlayer] >= WINNING_SCORE) {
    isPlaying   = false;
    winnerIndex = activePlayer;
    diceEl.classList.add('hidden');

    const winnerEl = document.querySelector(`.player--${activePlayer}`);
    winnerEl.classList.add('player--winner');
    winnerEl.classList.remove('player--active');

    showWinModal();
    return;
  }

  switchPlayer();
});

// ── Switch Player ─────────────────────────────────────────────────────────────
function switchPlayer() {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
}

// ── New Game ──────────────────────────────────────────────────────────────────
btnNew.addEventListener('click', init);

// ── Win Modal ─────────────────────────────────────────────────────────────────
function showWinModal() {
  const winnerName = `Player ${winnerIndex + 1}`;
  modalTitle.textContent = `🎉 ${winnerName} wins!`;
  winnerNameInput.value  = '';
  winModal.classList.remove('hidden');
  winnerNameInput.focus();
}

btnSubmitScore.addEventListener('click', async () => {
  const name  = winnerNameInput.value.trim() || `Player ${winnerIndex + 1}`;
  const score = scores[winnerIndex];
  await submitScore(name, score, rollCount);
  winModal.classList.add('hidden');
  await fetchLeaderboard();
});

btnSkipScore.addEventListener('click', () => {
  winModal.classList.add('hidden');
});

// Allow Enter key to submit
winnerNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnSubmitScore.click();
});

// ── Leaderboard ───────────────────────────────────────────────────────────────
async function fetchLeaderboard() {
  try {
    const res  = await fetch('/api/leaderboard');
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    renderLeaderboard(data);
  } catch {
    leaderboardList.innerHTML =
      '<li class="leaderboard__error">⚠️ Could not load leaderboard.</li>';
  }
}

function renderLeaderboard(entries) {
  if (!entries.length) {
    leaderboardList.innerHTML =
      '<li class="leaderboard__empty">No scores yet — be the first to win!</li>';
    return;
  }

  const rankEmojis  = ['🥇', '🥈', '🥉'];
  const rankClasses = ['gold', 'silver', 'bronze'];

  leaderboardList.innerHTML = entries
    .map((entry, i) => {
      const rankDisplay = i < 3
        ? `<span class="leaderboard__rank leaderboard__rank--${rankClasses[i]}">${rankEmojis[i]}</span>`
        : `<span class="leaderboard__rank">${i + 1}</span>`;

      // Use textContent approach via template to safely render names
      const safeName  = document.createElement('span');
      safeName.textContent = entry.name;
      const nameHTML  = safeName.outerHTML;

      return `<li class="leaderboard__entry">
        ${rankDisplay}
        <span class="leaderboard__player-name">${safeName.textContent}</span>
        <span class="leaderboard__score">${Number(entry.score)} pts</span>
        <span class="leaderboard__rolls">${Number(entry.rolls)} rolls</span>
      </li>`;
    })
    .join('');
}

async function submitScore(name, score, rolls) {
  try {
    const res = await fetch('/api/leaderboard', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ name, score, rolls }),
    });
    if (!res.ok) throw new Error('Failed to save');
  } catch {
    // Silently fail — game still works without leaderboard
    console.warn('Could not submit score to leaderboard.');
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
fetchLeaderboard();
