import { db } from '../database/connection';
import { music } from '../models/music';

const table = 'music';

export default class MusicService
{
    /**
     * Insere uma nova música no banco
     * 
     * @param obj Música a ser inserida
     * @returns ID do ítem recém incerido
     */
    static create(obj: music)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `insert into ${table} (name, artist) values (?, ?)`;

            tx.executeSql(sql, [obj.name, obj.artist], (_, { rowsAffected, insertId }) =>
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
    static findAll()
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
    }

    /**
     * Busca músicas pelo nome e pelo(s) artista(s).
     * Quebra o texto do parâmetro 'search' por palavras,
     * buscando todas as possibilidades.
     * 
     * @param search Texto de busca
     * @returns Lista de músicas
     */
    static find(search: string)
    {
        // Quebra a pesquisa por palavras
        const words = search.split(" ");

        var where = '';
        if(words.length)
        {
            // Pesquisa separadamente por cada palavra
            words.forEach(word => { where += `or name like '%${word}%' or artist like '%${word}%'` });
            
            where = where.replace('or', 'where');
        }

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `select * from ${table} ${where}`;

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
    }

    /**
     * Deleta todas as músicas.
     * (Recomendado apenas para testes)
     * 
     * @returns número de elementos deletados 
     */
    static deleteAll()
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = `delete from ${table}`;

            tx.executeSql(sql, [], (_, { rowsAffected }) =>
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

    /*
    static deleteById(id: number)
    {
        db.transaction(tx =>
        {
            tx.executeSql(`delete from ${table} where id = ?;`, [id], (_, { rows }) => {
            }), (sqlError) => {
                console.log(sqlError);
            }}, (txError) => {
            console.log(txError);
        });
    }
    
     static updateById(param: Animal) {
        return new Promise((resolve, reject) =>db.transaction(tx => {
                tx.executeSql(`update ${table} set nome = ? where id = ?;`, [param.nome,param.id], () => {
                }), (sqlError) => {
                    console.log(sqlError);
                }}, (txError) => {
                console.log(txError);
    
            }));
    }

     static findById(id: number) {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(`select * from ${table} where id=?`, [id], (_, { rows }) => {
                resolve(rows)
            }), (sqlError) => {
                console.log(sqlError);
            }}, (txError) => {
            console.log(txError);

        }));
    }
    */
}