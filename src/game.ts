const query = new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?")));
const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const boardImage = document.querySelector(".board-img") as HTMLImageElement;

const startingPositions = {
    red: [75, 375],
    green: [canvas.width - 75, 525],
    blue: [525, 75],
    yellow: [375, canvas.height - 75]
};

const canvasPositions = {
    red: [null, null, null, null],
    green: [null, null, null, null],
    blue: [null, null, null, null],
    yellow: [null, null, null, null],
};

const canvasSteps = {
    red: [[75, 0], [75, 0], [75, 0], [75, 0]],
    green: [[-75, 0], [-75, 0], [-75, 0], [-75, 0]],
    blue: [[0, 75], [0, 75], [0, 75], [0, 75]],
    yellow: [[0, -75], [0, -75], [0, -75], [0, -75]]
};

const lefts = [5, 15, 25, 35];
const rights = [9, 11, 19, 21, 29, 31, 39, 40];

let game;

const drawPawn = (color: string, position: [number, number]) => {
    ctx.beginPath();
    ctx.arc(...position, 25, 0, 2 * Math.PI);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(...position, 15, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

const drawPawns = () => {
    const red = "#ff0000";
    const blue = "#0000ff";
    const green = "#00ff00";
    const yellow = "#ffff00";

    // Red pawns
    drawPawn(red, [75, 75]);
    drawPawn(red, [150, 75]);
    drawPawn(red, [75, 150]);
    drawPawn(red, [150, 150]);

    // Blue pawns
    drawPawn(blue, [canvas.width - 75, 75])
    drawPawn(blue, [canvas.width - 150, 75])
    drawPawn(blue, [canvas.width - 75, 150])
    drawPawn(blue, [canvas.width - 150, 150])

    // Green pawns
    drawPawn(green, [canvas.width - 75, canvas.height - 75])
    drawPawn(green, [canvas.width - 150, canvas.height - 75])
    drawPawn(green, [canvas.width - 75, canvas.height - 150])
    drawPawn(green, [canvas.width - 150, canvas.height - 150])
};

const startGameFetch = async () => {
    const response = await fetch(`/chinczyk/api/get_game.php?id=${query.get("gameId")}`);
    const data = await response.json();
    game = data.game;

    pollBoard();
};

const pollBoard = async () => {
    const response = await fetch(`/chinczyk/api/game_updated.php?id=${query.get("gameId")}`);
    const data = await response.json();
    game = data.game;
    console.log(game);

    pollBoard();
};

const movePawn = (color: string, pawnId: number, newPosition?: number) => {
    if (!canvasPositions[color][pawnId]) {
        canvasPositions[color][pawnId] = startingPositions[color];
    } else if (newPosition) {
        const prevPosition = game.positions.red[pawnId];

        for (let i = prevPosition; i < newPosition; i++) {
            if (lefts.includes(i)) {
                if (canvasSteps[color][pawnId][0] != 0) {
                    canvasSteps[color][pawnId][1] = -canvasSteps[color][pawnId][0];
                    canvasSteps[color][pawnId][0] = 0;
                } else {
                    canvasSteps[color][pawnId][0] = canvasSteps[color][pawnId][1];
                    canvasSteps[color][pawnId][1] = 0;
                }
            }

            if (rights.includes(i)) {
                if (canvasSteps[color][pawnId][0] != 0) {
                    canvasSteps[color][pawnId][1] = canvasSteps[color][pawnId][0];
                    canvasSteps[color][pawnId][0] = 0;
                } else {
                    canvasSteps[color][pawnId][0] = -canvasSteps[color][pawnId][1];
                    canvasSteps[color][pawnId][1] = 0;
                }
            }

            canvasPositions[color][pawnId][0] += canvasSteps[color][pawnId][0];
            canvasPositions[color][pawnId][1] += canvasSteps[color][pawnId][1];
        }
    }

    drawPawn(color, canvasPositions[color][pawnId]);
};

ctx.drawImage(boardImage, 0, 0, 900, 900);
drawPawns();
startGameFetch().then(() => {
    movePawn("red", 0);
    movePawn("red", 0, 8)
    console.log(canvasPositions);
});
