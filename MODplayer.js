// module for player classes
import { canvas, ctx, nextCircleId, cellSize, 
    totalColumns, grid, cellChecks, isPlayerCreated, 
    interacted, keysPressed } from './index.js';

//arrays
import { entities } from './index.js'

//sound
import { playSound, sfxLimit, sfxPool, sfxPoolIndex } from './index.js';

//bad bullets
import { BadBullet, Bullet } from './MODbullet.js'

import { delay } from './MODboss.js';

export const playerStatsOriginal = //so we have a copy at all times
{   health: 10,
    bulletDamage: 1,
    bulletSize: 3,
    bulletSpeed: 100,
    movementSpeed: 10,
    dashDistance: 200,
    dashStealthDuration: 0,
    playerRadius: 15,

    fireCooldown: 20,
    ultimateCooldown: 75,
    dashCooldown: 60
};

export const playerStats = //so we can do power ups (maybe use points to buy?)
{   health: 10,
    bulletDamage: 1,
    bulletSize: 3,
    bulletSpeed: 100,
    movementSpeed: 10,
    dashDistance: 200,
    dashStealthDuration: 0, //every 10 = 1 second
    playerRadius: 15,

    fireCooldown: 20,
    ultimateCooldown: 75,
    dashCooldown: 60
};
export class Player {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        //default
        this.x = x;
        this.y = y;
        this.radius = playerStats.playerRadius;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
        this.mass = Math.PI * radius * radius;
        this.isPlayer = true;
        this.health = playerStats.health;

        //technical
        this.gridIndex = 0;
        this.id = nextCircleId.id++;
        this.damaged = false;
        this.toDelete = false;
        this.cooldown = 0;
        this.damageCooldown = 0;
        
        //moveset
        this.fireCooldown = 0;
        this.ultimateCooldown = 0;
        this.dashCooldown = 0;
        this.stealth = false; //dashStealth

        this.upgrades = {};
    } 

    update(dt) {
        //if (this.isDragged) return;
        
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    drawPlayer() {
        if (!this.stealth) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#7c7ce6';
            ctx.fill();
            ctx.closePath();
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#7c7ce662';
            ctx.fill();
            ctx.closePath();
        }
    }

    drawDamage() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e04b4b';
        ctx.fill();
        ctx.closePath();
    }

    drawDirection() {
        if (!this.stealth) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle)
            ctx.rect(5, -5, 20, 10);
            ctx.fillStyle = '#b5b5b5';
            ctx.strokeStyle = "#dbdbdb";
            ctx.lineWidth = 0;
            ctx.fill();
            ctx.restore();
        } else {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle)
            ctx.rect(5, -5, 20, 10);
            ctx.fillStyle = '#b5b5b52b';
            ctx.strokeStyle = "#dbdbdb";
            ctx.lineWidth = 0;
            ctx.fill();
            ctx.restore();
        }
    }

    drawTrail() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.rect(-playerStats.dashDistance - 10, -this.radius, playerStats.dashDistance + 10, this.radius * 2)
        ctx.fillStyle = '#7c7ce6';
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.restore();
    }

    checkBorders() {
        let restitution = 0.8
        if (this.y + this.radius > canvas.height) {
            this.vy *= -restitution
            this.y -= this.y + this.radius - canvas.height
        } else if (this.y - this.radius < 0) {
            this.vy *= -restitution
            this.y += -this.y + this.radius
        }

        if (this.x + this.radius > canvas.width) {
            this.vx *= -restitution
            this.x -= this.x + this.radius - canvas.width 
        } else if (this.x - this.radius < 0) {
            this.vx *= -restitution
            this.x += -this.x + this.radius 
        }
    }

    getAngle() {
        let angle = Math.atan2(this.vy, this.vx);

        if (this.vx === 0 && this.vy === 0) {
            angle = 0; 
        }

        this.angle = angle;
    }

    getGridIndex() {
        let col = Math.floor(this.x / cellSize);
        let row = Math.floor(this.y / cellSize);

        col = Math.max(0, Math.min(col, totalColumns - 1));
        row = Math.max(0, Math.min(row, totalColumns - 1));

        this.gridIndex = col + (row * totalColumns);
  
        if (grid[this.gridIndex]) {
            grid[this.gridIndex].push(this);
        }
    }

    checkCollisions() {
        for (let check of cellChecks) {
        let targetIndex = this.gridIndex + check;

        // pre checks
        if (!grid[targetIndex] || grid[targetIndex].length === 0) continue;
        if (check === 0 && grid[targetIndex].length <= 1) continue;

            for (let o of grid[targetIndex]) {
                if (this.id <= o.id) continue;

                    let dx = this.x - o.x;
                    let dy = this.y - o.y;
                    let distanceSq = (dx * dx) + (dy * dy);

                    if (distanceSq === 0) {
                        this.x += 0.1;
                        continue;
                    }

                    let radiusSq = (this.radius + o.radius) * (this.radius + o.radius);

                    if (distanceSq <= radiusSq) {
                        let distance = Math.sqrt(distanceSq);
                        let offset = (this.radius + o.radius) - distance;
                        let directionX = dx / distance; // (-1, 1)
                        let directionY = dy / distance; // (-1, 1)
                    
                        let totalMass = this.mass + o.mass;
                        let ratioMass = offset / totalMass;

                        this.x += (ratioMass) * (o.mass) * directionX;
                        this.y += (ratioMass) * (o.mass) * directionY;
                        o.x -= (ratioMass) * (this.mass) * directionX;
                        o.y -= (ratioMass) * (this.mass) * directionY

                        let relativeVX = this.vx - o.vx;
                        let relativeVY = this.vy - o.vy;
                        let velAlongNormal = (relativeVX * directionX) + (relativeVY * directionY);

                        // change to dot product
                        if (velAlongNormal < 0) {
                            let restitution = 0.8;
                            let impulse = -(1 + restitution) * velAlongNormal / ((1 / this.mass) +(1 / o.mass));

                            this.vx += (impulse / this.mass) * directionX;
                            this.vy += (impulse / this.mass) * directionY;
                            o.vx -= (impulse / o.mass) * directionX;
                            o.vy -= (impulse / o.mass) * directionY;
                        }
                    }

                        
            }
        }
    }
}

