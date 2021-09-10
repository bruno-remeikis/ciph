import { SQLResultSetRowList } from 'expo-sqlite';
import { db } from '../database/connection';
import { Sheet } from '../models/Sheet';

const table = 'sheet';

export default class SheetService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerida
     */
    static create(obj: Sheet): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `insert into ${table} (song_id, title, content) values (?, ?, ?)`;

            tx.executeSql(sql, [obj.songId, obj.title, obj.content], (_, { rowsAffected, insertId }) =>
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
     * Busca paginas pelo ID de sua música
     * 
     * @param songId ID da música
     * @returns Lista de paginas
     */
    static findBySongId(songId: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `select * from ${table} where song_id = ?`;

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
    }

    /**
     * Deleta paginas por ID da música
     * @param songId ID da música
     * @returns Número de linhas afetadas
     */
    static deleteBySongId(songId: number): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `delete from ${table} where song_id = ?`;

            tx.executeSql(sql, [songId], (_, { rowsAffected }) =>
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

    /**
     * Atualiza o título da pagina
     * @param id ID da pagina
     * @param title novo título da pagina
     */
    static updateTitle(id: number, title: string): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `update ${table} set title = ? where id = ?`;

            tx.executeSql(sql, [title, id], (_, { rowsAffected }) =>
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

    /**
     * Atualiza o conteúdo da pagina
     * 
     * @param id ID da pagina
     * @param content novo conteúdo da pagina
     * @returns Número de linhas afetadas
     */
    static updateContent(id: number, content: string): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `update ${table} set content = ? where id = ?`;

            tx.executeSql(sql, [content, id], (_, { rowsAffected }) =>
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