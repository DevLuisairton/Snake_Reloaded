// Configurações do jogo
const config = {
  tileSize: 20,
  initialSpeed: 150, // ms por movimento (menor = mais rápido)
  speedIncrease: 2, // ms a diminuir a cada alimento
  foodValue: 10, // pontos por alimento básico
  specialFoodChance: 0.2, // probabilidade de spawnar comida especial
  powerUpChance: 0.05, // probabilidade de spawnar power-up
  powerUpDuration: 10, // duração do power-up em segundos
  obstacleSpawnRate: 5, // a cada quantos pontos adicionar um obstáculo no modo sobrevivência
  maxObstacles: 20, // máximo de obstáculos no modo sobrevivência
  challengeDuration: 60, // duração do desafio em segundos
  challengeGoal: 10, // quantidade de alimentos para completar o desafio
};

// Temas do jogo
const themes = {
  neon: {
      primaryColor: '#00f3ff',
      secondaryColor: '#ff00f7',
      bgColor: '#0a0a1a',
      gridColor: '#1a1a2a',
      textColor: '#ffffff',
      foodColor: '#ffcc00',
      obstacleColor: '#ff3333',
      powerupColor: '#33ff33'
  },
  cyberpunk: {
      primaryColor: '#f7d300',
      secondaryColor: '#ff0055',
      bgColor: '#121212',
      gridColor: '#1e1e1e',
      textColor: '#ffffff',
      foodColor: '#00ffc8',
      obstacleColor: '#f20058',
      powerupColor: '#a537fd'
  },
  forest: {
      primaryColor: '#3fad51',
      secondaryColor: '#8ac926',
      bgColor: '#133a1b',
      gridColor: '#1a4d28',
      textColor: '#ffffff',
      foodColor: '#ff5400',
      obstacleColor: '#6a4c93',
      powerupColor: '#f9c80e'
  },
  desert: {
      primaryColor: '#ff9500',
      secondaryColor: '#ff4500',
      bgColor: '#3b2c20',
      gridColor: '#4e3b2f',
      textColor: '#ffffff',
      foodColor: '#00b4d8',
      obstacleColor: '#8b0000',
      powerupColor: '#d2fc5c'
  },
  space: {
      primaryColor: '#8c52ff',
      secondaryColor: '#5ce1e6',
      bgColor: '#000033',
      gridColor: '#000045',
      textColor: '#ffffff',
      foodColor: '#ffdd00',
      obstacleColor: '#ff5959',
      powerupColor: '#00ff9f'
  }
};

// Variáveis do jogo
let canvas, ctx;
let snake = [];
let direction = 'right';
let nextDirection = 'right';
let food = {};
let specialFood = null;
let obstacles = [];
let powerUps = [];
let activePowerUp = null;
let powerUpTimer = null;
let isGameActive = false;
let isPaused = false;
let score = 0;
let level = 1;
let speed = config.initialSpeed;
let gameLoop;
let gameMode = 'classic';
let gameTime = 0;
let timer;
let challengeTimeLeft = config.challengeDuration;
let challengeGoalLeft = config.challengeGoal;
let currentTheme = 'neon';

// Tipos de power-ups
const powerUpTypes = [
  { name: 'Velocidade', color: '#ffff00', effect: 'speed', duration: 5 },
  { name: 'Escudo', color: '#00ffff', effect: 'shield', duration: 8 },
  { name: 'Tamanho', color: '#ff00ff', effect: 'size', duration: 6 },
  { name: 'Pontos Duplos', color: '#ff9900', effect: 'double', duration: 10 }
];

// Elementos DOM
const menuElement = document.getElementById('menu');
const themesMenuElement = document.getElementById('themes-menu');
const gameOverElement = document.getElementById('game-over');
const powerUpIndicator = document.getElementById('power-up-indicator');
const powerUpName = document.getElementById('power-up-name');
const powerUpProgress = document.getElementById('power-up-progress');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const timeDisplay = document.getElementById('time');
const modeDisplay = document.getElementById('mode-display');
const finalScoreDisplay = document.getElementById('final-score');

