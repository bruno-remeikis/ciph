// Database
import { Table, cols } from '../../database/types';

// Models
import { Artist } from './Artist';

// ---------- BEAN ----------

export type Song =
{
    id?: number;
    name: string;
    artists?: Artist[] | string;

    insertDate?: string;
    updateDate?: string | null;
}



// ---------- DAO ----------

export const alias = 'sng';
export const song: Table =
{
    table: 'tb_song',

    id:             `${alias}_id_pk`,
    name:           `${alias}_name`,
    unaccentedName: `${alias}_unaccented_name`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}