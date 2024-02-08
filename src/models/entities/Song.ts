// Database
import { Table, cols } from '../../database/types';
import { Search } from '../bo/Search';

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

export const songToSearch = ({ id, name, artists, insertDate, updateDate }: Song): Search => ({
    type: 'song',
    id: id ? id : 0,
    name,
    artists,
    insertDate,
    updateDate
});

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