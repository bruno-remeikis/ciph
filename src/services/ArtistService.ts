import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';
import { db } from '../database/connection';

import SongArtistService, { song_artist } from './SongArtistService';

import { Artist } from '../models/Artist';

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
     * @param artists Lista de entidades a serem inseridas
     */
    static create(songId: number, artists: Artist[]): Promise<boolean>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            ArtistService.createTx(tx, songId, artists);
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

    static findByName(name: string, restrictedIds: number[]): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            let where = "";
            restrictedIds.forEach(id => where += id + ", ");

            if(where.length > 0)
            {
                where = where.slice(0, -2); // <- Remover ultimo ", "
                where = ` and ${artist.id} not in (${where})`;
            }

            const sql =
                `select
                    ${artist.id} as id,
                    ${artist.name} as name
                from
                    ${artist.table}
                where
                    ${artist.name} like '%${name}%'
                    ${where}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}