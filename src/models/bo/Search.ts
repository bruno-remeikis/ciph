import { Artist } from "../entities/Artist";

export type Search =
{
    type: 'song' | 'artist' | 'tag';

    id: number;
    name: string;
    artists?: Artist[] | string;

    //Tag
    amount?: number; // Quantidade de músicas
    color?: string | null;

    insertDate?: string;
    updateDate?: string | null;
}