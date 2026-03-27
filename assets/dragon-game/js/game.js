// ===== Dragon Fire Game =====
// Refactored from scriptfire.js - no jQuery dependency

// Auto-detect base path (works from root or dragon-game/ directory)
var GAME_BASE = (function () {
  var scripts = document.getElementsByTagName('script');
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src || '';
    var idx = src.indexOf('js/game.js');
    if (idx !== -1) {
      return src.substring(0, idx);
    }
  }
  return '';
})();

// Canvas & Context
let canvas, ctx;
let backgroundImage;
let bgShiftX = 100;

// Game Objects
let dragon = null;
let balls = [];
let enemies = [];

// Dragon config
const DRAGON_W = 75;
const DRAGON_H = 70;
let spritePos = 0;
let spriteDir = 0;

// Sizes & Speeds
const ENEMY_W = 128;
const ENEMY_H = 128;
const BALL_SPEED = 10;
const ENEMY_SPEED = 2;

// Audio
let dragonSound, wingsSound, explodeSound, explodeSound2, laughtSound;

// Mouse state
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Score
let score = 0;

// ===== Constructors =====
function Dragon(x, y, w, h, image) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.image = image;
  this.dragging = false;
}

function Ball(x, y, w, h, speed, image) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.speed = speed;
  this.image = image;
}

function Enemy(x, y, w, h, speed, image) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.speed = speed;
  this.image = image;
}

// ===== Utilities =====
function getRand(min, max) {
  return Math.floor(Math.random() * max) + min;
}

// ===== Draw Scene =====
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background scroll
  bgShiftX += 4;
  if (bgShiftX >= 1045) bgShiftX = 0;
  ctx.drawImage(backgroundImage, bgShiftX, 0, 1000, 940, 0, 0, 1000, 600);

  // Sprite animation
  spritePos++;
  if (spritePos >= 9) spritePos = 0;

  // Move dragon toward mouse on mousedown
  if (mouseDown && dragon) {
    if (lastMouseX > dragon.x) dragon.x += 5;
    if (lastMouseY > dragon.y) dragon.y += 5;
    if (lastMouseX < dragon.x) dragon.x -= 5;
    if (lastMouseY < dragon.y) dragon.y -= 5;
  }

  // Draw dragon
  if (dragon) {
    ctx.drawImage(
      dragon.image,
      spritePos * dragon.w, spriteDir * dragon.h,
      dragon.w, dragon.h,
      dragon.x - dragon.w / 2, dragon.y - dragon.h / 2,
      dragon.w, dragon.h
    );
  }

  // Draw & update fireballs
  for (let i = balls.length - 1; i >= 0; i--) {
    const ball = balls[i];
    if (ball) {
      ctx.drawImage(ball.image, ball.x, ball.y);
      ball.x += ball.speed;
      if (ball.x > canvas.width) {
        balls.splice(i, 1);
      }
    }
  }

  // Draw & update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (enemy) {
      ctx.drawImage(enemy.image, enemy.x, enemy.y);
      enemy.x += enemy.speed;
      if (enemy.x < -ENEMY_W) {
        enemies.splice(i, 1);
        laughtSound.currentTime = 0;
        laughtSound.play();
      }
    }
  }

  // Collision detection
  for (let bi = balls.length - 1; bi >= 0; bi--) {
    const ball = balls[bi];
    if (!ball) continue;
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      const enemy = enemies[ei];
      if (!enemy) continue;
      if (
        ball.x + ball.w > enemy.x &&
        ball.y + ball.h > enemy.y &&
        ball.y < enemy.y + enemy.h
      ) {
        enemies.splice(ei, 1);
        balls.splice(bi, 1);
        score++;
        updateScoreDisplay();
        explodeSound2.currentTime = 0;
        explodeSound2.play();
        break;
      }
    }
  }

  // Draw score on canvas
  ctx.font = '20px Verdana';
  ctx.fillStyle = '#f97316';
  ctx.fillText('Pontos: ' + score * 10, 850, 580);
}

function updateScoreDisplay() {
  const el = document.getElementById('score-display');
  if (el) el.textContent = 'Pontos: ' + score * 10;
}

// ===== Enemy Spawner =====
let enemyTimer = null;
let oEnemyImage;