export function createPlayer() { //doesnt work because isPlayerCreated is constant when exporting
    if (isPlayerCreated) return;

    let o = new Player(250, 250, this.radius, 0, 0, 0, 0, 0);
    entities.player.push(o);

    isPlayerCreated = true;
};

function shootBullet(player) {
    if (!isPlayerCreated || !interacted) return;
    let speed = playerStats.bulletSpeed;

    let angle = Math.atan2(player.vy, player.vx);

    if (player.vx === 0 && player.vy === 0) {
        angle = 0; 
    }
    let bvx = Math.cos(angle) * speed;
    let bvy = Math.sin(angle) * speed;
    let o = new Bullet(player.x + (player.radius + 5) * Math.cos(angle), 
    player.y + (player.radius + 5) * Math.sin(angle), playerStats.bulletSize, bvx, bvy, 0, 0, 0);
    o.mass = 0.1;

    entities.bullets.push(o);
    playSound('SFXpew.mp3');
};

function shootUltimate(player) {
    if (!isPlayerCreated || !interacted) return;

    let o = new Bullet(player.x, 
    player.y, 85, 0, 0, 0, 0, 0);
    
    o.mass = 100;
    o.toDelete = true;
    o.ultimate = true;
    entities.bullets.push(o);
    playSound('SFXboom.mp3');
    playSound('SFXeireen.mp3');
};

function doDash(player) {
    if (!isPlayerCreated || !interacted) return;
    let dashDistance = playerStats.dashDistance; 

    let angle = Math.atan2(player.vy, player.vx);

    if (player.vx === 0 && player.vy === 0) {
        angle = 0; 
    };
    player.x += Math.cos(angle) * dashDistance;
    player.y += Math.sin(angle) * dashDistance;
    player.drawTrail();
    if (playerStats.dashStealthDuration > 0) doStealth(player);
    playSound('SFXkachow.mp3');
};

async function doStealth(player) {
    let timer = 0;

    while (timer < playerStats.dashStealthDuration) {
        player.stealth = true;

        ctx.save();
        await delay(100); //every 0.1 seconds, timer += 1
        timer++
        ctx.restore();
    }
    player.stealth = false;
};

export function playerMoveSet(player) {
    if (!interacted) return;
    let movementSpeed = playerStats.movementSpeed;

    if (keysPressed.KeyW && player.vy >= -100) {player.vy -= movementSpeed}
    if (keysPressed.KeyS && player.vy <= 100) {player.vy += movementSpeed}
    if (!keysPressed.KeyW && !keysPressed.KeyS) {player.vy *= 0.85}
    if (keysPressed.KeyA && player.vx >= -100) {player.vx -= movementSpeed}
    if (keysPressed.KeyD && player.vx <= 100) {player.vx += movementSpeed}
    if (!keysPressed.KeyA && !keysPressed.KeyD) {player.vx *= 0.85}
    
    if (keysPressed.Space && player.fireCooldown <= 0) {
        shootBullet(player);
        player.fireCooldown = playerStats.fireCooldown;
    };
    
    if (keysPressed.KeyC && player.ultimateCooldown <= 0) {
        shootUltimate(player);
        player.ultimateCooldown = playerStats.ultimateCooldown;
    };
    
    if (keysPressed.ShiftLeft && player.dashCooldown <= 0) {
        doDash(player);
        player.dashCooldown = playerStats.dashCooldown;
    };
    
    if (player.fireCooldown > 0) player.fireCooldown--;
    if (player.ultimateCooldown > 0) player.ultimateCooldown--;
    if (player.dashCooldown > 0) player.dashCooldown--;
}