import { db } from '../database/connection';
import { Sheet } from '../models/Sheet';

const table = 'sheet';

export default class SheetService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerido
     */
    static create(obj: Sheet)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `insert into ${table} (music_id, title, content) values (?, ?, ?)`;

            tx.executeSql(sql, [obj.musicId, obj.title, obj.content], (_, { rowsAffected, insertId }) =>
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
     * Busca folhas pelo ID de sua música
     * 
     * @param musicId ID da música
     * @returns Lista de folhas
     */
    static findByMusicId(musicId: number)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `select * from ${table} where music_id = ?`;

            tx.executeSql(sql, [musicId], (_, { rows }) =>
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
     * Deleta folhas por ID da música
     * @param musicId ID da música
     */
    static deleteByMusicId(musicId: number)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `delete from ${table} where music_id = ?`;

            tx.executeSql(sql, [musicId], (_, { rowsAffected }) =>
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
     * Atualiza o título da folha
     * @param id ID da folha
     * @param title novo título da folha
     */
    static updateTitle(id: number, title: string)
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
}