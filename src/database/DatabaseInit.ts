import { db } from './connection';

export default class DatabaseInit
{
    constructor()
    {
        db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
            console.log('Foreign keys turned on')
        );

        this.init();
    }

    private init()
    {
        var sqls = [
            //`DROP TABLE IF EXISTS music;`,

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
            
            //`insert into music(name, artist) values('Faroeste Cabolco', 'Legião Urbana');`,
        ];

        db.transaction(tx =>
        {
            sqls.forEach((sql) =>
                tx.executeSql(sql)
            );
        },
        (err) =>
        {
            console.error(err);
            alert(err);
        });
        //() => console.log("transaction complete call back"));
    }
}