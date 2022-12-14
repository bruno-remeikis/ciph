// Database
import { Table, cols } from '../../database/types';

// Models
import { alias as songAlias, song } from './Song';
import { alias as tagAlias, tag } from './Tag';

// ---------- BEAN ----------

export type SongTag =
{
    id?: number;
    songId: number;
    tagId: number;
    songPosition?: number;

    insertDate?: string;
    updateDate?: string | null;
}

// ---------- DAO ----------

export const alias = songAlias + tagAlias;
export const song_tag: Table =
{
    table: `${song.table}_${tag.table}`,

    id:           `${alias}_id_pk`,
    songId:       `${alias}_${songAlias}_id_pk_fk`,
    tagId:        `${alias}_${tagAlias}_id_pk_fk`,
    songPosition: `${alias}_song_position`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}