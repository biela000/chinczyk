import {Player} from "./Player.js";
import {Positions} from "./Positions.js";
import {Color} from "./Color.js";

export type GamePayload = {
    _id: number;
    players: Player[];
    currentColor: Color;
    positions: Positions;
    createdAt: string;
    full: boolean;
};