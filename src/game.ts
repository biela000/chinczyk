import CanvasUtils from "./utils/CanvasUtils.js";
import {STARTING_CANVAS_POSITIONS} from "./utils/constants.js";
import Game from "./classes/Game.js";

const query = new URLSearchParams(window.location.href.substring(window.location.href.indexOf("?")));
const canvas = document.getElementById("board") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const boardImage = document.querySelector(".board-img") as HTMLImageElement;
const playerPanels = document.querySelectorAll(".player-panel") as NodeListOf<HTMLDivElement>;
const dice = document.querySelector(".dice") as HTMLImageElement;
const clock = document.querySelector(".time") as HTMLHeadingElement;

const gameId: string | null = query.get("gameId");
const playerId: string | null = query.get("playerId");
const nickname: string | null = query.get("nickname");

if (!gameId || !playerId || !nickname) {
    window.location.href = "/chinczyk";
}

const game = new Game(+gameId!, { _id: +playerId!, name: nickname! }, ctx, boardImage, playerPanels, dice, clock);
game.startGame();
