import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, onDisconnect, remove, push, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDTATBOCPb_uGYt5Trmx1EZu7doCR0WWvw",
  authDomain: "spotify-795ab.firebaseapp.com",
  databaseURL: "https://spotify-795ab-default-rtdb.firebaseio.com",
  projectId: "spotify-795ab",
  storageBucket: "spotify-795ab.firebasestorage.app",
  messagingSenderId: "907464366407",
  appId: "1:907464366407:web:e8915a98e9a3719bdb1462",
  measurementId: "G-TT6RD9XYR6"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Game constants
const GRID_SIZE = 40;
const CELL_SIZE = 15;
const GAME_SPEED = 80;
const INITIAL_SNAKE_LENGTH = 5;
const MAX_PLAYERS = 12;
const FOOD_VALUE = 1;
const SHRINK_INTERVAL = 60000; // 60 seconds
const SHRINK_AMOUNT = 2;
const MIN_GRID_SIZE = 20;

// Game variables
let canvas, ctx;
let gameInterval;
let gameActive = false;
let playerName = "";
let playerColor = "#FF5252";
let playerId = null;
let playerRef = null;
let gameStateRef = null;
let lastDirection = null;
let nextDirection = null;
let currentPlayers = {};
let foods = [];
let shrinkTimer = 60;
let currentGridSize = GRID_SIZE;
let boundary = { top: 0, right: GRID_SIZE - 1, bottom: GRID_SIZE - 1, left: 0 };
let shrinkInterval;

// DOM elements
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const playerNameInput = document.getElementById("player-name");
const colorOptions = document.querySelectorAll(".color-option");
const joinGameBtn = document.getElementById("join-game-btn");
const startGameBtn = document.getElementById("start-game-btn");
const playerCountDisplay = document.getElementById("player-count");
const waitingPlayersDisplay = document.getElementById("waiting-players");
const playerScoreDisplay = document.getElementById("player-score");
const playersAliveDisplay = document.getElementById("players-alive");
const shrinkTimerDisplay = document.getElementById("shrink-timer");
const finalScoreDisplay = document.getElementById("final-score");
const winnerDisplay = document.getElementById("winner-display");
const leaderboardList = document.getElementById("leaderboard-list");
const backToMenuBtn = document.getElementById("back-to-menu-btn");

// Initialize game
function init() {
  // Set up canvas
  canvas = document.getElementById("game-canvas");
  canvas.width = currentGridSize * CELL_SIZE;
  canvas.height = currentGridSize * CELL_SIZE;
  ctx = canvas.getContext("2d");
  
  // Set up color selection
  colorOptions.forEach(option => {
    option.addEventListener("click", () => {
      colorOptions.forEach(opt => opt.classList.remove("selected"));
      option.classList.add("selected");
      playerColor = option.dataset.color;
    });
  });
  
  // Select first color by default
  colorOptions[0].classList.add("selected");
  
  // Event listeners
  joinGameBtn.addEventListener("click", joinGame);
  startGameBtn.addEventListener("click", startGame);
  backToMenuBtn.addEventListener("click", resetGame);
  
  // Setup keyboard controls
  document.addEventListener("keydown", handleKeydown);
  
  // Setup Firebase listeners
  setupGameStateListener();
  setupPlayersListener();
}

function setupGameStateListener() {
  const gameStateRef = ref(database, "games/snakepit/state");
  onValue(gameStateRef, (snapshot) => {
    const gameState = snapshot.val() || { active: false };
    
    if (gameState.active && !gameActive) {
      showGameScreen();
      startGameplay();
    } else if (!gameState.active && gameActive) {
      gameActive = false;
      clearInterval(gameInterval);
      if (shrinkInterval) clearInterval(shrinkInterval);
    }
    
    if (gameState.foods) {
      foods = gameState.foods;
    }
    
    if (gameState.boundary) {
      boundary = gameState.boundary;
      resizeCanvas();
    }
  });
}

function setupPlayersListener() {
  const playersRef = ref(database, "games/snakepit/players");
  
  onValue(playersRef, (snapshot) => {
    const players = snapshot.val() || {};
    currentPlayers = players;
    
    // Update player count display
    const playerCount = Object.keys(players).length;
    playerCountDisplay.textContent = `Players: ${playerCount}/${MAX_PLAYERS}`;
    
    // Enable start button if more than 1 player and you're the first player
    if (playerId) {
      const playerIds = Object.keys(players);
      const isFirstPlayer = playerIds.length > 0 && playerIds[0] === playerId;
      startGameBtn.disabled = !(playerCount >= 1 && isFirstPlayer);
    }
    
    // Update waiting players list
    updateWaitingPlayers(players);
    
    // Update players alive counter during game
    if (gameActive) {
      const alivePlayers = Object.values(players).filter(p => !p.dead).length;
      playersAliveDisplay.textContent = `Players: ${alivePlayers}/${Object.keys(players).length}`;
      
      // Check if game should end (0 or 1 player alive)
      if (alivePlayers <= 1 && Object.keys(players).length > 1) {
        endGame();
      }
    }
  });
}

