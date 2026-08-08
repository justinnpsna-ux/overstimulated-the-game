// module for boss classes
import { canvas, ctx, nextCircleId, cellSize, 
    totalColumns, grid, cellChecks, isPlayerCreated, 
    interacted } from './index.js';

//arrays
import { entities } from './index.js'

//sound
import { playSound, sfxLimit, sfxPool, sfxPoolIndex } from './index.js';

//bad bullets
import { BadBullet, BadLaser, Bullet } from './MODbullet.js'

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        //default
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.ax = ax;
        this.ay = ay;
        this.mass = 10 * Math.PI * radius * radius;
        this.enemy = true;
        this.health = Math.floor(radius) / 5;

        //technical
        this.gridIndex = 0;
        this.id = nextCircleId.id++;
        this.damaged = false;
        this.toDelete = false;
        
        //moveset/damage
        this.cooldown = 0;
        this.fireBossCooldown = 50;

    } 

    update(dt) {
        //if (this.isDragged) return;
        
        this.vx += this.ax * dt;
        this.vy += this.ay * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    drawDeath() {
        if (this.health > 0) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.closePath();
    }

    drawDamage() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e04b4b';
        ctx.fill();
        ctx.closePath();
    }

    drawDirection() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        ctx.rect(15, -15, 50, 30);
        ctx.fillStyle = '#717171';
        ctx.strokeStyle = "#5a5656";
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.restore();
    }

    getAngle(boss) {
        if (!isPlayerCreated || !interacted) return;
        let p = entities.player[0];

        let speed = 40;

        let dx = p.x - boss.x;
        let dy = p.y - boss.y;

        let angle = Math.atan2(dy, dx);

        if (dx === 0 && dy === 0) {
            angle = 0;
        }
        
        this.angle = angle;
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
        let col = Math.floor(this.x / cellSize);
        let row = Math.floor(this.y / cellSize);

        col = Math.max(0, Math.min(col, totalColumns - 1));
        row = Math.max(0, Math.min(row, totalColumns - 1));

        this.gridIndex = col + (row * totalColumns);
  
        if (grid[this.gridIndex]) {
            grid[this.gridIndex].push(this);
        }
    }

    checkCollisions(doesDamage) {
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

                            if (doesDamage && o.isPlayer && o.cooldown <= 0) {
                                o.damaged = true;
                            };
                        }
                    }

                        
            }
        }
    }
}

export class SingleShooter extends Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.singleShooter = true;

    } 

    drawBoss() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#680853';
        ctx.strokeStyle = "#e3352f";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    shootBossBullet(boss, big) {
        if (!isPlayerCreated || !interacted) return;
        let p = entities.player[0];

        let speed = 40;

        let dx = p.x - boss.x;
        let dy = p.y - boss.y;

        let angle = Math.atan2(dy, dx);

        if (dx === 0 && dy === 0) {
            angle = 0;
        }

        let bvx = Math.cos(angle) * speed;
        let bvy = Math.sin(angle) * speed;

        let o = new BadBullet(boss.x + (boss.radius + 5) * Math.cos(angle), 
        boss.y + (boss.radius + 5) * Math.sin(angle), 5, bvx, bvy, 0, 0, 0);
        
        o.mass = 500;

        if (big) o.radius = 25;

        o.bullet = true;
        entities.badBullets.push(o); // array is in another module.!!!!!
        playSound('SFXheehaw.mp3');
    };

};

export class SpreadShooter extends Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.spreadShooter = true;

    } 

    drawBoss() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#c446a8';
        ctx.strokeStyle = "#ffc96c";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    drawDirection() {
        let angle = 0;
        while(angle < 7) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle)
            ctx.rect(7.5, -7.5, 25, 15);
            ctx.fillStyle = '#8aa7b5';
            ctx.strokeStyle = "#9abed6";
            ctx.lineWidth = 0;
            ctx.fill();
            ctx.restore();
            angle += Math.PI / 4
        }
    }

    shootBossBullet(boss, big) {
        if (!isPlayerCreated || !interacted) return;
        let p = entities.player[0];

        let speed = 20;

        let bulletNumber = 0;
        let angle = 0;

        while (bulletNumber < 8) {
            let bvx = Math.cos(angle) * speed;
            let bvy = Math.sin(angle) * speed;
            let o = new BadBullet(boss.x + (boss.radius + 5) * Math.cos(angle), 
            boss.y + (boss.radius + 5) * Math.sin(angle), 5, bvx, bvy, 0, 0, 0);
            o.mass = 500;

            if (big) o.radius = 25;

            o.bullet = true;
            entities.badBullets.push(o);
            angle += Math.PI / 4;
            bulletNumber++
        }
       
        playSound('SFXheehaw.mp3');
        bulletNumber = 0;
    };

};

export class ChargeHitter extends Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.chargeHitter = true;

        //stats
        this.health = 15;
        this.mass = 5000;

    } 

    drawBoss() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#c40343';
        ctx.strokeStyle = "#95fff8";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    drawDirection() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle)
        ctx.rect(43, -43, 12, 86);
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0;
        ctx.fill();
        ctx.restore();
    }

    shootBossBullet(boss) { 
        if (!isPlayerCreated || !interacted) return;
        let p = entities.player[0];

        let speed = 80;

        let dx = p.x - boss.x;
        let dy = p.y - boss.y;

        let angle = Math.atan2(dy, dx);

        if (dx === 0 && dy === 0) {
            angle = 0;
        }

        let bvx = Math.cos(angle) * speed;
        let bvy = Math.sin(angle) * speed;

        //let o = new BadBullet(boss.x + (boss.radius + 5) * Math.cos(angle), 
        //boss.y + (boss.radius + 5) * Math.sin(angle), 5, bvx, bvy, 0, 0, 0);
        boss.vx = bvx;
        boss.vy = bvy;
        
        playSound('SFXjoyCharge.mp3');
    }
}