// Inicialização
window.onload = function() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
  
  // Ajustar dimensões do canvas
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);

  // Criar partículas de fundo
  createParticles();
  
  // Event listeners para botões do menu
  document.getElementById('classic-btn').addEventListener('click', () => startGame('classic'));
  document.getElementById('survival-btn').addEventListener('click', () => startGame('survival'));
  document.getElementById('challenge-btn').addEventListener('click', () => startGame('challenge'));
  document.getElementById('evolution-btn').addEventListener('click', () => startGame('evolution'));
  document.getElementById('theme-btn').addEventListener('click', showThemesMenu);
  document.getElementById('back-btn').addEventListener('click', hideThemesMenu);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.getElementById('menu-btn').addEventListener('click', showMainMenu);
  
  // Event listeners para opções de tema
  document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
          setTheme(option.dataset.theme);
          hideThemesMenu();
      });
  });
  
  // Event listener para teclas
  document.addEventListener('keydown', handleKeyPress);
  
  // Aplicar tema inicial
  setTheme('neon');
};

// Criar partículas de fundo
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  particlesContainer.innerHTML = '';
  
  for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Tamanho aleatório
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Posição aleatória
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      
      // Cor aleatória entre primary e secondary
      const theme = themes[currentTheme];
      particle.style.backgroundColor = Math.random() > 0.5 ? theme.primaryColor : theme.secondaryColor;
      
      // Duração da animação aleatória
      particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
      
      // Delay da animação aleatório
      particle.style.animationDelay = `${Math.random() * 5}s`;
      
      particlesContainer.appendChild(particle);
  }
}

// Mudar tema
function setTheme(themeName) {
  if (!themes[themeName]) return;
  
  currentTheme = themeName;
  const theme = themes[themeName];
  
  document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
  document.documentElement.style.setProperty('--bg-color', theme.bgColor);
  document.documentElement.style.setProperty('--grid-color', theme.gridColor);
  document.documentElement.style.setProperty('--text-color', theme.textColor);
  document.documentElement.style.setProperty('--food-color', theme.foodColor);
  document.documentElement.style.setProperty('--obstacle-color', theme.obstacleColor);
  document.documentElement.style.setProperty('--powerup-color', theme.powerupColor);
  
  createParticles();
}

// Mostrar menu de temas
function showThemesMenu() {
  menuElement.style.display = 'none';
  themesMenuElement.style.display = 'flex';
}

// Esconder menu de temas
function hideThemesMenu() {
  themesMenuElement.style.display = 'none';
  menuElement.style.display = 'flex';
}

// Iniciar jogo
function startGame(mode) {
  gameMode = mode;
  menuElement.style.display = 'none';
  gameOverElement.style.display = 'none';
  
  // Inicializar variáveis do jogo
  snake = [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
  ];
  direction = 'right';
  nextDirection = 'right';
  score = 0;
  level = 1;
  speed = config.initialSpeed;
  obstacles = [];
  powerUps = [];
  activePowerUp = null;
  isGameActive = true;
  isPaused = false;
  gameTime = 0;
  challengeTimeLeft = config.challengeDuration;
  challengeGoalLeft = config.challengeGoal;
  
  // Criar comida inicial
  createFood();
  
  // Iniciar loop do jogo
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(gameUpdate, speed);
  
  // Iniciar timer
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
      if (!isPaused && isGameActive) {
          gameTime++;
          updateTimeDisplay();
          
          if (gameMode === 'challenge') {
              challengeTimeLeft--;
              
              if (challengeTimeLeft <= 0) {
                  gameOver();
              }
          }
      }
  }, 1000);
  
  // Atualizar display do modo
  switch (mode) {
      case 'classic':
          modeDisplay.textContent = 'Clássico';
          break;
      case 'survival':
          modeDisplay.textContent = 'Sobrevivência';
          break;
      case 'challenge':
          modeDisplay.textContent = 'Desafio';
          break;
      case 'evolution':
          modeDisplay.textContent = 'Evolução';
          break;
  }
  
  // Atualizar displays
  updateScoreDisplay();
  updateLevelDisplay();
  updateTimeDisplay();
}

