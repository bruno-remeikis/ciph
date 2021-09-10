import { SQLResultSetRowList } from 'expo-sqlite';
import { db } from '../database/connection';

const table = 'artist';

export default class ArtistService
{
    /**
     * Insere uma nova entidade no banco
     * 
     * @param songId ID da música
     * @param objs Lista de entidades a serem inseridas
     * @returns IDs das entidades recém inceridas
     */
    static create(songId: number, names: string[]): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            if(names.length === 0)
            {
                resolve(0);
                return;
            }

            let sql = `insert into ${table} (song_id, name) values `;

            const values: (number | string)[] = [];
            names.forEach(name =>
            {
                sql += '(?, ?), ';
                values.push(songId, name);
            });
            sql = sql.substr(0, sql.length - 2);

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
}