// Database
import { Table, cols } from '../../database/types';

// Models
import { alias as songAlias, song } from './Song';
import { alias as artistAlias, artist } from './Artist';

// ---------- BEAN ----------

export type SongArtist =
{
    id?: number;
    songId: number;
    artistId: number;

    insertDate?: string;
    updateDate?: string | null;
}

// ---------- DAO ----------

export const alias = songAlias + artistAlias;
export const song_artist: Table =
{
    table: `${song.table}_${artist.table}`,

    id:       `${alias}_id_pk`,
    songId:   `${alias}_${songAlias}_id_pk_fk`,
    artistId: `${alias}_${artistAlias}_id_pk_fk`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}