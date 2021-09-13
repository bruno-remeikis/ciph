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
     * @param artistId ID do artista
     * @returns ID da entidade recém inceridas
     */
    static create(songId: number, artistId: number): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `insert into ${song_artist.table} (
                ${song_artist.songId},
                ${song_artist.artistId}
            ) values (?, ?)`;

            tx.executeSql(sql, [songId, artistId], (_, { rowsAffected, insertId }) =>
            {
                if(rowsAffected > 0)
                    resolve(insertId);
                else
                    reject("Error inserting obj: " + JSON.stringify({ songId, artistId }));
            },
            (_, err) =>
            {
                console.error(err);
                reject(err);
                return false;
            });
        }));
    }

    static createTx(tx: SQLTransaction, songId: number, artistId: number)
    {
        const sql = `insert into ${song_artist.table} (
            ${song_artist.songId},
            ${song_artist.artistId}
        ) values (?, ?)`;

        tx.executeSql(sql, [songId, artistId]);
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
}