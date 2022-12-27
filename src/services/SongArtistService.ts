import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';

// Database
import { db } from '../database/connection';

// Models
import {  song_artist } from '../models/entities/SongArtist';

export default class SongArtistService
{
    /**
     * Insere as entidades assosiativas song_artist contidos
     * no JSON principal (parâmetro: 'songsArtists').
     * 
     * Por se tratar de uma tabela associativa, busca os novos
     * IDs ('newId') nos ítens das listas 'songs' e 'artists'.
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
            if(!json.songs || !Array.isArray(json.songs)
            || !json.artists || !Array.isArray(json.artists))
                reject();

            const sql =
                `insert into ${song_artist.table} (
                    ${song_artist.songId},
                    ${song_artist.artistId},
                    ${song_artist.insertDate},
                    ${song_artist.updateDate}
                ) values (?, ?, ?, ?)`;

            for(let i = 0; i < json.songsArtists.length; i++)
            {
                const obj = json.songsArtists[i];

                // Validar propriedades do objeto
                if(Number.isNaN(obj.songId) || obj.songId <= 0
                || Number.isNaN(obj.artistId) || obj.artistId <= 0)
                    continue;

                // Busca objetos do relacionamento.
                // Procura os com mesmo 'id' e pega o 'newId'
                const songId = json.songs
                    .find((song: any) => song.id === obj.songId)
                    ?.newId;
                
                const artistId = json.artists
                    .find((artist: any) => artist.id === obj.artistId)
                    ?.newId;

                // Valida IDs encontrados
                if(!songId || !artistId)
                    continue;

                const args = [
                    songId,
                    artistId,
                    obj.insertDate ? obj.insertDate : 'current_timestamp',
                    obj.updateDate ? obj.insertDate : null,
                ];

                tx.executeSql(sql, args, (_, { insertId }) =>
                {
                    json.songsArtists[i].newId = insertId;
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
            artistIds = [artistIds];

        const sql = `insert into ${song_artist.table} (
            ${song_artist.songId},
            ${song_artist.artistId}
        ) values (?, ?)`;

        artistIds.forEach(id =>
            tx.executeSql(sql, [songId, id]));
    }

    static export(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${song_artist.id} as id,
                    ${song_artist.songId} as songId,
                    ${song_artist.artistId} as artistId,
                    ${song_artist.insertDate} as insertDate,
                    ${song_artist.updateDate} as updateDate
                from
                    ${song_artist.table}`;

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