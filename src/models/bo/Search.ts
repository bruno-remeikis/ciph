import { Artist } from "../entities/Artist";

export type Search =
{
    type: 'song' | 'artist';

    id: number;
    name: string;
    artists?: Artist[] | string;

    insertDate?: string;
    updateDate?: string | null;
}