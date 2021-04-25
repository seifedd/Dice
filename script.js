'use strict';
const player_0 = document.querySelector('.player--0');
const player_1 = document.querySelector('.player--1');
const score0El = document.querySelector('#score--0');
const score1El = document.getElementById('score--1');
const diceEl = document.querySelector('.dice');
const btn_new = document.querySelector('.btn--new');
const btn_roll = document.querySelector('.btn--roll');
const btn_hold = document.querySelector('.btn--hold');
const current_score_0_El = document.getElementById('current--0');
const current_score_1_El = document.getElementById('current--1');
// start condition
let isPlaying, score, current_score, active_player;
const init = function() {
  isPlaying = true;
  score = [0, 0];
  current_score = 0;
  active_player = 0;

  score0El.textContent = 0;
  score1El.textContent = 0;
  current_score_0_El.textContent = 0;
  current_score_1_El.textContent = 0;

  diceEl.classList.add('hidden');
  player_0.classList.remove('player--winner');
  player_1.classList.remove('player--winner');
  player_0.classList.add('player--active');
  player_1.classList.remove('player--active');
};

init();
//roling a dice func

btn_roll.addEventListener('click', function() {
  if (isPlaying) {
    const dice_roll = Math.trunc(Math.random() * 6) + 1;
    diceEl.classList.remove('hidden');
    diceEl.setAttribute('src', `dice-${dice_roll}.png`);
    //check if the rolled dice is 1
    if (dice_roll !== 1) {
      //Add dice roll to the current score
      current_score += dice_roll;
      document.getElementById(
        `current--${active_player}`
      ).textContent = current_score;
    } else {
      switch_player();
    }
  }
});

btn_hold.addEventListener('click', function() {
  if (isPlaying) {
    console.log('hold button');
    //Add current score to total score
    score[active_player] = score[active_player] + current_score;
    //console.log(active_player);
    console.log(current_score);
    // scores[1] = scores[1] + currentScore

    document.getElementById(`score--${active_player}`).textContent =
      score[active_player];

    if (score[active_player] >= 20) {
      isPlaying = false;
      diceEl.classList.add('hidden');
      document
        .querySelector(`.player--${active_player}`)
        .classList.add('player--winner');
      document
        .querySelector(`.player--${active_player}`)
        .classList.remove('player--active');
    }
    //if score is less than 100 than switch player

    switch_player();
  }
});

btn_new.addEventListener('click', init);

const switch_player = function() {
  document.getElementById(`current--${active_player}`).textContent = 0;
  current_score = 0;
  active_player = active_player == 0 ? 1 : 0;

  player_0.classList.toggle('player--active');
  player_1.classList.toggle('player--active');
};
