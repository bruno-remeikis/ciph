export type artist = {
    id?: number;
    name: string;
}

export type music = {
    id?: number;
    name: string;
    artists: artist[];
}