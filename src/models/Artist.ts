// Database
import { Table, cols } from '../database/types';

// ---------- BEAN ----------

export type Artist =
{
    id?: number;
    name: string;

    insertDate?: string;
    updateDate?: string | null;
}

// ---------- DAO ----------

export const alias = 'art';
export const artist: Table =
{
    table: 'tb_artist',
    
    id:             `${alias}_id_pk`,
    name:           `${alias}_name`,
    unaccentedName: `${alias}_unaccented_name`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}