import { db } from './connection';

import { song } from '../services/SongService';
import { artist } from '../services/ArtistService';
import { song_artist } from '../services/SongArtistService';
import { sheet } from '../services/SheetService';

export default class Database
{
    /**
     * Constroi as tabelas do banco
     */
    public static init()
    {
        db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false, () =>
            console.log('Foreign keys turned on.')
        );

        var sqls = [
            `create table if not exists ${song.table} (
                ${song.id} integer primary key autoincrement,
                ${song.name} text not null
            );`,

            `create table if not exists ${artist.table} (
                ${artist.id} integer primary key autoincrement,
                ${artist.name} text unique not null
            );`,

            `create table if not exists ${song_artist.table} (
                ${song_artist.songId} integer not null,
                ${song_artist.artistId} integer not null,

                foreign key (${song_artist.songId})
                    references ${song.table} (${song.id}),

                foreign key (${song_artist.artistId})
                    references ${artist.table} (${artist.id})
            );`,
            
            `create table if not exists ${sheet.table} (
                ${sheet.id} integer primary key autoincrement,
                ${sheet.songId} integer not null,
                ${sheet.title} text not null,
                ${sheet.content} text not null,

                foreign key (${sheet.songId})
                    references ${song.table} (${song.id})
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
            () =>
            {
                console.log('Database has been created.');
                resolve(true)
            });
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
            `DROP TABLE IF EXISTS ${sheet.table};`,
            `DROP TABLE IF EXISTS ${song_artist.table};`,
            `DROP TABLE IF EXISTS ${artist.table};`,
            `DROP TABLE IF EXISTS ${song.table};`,
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
                console.log('Tables have been deleted.');
                Database.init()
                    .then(() => resolve(true))
                    .catch(err => reject(err));
            });
        }));
    }
}