function updateWaitingPlayers(players) {
  waitingPlayersDisplay.innerHTML = "";
  
  Object.values(players).forEach(player => {
    const playerElement = document.createElement("div");
    playerElement.className = "waiting-player";
    
    const colorDot = document.createElement("span");
    colorDot.className = "player-color";
    colorDot.style.backgroundColor = player.color;
    
    const nameSpan = document.createElement("span");
    nameSpan.textContent = player.name;
    
    playerElement.appendChild(colorDot);
    playerElement.appendChild(nameSpan);
    waitingPlayersDisplay.appendChild(playerElement);
  });
}

function joinGame() {
  playerName = playerNameInput.value.trim() || "Player";
  
  if (!playerId) {
    // Create new player entry
    const playersRef = ref(database, "games/snakepit/players");
    get(playersRef).then((snapshot) => {
      const players = snapshot.val() || {};
      
      // Check if max players reached
      if (Object.keys(players).length >= MAX_PLAYERS) {
        alert("Game is full! Please try again later.");
        return;
      }
      
      // Create new player
      const newPlayerRef = push(playersRef);
      playerId = newPlayerRef.key;
      
      const initialSnake = generateInitialSnake();
      const playerData = {
        name: playerName,
        color: playerColor,
        score: 0,
        snake: initialSnake,
        direction: "right",
        dead: false,
        lastUpdate: Date.now()
      };
      
      set(newPlayerRef, playerData);
      
      // Remove player on disconnect
      onDisconnect(newPlayerRef).remove();
      
      // Disable join button
      joinGameBtn.disabled = true;
      playerNameInput.disabled = true;
      colorOptions.forEach(opt => opt.style.pointerEvents = "none");
      
      // Store reference to player
      playerRef = newPlayerRef;
    });
  }
}

function generateInitialSnake() {
  // Find an open space for the snake
  let headX, headY;
  let validPlacement = false;
  
  while (!validPlacement) {
    // Keep snake away from edges
    headX = Math.floor(Math.random() * (currentGridSize - 10)) + 5;
    headY = Math.floor(Math.random() * (currentGridSize - 10)) + 5;
    
    validPlacement = true; // Assume placement is valid unless we find otherwise
  }
  
  // Create initial snake segments
  const snake = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: headX - i, y: headY });
  }
  
  return snake;
}

function startGame() {
  // Set game state to active
  const gameStateRef = ref(database, "games/snakepit/state");
  set(gameStateRef, { 
    active: true,
    startTime: Date.now(),
    foods: generateFood(5) // Start with 5 food items
  });
}

function generateFood(count) {
  const newFoods = [];
  
  for (let i = 0; i < count; i++) {
    let x, y;
    let validPosition = false;
    
    // Try to find a valid position
    while (!validPosition) {
      x = boundary.left + Math.floor(Math.random() * (boundary.right - boundary.left));
      y = boundary.top + Math.floor(Math.random() * (boundary.bottom - boundary.top));
      
      // Check if position is occupied by snake
      validPosition = true;
      for (const player of Object.values(currentPlayers)) {
        for (const segment of player.snake) {
          if (segment.x === x && segment.y === y) {
            validPosition = false;
            break;
          }
        }
        if (!validPosition) break;
      }
      
      // Check if position is occupied by other food
      for (const food of newFoods) {
        if (food.x === x && food.y === y) {
          validPosition = false;
          break;
        }
      }
    }
    
    newFoods.push({ x, y });
  }
  
  return newFoods;
}

function startGameplay() {
  gameActive = true;
  lastDirection = currentPlayers[playerId]?.direction || "right";
  nextDirection = lastDirection;
  
  // Start game loop
  gameInterval = setInterval(gameLoop, GAME_SPEED);
  
  // Start shrinking boundary
  shrinkTimer = 60;
  updateShrinkTimerDisplay();
  shrinkInterval = setInterval(shrinkBoundary, 1000);
}

