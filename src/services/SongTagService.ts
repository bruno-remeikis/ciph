import { db } from '../database/connection';
import { SQLTransaction } from 'expo-sqlite';

// Models
import { SongTag, song_tag } from '../models/entities/SongTag';

export default class SongTagService
{
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