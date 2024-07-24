const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.getElementById('backgroundMusic');
const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');

// Start playing background music only after user interaction
document.addEventListener('click', function() {
    if (backgroundMusic.paused) {
        backgroundMusic.play().catch(error => {
            console.error('Error playing background music:', error);
        });
    }
});

const trexImage = new Image();
trexImage.src = 'trex2.png';

const cloudImage = new Image();
cloudImage.src = 'cloud.png';

let imagesLoaded = 0;

trexImage.onload = () => imagesLoaded++;
cloudImage.onload = () => imagesLoaded++;

const checkImagesLoaded = () => imagesLoaded === 2;

// Game settings
const dino = {
    x: 50,
    y: 150,
    width: 44,
    height: 47,
    dy: 0,
    gravity: 0.6,
    jumpPower: -10,
    isJumping: false
};

const ground = {
    x: 0,
    y: 180,
    width: canvas.width,
    height: 20
};

let clouds = [];
let obstacles = [];
const spawnInterval = 2000;
let spawnTimer = 0;
let obstacleSpeed = 4;
let score = 0;
let isGameOver = false;

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomSize() {
    return {
        width: Math.floor(Math.random() * 20) + 5,
        height: Math.floor(Math.random() * 20) + 5
    };
}

function drawDino() {
    ctx.drawImage(trexImage, dino.x, dino.y, dino.width, dino.height);
}

function drawGround() {
    ctx.fillStyle = '#888';
    ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function updateClouds(deltaTime) {
    clouds.forEach(cloud => {
        cloud.x -= 0.5;
    });

    clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);

    if (Math.random() < 0.01) {
        const size = {
            width: Math.floor(Math.random() * 50) + 50,
            height: Math.floor(Math.random() * 30) + 30
        };
        clouds.push({
            x: canvas.width,
            y: Math.random() * (ground.y - size.height),
            width: size.width,
            height: size.height
        });
    }
}

function updateObstacles(deltaTime) {
    spawnTimer += deltaTime;
    if (spawnTimer >= spawnInterval) {
        const size = getRandomSize();
        obstacles.push({
            x: canvas.width,
            y: ground.y - size.height,
            width: size.width,
            height: size.height,
            color: getRandomColor(),
            speed: obstacleSpeed
        });
        spawnTimer = 0;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= obstacle.speed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function updateDino() {
    if (dino.isJumping) {
        dino.dy += dino.gravity;
        dino.y += dino.dy;

        if (dino.y > ground.y - dino.height) {
            dino.y = ground.y - dino.height;
            dino.dy = 0;
            dino.isJumping = false;
        }
    }
}

function checkCollision() {
    for (let obstacle of obstacles) {
        if (dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function increaseDifficulty(deltaTime) {
    score += deltaTime / 1500;
    if (Math.floor(score) % 10 === 0 && Math.floor(score) > 10) {
        obstacleSpeed += 0.1;
        obstacles.forEach(obstacle => obstacle.speed = obstacleSpeed);
    }
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawClouds();
    drawDino();
    drawObstacles();

    updateDino();
    updateObstacles(deltaTime);
    updateClouds(deltaTime);
    increaseDifficulty(deltaTime);

    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + Math.floor(score), 10, 20);

    if (checkCollision()) {
        isGameOver = true;
        backgroundMusic.pause();
        gameOverSound.play().catch(error => {
            console.error('Error playing game over sound:', error);
        });
        alert('Game Over! Your score: ' + Math.floor(score));
        document.location.reload();
    } else {
        if (!isGameOver) {
            requestAnimationFrame(gameLoop);
        }
    }
}

let lastFrameTime = 0;

document.addEventListener('keydown', function(event) {
    if (event.code === 'Space' && !dino.isJumping && !isGameOver) {
        dino.isJumping = true;
        dino.dy = dino.jumpPower;
        jumpSound.play().catch(error => {
            console.error('Error playing jump sound:', error);
        });
    }
});

if (checkImagesLoaded()) {
    requestAnimationFrame(gameLoop);
} else {
    const imageLoadInterval = setInterval(() => {
        if (checkImagesLoaded()) {
            clearInterval(imageLoadInterval);
            requestAnimationFrame(gameLoop);
        }
    }, 100);
}
