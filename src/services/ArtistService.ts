import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';
import { remove } from 'remove-accents';

// Database
import { db } from '../database/connection';

// Services
import SongArtistService from './SongArtistService';

// Models
import { Artist, artist } from '../models/entities/Artist';
import { song_artist } from '../models/entities/SongArtist';

export default class ArtistService
{
    /**
     * Insere os artistas contidos no JSON principal
     * (parâmetro: 'artists').
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
            if(!json.artists || !Array.isArray(json.artists))
                reject();

            const sql =
                `insert into ${artist.table} (
                    ${artist.name},
                    ${artist.unaccentedName},
                    ${artist.insertDate},
                    ${artist.updateDate}
                ) values (?, ?, ?, ?)`;

            for(let i = 0; i < json.artists.length; i++)
            {
                const obj = json.artists[i];

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
                    json.artists[i].newId = insertId;
                });
            }
        },
        err => reject(err),
        () => resolve()));
    }

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
                ${artist.name},
                ${artist.unaccentedName}
            ) values (?, ?)`;

        artists.forEach(artist =>
        {
            // Se artist possuir ID: artista já existe no BD
            if(artist.id)
                SongArtistService.createTx(tx, songId, artist.id);
            else
            {
                const args = [
                    artist.name.trim(),
                    remove(artist.name.trim())
                ];

                tx.executeSql(sql, args, (_, { rowsAffected, insertId }) =>
                {
                    if(rowsAffected > 0)
                        SongArtistService.createTx(tx, songId, insertId);
                });
            }
        });
    }

    static export(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${artist.id} as id,
                    ${artist.name} as name,
                    ${artist.insertDate} as insertDate,
                    ${artist.updateDate} as updateDate
                from
                    ${artist.table}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
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

    static findByNameSearch(name: string, restrictedIds: number[]): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            name = remove(name.trim()); // <- Remover acentos

            let where = "";
            restrictedIds.forEach(id => where += id + ", ");

            if(where.length > 0)
            {
                where = where.slice(0, -2); // <- Remover ultimo ", "
                where = `${artist.id} not in (${where}) and`;
            }

            /**
             * @param filter Permite que query seja ordenada, mantendo
             * os registros que começam com 'name' (...%) primeiro e os
             * que possuem 'name' em qualquer posição (%...%) por último
             * @param afterName Diz se nome dos artistas poderão possuir
             * valor antes do encontrado (%...)
             * @returns Query formatada
             */
            const baseSql = (filter: number, afterName: '%' | ''): string =>
                `select
                    ${artist.id} as id,
                    ${artist.name} as name,
                    ${artist.insertDate} as insertDate,
                    ${filter} as filter
                from
                    ${artist.table}
                where
                    ${where}
                    ${artist.unaccentedName} like '${afterName}${name}%'`;

            const sql =
                `select distinct
                    id,
                    name
                from
                (
                    ${baseSql(1, '')}
                    union
                    ${baseSql(2, '%')}
                )
                order by
                    filter asc,
                    insertDate desc
                limit 6`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static findByName(name: string): Promise<Artist | null>
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
                    ${artist.name} like ?`;

            tx.executeSql(sql, [name], (_, { rows }) =>
            {
                if(rows.length !== 0)
                    resolve(rows.item(0));
                else
                    resolve(null);
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static updateName(id: number, name: string)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `update ${artist.table} set
                    ${artist.name} = ?,
                    ${artist.unaccentedName} = ?
                where ${artist.id} = ?`;

            const args = [
                name.trim(),
                remove(name.trim()),
                id
            ];

            tx.executeSql(sql, args, (_, { rowsAffected }) =>
                resolve(rowsAffected)
            );
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}