// Atualização principal do jogo
function gameUpdate() {
  if (isPaused || !isGameActive) return;
  
  // Mover cobra
  moveSnake();
  
  // Verificar colisões
  checkCollisions();
  
  // Renderizar jogo
  renderGame();
  
  // Lógica específica do modo
  switch (gameMode) {
      case 'survival':
          handleSurvivalMode();
          break;
      case 'challenge':
          handleChallengeMode();
          break;
      case 'evolution':
          handleEvolutionMode();
          break;
  }
}

// Mover a cobra
function moveSnake() {
  // Atualizar direção
  direction = nextDirection;
  
  // Calcular nova posição da cabeça
  const head = { ...snake[0] };
  
  switch (direction) {
      case 'up':
          head.y--;
          break;
      case 'down':
          head.y++;
          break;
      case 'left':
          head.x--;
          break;
      case 'right':
          head.x++;
          break;
  }
  
  // Adicionar nova cabeça ao início do array
  snake.unshift(head);
  
  // Se não comeu, remover último segmento
  if (!(head.x === food.x && head.y === food.y) && 
      !(specialFood && head.x === specialFood.x && head.y === specialFood.y) &&
      !powerUps.some(p => head.x === p.x && head.y === p.y)) {
      snake.pop();
  }
}

// Verificar colisões
function checkCollisions() {
  const head = snake[0];
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);
  
  // Colisão com as paredes
  if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      // Se tem escudo, teletransportar ao invés de game over
      if (activePowerUp && activePowerUp.effect === 'shield') {
          if (head.x < 0) head.x = gridWidth - 1;
          if (head.x >= gridWidth) head.x = 0;
          if (head.y < 0) head.y = gridHeight - 1;
          if (head.y >= gridHeight) head.y = 0;
      } else {
          gameOver();
          return;
      }
  }
  
  // Colisão com o próprio corpo
  for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
          // Se tem escudo, ignorar colisão
          if (!(activePowerUp && activePowerUp.effect === 'shield')) {
              gameOver();
              return;
          }
      }
  }
  
  // Colisão com obstáculos
  for (let obstacle of obstacles) {
      if (head.x === obstacle.x && head.y === obstacle.y) {
          // Se tem escudo, ignorar colisão
          if (!(activePowerUp && activePowerUp.effect === 'shield')) {
              gameOver();
              return;
          }
      }
  }
  
  // Colisão com comida
  if (head.x === food.x && head.y === food.y) {
      // Pontuação
      let points = config.foodValue;
      if (activePowerUp && activePowerUp.effect === 'double') {
          points *= 2;
      }
      score += points;
      
      // Aumentar nível e velocidade a cada 100 pontos
      if (score >= level * 100) {
          level++;
          speed = Math.max(50, speed - config.speedIncrease * 2);
          clearInterval(gameLoop);
          gameLoop = setInterval(gameUpdate, speed);
          updateLevelDisplay();
      }
      
      // Criar nova comida
      createFood();
      
      // Possibilidade de criar comida especial
      if (Math.random() < config.specialFoodChance) {
          createSpecialFood();
      }
      
      // No modo desafio, atualizar objetivo
      if (gameMode === 'challenge') {
          challengeGoalLeft--;
          if (challengeGoalLeft <= 0) {
              // Completou o desafio!
              score += 500; // Bônus por completar
              updateScoreDisplay();
              gameOver(true);
              return;
          }
      }
      
      // No modo sobrevivência, adicionar obstáculo baseado na pontuação
      if (gameMode === 'survival' && score % config.obstacleSpawnRate === 0) {
          if (obstacles.length < config.maxObstacles) {
              createObstacle();
          }
      }
      
      updateScoreDisplay();
  }
  
  // Colisão com comida especial
  if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
      // Pontuação extra
      let points = config.foodValue * 3;
      if (activePowerUp && activePowerUp.effect === 'double') {
          points *= 2;
      }
      score += points;
      
      specialFood = null;
      updateScoreDisplay();
  }
  
  // Colisão com power-up
  for (let i = 0; i < powerUps.length; i++) {
      const powerUp = powerUps[i];
      if (head.x === powerUp.x && head.y === powerUp.y) {
          // Ativar power-up
          activatePowerUp(powerUp);
          powerUps.splice(i, 1);
          break;
      }
  }
}

