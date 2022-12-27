import { Artist } from "../entities/Artist";

export type Search =
{
    type: 'song' | 'artist' | 'tag';

    id: number;
    name: string;
    artists?: Artist[] | string;
    tags?: string; // Json Array (Tag[]) no formato string

    //Tag
    amount?: number; // Quantidade de músicas
    color?: string | null;
    position?: number; // Posição da música no repertório

    insertDate?: string;
    updateDate?: string | null;
}