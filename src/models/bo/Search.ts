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

/*export class Search2
{
    public artists?: Artist[] | string;
    public tags?: string; // Json Array (Tag[]) no formato string

    //Tag
    public amount?: number; // Quantidade de músicas
    public color?: string | null;
    public position?: number; // Posição da música no repertório

    public insertDate?: string;
    public updateDate?: string | null;

    constructor(
        public type: 'song' | 'artist' | 'tag',
        public id: number,
        public name: string
    ) {}
}*/