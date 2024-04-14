import { Color } from "../types/Color.js";
import { Player } from "../types/Player.js";
import { Positions } from "../types/Positions.js";
import {
    API_LINK,
    GET_GAME_LINK,
    MOVE_TIME_SECONDS,
    STARTING_CANVAS_POSITIONS,
    UPDATE_INTERVAL
} from "../utils/constants.js";
import { GamePayload } from "../types/GamePayload.js";
import CanvasUtils from "../utils/CanvasUtils.js";

export default class Game {
    private readonly _id: number;
    private player: Player;
    private players: Player[] = [];
    private currentColor: Color = "red";
    private pointsThrown: number | null = null;
    private hasThrownDice: boolean = false;
    private positions: Positions = {
        red: [0, 0, 0, 0],
        green: [0, 0, 0, 0],
        blue: [0, 0, 0, 0],
        yellow: [0, 0, 0, 0]
    };
    private isGameGoing: boolean = false;
    private hasGameStarted: boolean = false;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly boardImage: HTMLImageElement;
    private readonly playerPanels: NodeListOf<HTMLDivElement>;
    private readonly dice: HTMLImageElement
    private readonly clock: HTMLHeadingElement;
    private pawnsToMove: number[] | null = null;
    private playerCanvasPositions = [...STARTING_CANVAS_POSITIONS["red"]];

    constructor(id: number, player: { _id: number, name: string }, ctx: CanvasRenderingContext2D, boardImage: HTMLImageElement, playerPanels: NodeListOf<HTMLDivElement>, dice: HTMLImageElement, clock: HTMLHeadingElement) {
        this._id = id;
        this.player = { _id: player._id, name: player.name, color: "red", ready: false };

        this.ctx = ctx;
        CanvasUtils.clearBoard(this.ctx, boardImage);

        this.boardImage = boardImage;
        this.playerPanels = playerPanels;
        this.dice = dice;
        this.clock = clock;
    }

    public startGame(): void {
        this.isGameGoing = true;

        this.dice.addEventListener("click", async () => {
            if (this.currentColor === this.player.color && !this.hasThrownDice) {
                this.hasThrownDice = true;
                const response = await fetch(`${API_LINK}/throw_dice.php?gameId=${this._id}&playerId=${this.player._id}`);
                const dicePayload = (await response.json()) as { pointsThrown: number, pawnsToMove: number[] };

                this.pointsThrown = dicePayload.pointsThrown;
                this.pawnsToMove = dicePayload.pawnsToMove;

                this.updateDice();

                if (this.pawnsToMove.length === 0) {
                    this.pointsThrown = null;
                    this.pawnsToMove = null;
                    this.updateDice();
                    await this.passMove();
                }

                if (this.pawnsToMove?.length === 1) {
                    const response = await fetch(`${API_LINK}/move_pawn.php?gameId=${this._id}&playerId=${this.player._id}&pawnIndex=${this.pawnsToMove[0]}`);
                    const gamePayload = await response.json();

                    this.updateGame(gamePayload);
                }
            }
        });

        this.ctx.canvas.addEventListener("click", async (e: MouseEvent) => {
            if (this.currentColor === this.player.color && this.pawnsToMove && this.pawnsToMove.length > 0) {
                const x = e.offsetX;
                const y = e.offsetY;

                let clickedPawn = this.playerCanvasPositions.findIndex(([pawnX, pawnY]) => {
                    return Math.abs(pawnX - x) < 25 && Math.abs(pawnY - y) < 25;
                });

                if (this.playerCanvasPositions[clickedPawn].includes(0)) {
                    clickedPawn = -1;
                }

                if (clickedPawn !== -1 && this.pawnsToMove.includes(clickedPawn)) {
                    const response = await fetch(`${API_LINK}/move_pawn.php?gameId=${this._id}&playerId=${this.player._id}&pawnIndex=${clickedPawn}`);
                    const gamePayload = await response.json();

                    this.updateGame(gamePayload);
                }
            }
        });

        this.loop();
    }

