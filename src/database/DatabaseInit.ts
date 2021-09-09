import { db } from './connection';

export default class DatabaseInit
{
    constructor()
    {
        db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
            console.log('Foreign keys turned on')
        );

        DatabaseInit.init();
    }

    /**
     * Constroi as tabelas do banco
     */
    public static init()
    {
        var sqls = [
            `create table if not exists song (
                id integer primary key autoincrement,
                name text not null,
                artist text not null
            );`,
            
            `create table if not exists sheet (
                id integer primary key autoincrement,
                song_id integer not null,
                title text not null,
                content text not null,

                foreign key (song_id)
                    references song (id)
            );`
        ];

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            db.transaction(tx =>
            {
                sqls.forEach(sql =>
                    tx.executeSql(sql)
                );
            },
            // Error
            (err) => reject(err),
            // Success
            () => resolve(true));
        }));
    }

    /**
     * Destroi as tabelas e as recria novamente.
     * (Recomendado apenas para testes)
     * @deprecated
     */
    public static recreate()
    {
        const sqls = [
            `DROP TABLE IF EXISTS sheet;`,
            `DROP TABLE IF EXISTS song;`,
        ];

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            db.transaction(tx =>
            {
                sqls.forEach(sql =>
                    tx.executeSql(sql)
                );
            },
            // Error
            (err) =>
            {
                console.error(err);
                reject(err);
            },
            // Success
            () =>
            {
                DatabaseInit.init()
                    .then(() => resolve(true))
                    .catch(err => reject(err));
            });
        }));
    }
}