function addEnemy() {
  clearInterval(enemyTimer);
  const randY = getRand(0, canvas.height - ENEMY_H);
  enemies.push(new Enemy(canvas.width, randY, ENEMY_W, ENEMY_H, -ENEMY_SPEED, oEnemyImage));
  const interval = getRand(5000, 10000);
  enemyTimer = setInterval(addEnemy, interval);
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function () {
  canvas = document.getElementById('scene');
  ctx = canvas.getContext('2d');

  // Load background
  backgroundImage = new Image();
  backgroundImage.src = GAME_BASE + 'images/hell.jpg';
  backgroundImage.onerror = function () {
    console.log('Error loading the background image.');
  };

  // Audio
  dragonSound = new Audio(GAME_BASE + 'media/dragon.wav');
  dragonSound.volume = 0.9;

  laughtSound = new Audio(GAME_BASE + 'media/laught.wav');
  laughtSound.volume = 0.9;

  explodeSound = new Audio(GAME_BASE + 'media/explode1.wav');
  explodeSound.volume = 0.9;

  explodeSound2 = new Audio(GAME_BASE + 'media/explosion.wav');
  explodeSound2.volume = 0.9;

  wingsSound = new Audio(GAME_BASE + 'media/wings.wav');
  wingsSound.volume = 0.9;
  wingsSound.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
  }, false);

  // Preload ball image
  const oBallImage = new Image();
  oBallImage.src = GAME_BASE + 'images/fireball.png';

  // Preload enemy image
  oEnemyImage = new Image();
  oEnemyImage.src = GAME_BASE + 'images/enemy.png';

  // Load dragon
  const oDragonImage = new Image();
  oDragonImage.src = GAME_BASE + 'images/dragon.gif';
  oDragonImage.onload = function () {
    dragon = new Dragon(400, 300, DRAGON_W, DRAGON_H, oDragonImage);
  };

  // ===== Mouse Events =====
  canvas.addEventListener('mousedown', function (e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mouseDown = true;

    if (dragon &&
      mouseX > dragon.x - dragon.w / 2 &&
      mouseX < dragon.x + dragon.w / 2 &&
      mouseY > dragon.y - dragon.h / 2 &&
      mouseY < dragon.y + dragon.h / 2) {
      dragon.dragging = true;
      dragon.x = mouseX;
      dragon.y = mouseY;
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    if (dragon && dragon.dragging) {
      dragon.x = mouseX;
      dragon.y = mouseY;
    }

    // Direction
    if (dragon) {
      if (mouseX > dragon.x && Math.abs(mouseY - dragon.y) < dragon.w / 2) {
        spriteDir = 0;
      } else if (mouseX < dragon.x && Math.abs(mouseY - dragon.y) < dragon.w / 2) {
        spriteDir = 4;
      } else if (mouseY > dragon.y && Math.abs(mouseX - dragon.x) < dragon.h / 2) {
        spriteDir = 2;
      } else if (mouseY < dragon.y && Math.abs(mouseX - dragon.x) < dragon.h / 2) {
        spriteDir = 6;
      } else if (mouseY < dragon.y && mouseX < dragon.x) {
        spriteDir = 5;
      } else if (mouseY < dragon.y && mouseX > dragon.x) {
        spriteDir = 7;
      } else if (mouseY > dragon.y && mouseX < dragon.x) {
        spriteDir = 3;
      } else if (mouseY > dragon.y && mouseX > dragon.x) {
        spriteDir = 1;
      }
    }
  });

  canvas.addEventListener('mouseup', function () {
    if (dragon) dragon.dragging = false;
    mouseDown = false;

    dragonSound.currentTime = 0;
    dragonSound.play();
  });

  // ===== Keyboard Events =====
  window.addEventListener('keydown', function (event) {
    if (event.keyCode === 49) { // '1' key
      if (dragon) {
        balls.push(new Ball(dragon.x, dragon.y, 32, 32, BALL_SPEED, oBallImage));
        explodeSound.currentTime = 0;
        explodeSound.play();
      }
    }
  });

  // ===== Touch Events for Mobile =====
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const mouseX = (touch.clientX - rect.left) * scaleX;
    const mouseY = (touch.clientY - rect.top) * scaleY;

    mouseDown = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    if (dragon) {
      dragon.dragging = true;
      dragon.x = mouseX;
      dragon.y = mouseY;
    }

    // Start audio on first interaction
    wingsSound.play().catch(function () { });
  });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const mouseX = (touch.clientX - rect.left) * scaleX;
    const mouseY = (touch.clientY - rect.top) * scaleY;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    if (dragon && dragon.dragging) {
      dragon.x = mouseX;
      dragon.y = mouseY;
    }
  });

  canvas.addEventListener('touchend', function () {
    if (dragon) dragon.dragging = false;
    mouseDown = false;
    // Auto-fire on touch
    if (dragon) {
      balls.push(new Ball(dragon.x, dragon.y, 32, 32, BALL_SPEED, oBallImage));
      explodeSound.currentTime = 0;
      explodeSound.play();
    }
  });

  // ===== Start Game Loop =====
  // Start audio on first click anywhere
  document.addEventListener('click', function startAudio() {
    wingsSound.play().catch(function () { });
    document.removeEventListener('click', startAudio);
  }, { once: true });

  setInterval(drawScene, 30);
  addEnemy();
});
