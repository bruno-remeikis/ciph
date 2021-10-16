import { SQLResultSetRowList } from 'expo-sqlite';
import { remove } from 'remove-accents';

// Database
import { db } from '../database/connection';

// Services
import SheetService from './SheetService';
import ArtistService from './ArtistService';
import SongArtistService from './SongArtistService';

// Models
import { Song, song } from '../models/entities/Song';
import { Artist, artist } from '../models/entities/Artist';
import { song_artist } from '../models/entities/SongArtist';

// Utils
import { dbDatetimeFormat } from '../utils/functions';

export default class SongService
{
    /**
     * Insere as músicas contidas no JSON principal
     * (parâmetro: 'songs').
     * 
     * Atualiza o JSON, adicionando um 'newId' a
     * cada objeto inserido.
     * 
     * @param json Objeto JSON contendo dados de importação
     */
    static import(json: any): Promise<void>
    {  
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            // Validar JSON principal
            if(!json.songs || !Array.isArray(json.songs))
                reject();

            const sql =
                `insert into ${song.table} (
                    ${song.name},
                    ${song.unaccentedName},
                    ${song.insertDate},
                    ${song.updateDate}
                ) values (?, ?, ?, ?)`;

            for(let i = 0; i < json.songs.length; i++)
            {
                const obj = json.songs[i];

                // Validar propriedades do objeto
                if(!obj.name)
                    continue;

                const args = [
                    obj.name.trim(),
                    remove(obj.name.trim()),
                    obj.insertDate ? obj.insertDate : 'current_timestamp',
                    obj.updateDate ? obj.insertDate : null,
                ];

                tx.executeSql(sql, args, (_, { insertId }) =>
                {
                    json.songs[i].newId = insertId;

                    if(obj.sheets)
                        json.songs[i].sheets = SheetService.importTx(
                            tx, insertId, obj.sheets
                        );
                });
            }
        },
        err => reject(err),
        () => resolve()));
    }
    
    /**
     * Insere uma música e artistas no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerido
     */
    static createWithArtists(obj: Song, artists: Artist[]): Promise<number>
    {
        let id: number;

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `insert into ${song.table} (
                    ${song.name},
                    ${song.unaccentedName}
                ) values (?, ?)`;

            const args = [
                obj.name.trim(),
                remove(obj.name.trim())
            ];

            tx.executeSql(sql, args, (_, { rowsAffected, insertId }) =>
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

    static export(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${song.id} as id,
                    ${song.name} as name,
                    ${song.insertDate} as insertDate,
                    ${song.updateDate} as updateDate
                from
                    ${song.table}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    /**
     * Busca músicas pelo nome e pelo(s) artista(s).
     * Quebra o texto do parâmetro 'search' por palavras,
     * buscando todas as possibilidades.
     * 
     * @param search Texto de busca
     * @returns Lista de músicas
     */
    /*static find(search: string): Promise<SQLResultSetRowList>
    {
        let where = '';
        if(search.trim().length > 0)
        {
            // Quebra a pesquisa por palavras
            const words = search.split(" ");
            // Pesquisa separadamente por cada palavra
            words.forEach(word =>
            {
                word = remove(word); // < -Remover acentos
                where +=
                    `or ${song.unaccentedName} like '%${word}%' ` +
                    `or ${artist.unaccentedName} like '%${word}%' `
            });
            where = where.replace('or', 'where');
        }

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    id,
                    name,
                    insertDate,
                    updateDate,
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
                        ${song.name} as name,
                        ${dbDatetimeFormat(song.insertDate)} as insertDate,
                        ${dbDatetimeFormat(song.updateDate)} as updateDate
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
    }*/

    static findById(id: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    id,
                    name,
                    insertDate,
                    updateDate,
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
                        ${song.name} as name,
                        ${dbDatetimeFormat(song.insertDate)} as insertDate,
                        ${dbDatetimeFormat(song.updateDate)} as updateDate
                    from
                        ${song.table}
                    where
                        ${song.id} = ?
                )`;

            tx.executeSql(sql, [id], (_, { rows }) =>
            {
                if(rows.length !== 0)
                    resolve(rows.item(0));
                else
                    reject();
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    /**
     * @param artistId ID do artista
     * @param restrictArtist 'true' se deve trazer nome do artista junto com os demais
     */
    static findByArtistId(artistId: number, restrictArtist?: boolean): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    id,
                    name,
                    insertDate,
                    updateDate,
                    (
                        select
                            group_concat(${artist.name}, ', ')
                        from
                            ${song_artist.table}
                        left join
                            ${artist.table} on
                                ${song_artist.artistId} = ${artist.id}
                                ${restrictArtist
                                    ? `and ${artist.id} != ${artistId}`
                                    : ''
                                }
                        where
                            ${song_artist.songId} = id and
                            ${song_artist.songId} = ${song_artist.songId}
                    ) as artists
                from (
                    select
                        ${song.id} as id,
                        ${song.name} as name,
                        ${dbDatetimeFormat(song.insertDate)} as insertDate,
                        ${dbDatetimeFormat(song.updateDate)} as updateDate
                    from
                        ${song.table}
                    left join
                        ${song_artist.table} on
                            ${song.id} = ${song_artist.songId}
                    where
                        ${song_artist.artistId} = ?
                    group by
                        ${song.id},
                        ${song_artist.songId}
                )`;

            tx.executeSql(sql, [artistId], (_, { rows }) =>
            {
                resolve(rows);
            });
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
            SheetService.deleteBySongIdTx(tx, id);

            // Deletar link com músicas
            SongArtistService.deleteBySongIdTx(tx, id);

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