    private async passMove(): Promise<void> {
        const response = await fetch(`${API_LINK}/pass_move.php?gameId=${this._id}&playerId=${this.player._id}`);
        const gamePayload = await response.json();

        this.updateGame(gamePayload);
    }

    private updateDice(): void {
        this.dice.src = `/chinczyk/media/img/dice${this.pointsThrown}.png`;
    }

    private async fetchGame(): Promise<GamePayload> {
        const response = await fetch(`${GET_GAME_LINK}?id=${this._id}`);
        const gamePayload = (await response.json()).game;

        return gamePayload;
    }

    private updateGame(newGame: GamePayload): void {
        this.players = newGame.players;
        this.player = this.players.find(player => player._id === this.player._id)!;
        this.hasGameStarted = newGame.hasGameStarted;
        this.isGameGoing = newGame.isGameGoing;
        this.currentColor = newGame.currentColor;
        this.positions = newGame.positions;
        this.pointsThrown = newGame.pointsThrown;
        this.hasThrownDice = newGame.hasThrownDice;

        this.updatePlayerPanels();

        if (this.hasGameStarted) {
            this.draw();
            this.updateClock(newGame.moveStartedAt);
            this.updateDice();
        }
    }

    private draw(): void {
        CanvasUtils.clearBoard(this.ctx, this.boardImage);
        this.playerCanvasPositions = CanvasUtils.drawPawns(this.ctx, this.positions)[this.player.color];
    }

    private updatePlayerPanels(): void {
        this.playerPanels.forEach((panel: HTMLDivElement) => {
            const color = panel.dataset.color as Color;
            const player = this.players.find(player => player.color === color)!;

            if (!player._id) return;

            const shortenedName = player.name.length > 15 ? player.name.slice(0, 15) + "..." : player.name;
            panel.querySelector(".player-name")!.textContent = shortenedName;

            panel.classList.remove("active");

            if (this.currentColor === color) {
                panel.classList.add("active");
            }

            const panelContainer = panel.parentNode! as HTMLDivElement;
            panelContainer.classList.remove("ready", "unready");

            if (!this.hasGameStarted) {
                panelContainer.classList.add(player.ready ? "ready" : "unready");
                panelContainer.classList.remove(player.ready ? "unready" : "ready");
            }

            let readyButton = panel.querySelector(".ready-button") as HTMLButtonElement;

            if (!this.hasGameStarted && panel.dataset.color === this.player.color) {
                this.updateReadyButton(panel, player);
            } else {
                if (readyButton) {
                    readyButton.remove();
                }
            }
        });
    }

    private updateReadyButton(panel: HTMLDivElement, player: Player): void {
        const readyButtonTemplate = document.querySelector(".ready-button.template") as HTMLButtonElement;
        let readyButton = panel.querySelector(".ready-button") as HTMLButtonElement;

        if (!readyButton) {
            readyButton = readyButtonTemplate.cloneNode(true) as HTMLButtonElement;
            readyButton.classList.remove("template");
            panel.appendChild(readyButton);
        }

        readyButton.textContent = player.ready ? "Gotowy" : "Niegotowy";
        readyButton.disabled = player.ready;

        if (player.ready) {
            readyButton.classList.add("ready");
        } else {
            readyButton.classList.remove("ready");
        }

        readyButton.addEventListener("click", this.fetchPlayerReady.bind(this));
    }

    private async fetchPlayerReady(): Promise<void> {
        const response = await fetch(`${API_LINK}/player_ready.php?gameId=${this._id}&playerId=${this.player._id}`);
        const gamePayload = await response.json();

        this.updateGame(gamePayload);
    }

    private updateClock(moveStartedAt: number): void {
        const time = Math.floor((Date.now() - moveStartedAt) / 1000);
        const seconds = MOVE_TIME_SECONDS - time % 60;

        this.clock.textContent = `00:${seconds < 10 ? '0' + seconds : seconds}`;
    }

    private loop(): void {
        this.fetchGame().then((gamePayload: GamePayload) => {
            this.updateGame(gamePayload);
            setTimeout(this.loop.bind(this), UPDATE_INTERVAL);
        });
    }
}