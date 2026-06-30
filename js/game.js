/* =============================================
   BRICK — Brick Stacking Mini Game
   ============================================= */

const BRICK_GAME = (() => {
  let state = {
    isPlaying: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('brickHighScore') || '0'),
    combo: 1,
    timeLeft: 30,
    bricks: [],
    currentBrick: null,
    ghostBrick: null,
    isDragging: false,
    stackHeight: 0,
    gameLoopId: null,
    timerInterval: null,
    discountMultiplier: 0,
    tier: null,
  };

  const BOARD_WIDTH = 400;
  const BRICK_WIDTH = 80;
  const BRICK_HEIGHT = 30;
  const BASE_Y = 370;

  let board, ghost, timerEl, scoreEl, comboEl, highEl;

  function init() {
    board = document.getElementById('gameBoard');
    ghost = document.getElementById('gameGhost');
    timerEl = document.getElementById('gameTimer');
    scoreEl = document.getElementById('gameScore');
    comboEl = document.getElementById('gameCombo');
    highEl = document.getElementById('gameHigh');

    // Set high score
    highEl.textContent = state.highScore;

    // Board click to drop
    board.addEventListener('click', onBoardClick);
    board.addEventListener('mousemove', onBoardMove);
    board.addEventListener('touchmove', onBoardTouch, { passive: true });

    // Start button
    document.getElementById('gameStartBtn').addEventListener('click', startGame);

    // Retry
    document.getElementById('gameRetryBtn').addEventListener('click', () => {
      document.getElementById('gameResult').classList.remove('show');
      startGame();
    });

    window.addEventListener('resize', () => updateGhostPosition(0));
  }

  function startGame() {
    state.isPlaying = true;
    state.score = 0;
    state.combo = 1;
    state.timeLeft = 30;
    state.bricks = [];
    state.stackHeight = 0;
    state.tier = null;

    timerEl.textContent = state.timeLeft;
    scoreEl.textContent = 0;
    comboEl.textContent = 'x1';

    // Clear existing bricks
    board.querySelectorAll('.game-brick').forEach(el => el.remove());

    document.getElementById('gameStartBtn').style.display = 'none';

    // Start timer
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      timerEl.textContent = state.timeLeft;
      if (state.timeLeft <= 5) {
        timerEl.style.color = '#C62828';
      }
      if (state.timeLeft <= 0) {
        endGame();
      }
    }, 1000);

    // Spawn first brick
    spawnBrick();

    // Game loop
    if (state.gameLoopId) cancelAnimationFrame(state.gameLoopId);
    state.gameLoopId = requestAnimationFrame(gameLoop);
  }

  function spawnBrick() {
    const brick = document.createElement('div');
    brick.className = 'game-brick';
    brick.style.bottom = (BASE_Y - state.stackHeight * BRICK_HEIGHT) + 'px';

    // Random initial position
    const maxLeft = BOARD_WIDTH - BRICK_WIDTH;
    const startLeft = Math.random() * maxLeft;
    brick.style.left = startLeft + 'px';

    brick.dataset.placed = 'false';
    board.appendChild(brick);
    state.currentBrick = brick;
    state.isDragging = true;

    ghost.style.opacity = '1';
    ghost.style.bottom = brick.style.bottom;
    updateGhostPosition(startLeft);
  }

  function updateGhostPosition(left) {
    if (!ghost) return;
    ghost.style.left = left + 'px';
  }

  function onBoardMove(e) {
    if (!state.isPlaying || !state.isDragging || !state.currentBrick) return;
    const rect = board.getBoundingClientRect();
    let x = e.clientX - rect.left;

    // Clamp
    x = Math.max(0, Math.min(BOARD_WIDTH - BRICK_WIDTH, x));

    // Snap to grid-like feel
    state.currentBrick.style.left = x + 'px';
    updateGhostPosition(x);
  }

  function onBoardTouch(e) {
    if (!state.isPlaying || !state.isDragging || !state.currentBrick) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = board.getBoundingClientRect();
    let x = touch.clientX - rect.left;
    x = Math.max(0, Math.min(BOARD_WIDTH - BRICK_WIDTH, x));
    state.currentBrick.style.left = x + 'px';
    updateGhostPosition(x);
  }

  function onBoardClick(e) {
    if (!state.isPlaying || !state.isDragging || !state.currentBrick) return;
    dropBrick();
  }

  function dropBrick() {
    const brick = state.currentBrick;
    if (!brick) return;

    state.isDragging = false;
    ghost.style.opacity = '0';
    brick.dataset.placed = 'true';
    brick.classList.add('placed');

    const brickLeft = parseFloat(brick.style.left);
    const brickBottom = parseFloat(brick.style.bottom);

    // Calculate precision
    const prevBrick = state.bricks[state.bricks.length - 1];
    let precision = 1;

    if (prevBrick) {
      const prevLeft = prevBrick.left;
      const diff = Math.abs(brickLeft - prevLeft);
      const maxDiff = BRICK_WIDTH;

      if (diff < 5) {
        precision = 1.5; // Perfect
        brick.classList.add('perfect');
        showFloatingText('PERFECT!', brickLeft + BRICK_WIDTH / 2, brickBottom);
      } else if (diff < 15) {
        precision = 1.2; // Great
      } else if (diff > BRICK_WIDTH * 0.6) {
        precision = 0.5; // Poor - might fall
        // Check if it would fall
        if (diff > BRICK_WIDTH * 0.7) {
          // Brick falls!
          animateBrickFall(brick);
          state.combo = 1;
          comboEl.textContent = 'x1';
          showFloatingText('MISS!', brickLeft + BRICK_WIDTH / 2, brickBottom);
          spawnBrick();
          return;
        }
      }
    }

    // Calculate score
    const basePoints = 10;
    const comboMultiplier = state.combo;
    const precisionMultiplier = precision;
    const points = Math.round(basePoints * comboMultiplier * precisionMultiplier);

    state.score += points;
    state.combo += 1;
    state.stackHeight += 1;

    scoreEl.textContent = state.score;
    comboEl.textContent = 'x' + state.combo;

    // Store brick position
    state.bricks.push({
      left: brickLeft,
      bottom: brickBottom,
      el: brick,
    });

    showFloatingText('+' + points, brickLeft + BRICK_WIDTH / 2, brickBottom + 30);

    // Spawn next
    spawnBrick();
  }

  function animateBrickFall(brick) {
    brick.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
    brick.style.transform = 'translateY(100px) rotate(45deg)';
    brick.style.opacity = '0';
    setTimeout(() => {
      if (brick.parentNode) brick.remove();
    }, 300);
  }

  function showFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
      position: absolute;
      left: ${x}px;
      bottom: ${y}px;
      transform: translateX(-50%);
      color: #D4A843;
      font-family: 'Sora', sans-serif;
      font-size: 14px;
      font-weight: 600;
      pointer-events: none;
      z-index: 10;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    `;
    board.appendChild(el);

    el.animate([
      { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
      { transform: 'translateX(-50%) translateY(-40px)', opacity: 0 },
    ], { duration: 800, easing: 'ease-out' }).onfinish = () => el.remove();
  }

  function gameLoop() {
    if (!state.isPlaying) return;
    state.gameLoopId = requestAnimationFrame(gameLoop);
  }

  function endGame() {
    state.isPlaying = false;
    clearInterval(state.timerInterval);
    if (state.gameLoopId) cancelAnimationFrame(state.gameLoopId);

    timerEl.style.color = '';

    // Calculate tier
    const score = state.score;
    let tier, discount, message;

    if (score >= 200) {
      tier = 'PLATINUM';
      discount = 30;
      message = 'Extraordinary precision. The brick bows to you.';
    } else if (score >= 150) {
      tier = 'GOLD';
      discount = 20;
      message = 'Masterful control. You are worthy of greatness.';
    } else if (score >= 80) {
      tier = 'SILVER';
      discount = 10;
      message = 'Impressive focus. The brick acknowledges your effort.';
    } else if (score >= 30) {
      tier = 'BRONZE';
      discount = 5;
      message = 'Not bad. The brick acknowledges your effort.';
    } else {
      tier = 'PARTICIPANT';
      discount = 0;
      message = 'The brick respects your time. Try again for rewards.';
    }

    state.tier = tier;
    state.discountMultiplier = discount;

    // Save high score
    if (score > state.highScore) {
      state.highScore = score;
      localStorage.setItem('brickHighScore', score.toString());
      highEl.textContent = score;
    }

    // Show result
    document.getElementById('tierName').textContent = tier;
    document.getElementById('resultScore').textContent = score;
    document.getElementById('rewardValue').textContent = discount + '% Discount';
    document.getElementById('resultMessage').textContent = message;

    // Style tier
    const tierColors = {
      'PLATINUM': '#E5E4E2',
      'GOLD': '#D4A843',
      'SILVER': '#C0C0C0',
      'BRONZE': '#CD7F32',
      'PARTICIPANT': '#666666',
    };
    document.querySelector('.tier-name').style.color = tierColors[tier] || '#fff';

    document.getElementById('gameResult').classList.add('show');
    document.getElementById('gameStartBtn').style.display = '';

    // Store discount for cart
    localStorage.setItem('brickDiscount', discount);
    localStorage.setItem('brickScore', score);
    localStorage.setItem('brickTier', tier);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('gameComplete', {
      detail: { discount, tier, score }
    }));
  }

  function getDiscount() {
    return state.discountMultiplier;
  }

  const api = { init, getDiscount };
  window.BRICK_GAME = api;
  return api;
})();
