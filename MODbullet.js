// module for bullet classes
import { canvas, ctx, nextCircleId, cellSize, 
    totalColumns, grid, cellChecks, isPlayerCreated, 
    interacted } from './index.js';

//arrays
import { entities } from './index.js'

//sound
import { playSound, sfxLimit, sfxPool, sfxPoolIndex } from './index.js';

import { playerStats, playerStatsOriginal } from './MODplayer.js'
export class Bullet {
    constructor(x, y, radius, vx, vy, ax, ay, mass) { //dont think i need id cuz it inherits
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
        this.mass = mass;
        this.bullet = true;

        //technical
        this.gridIndex = 0;
        this.id = nextCircleId.id++;
        this.toDelete = false;

    } 

    update(dt) {
        //if (this.isDragged) return;
        
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    drawBullets() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 0.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe54f';
        ctx.strokeStyle = "#ffa200";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
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

    getGridIndex() {
        if (this.badLaser) return;
        let col = Math.floor(this.x / cellSize);
        let row = Math.floor(this.y / cellSize);

        col = Math.max(0, Math.min(col, totalColumns - 1));
        row = Math.max(0, Math.min(row, totalColumns - 1));

        this.gridIndex = col + (row * totalColumns);
  
        if (grid[this.gridIndex]) {
            grid[this.gridIndex].push(this);
        }
    }

    checkCollisions(exceptPlayer, exceptEnemies) {
        for (let check of cellChecks) {
        let targetIndex = this.gridIndex + check;

        // pre checks
        if (!grid[targetIndex] || grid[targetIndex].length === 0) continue;
        if (check === 0 && grid[targetIndex].length <= 1) continue;

            for (let o of grid[targetIndex]) {
                if (this.id <= o.id) continue; //anti double collide
                if (o.bullet && !o.badBullet) continue; //good bullet colliding with good bullet

                if (exceptPlayer && o.isPlayer) continue; //good bullet colliding with player
                if (exceptPlayer && !this.ultimate && o.badBullet) continue; //good bullet, not ultimate, colliding with bad bullet

                    let dx = this.x - o.x;
                    let dy = this.y - o.y;
                    let distanceSq = (dx * dx) + (dy * dy);

                    if (distanceSq === 0) { //just in case check
                        this.x += 0.1;
                        continue;
                    }

                    let radiusSq = (this.radius + o.radius) * (this.radius + o.radius);

                    if (distanceSq <= radiusSq) {
                        let distance = Math.sqrt(distanceSq);
                        let offset = (this.radius + o.radius) - distance;
                        let directionX = dx / distance; // (-1, 1)
                        let directionY = dy / distance; // (-1, 1)

                        if (this.ultimate && o.badBullet) { //ultimate breaks bad bullets check
                            o.toDelete = true;
                            continue;
                        }

                        this.toDelete = true;
                        o.damaged = true;
                        o.health -= playerStats.bulletDamage; //for enemies
                        
                        let knockback = this.radius > 50 ? 100000 : 15000;
                        o.vx -= (knockback / o.mass) * directionX;
                        o.vy -= (knockback / o.mass) * directionY;
          
                        console.log("hit!");
                        //new Audio('ow.mp3').play();
                    }
                }
            }
        }
    }

export class BadBullet extends Bullet {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.badBullet = true;
        this.toDelete = false;

    } 