// Renderizar o jogo
function renderGame() {
  const theme = themes[currentTheme];
  
  // Limpar canvas
  ctx.fillStyle = theme.gridColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Desenhar grade (opcional, para efeito visual)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  // Linhas horizontais
  for (let y = 0; y < canvas.height; y += config.tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
  }
  
  // Linhas verticais
  for (let x = 0; x < canvas.width; x += config.tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
  }
  
  // Desenhar comida
  if (food) {
      ctx.fillStyle = theme.foodColor;
      ctx.beginPath();
      ctx.arc(
          (food.x * config.tileSize) + config.tileSize / 2,
          (food.y * config.tileSize) + config.tileSize / 2,
          config.tileSize / 2 - 2,
          0,
          Math.PI * 2
      );
      ctx.fill();
      
      // Brilho ao redor da comida
      ctx.shadowColor = theme.foodColor;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = theme.foodColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
  }
  
  // Desenhar comida especial
  if (specialFood) {
      ctx.fillStyle = theme.secondaryColor;
      ctx.beginPath();
      ctx.arc(
          (specialFood.x * config.tileSize) + config.tileSize / 2,
          (specialFood.y * config.tileSize) + config.tileSize / 2,
          config.tileSize / 2,
          0,
          Math.PI * 2
      );
      ctx.fill();
      
      // Efeito pulsante
      ctx.shadowColor = theme.secondaryColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = theme.secondaryColor;
      ctx.lineWidth = 2 + Math.sin(gameTime * 0.2) * 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
  }
  
  // Desenhar power-ups
  for (let powerUp of powerUps) {
      ctx.fillStyle = powerUp.color;
      ctx.beginPath();
      const centerX = (powerUp.x * config.tileSize) + config.tileSize / 2;
      const centerY = (powerUp.y * config.tileSize) + config.tileSize / 2;
      const size = config.tileSize / 2;
      
      // Estrela (forma do power-up)
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
          const outerAngle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const innerAngle = outerAngle + Math.PI / 5;
          
          // Ponto externo
          let x = centerX + Math.cos(outerAngle) * size;
          let y = centerY + Math.sin(outerAngle) * size;
          
          if (i === 0) {
              ctx.moveTo(x, y);
          } else {
              ctx.lineTo(x, y);
          }
          
          // Ponto interno
          x = centerX + Math.cos(innerAngle) * (size / 2);
          y = centerY + Math.sin(innerAngle) * (size / 2);
          ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Efeito de brilho
      ctx.shadowColor = powerUp.color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = powerUp.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
  }
  
  // Desenhar obstáculos
  for (let obstacle of obstacles) {
      ctx.fillStyle = theme.obstacleColor;
      ctx.fillRect(
          obstacle.x * config.tileSize,
          obstacle.y * config.tileSize,
          config.tileSize,
          config.tileSize
      );
      
      // Efeito de borda
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
          obstacle.x * config.tileSize,
          obstacle.y * config.tileSize,
          config.tileSize,
          config.tileSize
      );
  }
  
  // Desenhar cobra
  for (let i = 0; i < snake.length; i++) {
      const segment = snake[i];
      
      // Gradiente de cores para a cobra
      let segmentColor;
      
      if (i === 0) { // Cabeça
          segmentColor = theme.primaryColor;
      } else {
          // Corpo com gradiente
          const ratio = i / snake.length;
          const r1 = parseInt(theme.primaryColor.slice(1, 3), 16);
          const g1 = parseInt(theme.primaryColor.slice(3, 5), 16);
          const b1 = parseInt(theme.primaryColor.slice(5, 7), 16);
          
          const r2 = parseInt(theme.secondaryColor.slice(1, 3), 16);
          const g2 = parseInt(theme.secondaryColor.slice(3, 5), 16);
          const b2 = parseInt(theme.secondaryColor.slice(5, 7), 16);
          
          const r = Math.floor(r1 + (r2 - r1) * ratio);
          const g = Math.floor(g1 + (g2 - g1) * ratio);
          const b = Math.floor(b1 + (b2 - b1) * ratio);
          
          segmentColor = `rgb(${r}, ${g}, ${b})`;
      }
      
      // Desenhar segmento
      ctx.fillStyle = segmentColor;
      
      // Efeito de escudo
      if (activePowerUp && activePowerUp.effect === 'shield' && i === 0) {
          ctx.shadowColor = theme.primaryColor;
          ctx.shadowBlur = 15;
      }
      
      ctx.beginPath();
      
      // Cabeça da cobra
      if (i === 0) {
          ctx.arc(
              (segment.x * config.tileSize) + config.tileSize / 2,
              (segment.y * config.tileSize) + config.tileSize / 2,
              config.tileSize / 2,
              0,
              Math.PI * 2
          );
          
          // Olhos da cobra
          ctx.fill();
          ctx.fillStyle = 'white';
          
          // Posição dos olhos baseada na direção
          let eyeX1, eyeY1, eyeX2, eyeY2;
          const eyeOffset = config.tileSize / 8;
          const eyeSize = config.tileSize / 6;
          
          switch (direction) {
              case 'up':
                  eyeX1 = (segment.x * config.tileSize) + config.tileSize / 3;
                  eyeY1 = (segment.y * config.tileSize) + config.tileSize / 3;
                  eyeX2 = (segment.x * config.tileSize) + config.tileSize * 2/3;
                  eyeY2 = (segment.y * config.tileSize) + config.tileSize / 3;
                  break;
              case 'down':
                  eyeX1 = (segment.x * config.tileSize) + config.tileSize / 3;
                  eyeY1 = (segment.y * config.tileSize) + config.tileSize * 2/3;
                  eyeX2 = (segment.x * config.tileSize) + config.tileSize * 2/3;
                  eyeY2 = (segment.y * config.tileSize) + config.tileSize * 2/3;
                  break;
              case 'left':
                  eyeX1 = (segment.x * config.tileSize) + config.tileSize / 3;
                  eyeY1 = (segment.y * config.tileSize) + config.tileSize / 3;
                  eyeX2 = (segment.x * config.tileSize) + config.tileSize / 3;
                  eyeY2 = (segment.y * config.tileSize) + config.tileSize * 2/3;
                  break;
              case 'right':
                  eyeX1 = (segment.x * config.tileSize) + config.tileSize * 2/3;
                  eyeY1 = (segment.y * config.tileSize) + config.tileSize / 3;
                  eyeX2 = (segment.x * config.tileSize) + config.tileSize * 2/3;
                  eyeY2 = (segment.y * config.tileSize) + config.tileSize * 2/3;
                  break;
          }
          
          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Pupila
          ctx.fillStyle = 'black';
          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, eyeSize / 2, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, eyeSize / 2, 0, Math.PI * 2);
          ctx.fill();
      } else {
          // Corpo da cobra
          ctx.arc(
              (segment.x * config.tileSize) + config.tileSize / 2,
              (segment.y * config.tileSize) + config.tileSize / 2,
              (config.tileSize / 2) - (i === snake.length - 1 ? 2 : 0),
              0,
              Math.PI * 2
          );
          ctx.fill();
      }
      
      ctx.shadowBlur = 0;
  }
  
  // Modo de desafio: mostrar tempo restante e objetivos
  if (gameMode === 'challenge') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 60);
      ctx.fillStyle = theme.primaryColor;
      ctx.font = '16px Orbitron';
      ctx.fillText(`Tempo: ${formatTime(challengeTimeLeft)}`, 20, 30);
      ctx.fillText(`Alimentos: ${config.challengeGoal - challengeGoalLeft}/${config.challengeGoal}`, 20, 60);
  }
}

