import { db } from '../database/connection';
import { remove } from 'remove-accents';

import { SQLResultSetRowList } from 'expo-sqlite';

// Models
import { Tag, tag } from '../models/entities/Tag';
import { song_tag } from '../models/entities/SongTag';

// Services
import SongTagService from './SongTagService';

export default class TagService
{
    /**
     * Insere os repertórios contidos no JSON principal
     * (parâmetro: 'tags').
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
            if(!json.tags || !Array.isArray(json.tags))
                reject();

            const sql =
                `insert into ${tag.table} (
                    ${tag.name},
                    ${tag.unaccentedName},
                    ${tag.insertDate},
                    ${tag.updateDate}
                ) values (?, ?, ?, ?)`;

            for(let i = 0; i < json.tags.length; i++)
            {
                const obj = json.tags[i];

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
                    json.tags[i].newId = insertId;
                });
            }
        },
        err => reject(err),
        () => resolve()));
    }

    static export(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${tag.id} as id,
                    ${tag.name} as name,
                    ${tag.color} as color,
                    ${tag.insertDate} as insertDate,
                    ${tag.updateDate} as updateDate
                from
                    ${tag.table}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    /**
     * Insere uma nova entidade no banco
     * 
     * @param obj Entidade a ser inserida
     * @returns ID da entidade recém incerida
     */
    static create(obj: Tag): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `insert into ${tag.table} (
                    ${tag.name},
                    ${tag.unaccentedName},
                    ${tag.color}
                ) values (?, ?, ?)`;

            const args = [
                obj.name.trim(),
                remove(obj.name.trim()),
                obj.color
            ];

            tx.executeSql(sql, args, (_, { rowsAffected, insertId }) =>
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
     * Busca todas as tags
     */
    static find(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = 
                `select
                    ${tag.id} as id,
                    ${tag.name} as name,
                    ${tag.color} as color,
                    (
                        select count(*)
                        from ${song_tag.table}
                        where ${song_tag.tagId} = ${tag.id}
                    ) as amount,
                    ${tag.insertDate} as insertDate,
                    ${tag.updateDate} as updateDate
                from ${tag.table}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    /**
     * Busca todas as tags que ainda não foram adicionadas à música
     */
    /*static findNotAdded(songId: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = 
                `select
                    ${tag.id} as id,
                    ${tag.name} as name,
                    ${tag.color} as color,
                    null as amount,
                    ${tag.insertDate} as insertDate,
                    ${tag.updateDate} as updateDate
                from ${tag.table}
                left join ${song_tag.table} st2
                    on st2.${song_tag.tagId} = ${tag.id}
                where
                    st2.${song_tag.songId} != ?
                group by ${song_tag.tagId}`;

            console.log(sql);

            tx.executeSql(sql, [songId], (_, { rows }) => { console.log(rows); resolve(rows); });
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }*/

    /**
     * Busca tags por ID da música
     * @param songId ID da música
     */
    static findBySongId(songId: number): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql = 
                `select
                    ${tag.id} as id,
                    ${tag.name} as name,
                    ${tag.color} as color,
                    (
                        select count(*)
                        from ${song_tag.table}
                        where ${song_tag.tagId} = ${tag.id}
                    ) as amount,
                    ${tag.insertDate} as insertDate,
                    ${tag.updateDate} as updateDate
                from ${tag.table}
                inner join ${song_tag.table}
                    on ${tag.id} = ${song_tag.tagId}
                where ${song_tag.songId} = ?`;

            tx.executeSql(sql, [songId], (_, { rows }) => resolve(rows));
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
                `update ${tag.table} set
                    ${tag.name} = ?,
                    ${tag.unaccentedName} = ?
                where ${tag.id} = ?`;

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

    /**
     * Deleta tag (repertório) por ID
     * 
     * @param id ID da tag (repertório)
     * @returns Número de linhas afetadas
     */
    static delete(id: number): Promise<number>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            // Deleta relacionamentos entre tag e música
            SongTagService.deleteByTagIdTx(tx, id);

            const sql =
                `delete from ${tag.table} where ${tag.id} = ?`;

            tx.executeSql(sql, [id], (_, { rowsAffected }) => resolve(rowsAffected));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}