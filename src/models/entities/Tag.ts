// Database
import { Table, cols } from '../../database/types';

// ---------- BEAN ----------

export type Tag =
{
    id?: number;
    name: string;
    color?: string | null; // hexadecimal

    amount?: number;

    insertDate?: string;
    updateDate?: string | null;
}

// ---------- DAO ----------

export const alias = 'tag';
export const tag: Table =
{
    table: 'tb_tag',
    
    id:    `${alias}_id_pk`,
    name:  `${alias}_name`,
    unaccentedName: `${alias}_unaccented_name`,
    color: `${alias}_color`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}