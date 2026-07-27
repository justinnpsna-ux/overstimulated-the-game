//module for upgrade class
import { playerStats, playerStatsOriginal } from "./MODplayer.js";
import { winMenu } from "./MODgameState.js";
import { entities, ctx, canvas, getRng } from "./index.js";
class Upgrade {
    constructor(health, cooldown, speed, damage, dash, misc) {
        this.health = health;
        this.cooldown = cooldown;
        this.speed = speed;
        this.damage = damage;
        this.dash = dash;
        this.misc = misc;

        this.upgradeList = [ //DICTIONARY!!!! i learned by random chance
            { name: "Minigun", desc: "-20% Fire Cooldown", effect: {fireCooldown: -4} },
            { name: "Minimegagun", desc: "+100% Bullet Size", effect: {bulletSize: +3}, requires: "Minigun" },
            { name: "McDonalds world cup meal", desc: "+5 Health", effect: {health: 5} },
            { name: "Chipotle", desc: "-20% Ultimate Cooldown", effect: {ultimateCooldown: -15} },
            { name: "Planet fitness", desc: "-20% Dash Cooldown", effect: {dashCooldown: -12} },
            { name: "lamine yamal", desc: "+20% Bullet Damage", effect: {ultimateCooldown: -15} },
            { name: "plyometrics", desc: "+20% Dash Distance", effect: {dashDistance: 40} }
        ];
    }

    getRandomizedUpgrade() {
        let index = getRng(0, this.upgradeList.length - 1);
        return this.upgradeList[index];
    }

};

export const upgrade = new Upgrade();
upgrade.getRandomizedUpgrade()

//upgrades buttons
export const upgradeMenu = document.getElementById('upgradeMenu');
const upgrade1Btn = document.getElementById('upgrade1Btn');
const upgrade2Btn = document.getElementById('upgrade2Btn');
const upgrade3Btn = document.getElementById('upgrade3Btn');

export const upgrade1 = document.getElementById('upgrade1');
export const upgrade2 = document.getElementById('upgrade2');
export const upgrade3 = document.getElementById('upgrade3');

upgrade1Btn.addEventListener('click', () => {
    let name = document.getElementById('upgrade1Name').textContent;
    entities.player[0].upgrades[name] = true;

    for (let u of upgrade.upgradeList) {
        if (u.name !== name) continue;
        let upgradeEffect = u.effect;

        for (const [key, value] of Object.entries(upgradeEffect)) {
            playerStats[key] += value;
        }
    }

    upgradeMenu.classList.add('hidden');
    winMenu.classList.remove('hidden');
});

upgrade2Btn.addEventListener('click', () => {
    let name = document.getElementById('upgrade2Name').textContent;
    entities.player[0].upgrades[name] = true;
    
    for (let u of upgrade.upgradeList) {
        if (u.name !== name) continue;
        let upgradeEffect = u.effect;

        for (const [key, value] of Object.entries(upgradeEffect)) {
            playerStats[key] += value;
        }
    }

    upgradeMenu.classList.add('hidden');
    winMenu.classList.remove('hidden');
});

upgrade3Btn.addEventListener('click', () => {
    let name = document.getElementById('upgrade3Name').textContent;
    entities.player[0].upgrades[name] = true;

    for (let u of upgrade.upgradeList) {
        if (u.name !== name) continue;
        let upgradeEffect = u.effect;

        for (const [key, value] of Object.entries(upgradeEffect)) {
            playerStats[key] += value;
        }
    }

    upgradeMenu.classList.add('hidden');
    winMenu.classList.remove('hidden');
});