function shrinkBoundary() {
  shrinkTimer--;
  updateShrinkTimerDisplay();
  
  if (shrinkTimer === 0) {
    // Shrink the boundary
    if (currentGridSize > MIN_GRID_SIZE) {
      const gameStateRef = ref(database, "games/snakepit/state");
      
      // Get current state
      get(gameStateRef).then((snapshot) => {
        const gameState = snapshot.val() || {};
        
        // Shrink boundary by SHRINK_AMOUNT on each side
        const newBoundary = {
          top: boundary.top + SHRINK_AMOUNT,
          right: boundary.right - SHRINK_AMOUNT,
          bottom: boundary.bottom - SHRINK_AMOUNT,
          left: boundary.left + SHRINK_AMOUNT
        };
        
        // Update boundary in database
        set(gameStateRef, {
          ...gameState,
          boundary: newBoundary
        });
        
        // Reset timer
        shrinkTimer = 60;
      });
    }
  }
}

function updateShrinkTimerDisplay() {
  shrinkTimerDisplay.textContent = `Arena shrinks in: ${shrinkTimer}s`;
}

function resizeCanvas() {
  // Calculate new grid size based on boundary
  const width = boundary.right - boundary.left + 1;
  const height = boundary.bottom - boundary.top + 1;
  
  // Update canvas dimensions
  canvas.width = width * CELL_SIZE;
  canvas.height = height * CELL_SIZE;
}

function gameLoop() {
  if (!gameActive || !playerId || !currentPlayers[playerId]) return;
  
  const player = currentPlayers[playerId];
  
  // Don't update if player is dead
  if (player.dead) return;
  
  // Update direction if changed
  if (nextDirection) {
    // Prevent 180-degree turns
    const opposites = {
      "up": "down",
      "down": "up",
      "left": "right",
      "right": "left"
    };
    
    if (nextDirection !== opposites[lastDirection]) {
      lastDirection = nextDirection;
      
      // Update direction in database
      const directionRef = ref(database, `games/snakepit/players/${playerId}/direction`);
      set(directionRef, lastDirection);
    }
  }
  
  // Calculate new head position
  const head = { ...player.snake[0] };
  switch (lastDirection) {
    case "up": head.y--; break;
    case "down": head.y++; break;
    case "left": head.x--; break;
    case "right": head.x++; break;
  }
  
  // Check for collisions
  if (
    head.x < boundary.left || 
    head.x > boundary.right || 
    head.y < boundary.top || 
    head.y > boundary.bottom
  ) {
    // Hit boundary
    playerDied();
    return;
  }
  
  // Check collision with self or other players
  for (const p of Object.values(currentPlayers)) {
    for (let i = 0; i < p.snake.length; i++) {
      // Skip checking the head of our own snake
      if (p.id === playerId && i === 0) continue;
      
      if (head.x === p.snake[i].x && head.y === p.snake[i].y) {
        playerDied();
        return;
      }
    }
  }
  
  // Check for food
  let foodEaten = false;
  let foodIndex = -1;
  
  for (let i = 0; i < foods.length; i++) {
    if (head.x === foods[i].x && head.y === foods[i].y) {
      foodEaten = true;
      foodIndex = i;
      break;
    }
  }
  
  // Create new snake
  const newSnake = [head, ...player.snake];
  if (!foodEaten) {
    newSnake.pop(); // Remove tail if no food eaten
  }
  
  // Update player in database
  const updates = {
    snake: newSnake,
    lastUpdate: Date.now()
  };
  
  if (foodEaten) {
    // Update score
    updates.score = player.score + FOOD_VALUE;
    playerScoreDisplay.textContent = `Score: ${updates.score}`;
    
    // Remove eaten food and add new food
    const gameStateRef = ref(database, "games/snakepit/state");
    get(gameStateRef).then((snapshot) => {
      const gameState = snapshot.val();
      if (gameState && gameState.foods) {
        const updatedFoods = [...gameState.foods];
        updatedFoods.splice(foodIndex, 1);
        updatedFoods.push(...generateFood(1));
        
        set(ref(database, "games/snakepit/state/foods"), updatedFoods);
      }
    });
  }
  
  set(ref(database, `games/snakepit/players/${playerId}`), {
    ...player,
    ...updates
  });
  
  // Render game
  render();
}

function playerDied() {
  if (!playerId || !currentPlayers[playerId]) return;
  
  // Mark player as dead
  set(ref(database, `games/snakepit/players/${playerId}/dead`), true);
  
  // Check if we're the last player
  const alivePlayers = Object.values(currentPlayers).filter(p => !p.dead).length;
  if (alivePlayers <= 1) {
    endGame();
  }
}

