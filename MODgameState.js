//module for game state class (were gonna use html instead of this!)
import { canvas, ctx, nextCircleId, cellSize, 
    totalColumns, grid, cellChecks, isPlayerCreated, 
    interacted } from './index.js';

import { entities, levelManager } from './index.js'
export class GameState { 
    constructor(state) {
        this.state = "MAINMENU";
    };

    drawMainMenu() {
        this.state = "MAINMENU"
    // 1. Clear the canvas with a solid color
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw the Game Title Text
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("overstimulated: the game", canvas.width / 2, 150);

    // 3. Draw a "Start Button" Box
        ctx.fillStyle = "#3498db";
        ctx.fillRect(canvas.width / 2 - 100, 250, 200, 50);

    // 4. Draw the Text inside the Button
        ctx.font = "24px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("start?", canvas.width / 2, 282);
    }

    drawDeathMenu() {
        this.state = "DEATHMENU"

        ctx.fillStyle = "#c3290e9b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("u dided", canvas.width / 2, 150);

        ctx.fillStyle = "#7d858a";
        ctx.fillRect(canvas.width / 2 - 100, 250, 200, 50);

        ctx.font = "24px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("refresh to restart", canvas.width / 2, 282);
    }

    resetGame() {

    }
    
};

function screenShake(multiplier) { //new feature

}
//main menu
const mainMenu = document.getElementById('mainMenu');
const startGameBtn = document.getElementById('startGameBtn');

startGameBtn.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
});

//levels buttons
export const winMenu = document.getElementById('winMenu');
const retryLevelBtn = document.getElementById('retryLevelBtn');
const pauseLevelBtn = document.getElementById('pauseLevelBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

retryLevelBtn.addEventListener('click', () => {
    winMenu.classList.add('hidden');
    levelManager.resetLevel();
    levelManager.startCurrentLevel();
});

pauseLevelBtn.addEventListener('click', () => {
    winMenu.classList.add('hidden');
    levelManager.resetLevel();
    levelManager.pause = true;
});

nextLevelBtn.addEventListener('click', () => {
    winMenu.classList.add('hidden');
    levelManager.resetLevel();
    levelManager.nextLevel();
    levelManager.startCurrentLevel();
});


