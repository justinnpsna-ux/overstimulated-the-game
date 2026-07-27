import { Player, playerMoveSet, playerStats } from './MODplayer.js'
import { Circle } from './MODcircle.js'
import { SingleShooter, SpreadShooter, ChargeHitter, LaserShooter } from './MODboss.js'
import { Bullet, BadBullet, BadLaser } from './MODbullet.js'
import { levelButtons, LevelManager, unlockNextLevel } from './MODlevels.js'
import { Animate } from './MODanimate.js'
import { GameState } from './MODgameState.js'
import { spawnBall, spawnChargeHitter, spawnSingleShooter, spawnSpreadShooter, spawnLaserShooter } from './MODlevels.js'
import { PointsCounter } from './MODpoints.js'

export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

canvas.style.backgroundColor = "#e4e4e4";

//game state manager
const gameState = new GameState();

//level manager
export const levelManager = new LevelManager();

//animate functions
const animateFunc = new Animate();

const pointsCounter = new PointsCounter();

//all button features. keep
const freeFall = document.getElementById("freefall");
const test = document.getElementById("test");
const pendulum = document.getElementById("pendulum");
const singleshooterButton = document.getElementById("singleshooter");
const spreadshooterButton = document.getElementById("spreadshooter");
const chargehitterButton = document.getElementById("chargehitter");
const nextLevelButton = document.getElementById("nextLevelButton");
const reset = document.getElementById("reset");

//unique id for all circles
export let nextCircleId = { id: 0 }; 

//player
export let interacted = true; //make this true if user clicks on screen once
export let isPlayerCreated = false;
let destroyedCounter = 0;
let immortal = false;

//drop powerups rng
let dropRNG;

//sfx
export const sfxLimit = 10;
export let sfxPool = {pool: []};
export let sfxPoolIndex = 0;

export function playSound(fileName) {
    let sound = sfxPool.pool[sfxPoolIndex];
    sound = new Audio(fileName)

    sound.currentTime = 0;
    sound.play()//.catch(err => window.alert("click first to geet soudn"));

    sfxPoolIndex = (sfxPoolIndex + 1) % sfxLimit;
}

//collision feature (spatial grid)
export const cellSize = 100;
export const totalColumns = canvas.width / cellSize;
export let grid = Array.from({length: totalColumns * totalColumns}, () => []);
export let cellChecks = [
  -totalColumns - 1, -totalColumns, -totalColumns + 1,
  -1,                0,             1,
  totalColumns - 1,  totalColumns,  totalColumns + 1
];

//drag feature. keep
let clickedCircle = null;
let lastX = 0;
let lastY = 0;
let lastTime = 0;

export let entities = { 
    faller: [],
    enemies: [], 
    swinger: [], 
    player: [],

    bullets : [],
    badBullets: []
    };

//keys
export const keysPressed = {
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    KeyC: false,
    ShiftLeft: false 
};

export function getRng(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animate() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //timer
    document.getElementById('timer').textContent = 
    (performance.now() / 1000).toFixed(2);

    animateFunc.clearCells();

    animateFunc.updatePlayer();

    animateFunc.updateAll();

    animateFunc.gridIndexAll();
    
    animateFunc.collisionsAll();

    animateFunc.drawFaller();

    animateFunc.drawSingleShooter();

    animateFunc.drawSpreadShooter();

    animateFunc.drawChargeHitter();

    animateFunc.drawLaserShooter();

    animateFunc.drawBullets();

    animateFunc.drawSwinger();

    //animateFunc.filterBullets();
    entities.bullets = entities.bullets.filter(b => b.toDelete == false && Math.abs(b.vx) + Math.abs(b.vy) >= 100);
    entities.badBullets = entities.badBullets.filter(b => b.toDelete == false && Math.abs(b.vx) + Math.abs(b.vy) >= 10);

    //point system
    pointsCounter.handleEnemyDeath();
    document.getElementById('counter').textContent = destroyedCounter;

    //health death system
    if (playerStats.health <= 0 && !immortal) { 
        entities.player = [];
        isPlayerCreated = false;
        gameState.drawDeathMenu();
    }
    document.getElementById('playerhealth').textContent = playerStats.health;

    //to check if there are no enemies to move on levels
    levelManager.getSuccess();

    unlockNextLevel();

    document.getElementById("playerStatsPrototype").textContent = Object.entries(playerStats);

    requestAnimationFrame(animate);
};

//buttons
freeFall.onclick = () => {
    let o = new Circle(getRng(0, canvas.width), getRng(0, canvas.height), getRng(10, 30), getRng(-10, 10), getRng(-10, 10), 0, 0);
    entities.faller.push(o);
};

test.onclick = () => {
    spawnLaserShooter();
};

pendulum.onclick = () => {
    let o = new Circle(300, 250, 20, 0, 0, 0, 0, Math.PI/2, 0, 0, 100) //pendulum swing soon
    entities.swinger.push(o);
};

singleshooterButton.onclick = () => {
    spawnSingleShooter();
};

spreadshooterButton.onclick = () => {
    spawnSpreadShooter();
};

chargehitterButton.onclick = () => {
    spawnChargeHitter();
};

nextLevelButton.onclick = () => {
    if (levelManager.nextLevel() == false) return;
    levelManager.startCurrentLevel();
};

reset.onclick = () => {
    entities.faller = [];
    entities.enemies = [];
};

//mouse pos func and events
function getMousePos(event) {
    let rect = canvas.getBoundingClientRect();
    return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
    };
};

canvas.addEventListener('mousedown', (event) => {
    let mouse = getMousePos(event);
    interacted = true;

    clickedCircle = entities.faller.find(o => {
        let dx = mouse.x - o.x;
        let dy = mouse.y - o.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= o.radius;
  });

    if (clickedCircle) {
        clickedCircle.isDragged = true;
        clickedCircle.vx = 0;
        clickedCircle.vy = 0;
    }
});

canvas.addEventListener('mousemove', (event) => {
    let mouse = getMousePos(event);
    let currentTime = performance.now();
    let timeDelta = (currentTime - lastTime) / 30;

    if (clickedCircle) {
        clickedCircle.x = mouse.x;
        clickedCircle.y = mouse.y;
        
        if (timeDelta > 0) {
            clickedCircle.vx = (mouse.x - lastX) / timeDelta;
            clickedCircle.vy = (mouse.y - lastY) / timeDelta;

        }
    }
    lastX = mouse.x;
    lastY = mouse.y;
    lastTime = currentTime;
});

window.addEventListener('mouseup', () => {
    if (clickedCircle) {
        clickedCircle.isDragged = false;
    }
    clickedCircle = null;
});

window.addEventListener('keydown', (event) => {
    if (event.code in keysPressed) {
        keysPressed[event.code] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code in keysPressed) {
        keysPressed[event.code] = false;
    }
});

//FUNCTIONSSS~~~~~~~~~~~~
function createPlayer() {
    if (isPlayerCreated) return;

    let o = new Player(250, 250, 15, 0, 0, 0, 0, 0);
    entities.player.push(o);

    isPlayerCreated = true;
};

levelButtons();
createPlayer();
levelManager.startCurrentLevel();
animate();

document.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.blur();
  }
}); //to unselect buttons after clicking!!!!!
