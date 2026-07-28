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
            { name: "only in philly", desc: "-10% Reload Time", effect: {fireCooldown: -2} },
            { name: "taco bell 4am", desc: "+100% Bullet Size", effect: {bulletSize: +3}, requires: "Minigun" },
            { name: "mcdonalds world cup meal", desc: "+2 Health", effect: {health: 2} },
            { name: "chipotle double queso", desc: "-7% Ultimate Cooldown", effect: {ultimateCooldown: -5} },
            { name: "hesi pump fake", desc: "-20% Dash Cooldown", effect: {dashCooldown: -12} },
            { name: "after david laid edit", desc: "+20% Bullet Damage", effect: {bulletDamage: 0.2} },
            { name: "starbucks venti pumpkin spice", desc: "+40% Dash Distance", effect: {dashDistance: 80} },
            { name: "dominos 30 mins or less", desc: "+30% Bullet Speed", effect: {bulletSpeed: 30} },
            { name: "erling haaland vs ball", desc: "+20% Movement Speed", effect: {movementSpeed: 2} },
            { name: "fast metabolism", desc: "-10% Player Size", effect: {playerRadius: -1.5} },
            { name: "shaq free throw", desc: "+10% Bullet Recoil", effect: {bulletSpread: 1} },
            { name: "dry scoop pre workout", desc: "-20% Reload Time, -1 Health", effect: {fireCooldown: -4, health: -1} },
            { name: "after kpot", desc: "+30% Bullet Recoil, -30% Movement Speed", effect: {bulletSpread: 3, movementSpeed: -3} },
            { name: "hoodie method", desc: "Immune for +0.2s after Dash", effect: {dashStealthDuration: 2} },

            //1000 degree honey bun: burn enemies
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
