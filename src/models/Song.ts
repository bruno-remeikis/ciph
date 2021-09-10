import { Artist } from "./Artist";

export type Song = {
    id?: number;
    name: string;
    artists?: Artist[] | string;
}