import { db } from '../database/connection';
import { SQLResultSetRowList, SQLTransaction } from 'expo-sqlite';

// Models
import { song_tag } from '../models/entities/SongTag';

export default class SongTagService
{
    /**
     * Insere as entidades assosiativas song_tag contidos
     * no JSON principal (parâmetro: 'songsTags').
     * 
     * Por se tratar de uma tabela associativa, busca os novos
     * IDs ('newId') nos ítens das listas 'songs' e 'tags'.
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
            || !json.tags || !Array.isArray(json.tags))
                reject();

            const sql =
                `insert into ${song_tag.table} (
                    ${song_tag.songId},
                    ${song_tag.tagId},
                    ${song_tag.insertDate},
                    ${song_tag.updateDate}
                ) values (?, ?, ?, ?)`;

            for(let i = 0; i < json.songsTags.length; i++)
            {
                const obj = json.songsTags[i];

                // Validar propriedades do objeto
                if(Number.isNaN(obj.songId) || obj.songId <= 0
                || Number.isNaN(obj.tagId) || obj.tagId <= 0)
                    continue;

                // Busca objetos do relacionamento.
                // Procura os com mesmo 'id' e pega o 'newId'
                const songId = json.songs
                    .find((song: any) => song.id === obj.songId)
                    ?.newId;
                
                const tagId = json.tags
                    .find((tag: any) => tag.id === obj.tagId)
                    ?.newId;

                // Valida IDs encontrados
                if(!songId || !tagId)
                    continue;

                const args = [
                    songId,
                    tagId,
                    obj.insertDate ? obj.insertDate : 'current_timestamp',
                    obj.updateDate ? obj.insertDate : null,
                ];

                tx.executeSql(sql, args, (_, { insertId }) =>
                {
                    json.songsTags[i].newId = insertId;
                });
            }
        },
        err => reject(err),
        () => resolve()));
    }

    /**
     * Insere uma nova entidade no banco
     * 
     * @param songId IDs da músicas
     * @param tagIds IDs das tags (repertórios)
     * @returns ID da entidade recém inceridas
     */
    static create(songIds: number | number[], tagIds: number | number[]): Promise<boolean>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            if(!Array.isArray(songIds))
                songIds = [songIds];

            if(!Array.isArray(tagIds))
                tagIds = [tagIds];

            const mainSql = `insert into ${song_tag.table} (
                ${song_tag.songId},
                ${song_tag.tagId}
            ) values (?, ?)`;

            const countSql = 
                `select count(*) as qtd
                from ${song_tag.table}
                where ${song_tag.songId} = ?
                    AND ${song_tag.tagId} = ?`;

            songIds.forEach(songId =>
            {
                if(Array.isArray(tagIds))
                    tagIds.forEach(tagId =>
                    {
                        tx.executeSql(countSql, [songId, tagId], (_, { rows }) =>
                        {
                            if(rows.item(0).qtd === 0)
                                tx.executeSql(mainSql, [songId, tagId]);
                        }); 
                    });
            });
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

    static export(): Promise<SQLResultSetRowList>
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `select
                    ${song_tag.id} as id,
                    ${song_tag.songId} as songId,
                    ${song_tag.tagId} as tagId,
                    ${song_tag.insertDate} as insertDate,
                    ${song_tag.updateDate} as updateDate
                from
                    ${song_tag.table}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }

    static delete(songId: number, tagId: number)
    {
        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const sql =
                `delete from ${song_tag.table} where
                    ${song_tag.songId} = ? and
                    ${song_tag.tagId} = ?`;

            tx.executeSql(sql, [songId, tagId], (_, { rowsAffected }) =>
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
            `delete from ${song_tag.table}
            where ${song_tag.songId} = ?`;

        tx.executeSql(sql, [songId]);
    }

    static deleteByTagIdTx(tx: SQLTransaction, tagId: number)
    {
        const sql =
            `delete from ${song_tag.table}
            where ${song_tag.tagId} = ?`;

        tx.executeSql(sql, [tagId]);
    }
}