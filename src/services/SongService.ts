import { SQLResultSetRowList } from 'expo-sqlite';
import { db } from '../database/connection';

import SheetService from './SheetService';
import ArtistService, { artist } from './ArtistService';
import { song_artist } from './SongArtistService';

import { Song } from '../models/Song';
import { Artist } from '../models/Artist';

export const song = {
    table: 'tb_song',
    id: 'sng_id_pk',
    name: 'sng_name'
}

export default class SongService
{

    /**
     * Insere uma nova entidade no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerido
     */
    static create(obj: Song, artists: Artist[]): Promise<number>
    {
        let id: number;

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `insert into ${song.table} (
                    ${song.name}
                ) values (?)`;

            tx.executeSql(sql, [obj.name.trim()], (_, { rowsAffected, insertId }) =>
            {
                if(rowsAffected > 0)
                {
                    id = insertId;
                    ArtistService.createTx(tx, insertId, artists);
                }
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
        },
        () => resolve(id)));
    }

    /**
     * Busca músicas pelo nome e pelo(s) artista(s).
     * Quebra o texto do parâmetro 'search' por palavras,
     * buscando todas as possibilidades.
     * 
     * @param search Texto de busca
     * @returns Lista de músicas
     */
    static find(search: string): Promise<SQLResultSetRowList>
    {
        let where = '';
        if(search.trim().length > 0)
        {
            // Quebra a pesquisa por palavras
            const words = search.split(" ");
            // Pesquisa separadamente por cada palavra
            // or artist like '%${word}%'
            words.forEach(word => {
                where +=
                    `or ${song.name} like '%${word}%' ` +
                    `or ${artist.name} like '%${word}%'`
            });
            where = where.replace('or', 'where');
        }

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    id,
                    name,
                    (
                        select
                            group_concat(${artist.name}, ', ')
                        from
                            ${song_artist.table}
                        left join
                            ${artist.table} on
                                ${song_artist.artistId} = ${artist.id}
                        where
                            ${song_artist.songId} = id and
                            ${song_artist.songId} = ${song_artist.songId}
                    ) as artists
                from (
                    select
                        ${song.id} as id,
                        ${song.name} as name
                    from
                        ${song.table}
                    left join
                        ${song_artist.table} on
                            ${song.id} = ${song_artist.songId}
                    left join
                        ${artist.table} on
                            ${song_artist.artistId} = ${artist.id}
                    ${where}
                    group by
                        ${song.id},
                        ${song_artist.songId}
                )`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static update(obj: Song)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            if(!obj.id)
                reject();

            const sql =
                `update ${song.table}
                set ${song.name} = ?
                where ${song.id} = ?`;

            tx.executeSql(sql, [obj.name, obj.id], (_, { rowsAffected }) =>
                resolve(rowsAffected));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    /**
     * Deleta música por ID
     * 
     * @param id ID da música
     * @returns Número de linhas afetadas
     */
    static delete(id: number): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            // Deleta folhas da música
            SheetService.deleteBySongId(id);

            const sql =
                `delete from ${song.table} where ${song.id} = ?`;

            tx.executeSql(sql, [id], (_, { rowsAffected }) =>
            {
                resolve(rowsAffected);
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}