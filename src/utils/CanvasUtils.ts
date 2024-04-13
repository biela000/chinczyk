import {Positions} from "../types/Positions.js";
import {BOARD_SIZE, CANVAS_POSITIONS, HEX_COLORS, STARTING_CANVAS_POSITIONS} from "./constants.js";
import {Color} from "../types/Color.js";

export default class CanvasUtils {
    public static clearBoard(ctx: CanvasRenderingContext2D, boardImage: HTMLImageElement) {
        ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
        CanvasUtils.drawBoard(ctx, boardImage);
    }

    private static drawBoard(ctx: CanvasRenderingContext2D, boardImage: HTMLImageElement) {
        ctx.drawImage(boardImage, 0, 0, BOARD_SIZE, BOARD_SIZE);
    }

    public static drawPawns(ctx: CanvasRenderingContext2D, positions: Positions) {
        CanvasUtils.drawColorPawns(ctx, positions.red, "red");
        CanvasUtils.drawColorPawns(ctx, positions.green, "green");
        CanvasUtils.drawColorPawns(ctx, positions.blue, "blue");
        CanvasUtils.drawColorPawns(ctx, positions.yellow, "yellow");
    }

    private static drawColorPawns(ctx: CanvasRenderingContext2D, positions: [number, number, number, number], color: Color) {
        const alreadyDrawnPositions: number[] = [];
        const repeatedPositionCount: [number, number, number, number] = [0, 0, 0, 0];

        for (let i = 0; i < positions.length; i++) {
            if (positions[i] != 0 && !alreadyDrawnPositions.includes(positions[i])) {
                CanvasUtils.drawPawn(ctx, HEX_COLORS[color], CANVAS_POSITIONS[color][positions[i]]);
                alreadyDrawnPositions.push(positions[i]);
            } else if (alreadyDrawnPositions.includes(positions[i])) {
                repeatedPositionCount[alreadyDrawnPositions.indexOf(positions[i])]++;
            } else {
                CanvasUtils.drawPawn(ctx, HEX_COLORS[color], STARTING_CANVAS_POSITIONS[color][i]);
            }
        }

        for (let i = 0; i < repeatedPositionCount.length; i++) {
            if (repeatedPositionCount[i] > 0) {
                ctx.font = "30px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(repeatedPositionCount[i].toString(), ...CANVAS_POSITIONS[color][positions[i]]);
            }
        }
    }

    public static drawPawn(ctx: CanvasRenderingContext2D, color: string, position: [number, number]) {
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
}