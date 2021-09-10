import { SQLResultSetRowList } from 'expo-sqlite';
import { db } from '../database/connection';
import SheetService from './SheetService';
import { Song } from '../models/Song';
import ArtistService from './ArtistService';

const table = 'song';

export default class SongService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerido
     */
    static create(obj: Song): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `insert into ${table} (name) values (?)`;

            tx.executeSql(sql, [obj.name], (_, { rowsAffected, insertId }) =>
            {
                if(rowsAffected > 0)
                    resolve(insertId);
                else
                    reject("Error inserting obj: " + JSON.stringify(obj));
            },
            (_, err) =>
            {
                console.error(err);
                reject(err);
                return false;
            });
        }));
    }

    /**
     * Busca todas as músicas
     * 
     * @returns Lista de músicas
     */
    /*static findAll(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `select * from ${table}`;

            tx.executeSql(sql, [], (_, { rows }) =>
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
            words.forEach(word => { where += `or name like '%${word}%'` });
            where = where.replace('or', 'where');
        }

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = //`select * from ${table} ${where}`;
                `select
                    s.*,
                    group_concat(a.name, ', ') as artists
                from ${table} s
                join artist a
                    on a.song_id = s.id
                ${where}
                group by
                    s.id, a.song_id`;

            tx.executeSql(sql, [], (_, { rows, rowsAffected }) =>
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

            const sql = `delete from ${table} where id = ?`;

            tx.executeSql(sql, [id], (_, { rowsAffected }) =>
            {
                resolve(rowsAffected);
            }),
            (_: any, err: any) =>
            {
                console.error(err);
                reject(err);
                return false;
            };
        }));
    }
}