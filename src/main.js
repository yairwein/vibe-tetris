const THREE = require('three');
const { TetrisGame } = require('./game.js');

// Make THREE available globally
window.THREE = THREE;

// Game configuration
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log("Starting Tetris game...");
    
    try {
        const game = new TetrisGame(GRID_WIDTH, GRID_HEIGHT, BLOCK_SIZE);
        console.log("Game initialized");
        game.start();
        console.log("Game started");
    } catch (error) {
        console.error("Error starting game:", error);
        document.getElementById('canvas-container').innerHTML = 
            `<div style="color:red;padding:20px;">Error: ${error.message}</div>`;
    }
}); 