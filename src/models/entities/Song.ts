// Database
import { Table, cols } from '../../database/types';

// Models
import { Artist } from './Artist';
import { Sheet } from './Sheet';

// ---------- BEAN ----------

export type Song =
{
    id?: number;
    name: string;
    
    artists?: Artist[] | string;
    sheets?: Sheet[];

    position?: number; // Posição no repertório

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