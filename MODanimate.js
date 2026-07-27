//modules for aniamtion/physics classes [WIP]
import { canvas, ctx, nextCircleId, cellSize, 
    totalColumns, grid, cellChecks, isPlayerCreated, 
    interacted } from './index.js';

//arrays
import { entities } from './index.js'

//misc
import { playerMoveSet, playerStats, playerStatsOriginal } from './MODplayer.js';

//sound
import { playSound } from './index.js';


//use delta time here. make the function here
export class Animate { //list all functions needed in animate func
    constructor(deltaTime) {
        this.deltaTime = deltaTime;
    }
    
    clearCells() {
        for (let cell of grid) {
            cell.length = 0;
        };
    };

    updatePlayer() {
        for (let i of entities.player) {
            playerMoveSet(i);
            i.update(0.1);
            i.checkBorders();
            i.getAngle();
            i.drawDirection();
        
            if (i.damaged && i.cooldown < 3) {
                if (i.damageCooldown <= 0) {
                    i.damageCooldown = 10;
                    playerStats.health--;
                    playSound('SFXow.mp3');
                };

                i.cooldown++;
                i.drawDamage();
            } else {
                i.damaged = false;
                i.drawPlayer();
                i.cooldown = 0;
                i.damageCooldown--;
            }
        }
    }

    updateAll() {
        for (let o of entities.bullets) o.update(0.1);
        for (let o of entities.badBullets) o.update(0.1);
        for (let o of entities.faller) o.update(0.1);
        for (let o of entities.enemies) o.update(0.1);
        for (let o of entities.swinger) { o.applyTorque(-0.098 * Math.sin(o.theta)); o.swing(0.1); }
    }
    
    gridIndexAll() {
        for (let i of entities.player) i.getGridIndex();
        for (let o of entities.faller) o.getGridIndex();
        for (let o of entities.enemies) o.getGridIndex();
        for (let o of entities.swinger) o.getGridIndex();
        for (let o of entities.bullets) o.getGridIndex();
        for (let o of entities.badBullets) o.getGridIndex();
    }

    collisionsAll() {
        for (let i of entities.player) i.checkCollisions();
        for (let o of entities.bullets) o.checkCollisions(true, false);
        for (let o of entities.badBullets) o.checkCollisions(false, true)
        for (let o of entities.faller) o.checkCollisions();
        for (let o of entities.enemies) o.checkCollisions(o.chargeHitter);
        for (let o of entities.swinger) o.checkCollisions();
    };

    drawBullets() {
        for (let b of entities.bullets) {
            if (!b.ultimate) {b.checkBorders()}; //only ultimate doesnt care about borders
            b.drawBullets();
        };

        for (let b of entities.badBullets) {
            if (b.badLaser) {
                b.drawBadLaser();
            } else {
                b.checkBorders(); 
                b.drawBadBullets();
            }
        };
    };

    drawFaller() {
        for (let o of entities.faller) {
            o.checkBorders();
        
            if (o.damaged && o.cooldown < 3) {
                o.cooldown++;
                o.drawDamage();
            } else {
                o.damaged = false;
                o.draw()
                o.cooldown = 0;
            };
        };
    };

    drawSingleShooter() {
        for (let b of entities.enemies) {
            if (!b.singleShooter) continue;
            if (b.fireBossCooldown <= 0) {
                b.shootBossBullet(b, false);
                b.fireBossCooldown = 50;
            };
            if (b.fireBossCooldown > 0) b.fireBossCooldown--;
            b.getAngle(b);
            b.drawDirection();
            b.checkBorders();

            if (b.damaged && b.cooldown < 3) {
                b.cooldown++;
                b.drawDamage();
            } else {
                b.damaged = false;
                b.drawBoss()
                b.cooldown = 0;
            };
        };
    };
    
    drawSpreadShooter() {
        for (let b of entities.enemies) {
            if (!b.spreadShooter) continue;
            if (b.fireBossCooldown <= 0) {
                b.shootBossBullet(b, false);
                b.fireBossCooldown = 500;
            };
            if (b.fireBossCooldown > 0) b.fireBossCooldown--;
            b.drawDirection();
            b.checkBorders();

            if (b.damaged && b.cooldown < 3) {
                b.cooldown++;
                b.drawDamage();
            } else {
                b.damaged = false;
                b.drawBoss()
                b.cooldown = 0;
            };
        };
    };

    drawChargeHitter() {
        for (let b of entities.enemies) {
            if (!b.chargeHitter) continue;
            if (b.fireBossCooldown <= 0) {
                b.shootBossBullet(b, false);
                b.fireBossCooldown = 150;
            };

            if (b.fireBossCooldown > 0) { 
                b.vx /= 1.015;
                b.vy /= 1.015;
                b.fireBossCooldown--;
            };
            b.getAngle(b);
            b.drawDirection();
            b.checkBorders();

            if (b.damaged && b.cooldown < 3) {
                b.cooldown++;
                b.drawDamage();
            } else {
                b.damaged = false;
                b.drawBoss()
                b.cooldown = 0;
            };
        };
    };

    drawLaserShooter() {
        for (let b of entities.enemies) {
            if (!b.laserShooter) continue;
            if (b.fireBossCooldown <= 0) {
                b.shootBossBullet(b, false);
            } else {
                b.fireBossCooldown--;
            }
            b.getAngle(b);
            b.drawDirection();
            b.checkBorders();

            if (b.damaged && b.cooldown < 3) {
                b.cooldown++;
                b.drawDamage();
            } else {
                b.damaged = false;
                b.drawBoss()
                b.cooldown = 0;
            };
        };
    };

    drawSwinger() {
        for (let o1 of entities.swinger) {
            o1.checkBorders();
            o1.drawPendulum();
        };
    };

    filterBullets() { //doesnt work bcs its using vars from another module
        entities.bullets = entities.bullets.filter(b => b.toDelete == false && Math.abs(b.vx) + Math.abs(b.vy) >= 100);
        entities.badBullets = entities.badBullets.filter(b => b.toDelete == false && Math.abs(b.vx) + Math.abs(b.vy) >= 10);
    };
}