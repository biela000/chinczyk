import {Color} from "./Color.js";

export type Player = {
    _id: number;
    name: string;
    color: Color;
    ready: boolean;
}