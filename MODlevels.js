//module for levels
import { Player, playerMoveSet } from './MODplayer.js'
import { Circle } from './MODcircle.js'
import { SingleShooter, SpreadShooter, ChargeHitter, LaserShooter } from './MODboss.js'
import { Bullet, BadBullet } from './MODbullet.js'

//arrays
import { entities, sfxPool } from './index.js'

import { levelManager } from './index.js'

//rng lol
import { getRng, canvas, ctx } from './index.js'

import { winMenu } from './MODgameState.js'
import { upgradeMenu, upgrade } from './MODupgrade.js'
export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
        this.pause = false;
        this.levels = [
            {
                isBeat: false,
                name: "Level 1: thats a lot of balls",
                spawnBall: 10
            },
            {
                isBeat: false,
                name: "Level 2: great... even more balls",
                spawnBall: 10,
                spawnSingleShooter: 1
            },
            {
                isBeat: false,
                name: "Level 3: take a load of these balls",
                spawnBall: 5,
                spawnSingleShooter: 2
            },
            {
                isBeat: false,
                name: "Level 4: wow. EVEN MORE BALLS",
                spawnBall: 5,
                spawnSingleShooter: 1,
                spawnSpreadShooter: 2
            },
            {
                isBeat: false,
                name: "Level 5: we might be cooked",
                spawnBall: 10,
                spawnSingleShooter: 1,
                spawnSpreadShooter: 1,
                spawnChargeHitter: 2
            },
            {
                isBeat: false,
                name: "Level 6: balls galore",
                spawnBall: 5,
                spawnSingleShooter: 3,
                spawnSpreadShooter: 2,
                spawnChargeHitter: 3
            },
            {
                isBeat: false,
                name: "Level 7: is that darth vader",
                spawnBall: 30,
                spawnSingleShooter: 1,
                spawnSpreadShooter: 2,
                spawnChargeHitter: 1,
                spawnLaserShooter: 1
            },
            {
                isBeat: false,
                name: "Level 8: why is everything red",
                spawnBall: 10,
                spawnSingleShooter: 2,
                spawnChargeHitter: 3,
                spawnLaserShooter: 3
            },
            {
                isBeat: false,
                name: "Level 9: u gotta be kidding me",
                spawnBall: 20,
                spawnSpreadShooter: 1,
                spawnChargeHitter: 5,
                spawnLaserShooter: 5
            },
            {
                isBeat: false,
                name: "Level 10: everything is literally red",
                spawnBall: 20,
                spawnLaserShooter: 30
            },
            {
                isBeat: false,
                name: "Level 11: do i ever get a break?",
                spawnBall: 20,
                spawnSingleShooter: 15,
                spawnChargeHitter: 15
            }
        ]
    }

    startCurrentLevel(index) {
        if (index === undefined) index = this.currentLevelIndex;
        for (let [key, value] of Object.entries(this.levels[index])) {
            if (key == "isBeat") continue;
            if (key == "name") { //if name, isBeat, skip
                console.log(value);
                continue;
            };

            const actualFunction = spawnFunctions[key];

            if (actualFunction) {
                while (value > 0) {
                actualFunction(); 
                value--;
                }
            } else {
                console.warn(`No function found for key: ${key}`);
            }
        }
    }

    getCurrentLevel() {
        console.log(this.levels[this.currentLevelIndex].name);
    }

    nextLevel() {
        if (this.currentLevelIndex == this.levels.length - 1) return false;
        this.currentLevelIndex++;
    }

    resetLevel() {
        entities.enemies = [];
        entities.faller = [];

        entities.bullets =[];
        entities.badBullets = [];

        sfxPool.pool = [];
    }

    getSuccess() {
        if (this.levels[this.currentLevelIndex].isBeat) return;
        if (entities.faller.length > 0 || entities.enemies.length > 0) return;
        this.levels[this.currentLevelIndex].isBeat = true;
        this.resetLevel();
        upgradeMenu.classList.remove('hidden');
        this.getUpgrades();
        //this.getUpgradeMenu()
    }

    getUpgrades() {
        let upgrade1 = upgrade.getRandomizedUpgrade();
        let upgrade2 = upgrade.getRandomizedUpgrade();
        let upgrade3 = upgrade.getRandomizedUpgrade();
        document.getElementById('upgrade1Name').textContent = upgrade1.name;
        document.getElementById('upgrade2Name').textContent = upgrade2.name;
        document.getElementById('upgrade3Name').textContent = upgrade3.name;

        document.getElementById('upgrade1Desc').textContent = upgrade1.desc;
        document.getElementById('upgrade2Desc').textContent = upgrade2.desc;
        document.getElementById('upgrade3Desc').textContent = upgrade3.desc;
    }

    getUpgradeMenu() { //implement upgrade in certain level
        console.log(upgradeMenu.classList.value.includes('hidden'))
        if (!this.levels[this.currentLevelIndex].isBeat) return;
        //if (!this.levels[this.currentLevelIndex].upgrade) return;
        if (upgradeMenu.classList.value.includes('hidden')) upgradeMenu.classList.remove('hidden');
    }

};

const spawnFunctions = {
    spawnBall: spawnBall,                 
    spawnSingleShooter: spawnSingleShooter,
    spawnSpreadShooter: spawnSpreadShooter,
    spawnChargeHitter: spawnChargeHitter,
    spawnLaserShooter: spawnLaserShooter
};

export function spawnBall() {
    let o = new Circle(getRng(0, canvas.width), getRng(0, canvas.height / 2), getRng(15, 25), getRng(-5, 5), getRng(-5, 5), 0, 0);
    entities.faller.push(o);
};

export function spawnSingleShooter() {
    let o = new SingleShooter(getRng(0, canvas.width), getRng(0, canvas.height / 3), 50, 0, 0, 0, 0, 0);
    o.fireBossCooldown = 100;
    entities.enemies.push(o);
};

export function spawnSpreadShooter() {
    let o = new SpreadShooter(getRng(0, canvas.width), getRng(0, canvas.height / 3), 30, 0, 0, 0, 0);
    o.fireBossCooldown = 200;
    entities.enemies.push(o);
};

export function spawnChargeHitter() {
    let o = new ChargeHitter(getRng(0, canvas.width), getRng(0, canvas.height / 3), 60, 0, 0, 0, 0);
    o.fireBossCooldown = 200;
    entities.enemies.push(o);
};

export function spawnLaserShooter() {
    let o = new LaserShooter(getRng(0, canvas.width), getRng(0, canvas.height / 4), 60, 0, 0, 0, 0);
    o.fireBossCooldown = 100;
    entities.enemies.push(o);
};

//levels buttons
const levelsPage = document.getElementById('levelsPage');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');

openBtn.addEventListener('click', () => {
    levelsPage.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
    levelsPage.classList.add('hidden');
});

export function unlockNextLevel() {
    const buttons = document.querySelectorAll('.level');
    let index = levelManager.currentLevelIndex; 
    if (levelManager.levels[index].isBeat) {
        buttons[index + 1].classList.add('access');
    }
}

export function levelButtons() {
    const buttons = document.querySelectorAll('.level');

    buttons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            console.log(levelManager.levels[index].isBeat)
            if (buttons[index].classList.value.includes('access')) {
                levelsPage.classList.add('hidden');
                levelManager.resetLevel();
                levelManager.startCurrentLevel(index);
                levelManager.currentLevelIndex = index;
            }
        });
    });
}

