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
            `create table if not exists music (
                id integer primary key autoincrement,
                name text not null,
                artist text not null
            );`,
            
            `create table if not exists sheet (
                id integer primary key autoincrement,
                music_id integer not null,
                title text not null,
                content text not null,

                foreign key (music_id)
                    references music (id)
            );`
        ];

        db.transaction(tx =>
        {
            sqls.forEach(sql =>
                tx.executeSql(sql)
            );
        },
        (err) =>
        {
            console.error(err);
            alert(err);
        });
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
            `DROP TABLE IF EXISTS music;`,
        ];

        db.transaction(tx =>
        {
            sqls.forEach(sql =>
                tx.executeSql(sql)
            );

            DatabaseInit.init();
        },
        (err) =>
        {
            console.error(err);
            alert(err);
        });
    }
}