// Criar comida em posição aleatória
function createFood() {
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);
  
  let position;
  let validPosition = false;
  
  while (!validPosition) {
      position = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight)
      };
      
      validPosition = true;
      
      // Verificar se não está na cobra
      for (let segment of snake) {
          if (position.x === segment.x && position.y === segment.y) {
              validPosition = false;
              break;
          }
      }
      
      // Verificar se não está nos obstáculos
      if (validPosition) {
          for (let obstacle of obstacles) {
              if (position.x === obstacle.x && position.y === obstacle.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está em power-ups
      if (validPosition) {
          for (let powerUp of powerUps) {
              if (position.x === powerUp.x && position.y === powerUp.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está na comida especial
      if (validPosition && specialFood) {
          if (position.x === specialFood.x && position.y === specialFood.y) {
              validPosition = false;
          }
      }
  }
  
  food = position;
  
  // Possibilidade de criar power-up
  if (Math.random() < config.powerUpChance) {
      createPowerUp();
  }
}

// Criar comida especial
function createSpecialFood() {
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);
  
  let position;
  let validPosition = false;
  
  while (!validPosition) {
      position = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight)
      };
      
      validPosition = true;
      
      // Verificar se não está na cobra
      for (let segment of snake) {
          if (position.x === segment.x && position.y === segment.y) {
              validPosition = false;
              break;
          }
      }
      
      // Verificar se não está na comida normal
      if (validPosition && food) {
          if (position.x === food.x && position.y === food.y) {
              validPosition = false;
          }
      }
      
      // Verificar se não está nos obstáculos
      if (validPosition) {
          for (let obstacle of obstacles) {
              if (position.x === obstacle.x && position.y === obstacle.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está em power-ups
      if (validPosition) {
          for (let powerUp of powerUps) {
              if (position.x === powerUp.x && position.y === powerUp.y) {
                  validPosition = false;
                  break;
              }
          }
      }
  }
  
  specialFood = position;
  
  // Comida especial desaparece após um tempo
  setTimeout(() => {
      specialFood = null;
  }, 5000);
}

// Criar power-up
function createPowerUp() {
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);
  
  let position;
  let validPosition = false;
  
  while (!validPosition) {
      position = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight)
      };
      
      validPosition = true;
      
      // Verificar se não está na cobra
      for (let segment of snake) {
          if (position.x === segment.x && position.y === segment.y) {
              validPosition = false;
              break;
          }
      }
      
      // Verificar se não está na comida
      if (validPosition && food) {
          if (position.x === food.x && position.y === food.y) {
              validPosition = false;
          }
      }
      
      // Verificar se não está na comida especial
      if (validPosition && specialFood) {
          if (position.x === specialFood.x && position.y === specialFood.y) {
              validPosition = false;
          }
      }
      
      // Verificar se não está nos obstáculos
      if (validPosition) {
          for (let obstacle of obstacles) {
              if (position.x === obstacle.x && position.y === obstacle.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está em outros power-ups
      if (validPosition) {
          for (let powerUp of powerUps) {
              if (position.x === powerUp.x && position.y === powerUp.y) {
                  validPosition = false;
                  break;
              }
          }
      }
  }
  
  // Selecionar tipo de power-up aleatório
  const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  
  // Adicionar power-up
  powerUps.push({
      x: position.x,
      y: position.y,
      type: powerUpType.name,
      effect: powerUpType.effect,
      color: powerUpType.color,
      duration: powerUpType.duration
  });
  
  // Power-up desaparece após um tempo
  setTimeout(() => {
      const index = powerUps.findIndex(p => p.x === position.x && p.y === position.y);
      if (index !== -1) {
          powerUps.splice(index, 1);
      }
  }, 8000);
}

// Criar obstáculo
function createObstacle() {
  const gridWidth = Math.floor(canvas.width / config.tileSize);
  const gridHeight = Math.floor(canvas.height / config.tileSize);
  
  let position;
  let validPosition = false;
  
  while (!validPosition) {
      position = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight)
      };
      
      validPosition = true;
      
      // Verificar se não está na cobra
      for (let segment of snake) {
          if (position.x === segment.x && position.y === segment.y) {
              validPosition = false;
              break;
          }
      }
      
      // Verificar se não está em outra comida
      if (validPosition && food) {
          if (position.x === food.x && position.y === food.y) {
              validPosition = false;
          }
      }
      
      // Verificar se não está na comida especial
      if (validPosition && specialFood) {
          if (position.x === specialFood.x && position.y === specialFood.y) {
              validPosition = false;
          }
      }
      
      // Verificar se não está em outros obstáculos
      if (validPosition) {
          for (let obstacle of obstacles) {
              if (position.x === obstacle.x && position.y === obstacle.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está em power-ups
      if (validPosition) {
          for (let powerUp of powerUps) {
              if (position.x === powerUp.x && position.y === powerUp.y) {
                  validPosition = false;
                  break;
              }
          }
      }
      
      // Verificar se não está muito próximo da cabeça da cobra
      if (validPosition) {
          const head = snake[0];
          const distance = Math.sqrt(Math.pow(position.x - head.x, 2) + Math.pow(position.y - head.y, 2));
          if (distance < 5) {
              validPosition = false;
          }
      }
  }
  
  obstacles.push(position);
}

// Ativar power-up
function activatePowerUp(powerUp) {
  // Desativar power-up anterior se estiver ativo
  if (activePowerUp) {
      clearTimeout(powerUpTimer);
  }
  
  activePowerUp = powerUp;
  
  // Efeito do power-up
  switch (powerUp.effect) {
      case 'speed':
          // Aumentar velocidade
          const oldSpeed = speed;
          speed = Math.max(50, speed / 1.5);
          clearInterval(gameLoop);
          gameLoop = setInterval(gameUpdate, speed);
          
          // Restaurar velocidade após o término
          powerUpTimer = setTimeout(() => {
              speed = oldSpeed;
              clearInterval(gameLoop);
              gameLoop = setInterval(gameUpdate, speed);
              activePowerUp = null;
              powerUpIndicator.style.display = 'none';
          }, powerUp.duration * 1000);
          break;
          
      case 'shield':
          // Proteção contra colisões
          powerUpTimer = setTimeout(() => {
              activePowerUp = null;
              powerUpIndicator.style.display = 'none';
          }, powerUp.duration * 1000);
          break;
          
      case 'size':
          // Reduzir tamanho da cobra
          if (snake.length > 5) {
              snake = snake.slice(0, Math.max(3, snake.length / 2));
          }
          
          powerUpTimer = setTimeout(() => {
              activePowerUp = null;
              powerUpIndicator.style.display = 'none';
          }, powerUp.duration * 1000);
          break;
          
      case 'double':
          // Pontos duplos
          powerUpTimer = setTimeout(() => {
              activePowerUp = null;
              powerUpIndicator.style.display = 'none';
          }, powerUp.duration * 1000);
          break;
  }
  
  // Mostrar indicador de power-up
  powerUpIndicator.style.display = 'block';
  powerUpIndicator.classList.add('pulse');
  powerUpName.textContent = `${powerUp.type} (${powerUp.duration}s)`;
  
  // Iniciar timer de progresso
  let timeLeft = powerUp.duration;
  
  const updateProgress = () => {
      timeLeft -= 0.1;
      const percentage = (timeLeft / powerUp.duration) * 100;
      powerUpProgress.style.width = `${percentage}%`;
      
      powerUpName.textContent = `${powerUp.type} (${timeLeft.toFixed(1)}s)`;
      
      if (timeLeft <= 0) {
          clearInterval(progressInterval);
      }
  };
  
  const progressInterval = setInterval(updateProgress, 100);
}

// Game over
function gameOver(success = false) {
  isGameActive = false;
  clearInterval(gameLoop);
  clearInterval(timer);
  
  if (activePowerUp) {
      clearTimeout(powerUpTimer);
      powerUpIndicator.style.display = 'none';
  }
  
  // Mostrar tela de game over
  gameOverElement.style.display = 'block';
  
  if (success) {
      document.querySelector('#game-over h2').textContent = 'Desafio Concluído!';
  } else {
      document.querySelector('#game-over h2').textContent = 'Game Over';
  }
  
  finalScoreDisplay.textContent = `Pontuação: ${score}`;
}

// Reiniciar jogo
function restartGame() {
  startGame(gameMode);
}

// Voltar ao menu principal
function showMainMenu() {
  gameOverElement.style.display = 'none';
  menuElement.style.display = 'flex';
  
  isGameActive = false;
  
  if (gameLoop) clearInterval(gameLoop);
  if (timer) clearInterval(timer);
  
  if (activePowerUp) {
      clearTimeout(powerUpTimer);
      powerUpIndicator.style.display = 'none';
  }
}

// Pausar jogo
function togglePause() {
  if (!isGameActive) return;
  
  isPaused = !isPaused;
  
  if (isPaused) {
      // Mostrar texto de pausa
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '40px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSA', canvas.width / 2, canvas.height / 2 - 30);
      
      ctx.font = '20px Orbitron';
      ctx.fillText('Pressione P para continuar', canvas.width / 2, canvas.height / 2 + 30);
      
      ctx.textAlign = 'start';
  }
}

// Manipular modo de sobrevivência
function handleSurvivalMode() {
  // Aumentar dificuldade ao longo do tempo
  if (gameTime > 0 && gameTime % 30 === 0 && obstacles.length < config.maxObstacles) {
      createObstacle();
  }
}

// Manipular modo de desafio
function handleChallengeMode() {
  // Já implementado na lógica principal
}

// Manipular modo de evolução
function handleEvolutionMode() {
  // Aumentar chance de power-ups
  if (Math.random() < 0.01 && powerUps.length < 3) {
      createPowerUp();
  }
}

// Manipular teclas
function handleKeyPress(e) {
  if (!isGameActive) {
      // Tecla ESC enquanto no game over volta para o menu
      if (e.key === 'Escape' && gameOverElement.style.display === 'block') {
          showMainMenu();
      }
      return;
  }
  
  // Mudar direção
  switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
          if (direction !== 'down') {
              nextDirection = 'up';
          }
          break;
      case 'ArrowDown':
      case 's':
      case 'S':
          if (direction !== 'up') {
              nextDirection = 'down';
          }
          break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
          if (direction !== 'right') {
              nextDirection = 'left';
          }
          break;
      case 'ArrowRight':
      case 'd':
      case 'D':
          if (direction !== 'left') {
              nextDirection = 'right';
          }
          break;
      case 'p':
      case 'P':
          togglePause();
          break;
      case 'Escape':
          showMainMenu();
          break;
  }
}

// Atualizar display de pontuação
function updateScoreDisplay() {
  scoreDisplay.textContent = score;
}

// Atualizar display de nível
function updateLevelDisplay() {
  levelDisplay.textContent = level;
}

// Atualizar display de tempo
function updateTimeDisplay() {
  timeDisplay.textContent = formatTime(gameTime);
}

// Formatar tempo (segundos para MM:SS)
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}