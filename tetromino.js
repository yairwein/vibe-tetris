// Tetromino shapes and colors
const SHAPES = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: 0x00FFFF // Cyan
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: 0xFFFF00 // Yellow
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0x800080 // Purple
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: 0x00FF00 // Green
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: 0xFF0000 // Red
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0x0000FF // Blue
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: 0xFF7F00 // Orange
    }
};

class Tetromino {
    constructor(type, scene, blockSize) {
        this.type = type;
        this.shape = SHAPES[type].shape;
        this.color = SHAPES[type].color;
        this.scene = scene;
        this.blockSize = blockSize;
        this.position = { x: 0, y: 0 };
        this.blocks = [];
        this.meshes = [];
        
        this.createBlocks();
    }
    
    createBlocks() {
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x]) {
                    const mesh = new THREE.Mesh(geometry, material);
                    this.meshes.push(mesh);
                    this.scene.add(mesh);
                    this.blocks.push({ x, y, mesh });
                }
            }
        }
        
        this.updateMeshPositions();
    }
    
    updateMeshPositions() {
        for (const block of this.blocks) {
            const worldX = (this.position.x + block.x) * this.blockSize;
            const worldY = (this.position.y + block.y) * this.blockSize;
            block.mesh.position.set(worldX, worldY, 0);
        }
    }
    
    move(dx, dy, grid) {
        const newX = this.position.x + dx;
        const newY = this.position.y + dy;
        
        if (this.isValidPosition(newX, newY, grid)) {
            this.position.x = newX;
            this.position.y = newY;
            this.updateMeshPositions();
            return true;
        }
        return false;
    }
    
    rotate(grid) {
        // Save the original shape
        const originalShape = this.shape.map(row => [...row]);
        
        // Create a new rotated shape
        const size = this.shape.length;
        const newShape = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                newShape[x][size - 1 - y] = this.shape[y][x];
            }
        }
        
        // Apply the rotation
        this.shape = newShape;
        
        // Check if the rotation is valid
        if (!this.isValidPosition(this.position.x, this.position.y, grid)) {
            // If not valid, revert to the original shape
            this.shape = originalShape;
            return false;
        }
        
        // Update the blocks based on the new shape
        this.updateBlocks();
        return true;
    }
    
    updateBlocks() {
        // Remove all existing meshes from the scene
        for (const block of this.blocks) {
            this.scene.remove(block.mesh);
        }
        
        // Clear blocks and meshes arrays
        this.blocks = [];
        this.meshes = [];
        
        // Recreate blocks based on the current shape
        this.createBlocks();
    }
    
    isValidPosition(x, y, grid) {
        for (let blockY = 0; blockY < this.shape.length; blockY++) {
            for (let blockX = 0; blockX < this.shape[blockY].length; blockX++) {
                if (this.shape[blockY][blockX]) {
                    const gridX = x + blockX;
                    const gridY = y + blockY;
                    
                    // Check if out of bounds
                    if (gridX < 0 || gridX >= grid[0].length || gridY < 0 || gridY >= grid.length) {
                        return false;
                    }
                    
                    // Check if cell is already occupied
                    if (grid[gridY][gridX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    getBlockPositions() {
        const positions = [];
        for (let y = 0; y < this.shape.length; y++) {
            for (let x = 0; x < this.shape[y].length; x++) {
                if (this.shape[y][x]) {
                    positions.push({
                        x: this.position.x + x,
                        y: this.position.y + y,
                        color: this.color
                    });
                }
            }
        }
        return positions;
    }
    
    removeFromScene() {
        for (const block of this.blocks) {
            this.scene.remove(block.mesh);
        }
    }
} 