// Game configuration
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Function to check if Three.js is loaded
function isThreeJsLoaded() {
    return typeof THREE !== 'undefined';
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    console.log("Starting Tetris game...");
    
    // Check if Three.js is loaded
    if (!isThreeJsLoaded()) {
        console.error("Three.js is not loaded. Please check your internet connection or try a different CDN.");
        document.getElementById('canvas-container').innerHTML = 
            '<div style="color:red;padding:20px;">Error: Three.js library could not be loaded.</div>';
        return;
    }
    
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