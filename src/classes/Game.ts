import { Color } from "../types/Color.js";
import { Player } from "../types/Player.js";
import { Positions } from "../types/Positions.js";
import {API_LINK, GET_GAME_LINK, UPDATE_INTERVAL} from "../utils/constants.js";
import { GamePayload } from "../types/GamePayload.js";
import CanvasUtils from "../utils/CanvasUtils.js";

export default class Game {
    private readonly _id: number;
    private player: Player;
    private players: Player[] = [];
    private currentColor: Color = "red";
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

    constructor(id: number, player: { _id: number, name: string }, ctx: CanvasRenderingContext2D, boardImage: HTMLImageElement, playerPanels: NodeListOf<HTMLDivElement>) {
        this._id = id;
        this.player = { _id: player._id, name: player.name, color: "red", ready: false };

        this.ctx = ctx;
        CanvasUtils.clearBoard(this.ctx, boardImage);

        this.boardImage = boardImage;
        this.playerPanels = playerPanels;
    }

    public startGame(): void {
        this.isGameGoing = true;

        this.fetchGame().then((gamePayload: GamePayload) => {
            this.fillPlayerDataFrom(gamePayload.players);
            this.updateGame(gamePayload);
            this.loop();
        }).catch((error: Error) => {
            this.isGameGoing = false;
            console.error(error);
        });
    }

    private async fetchGame(): Promise<GamePayload> {
        const response = await fetch(`${GET_GAME_LINK}?id=${this._id}`);
        const gamePayload = (await response.json()).game;

        return gamePayload;
    }

    private updateGame(newGame: GamePayload): void {
        this.players = newGame.players;
        this.currentColor = newGame.currentColor;
        this.positions = newGame.positions;

        this.draw();
        this.updatePlayerPanels();
    }

    private draw(): void {
        CanvasUtils.clearBoard(this.ctx, this.boardImage);
        CanvasUtils.drawPawns(this.ctx, this.positions);
    }

    private updatePlayerPanels(): void {
        this.playerPanels.forEach((panel: HTMLDivElement) => {
            const color = panel.dataset.color as Color;
            const player = this.players.find(player => player.color === color)!;

            const shortenedName = player.name.length > 15 ? player.name.slice(0, 15) + "..." : player.name;
            panel.querySelector(".player-name")!.textContent = shortenedName;

            const panelContainer = panel.parentNode! as HTMLDivElement;
            panelContainer.classList.add(player.ready ? "ready" : "unready");

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

        readyButton.textContent = player.ready ? "Not ready" : "Ready";

        if (player.ready) {
            readyButton.classList.add("ready");
        } else {
            readyButton.classList.remove("ready");
        }

        readyButton.addEventListener("click", this.fetchPlayerReady.bind(this));
    }

    private async fetchPlayerReady(): Promise<void> {
        const response = await fetch(`${API_LINK}/player_ready.php?id=${this._id}&playerId=${this.player._id}`);
        const gamePayload = (await response.json()).game;

        this.updateGame(gamePayload);
    }

    private fillPlayerDataFrom(players: Player[]): void {
        const allPlayerData = players.find(player => player._id === this.player._id);
        if (allPlayerData) {
            this.player = allPlayerData;
        } else {
            throw new Error("Player not found");
        }
    }

    private loop(): void {
        this.fetchGame().then((gamePayload: GamePayload) => {
            this.updateGame(gamePayload);
            setTimeout(this.loop.bind(this), UPDATE_INTERVAL);
        });
    }
}