// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let matchTime = 0;
let homeScore = 0;
let awayScore = 0;

// Player object
class Player {
    constructor(x, y, team, speed = 3) {
        this.x = x;
        this.y = y;
        this.team = team; // 'home' or 'away'
        this.speed = speed;
        this.radius = 8;
        this.angle = 0;
        this.hasball = false;
    }

    draw() {
        ctx.fillStyle = this.team === 'home' ? '#1976d2' : '#f57c00';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw player number/indicator
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', this.x, this.y);
    }

    update() {
        if (gameRunning && !gamePaused) {
            // Simple AI movement
            this.x += (Math.random() - 0.5) * this.speed;
            this.y += (Math.random() - 0.5) * this.speed;

            // Keep player in bounds
            this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }
}

// Ball object
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 6;
        this.friction = 0.98;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball pattern
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    update() {
        if (gameRunning && !gamePaused) {
            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Apply friction
            this.vx *= this.friction;
            this.vy *= this.friction;

            // Bounce off walls
            if (this.x - this.radius < 0 || this.x + this.radius > canvas.width) {
                this.vx *= -0.8;
                this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            }
            if (this.y - this.radius < 0 || this.y + this.radius > canvas.height) {
                this.vy *= -0.8;
                this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
            }

            // Check goal
            checkGoal();
        }
    }
}

// Initialize game objects
let players = [];
let ball;

function initGame() {
    players = [];
    homeScore = 0;
    awayScore = 0;
    matchTime = 0;
    
    // Create home team players
    for (let i = 0; i < 6; i++) {
        players.push(new Player(
            canvas.width * 0.3 + (Math.random() - 0.5) * 100,
            canvas.height * 0.5 + (Math.random() - 0.5) * 100,
            'home'
        ));
    }

    // Create away team players
    for (let i = 0; i < 6; i++) {
        players.push(new Player(
            canvas.width * 0.7 + (Math.random() - 0.5) * 100,
            canvas.height * 0.5 + (Math.random() - 0.5) * 100,
            'away'
        ));
    }

    // Create ball
    ball = new Ball(canvas.width / 2, canvas.height / 2);
    
    updateScore();
}

function drawField() {
    // Field background
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // Center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Goal areas
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // Home goal area
    ctx.strokeRect(10, canvas.height / 2 - 80, 80, 160);
    ctx.strokeRect(10, canvas.height / 2 - 50, 30, 100);

    // Away goal area
    ctx.strokeRect(canvas.width - 90, canvas.height / 2 - 80, 80, 160);
    ctx.strokeRect(canvas.width - 40, canvas.height / 2 - 50, 30, 100);
}

function checkGoal() {
    // Home goal (right side)
    if (ball.x + ball.radius > canvas.width - 10 && 
        ball.y > canvas.height / 2 - 50 && 
        ball.y < canvas.height / 2 + 50) {
        homeScore++;
        resetBallPosition();
        updateScore();
    }

    // Away goal (left side)
    if (ball.x - ball.radius < 10 && 
        ball.y > canvas.height / 2 - 50 && 
        ball.y < canvas.height / 2 + 50) {
        awayScore++;
        resetBallPosition();
        updateScore();
    }
}

function resetBallPosition() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() - 0.5) * 5;
    ball.vy = (Math.random() - 0.5) * 5;
}

function updateScore() {
    document.getElementById('homeScore').textContent = homeScore;
    document.getElementById('awayScore').textContent = awayScore;
}

function updateTimer() {
    if (gameRunning && !gamePaused) {
        matchTime++;
        const minutes = Math.floor(matchTime / 60);
        const seconds = matchTime % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }
}

function gameLoop() {
    // Clear canvas
    drawField();

    // Update and draw players
    players.forEach(player => {
        player.update();
        player.draw();
    });

    // Update and draw ball
    ball.update();
    ball.draw();

    // Simulate ball interaction with players
    players.forEach(player => {
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + ball.radius + 10) {
            // Ball kicked by player
            ball.vx = (dx / distance) * 8;
            ball.vy = (dy / distance) * 8;
        }
    });

    requestAnimationFrame(gameLoop);
}

// Button event listeners
document.getElementById('startBtn').addEventListener('click', () => {
    gameRunning = true;
    gamePaused = false;
    document.getElementById('startBtn').textContent = 'Resume';
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    gamePaused = !gamePaused;
    document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';
});

document.getElementById('resetBtn').addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    initGame();
    document.getElementById('startBtn').textContent = 'Start Match';
    document.getElementById('pauseBtn').textContent = 'Pause';
});

// Keyboard controls for manual player control (optional)
window.addEventListener('keydown', (e) => {
    if (gameRunning && players.length > 0) {
        // Arrow keys to move first player (for testing)
        switch(e.key) {
            case 'ArrowUp':
                players[0].y -= 10;
                e.preventDefault();
                break;
            case 'ArrowDown':
                players[0].y += 10;
                e.preventDefault();
                break;
            case 'ArrowLeft':
                players[0].x -= 10;
                e.preventDefault();
                break;
            case 'ArrowRight':
                players[0].x += 10;
                e.preventDefault();
                break;
        }
    }
});

// Start the game
initGame();
gameLoop();

// Update timer every second
setInterval(updateTimer, 1000);