function endGame() {
  // Set game state to inactive
  const gameStateRef = ref(database, "games/snakepit/state");
  set(gameStateRef, { active: false });
  
  // Stop game loops
  clearInterval(gameInterval);
  if (shrinkInterval) clearInterval(shrinkInterval);
  
  // Display game over screen
  showGameOverScreen();
}

function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Adjust coordinate system based on boundary
  const offsetX = -boundary.left * CELL_SIZE;
  const offsetY = -boundary.top * CELL_SIZE;
  
  // Draw boundary
  ctx.strokeStyle = "#00f5d4";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  
  // Draw food
  ctx.fillStyle = "#ffcc00";
  for (const food of foods) {
    ctx.beginPath();
    const x = food.x * CELL_SIZE + offsetX + CELL_SIZE / 2;
    const y = food.y * CELL_SIZE + offsetY + CELL_SIZE / 2;
    ctx.arc(x, y, CELL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Draw snakes
  for (const [id, player] of Object.entries(currentPlayers)) {
    // Skip dead players
    if (player.dead) continue;
    
    // Set snake color
    ctx.fillStyle = player.color;
    
    // Draw snake body
    for (let i = 0; i < player.snake.length; i++) {
      const segment = player.snake[i];
      
      // Draw rounded rectangle for head
      if (i === 0) {
        drawRoundedRect(
          segment.x * CELL_SIZE + offsetX, 
          segment.y * CELL_SIZE + offsetY, 
          CELL_SIZE, 
          CELL_SIZE, 
          4
        );
        
        // Draw eyes on head
        ctx.fillStyle = "#fff";
        const eyeSize = CELL_SIZE / 5;
        
        // Position eyes based on direction
        let eyeX1, eyeY1, eyeX2, eyeY2;
        switch (player.direction) {
          case "up":
            eyeX1 = segment.x * CELL_SIZE + offsetX + CELL_SIZE / 3 - eyeSize / 2;
            eyeY1 = segment.y * CELL_SIZE + offsetY + CELL_SIZE / 3;
            eyeX2 = segment.x * CELL_SIZE + offsetX + CELL_SIZE * 2/3 - eyeSize / 2;
            eyeY2 = segment.y * CELL_SIZE + offsetY + CELL_SIZE / 3;
            break;
          case "down":
            eyeX1 = segment.x * CELL_SIZE + offsetX + CELL_SIZE / 3 - eyeSize / 2;
            eyeY1 = segment.y * CELL_SIZE + offsetY + CELL_SIZE * 2/3;
            eyeX2 = segment.x * CELL_SIZE + offsetX + CELL_SIZE * 2/3 - eyeSize / 2;
            eyeY2 = segment.y * CELL_SIZE + offsetY + CELL_SIZE * 2/3;
            break;
          case "left":
            eyeX1 = segment.x * CELL_SIZE + offsetX + CELL_SIZE / 3;
            eyeY1 = segment.y * CELL_SIZE + offsetY + CELL_SIZE / 3 - eyeSize / 2;
            eyeX2 = segment.x * CELL_SIZE + offsetX + CELL_SIZE / 3;
            eyeY2 = segment.y * CELL_SIZE + offsetY + CELL_SIZE * 2/3 - eyeSize / 2;
            break;
          case "right":
            eyeX1 = segment.x * CELL_SIZE + offsetX + CELL_SIZE * 2/3;
            eyeY1 = segment.y * CELL_SIZE + offsetY + CELL_SIZE / 3 - eyeSize / 2;
            eyeX2 = segment.x * CELL_SIZE + offsetX + CELL_SIZE * 2/3;
            eyeY2 = segment.y * CELL_SIZE + offsetY + CELL_SIZE * 2/3 - eyeSize / 2;
            break;
        }
        
        ctx.fillRect(eyeX1, eyeY1, eyeSize, eyeSize);
        ctx.fillRect(eyeX2, eyeY2, eyeSize, eyeSize);
        
        // Reset color for body
        ctx.fillStyle = player.color;
      } else {
        // Draw body segments
        ctx.fillRect(
          segment.x * CELL_SIZE + offsetX + 1, 
          segment.y * CELL_SIZE + offsetY + 1, 
          CELL_SIZE - 2, 
          CELL_SIZE - 2
        );
      }
    }
    
    // Draw name above snake if it's not you
    if (id !== playerId) {
      const head =
