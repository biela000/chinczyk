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
        const canvasPositions: { red: [number, number][], blue: [number, number][], green: [number, number][], yellow: [number, number][] } = {
            red: [],
            blue: [],
            green: [],
            yellow: []
        };

        canvasPositions.red = CanvasUtils.drawColorPawns(ctx, positions.red, "red");
        canvasPositions.green = CanvasUtils.drawColorPawns(ctx, positions.green, "green");
        canvasPositions.blue = CanvasUtils.drawColorPawns(ctx, positions.blue, "blue");
        canvasPositions.yellow = CanvasUtils.drawColorPawns(ctx, positions.yellow, "yellow");

        return canvasPositions;
    }

    private static drawColorPawns(ctx: CanvasRenderingContext2D, positions: [number, number, number, number], color: Color) {
        const alreadyDrawnPositions: { position: number, count: number }[] = [];
        const canvasPositions: [number, number][] = [];

        for (let i = 0; i < positions.length; i++) {
            const alreadyDrawnPosition = alreadyDrawnPositions.find((position) => position.position === positions[i]);
            if (positions[i] === 45) {
                canvasPositions.push([0, 0]);
            }
            if (positions[i] !== 0 && !alreadyDrawnPosition) {
                CanvasUtils.drawPawn(ctx, HEX_COLORS[color], CANVAS_POSITIONS[color][positions[i] - 1]);
                alreadyDrawnPositions.push({ position: positions[i], count: 1 });
                canvasPositions.push(CANVAS_POSITIONS[color][positions[i] - 1]);
            } else if (alreadyDrawnPosition && positions[i] !== 0) {
                alreadyDrawnPosition.count++;
                canvasPositions.push(CANVAS_POSITIONS[color][positions[i] - 1]);
            } else {
                CanvasUtils.drawPawn(ctx, HEX_COLORS[color], STARTING_CANVAS_POSITIONS[color][i]);
                canvasPositions.push(STARTING_CANVAS_POSITIONS[color][i]);
            }
        }

        for (let i = 0; i < alreadyDrawnPositions.length; i++) {
            if (alreadyDrawnPositions[i].count > 1) {
                ctx.font = "30px Arial";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(alreadyDrawnPositions[i].count.toString(), ...CANVAS_POSITIONS[color][alreadyDrawnPositions[i].position - 1]);
            }
        }

        return canvasPositions;
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