export class LaserShooter extends Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.laserShooter = true;
        this.laserTimer = 0;

        this.angle = 0;
        this.oldAngle = 0;

        this.radius = 80;
        this.health = 20;

    } 

    drawBoss() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#680785';
        ctx.strokeStyle = "#ff04c4";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    drawDirection() {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this.x, this.y);
        //ctx.rotate(this.angle)
        if (this.laserTimer < 450) {
            ctx.rotate(this.angle)
        } else if (this.laserTimer < 500 || this.laserTimer > 525) {
            ctx.rotate(this.oldAngle)
        } else {
            ctx.rotate(this.oldAngle)
        }
        ctx.rect(0, -75, 100, 150);
        ctx.fillStyle = '#46084d';
        ctx.strokeStyle = "#a806c5";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    async shootBossBullet(boss, big) {
        if (!isPlayerCreated || !interacted) return; 
  
        let p = entities.player[0]; 
        let knockback = 1; 
        let dx = p.x - boss.x; 
        let dy = p.y - boss.y; 
        let angle = Math.atan2(dy, dx); 
  
        if (dx === 0 && dy === 0) { angle = 0 }; 

        let o = new BadLaser(boss.x, boss.y); 

        if (this.laserTimer < 450) {
            o.warningLaser = true; 
            o.angle = angle;
            this.oldAngle = angle;

        } else if (this.laserTimer < 500 || this.laserTimer > 525) {
            o.warningLaser = null;
            this.angle = this.oldAngle;
            o.angle = this.oldAngle;
            
        } else {
            o.warningLaser = false;
            o.angle = this.oldAngle;            

        }
        
        entities.badBullets.push(o); 
        o.checkCollisions() //bad laser coll check doesnt work on MODanimate
        //if (!o.warningLaser) console.log(badBullets);
        boss.fireBossCooldown = 0; 

        if (o.warningLaser === false) {
            let bvx = Math.cos(this.oldAngle) * knockback; 
            let bvy = Math.sin(this.oldAngle) * knockback; 
            this.vx -= bvx; 
            this.vy -= bvy; 
        }

        this.vx /= 1.02; 
        this.vy /= 1.02; 


        ctx.save();
        await delay(1000); 
        this.laserTimer++;
        if (this.laserTimer === 1) playSound("SFXmamaHaha.mp3");
        if (this.laserTimer === 490) playSound("SFXmamaBoomShort.mp3");
        ctx.restore();
        
        if (this.laserTimer > 600) this.laserTimer = 0; //50 is 1 second
    }
}

export class SpinShooter extends Boss {
    constructor(x, y, radius, vx, vy, ax, ay, mass) {
        super(x, y, radius, vx, vy, ax, ay, mass);
        this.spinShooter = true;
        this.laserTimer = 0;

        this.angle = 0;
        this.oldAngle = 0;

        this.radius = 80;
        this.health = 20;

    } 

    drawBoss() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#d10e80';
        ctx.strokeStyle = "#ff04c4";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    drawDirection() {
        let angleNumber = 0;
        let angle = this.angle;
        let oldAngle = this.oldAngle;

        while(angleNumber < 8) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(this.x, this.y);
            //ctx.rotate(this.angle)
            if (this.laserTimer < 450) {
                ctx.rotate(angle)
            } else if (this.laserTimer < 500 || this.laserTimer > 525) {
                ctx.rotate(oldAngle)
            } else {
                ctx.rotate(oldAngle)
            }
            ctx.rect(0, -65, 80, 130);
            ctx.fillStyle = '#46084d';
            ctx.strokeStyle = "#a806c5";
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            angle += Math.PI / 4
            oldAngle += Math.PI / 4
            angleNumber++;
        }
        
    }

    async shootBossBullet(boss, big) {
        if (!isPlayerCreated || !interacted) return; 
  
        let p = entities.player[0]; 
        let knockback = 1; 
        let dx = p.x - boss.x; 
        let dy = p.y - boss.y; 
        let angle = Math.atan2(dy, dx); 
        let angleNumber = 0;
  
        if (dx === 0 && dy === 0) { angle = 0 }; 

        while(angleNumber < 8) {
            let o = new BadLaser(boss.x, boss.y); 

            if (this.laserTimer < 450) {
                o.warningLaser = true; 
                o.angle = angle;
                this.oldAngle = angle;

            } else if (this.laserTimer < 500 || this.laserTimer > 525) {
                o.warningLaser = null;
                o.angle = this.oldAngle;
            
            } else {
                o.warningLaser = false;
                o.angle = this.oldAngle;           

            }
        
            entities.badBullets.push(o); 
            o.checkCollisions() //bad laser coll check doesnt work on MODanimate

            if (o.warningLaser === false) {
                let bvx = Math.cos(this.oldAngle) * knockback; 
                let bvy = Math.sin(this.oldAngle) * knockback; 
                this.vx -= bvx; 
                this.vy -= bvy; 
            }
            angle += Math.PI / 4
            this.oldAngle += Math.PI / 4
            angleNumber++
        }

        this.vx /= 1.02; 
        this.vy /= 1.02; 

        boss.fireBossCooldown = 0; 
        ctx.save();
        await delay(1000); 
        this.laserTimer++;
        if (this.laserTimer === 1) playSound("SFXmamaHaha.mp3");
        if (this.laserTimer === 490) playSound("SFXmamaBoomShort.mp3");
        ctx.restore();
        
        if (this.laserTimer > 600) this.laserTimer = 0; //50 is 1 second
    }
}

function getDamage() { //feature? to show how much damage each enemy has?

};