    drawBadBullets() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00c3';
        ctx.strokeStyle = "#ff78dd";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    checkCollisions(exceptPlayer, exceptEnemies) {
        for (let check of cellChecks) {
        let targetIndex = this.gridIndex + check;

        // pre checks
        if (!grid[targetIndex] || grid[targetIndex].length === 0) continue;
        if (check === 0 && grid[targetIndex].length <= 1) continue;

            for (let o of grid[targetIndex]) {
                if (this.id <= o.id) continue; //anti double collide
                if (o.stealth) continue;

                if (exceptEnemies && !o.isPlayer) continue; //not player, not swinger? check
                if (exceptEnemies && o.bullet) continue; //bad bullet collide with good bullet ignore

                    let dx = this.x - o.x;
                    let dy = this.y - o.y;
                    let distanceSq = (dx * dx) + (dy * dy);

                    if (distanceSq === 0) {// just in case check
                        this.x += 0.1;
                        continue;
                    }

                    let radiusSq = (this.radius + o.radius) * (this.radius + o.radius);

                    if (distanceSq <= radiusSq) {
                        let distance = Math.sqrt(distanceSq);
                        let offset = (this.radius + o.radius) - distance;
                        let directionX = dx / distance; // (-1, 1)
                        let directionY = dy / distance; // (-1, 1)

                        if (o.ultimate) { //ultimate destroys bad bullet
                            this.toDelete = true;
                            continue;
                        }
                    
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

                            this.toDelete = true;
                            o.damaged = true;
                        }
                    }

                        
            }
        }
    }
}

export class BadLaser extends Bullet {
    constructor(x, y, mass) {
        super(x, y, mass);
        this.badLaser = true;
        this.badBullet = true;
        this.toDelete = false;

        this.warningLaser = true; 

    } 

    drawWarningLaser() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        ctx.rect(25, -25, 1000, 50);
        ctx.fillStyle = '#ff00000f';
        ctx.strokeStyle = "#ff000010";
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.restore();
        
    }

    drawBadLaser() {
        ctx.save();
        if (this.warningLaser === true) {
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle)
            ctx.rect(100, -40, 1000, 80);
            ctx.fillStyle = '#ff000014';
            ctx.strokeStyle = "#ff000023";
            ctx.lineWidth = 0;
            ctx.fill();
        } else if (this.warningLaser === null) {
            return;
        } else if (this.warningLaser === false) {
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.rect(100, -40, 1000, 80)
            ctx.fillStyle = '#ff299887';
            ctx.strokeStyle = "#d178fd4d";
            ctx.lineWidth = 50;
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }

    checkCollisions(exceptPlayer, exceptEnemies) {
        if (this.warningLaser === true || this.warningLaser === null) return;

        let p = entities.player[0];
        if (p.stealth) return;

        let knockback = 50;
        let laserWidth = 50;

        let nSlope = Math.tan(this.angle);
        let pSlope = -1 / nSlope;

        if (nSlope === 0) nSlope += 0.1; //TODO: learn how to use vectors so no edge cases
        if (nSlope > 10000) nSlope = 10000;
        if (nSlope < -10000) nSlope = -10000;

        let bx = ((-this.y + p.y + nSlope * this.x - pSlope * p.x) / (nSlope - pSlope));
        let by = nSlope * (bx - this.x) + this.y;

        let dx = p.x - bx;
        let dy = p.y - by;

        let distanceSq = (dx * dx) + (dy * dy)

        if (distanceSq <= (laserWidth * laserWidth)) {
            p.damaged = true
            p.vx += knockback * Math.cos(this.angle);
            p.vy += knockback * Math.sin(this.angle);
        }
    }

    checkCollisionsOld(exceptPlayer, exceptEnemies) {
        //not optimal. but cool to know
        if (this.warningLaser === true || this.warningLaser === null) return;

        let p = player[0];
        let knockback = 50;

        let ox = this.x //its already centered somehow????? it works tho so i dont mind lol
        let oy = this.y
        let slope = Math.tan(this.angle);

        let by = slope * (p.x - ox) + oy; //this finds the y value of the laser at x = player.x
        let diffY = Math.abs(p.y - by);

        let bx = ((p.y - this.y) / slope) + this.x;
        let diffX = Math.abs(p.x - bx);
        //maybe use optimization with derivatives to find perpendicular path to laser instead?
        if (diffY <= 85 || diffX <= 85) {
            p.damaged = true
            p.vx += knockback * Math.cos(this.angle);
            p.vy += knockback * Math.sin(this.angle);
        };
    }
}