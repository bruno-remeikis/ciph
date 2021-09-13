import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';
import { db } from '../database/connection';
import { Artist } from '../models/Artist';
import SongArtistService, { song_artist } from './SongArtistService';

export const artist = {
    table: 'tb_artist',
    id: 'art_id_pk',
    name: 'art_name',
}

export default class ArtistService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param songId ID da música
     * @param obj Entidade a ser inserida
     * @returns IDs das entidades recém inceridas
     */
    /*static createLinked(songId: number, name: string): Promise<number>
    {
        return new Promise(async (resolve, reject) => db.transaction(tx =>
        {
            const sqlArtist = `insert into ${table} (name) values (?)`;
            const sqlSongArtist = `insert into ${table} (song_id, music_id) values (?, ?)`;

            await tx.executeSql(sqlArtist, []);

            tx.executeSql(sql, values, (_, { rowsAffected }) =>
            {
                if(rowsAffected > 0)
                    resolve(rowsAffected);
                else
                    reject("Error inserting objs: " + JSON.stringify(names));
            },
            (_, err) =>
            {
                console.error(err);
                reject(err);
                return false;
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }*/

    /**
     * Insere uma nova entidade no banco
     * 
     * @param songId ID da música
     * @param artists Lista de entidades a serem inseridas
     */
    static create(songId: number, artists: Artist[]): Promise<boolean>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            if(artists.length === 0)
            {
                resolve(false);
                return;
            }

            const sql =
                `insert into ${artist.table} (
                    ${artist.name}
                ) values (?)`;

            artists.forEach(artist =>
            {
                // Se artist possuir ID: artista já existe no BD
                if(artist.id)
                    SongArtistService.create(songId, artist.id);
                else
                    tx.executeSql(sql, [], (_, { rowsAffected, insertId }) =>
                    {
                        if(rowsAffected > 0)
                            SongArtistService.create(songId, insertId);
                        else
                            console.error("Error inserting obj: " + JSON.stringify(artist));
                    });
            });
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

    static createTx(tx: SQLTransaction, songId: number, artists: Artist[])
    {
        if(artists.length === 0)
            return;

        const sql =
            `insert into ${artist.table} (
                ${artist.name}
            ) values (?)`;

        artists.forEach(artist =>
        {
            // Se artist possuir ID: artista já existe no BD
            if(artist.id)
                SongArtistService.createTx(tx, songId, artist.id);
            else
                tx.executeSql(sql, [artist.name], (_, { rowsAffected, insertId }) =>
                {
                    if(rowsAffected > 0)
                        SongArtistService.createTx(tx, songId, insertId);
                });
        });
    }

    /**
     * Busca artistas pelo ID de sua música
     * 
     * @param songId ID da música
     * @returns Lista de artistas
     */
    static findBySongId(songId: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${artist.id} as id,
                    ${artist.name} as name
                from
                    ${artist.table}
                inner join
                    ${song_artist.table} on
                        ${artist.id} = ${song_artist.artistId}
                where
                    ${song_artist.songId} = ?`;

            tx.executeSql(sql, [songId], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static findByName(name: string): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${artist.id} as id,
                    ${artist.name} as name
                from
                    ${artist.table}
                where
                    ${artist.name} like '%${name}%'`;
            
            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}