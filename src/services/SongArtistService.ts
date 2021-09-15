import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';
import { db } from '../database/connection';

export const song_artist = {
    table: `tb_song_tb_artist`,
    songId: 'sngart_sng_id_pk_fk',
    artistId: 'sngart_art_id_pk_fk',
}

export default class SongArtistService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param songId ID da música
     * @param artistIds IDs dos artistas
     * @returns ID da entidade recém inceridas
     */
    static create(songId: number, artistIds: number | number[]): Promise<boolean>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            SongArtistService.createTx(tx, songId, artistIds);
        },
        err =>
        {
            console.error(err);
            reject(err);
        },
        () =>
        {
            resolve(true);
        }));
    }

    static createTx(tx: SQLTransaction, songId: number, artistIds: number | number[])
    {
        if(!Array.isArray(artistIds))
        {
            artistIds = [artistIds];
        }

        const sql = `insert into ${song_artist.table} (
            ${song_artist.songId},
            ${song_artist.artistId}
        ) values (?, ?)`;

        artistIds.forEach(id =>
            tx.executeSql(sql, [songId, id]));
    }

    /**
     * Busca artistas pelo ID de sua música
     * 
     * @param songId ID da música
     * @returns Lista de artistas
     */
    /*static findBySongId(songId: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `select * from ${song_artist.table} where ${song_artist.songId} = ?`;

            tx.executeSql(sql, [songId], (_, { rows }) =>
            {
                resolve(rows);
            }),
            (_: any, err: any) =>
            {
                console.error(err);
                reject(err);
                return false;
            };
        }));
    }*/

    static delete(songId: number, artistIds: number | number[])
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            let whereIn = '';
            if(Array.isArray(artistIds))
            {
                if(artistIds.length === 0)
                    reject();

                artistIds.forEach(id => whereIn += id + ", ");
                whereIn = whereIn.slice(0, -2); // <- Remover ultimo ", "
            }
            else
                whereIn = artistIds + '';

            const sql =
                `delete from ${song_artist.table} where
                    ${song_artist.songId} = ? and
                    ${song_artist.artistId} in (${whereIn})`;

            tx.executeSql(sql, [songId], (_, { rowsAffected }) =>
                resolve(rowsAffected));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static deleteBySongIdTx(tx: SQLTransaction, songId: number)
    {
        const sql =
            `delete from ${song_artist.table}
            where ${song_artist.songId} = ?`;

        tx.executeSql(sql, [songId]);
    }
}