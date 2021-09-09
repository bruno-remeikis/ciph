export type artist = {
    id?: number;
    name: string;
}

export type song = {
    id?: number;
    name: string;
    artists: artist[];
}