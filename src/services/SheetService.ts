import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';
import { db } from '../database/connection';
import { Sheet } from '../models/Sheet';

export const sheet = {
    table: 'tb_sheet',
    id: 'sht_id_pk',
    songId: 'sht_sng_id_pk_fk',
    title: 'sht_title',
    content: 'sht_content',
}

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
            const sql = `insert into ${sheet.table} (
                ${sheet.songId},
                ${sheet.title},
                ${sheet.content}
            ) values (?, ?, ?)`;

            tx.executeSql(sql, [obj.songId, obj.title, obj.content], (_, { rowsAffected, insertId }) =>
            {
                if(rowsAffected > 0)
                    resolve(insertId);
                else
                    reject("Error inserting obj: " + JSON.stringify(obj));
            });
        },
        err =>
        {
            console.error(err);
            reject(err);
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
            const sql =
                `select
                    ${sheet.id} as id,
                    ${sheet.songId} as songId,
                    ${sheet.title} as title,
                    ${sheet.content} as content
                from
                    ${sheet.table}
                where
                    ${sheet.songId} = ?`;

            tx.executeSql(sql, [songId], (_, { rows }) =>
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

    /**
     * Atualiza o título da pagina
     * @param id ID da pagina
     * @param title novo título da pagina
     */
    static updateTitle(id: number, title: string): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `update ${sheet.table}
                set ${sheet.title} = ?
                where ${sheet.id} = ?`;

            tx.executeSql(sql, [title, id], (_, { rowsAffected }) =>
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
            const sql =
                `update ${sheet.table}
                set ${sheet.content} = ?
                where ${sheet.id} = ?`;

            tx.executeSql(sql, [content, id], (_, { rowsAffected }) =>
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

    /**
     * Deleta paginas por ID da música
     * @param tx Transaction
     * @param songId ID da música
     */
    static deleteBySongIdTx(tx: SQLTransaction, songId: number)
    {
        const sql =
            `delete from ${sheet.table}
            where ${sheet.songId} = ?`;

        tx.executeSql(sql, [songId]);
    }

    /**
     * Deleta pagina
     * @param id ID da pagina
     * @returns Promise com número de linhas afetadas (number)
     */
    static delete(id: number): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `delete from ${sheet.table} where ${sheet.id} = ?`;

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