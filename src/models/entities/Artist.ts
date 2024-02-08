// Database
import { Table, cols } from '../../database/types';
import { Search/*, Search2*/ } from '../bo/Search';

// ---------- BEAN ----------

export type Artist =
{
    id?: number;
    name: string;

    insertDate?: string;
    updateDate?: string | null;
}

/*export class Artist2 extends Search2
{
    constructor(
        public id?: number,
        public name: string
    ) {
        super('artist', id, name);
    }
}*/

/*export type Artist = Omit<Search, 'type' | 'artists' | 'tags' | 'amount' | 'color' | 'position'> & {
    id?: number;
}*/

export const artistToSearch = ({ id, name, insertDate, updateDate }: Artist): Search => ({
    type: 'artist',
    id: id ? id : 0,
    name,
    insertDate,
    updateDate
});

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