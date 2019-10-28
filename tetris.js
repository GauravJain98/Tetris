const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

const pieces = 'iljszot';
let val = pieces[(7 * Math.random()) | 0];

const player = {
    pos: { x: 5, y: 0 },
    matrix: createPiece(val),
    score: 0
};

function scoreing() {
    let rowcount = 0;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        rowcount++;
        arena.unshift(row);
        ++y;
    }
    player.score += rowcount * 2;
    // body...
}

function collide(arena, player) {
    const [matrix, position] = [player.matrix, player.pos];
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (
                matrix[y][x] !== 0 &&
                (arena[y + position.y] &&
                    arena[y + position.y][x + position.x]) !== 0
            ) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 't') {
        return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
    } else if (type === 'o') {
        return [[2, 2], [2, 2]];
    } else if (type === 'i') {
        return [[0, 3, 0, 0], [0, 3, 0, 0], [0, 3, 0, 0], [0, 3, 0, 0]];
    } else if (type === 's') {
        return [[0, 0, 0], [0, 4, 4], [4, 4, 0]];
    } else if (type === 'z') {
        return [[0, 0, 0], [5, 5, 0], [0, 5, 5]];
    } else if (type === 'l') {
        return [[0, 6, 0], [0, 6, 0], [0, 6, 6]];
    } else if (type === 'j') {
        return [[0, 7, 0], [0, 7, 0], [7, 7, 0]];
    }
}

const color = [
    null,
    'red',
    'blue',
    'violet',
    'green',
    'purple',
    'orange',
    'pink'
];

function draw(val) {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (val !== 1) {
        drawPiece(arena, { x: 0, y: 0 });
        drawPiece(player.matrix, player.pos);
    }
}

function drawPiece(piece, offset) {
    piece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    // adds player matrix to the arena.
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
    // body...
}

function rotation(matrix, dir) {
    //inverseinging matrix
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
    // body...
}

function playerRotate(dir) {
    rotation(player.matrix, dir);
    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -2;
    }
    // body...
}

let dropCounter = 0;
const dropInterval = 1000;

let lasttime = 0;

function playerDrop() {
    player.pos.y++;

    over = 0;

    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        if (player.pos.y !== 0) {
            playerReset();
        } else {
            over = 1;
        }
        scoreing();
        updateScore(over);
    }
    dropCounter = 0;
    // body...
}

function update(time = 0) {
    const deltatime = time - lasttime;
    lasttime = time;
    dropCounter += deltatime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
    // body...
}

const arena = createMatrix(12, 20);

function playerReset() {
    let val = pieces[(7 * Math.random()) | 0];
    player.matrix = createPiece(val);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 - player.matrix[0].length / 2) | 0;
}

function updateScore(over) {
    if (over === 0) document.getElementById('score').innerHTML = player.score;
    else document.getElementById('score').innerHTML = 'GAME OVER';
    // body...
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        //left
        playerMove(-1);
    } else if (event.keyCode === 39) {
        //right
        playerMove(1);
    } else if (event.keyCode === 40) {
        //down
        playerDrop();
    } else if (event.keyCode === 81) {
        //q
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        //w
        playerRotate(1);
    }
});

draw(1);
updateScore();
document.getElementById('score').innerHTML = 'CLICK TO PLAY';
canvas.addEventListener('click', event => {
    drawPiece(player.matrix, player.pos);
    console.log(event);
    update();
    updateScore(0);
});

if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(
        navigator.userAgent
    )
) {
    document.getElementById('gamepad').innerHTML =
        '<div id ="row1" class="row"><i class="fa fa-undo btn btn-primary" onclick ="playerRotate(-1);" aria-hidden="true"></i><i class="fa fa-repeat btn btn-primary"  onclick ="playerRotate(1);" aria-hidden="true"></i></div><br><div id ="row2" class="row"><button id="left" onclick="playerMove(-1)" class="btn btn-primary"><</button><button id="down" onclick="playerDrop()"class="btn btn-primary">v</button><button id="right" onclick="playerMove(1)"class="btn btn-primary">></button>';
} else {
    document.getElementById('gamepad').innerHTML = 'Use Q And W to Rotate';
}
