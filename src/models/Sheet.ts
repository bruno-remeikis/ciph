// Database
import { Table, cols } from '../database/types';

// Models
import { alias as songAlias } from './Song';

// ---------- BEAN ----------

export type Sheet =
{
    readonly type: 'Sheet';

    id?: number;
    songId: number;
    title: string;
    content: string;

    insertDate?: string;
    updateDate?: string | null;
}

// ---------- DAO ----------

export const alias = 'sht';
export const sheet: Table =
{
    table: 'tb_sheet',

    id:      `${alias}_id_pk`,
    songId:  `${alias}_${songAlias}_id_pk_fk`,
    title:   `${alias}_title`,
    content: `${alias}_content`,

    insertDate: alias + cols.insert,
    updateDate: alias + cols.update,
}