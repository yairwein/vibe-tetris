const THREE = require('three');
const { SHAPES, Tetromino } = require('./tetromino.js');

class TetrisGame {
    constructor(width, height, blockSize) {
        this.width = width;
        this.height = height;
        this.blockSize = blockSize;
        this.grid = Array(height).fill().map(() => Array(width).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        
        // Initialize Three.js scene
        this.initScene();
        
        // Create grid blocks
        this.gridBlocks = [];
        
        // Current and next tetromino
        this.currentTetromino = null;
        this.nextTetromino = null;
        
        // Game speed (milliseconds per drop)
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // Input handling
        this.setupInput();
        
        // DOM elements
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.gameOverElement = document.getElementById('game-over');
        this.restartButton = document.getElementById('restart-button');
        
        this.restartButton.addEventListener('click', () => this.restart());
    }
    
    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111111);
        
        // Create camera with adjusted view size
        const aspectRatio = this.width / this.height;
        const viewSize = this.height * this.blockSize * 0.8; // Increased from 0.7
        this.camera = new THREE.OrthographicCamera(
            -aspectRatio * viewSize, aspectRatio * viewSize,
            viewSize, -viewSize,
            0.1, 1000
        );
        this.camera.position.z = 100;
        
        // Create renderer with adjusted size
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width * this.blockSize * 2.0, this.height * this.blockSize * 2.0); // Increased from 1.8
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
        
        // Create game board outline
        this.createBoardOutline();
    }
    
    createBoardOutline() {
        const boardWidth = this.width * this.blockSize;
        const boardHeight = this.height * this.blockSize;
        
        const geometry = new THREE.BoxGeometry(boardWidth, boardHeight, this.blockSize);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({ color: 0x444444 });
        const boardOutline = new THREE.LineSegments(edges, material);
        
        // Position the board at the origin (0,0,0)
        // This makes it easier to align everything
        boardOutline.position.set(0, 0, -this.blockSize/2);
        
        this.scene.add(boardOutline);
    }
    
    setupInput() {
        document.addEventListener('keydown', (event) => {
            if (this.gameOver) return;
            if (this.paused && event.key !== 'p') return;
            
            switch (event.key) {
                case 'ArrowLeft':
                    if (this.currentTetromino) {
                        this.currentTetromino.move(-1, 0, this.grid);
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentTetromino) {
                        this.currentTetromino.move(1, 0, this.grid);
                    }
                    break;
                case 'ArrowUp':
                    if (this.currentTetromino) {
                        this.currentTetromino.rotate(this.grid);
                    }
                    break;
                case 'ArrowDown':
                    if (this.currentTetromino) {
                        this.currentTetromino.move(0, 1, this.grid);
                    }
                    break;
                case ' ': // Space for hard drop
                    this.hardDrop();
                    break;
                case 'p': // Pause
                    this.togglePause();
                    break;
            }
        });
    }
    
    start() {
        this.spawnTetromino();
        this.gameLoop();
    }
    
    gameLoop(timestamp) {
        if (this.gameOver) return;
        
        // Ensure timestamp is a number
        timestamp = timestamp || 0;
        
        if (!this.paused) {
            // Handle automatic dropping
            if (!this.lastDropTime) this.lastDropTime = timestamp;
            
            if (timestamp - this.lastDropTime > this.dropInterval) {
                this.dropTetromino();
                this.lastDropTime = timestamp;
            }
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
        
        // Continue the game loop
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
    
    spawnTetromino() {
        // Get a random tetromino type
        const types = Object.keys(SHAPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Create a new tetromino with height and width parameters
        const tetromino = new Tetromino(randomType, this.scene, this.blockSize, this.height, this.width);
        
        // Set initial position (centered at the top)
        const startX = Math.floor((this.width - tetromino.shape[0].length) / 2);
        tetromino.position = { x: startX, y: 0 };
        tetromino.updateMeshPositions();
        
        // Check if the new tetromino can be placed
        if (!tetromino.isValidPosition(startX, 0, this.grid)) {
            // Game over
            this.gameOver = true;
            this.gameOverElement.classList.remove('hidden');
            return;
        }
        
        this.currentTetromino = tetromino;
    }
    
    dropTetromino() {
        if (!this.currentTetromino) return;
        
        // Try to move down
        const moved = this.currentTetromino.move(0, 1, this.grid);
        
        if (!moved) {
            // Lock the tetromino in place
            this.lockTetromino();
            
            // Check for completed lines
            this.checkLines();
            
            // Spawn a new tetromino
            this.spawnTetromino();
        }
    }
    
    hardDrop() {
        if (!this.currentTetromino) return;
        
        // Move down until it can't move anymore
        let moved = true;
        while (moved) {
            moved = this.currentTetromino.move(0, 1, this.grid);
        }
        
        // Lock the tetromino in place
        this.lockTetromino();
        
        // Check for completed lines
        this.checkLines();
        
        // Spawn a new tetromino
        this.spawnTetromino();
    }
    
    lockTetromino() {
        // Get the positions of all blocks in the tetromino
        const positions = this.currentTetromino.getBlockPositions();
        
        // Add blocks to the grid
        for (const pos of positions) {
            if (pos.y >= 0 && pos.y < this.height && pos.x >= 0 && pos.x < this.width) {
                this.grid[pos.y][pos.x] = pos.color;
                
                // Create a static block at this position
                this.createStaticBlock(pos.x, pos.y, pos.color);
            }
        }
        
        // Remove the tetromino from the scene
        this.currentTetromino.removeFromScene();
        this.currentTetromino = null;
    }
    
    createStaticBlock(x, y, color) {
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const material = new THREE.MeshLambertMaterial({ color });
        const mesh = new THREE.Mesh(geometry, material);
        
        // Position the block relative to the board origin
        // Adjust x position to start from the left edge of the board
        // Adjust y position to start from the bottom of the board with inverted Y
        mesh.position.set(
            (x * this.blockSize) - (this.width * this.blockSize / 2) + (this.blockSize / 2),
            ((this.height - y - 1) * this.blockSize) - (this.height * this.blockSize / 2) + (this.blockSize / 2),
            0
        );
        
        this.scene.add(mesh);
        this.gridBlocks.push({ x, y, mesh });
    }
    
    checkLines() {
        let linesCleared = 0;
        
        // Check each row from bottom to top
        for (let y = this.height - 1; y >= 0; y--) {
            // Check if the row is full - make sure we're checking correctly
            const isRowFull = this.grid[y].every(cell => cell !== 0);
            console.log(`Row ${y} full: ${isRowFull}`); // Add debug logging
            
            if (isRowFull) {
                // Clear the row
                this.clearRow(y);
                linesCleared++;
                
                // Move all rows above down
                this.moveRowsDown(y);
                
                // Check the same row again (since we moved rows down)
                y++;
            }
        }
        
        // Update score based on lines cleared
        if (linesCleared > 0) {
            console.log(`Cleared ${linesCleared} lines`); // Add debug logging
            this.updateScore(linesCleared);
        }
    }
    
    clearRow(row) {
        // Remove blocks from the scene
        this.gridBlocks = this.gridBlocks.filter(block => {
            if (block.y === row) {
                this.scene.remove(block.mesh);
                return false;
            }
            return true;
        });
        
        // Clear the row in the grid
        this.grid[row].fill(0);
    }
    
    moveRowsDown(clearedRow) {
        // Move grid data down
        for (let y = clearedRow; y > 0; y--) {
            this.grid[y] = [...this.grid[y - 1]];
        }
        
        // Clear the top row
        this.grid[0].fill(0);
        
        // Update block positions
        this.gridBlocks.forEach(block => {
            if (block.y < clearedRow) {
                block.y++;
                // Update the mesh position with the same positioning logic as createStaticBlock
                block.mesh.position.y = ((this.height - block.y - 1) * this.blockSize) - (this.height * this.blockSize / 2) + (this.blockSize / 2);
            }
        });
    }
    
    updateScore(linesCleared) {
        // Classic Tetris scoring
        const points = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };
        
        // Add points based on lines cleared and level
        this.score += (points[linesCleared] || 0) * this.level;
        
        // Update lines cleared
        this.lines += linesCleared;
        
        // Update level (every 10 lines)
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            // Increase speed with level
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
        }
        
        // Update UI
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.levelElement.textContent = `Level: ${this.level}`;
        this.linesElement.textContent = `Lines: ${this.lines}`;
    }
    
    togglePause() {
        this.paused = !this.paused;
    }
    
    restart() {
        // Clear the grid
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(0));
        
        // Remove all blocks from the scene
        for (const block of this.gridBlocks) {
            this.scene.remove(block.mesh);
        }
        this.gridBlocks = [];
        
        // Remove current tetromino if exists
        if (this.currentTetromino) {
            this.currentTetromino.removeFromScene();
            this.currentTetromino = null;
        }
        
        // Reset game state
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.paused = false;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // Update UI
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.levelElement.textContent = `Level: ${this.level}`;
        this.linesElement.textContent = `Lines: ${this.lines}`;
        this.gameOverElement.classList.add('hidden');
        
        // Start the game
        this.start();
    }
}

module.exports = {
    TetrisGame
}; 