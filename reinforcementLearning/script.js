// Maze Layout (5x5)
// Hidden treasure at (0,4), cats at (1,1) and (2,3)
const gridSize = 5;
let robotPosition = {x: 4, y: 0};  // Starting position
let penalty = 0;

const treasurePosition = {x: 0, y: 4};
const catPositions = [{x: 1, y: 1}, {x: 2, y: 3}, {x:2, y:0}, {x:4, y:2}];

// HTML elements
const mazeContainer = document.getElementById('maze-container');
const statusDiv = document.getElementById('status');

// Initialize maze
function renderMaze() {
    mazeContainer.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');

            // Add the robot
            if (robotPosition.x === i && robotPosition.y === j) {
                tile.classList.add('robot');
            }
            // Add the treasure
            else if (treasurePosition.x === i && treasurePosition.y === j) {
                tile.classList.add('treasure');
            }
            // Add the cats
            else if (catPositions.some((cat) => cat.x === i && cat.y === j)) {
                tile.classList.add('cat');
            }

            mazeContainer.appendChild(tile);
        }
    }
}


// Move the robot and update the maze
function moveRobot(dx, dy) {
    const newX = robotPosition.x + dx;
    const newY = robotPosition.y + dy;

    if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {

        robotPosition.x = newX;
        robotPosition.y = newY;

        const tile = mazeContainer.children[newX * gridSize + newY];

        if (newX === treasurePosition.x && newY === treasurePosition.y) {
            tile.classList.add('goal');
            alert("🎉 You found Santa's gift! Final Penalty: " + penalty);
            resetGame();
        } else if (catPositions.some((cat) => (cat.x === newX && cat.y === newY))) {
            tile.classList.add('hit-cat');
            alert("😾 Oh no, a naughty cat caught you! Penalty: " + penalty);
            resetGame();
        } else {
            penalty += 10;
            renderMaze();
            updateStatus();
        }
    }
}

// Update the penalty and status
function updateStatus() {
    statusDiv.textContent = `Penalty: ${penalty}`;
}

// Reset game after winning or losing
function resetGame() {
    robotPosition = {x: 4, y: 0};
    penalty = 0;
    renderMaze();
    updateStatus();
}

// Controls
document.getElementById('up').addEventListener('click', () => moveRobot(-1, 0));
document.getElementById('down').addEventListener('click', () => moveRobot(1, 0));
document.getElementById('left').addEventListener('click', () => moveRobot(0, -1));
document.getElementById('right').addEventListener('click', () => moveRobot(0, 1));

// Initial rendering
renderMaze();
updateStatus();
