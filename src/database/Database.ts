import { db } from './connection';
import { Table } from './types';

// Models
import { song } from '../models/entities/Song';
import { artist } from '../models/entities/Artist';
import { song_artist } from '../models/entities/SongArtist';
import { sheet } from '../models/entities/Sheet';
import { tag } from '../models/entities/Tag';
import { song_tag } from '../models/entities/SongTag';



// ---------- TYPES ----------

// Tabelas que necessitam de triggers de update
type UpdTgType = { name: string, tb: Table };



// ---------- CONSTS ----------

const updTriggers: UpdTgType[] = [
    {name: 'song',        tb: song},
    {name: 'artist',      tb: artist},
    {name: 'song_artist', tb: song_artist},
    {name: 'sheet',       tb: sheet},
    {name: 'tag',         tb: tag},
    {name: 'song_tag',    tb: song_tag},
];



// ---------- CLASS ----------

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
            // SONG
            `create table if not exists ${song.table} (
                ${song.id} integer primary key autoincrement,
                ${song.name} text not null,
                ${song.unaccentedName} text not null,
                ${song.insertDate} datetime not null
                    default current_timestamp,
                ${song.updateDate} datetime
            );`,
            // ARTIST
            `create table if not exists ${artist.table} (
                ${artist.id} integer primary key autoincrement,
                ${artist.name} text unique not null,
                ${artist.unaccentedName} text not null,
                ${artist.insertDate} datetime not null
                    default current_timestamp,
                ${artist.updateDate} datetime
            );`,
            // SONG_ARTIST (N:N)
            `create table if not exists ${song_artist.table} (
                ${song_artist.id} integer primary key autoincrement,
                ${song_artist.songId} integer not null,
                ${song_artist.artistId} integer not null,
                ${song_artist.insertDate} datetime not null
                    default current_timestamp,
                ${song_artist.updateDate} datetime,

                foreign key (${song_artist.songId})
                    references ${song.table} (${song.id}),

                foreign key (${song_artist.artistId})
                    references ${artist.table} (${artist.id})
            );`,
            // SHEET
            `create table if not exists ${sheet.table} (
                ${sheet.id} integer primary key autoincrement,
                ${sheet.songId} integer not null,
                ${sheet.title} text not null,
                ${sheet.content} text not null,
                ${sheet.insertDate} datetime not null
                    default current_timestamp,
                ${sheet.updateDate} datetime,

                foreign key (${sheet.songId})
                    references ${song.table} (${song.id})
            );`,
            // TAG
            `create table if not exists ${tag.table} (
                ${tag.id} integer primary key autoincrement,
                ${tag.name} text not null,
                ${tag.color} text,
                ${tag.insertDate} datetime not null
                    default current_timestamp,
                ${tag.updateDate} datetime
            );`,
            // SONG_TAG (N:N)
            `create table if not exists ${song_tag.table} (
                ${song_tag.id} integer primary key autoincrement,
                ${song_tag.songId} integer not null,
                ${song_tag.tagId} integer not null,
                ${song_tag.insertDate} datetime not null
                    default current_timestamp,
                ${song_tag.updateDate} datetime,

                foreign key (${song_tag.songId})
                    references ${song.table} (${song.id}),

                foreign key (${song_tag.tagId})
                    references ${tag.table} (${tag.id})
            );`,
        ];

        const triggerSql = (upd: UpdTgType) =>
           `create trigger if not exists tg_update_${upd.name}
                after update on ${upd.tb.table}
                for each row
                begin
                    update ${upd.tb.table}
                    set ${upd.tb.updateDate} = current_timestamp
                    where ${upd.tb.id} = old.${upd.tb.id};
                end;`;

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            db.transaction(tx =>
            {
                sqls.forEach(sql =>
                    tx.executeSql(sql)
                );

                // Criar triggers de update para ..._update_dt
                updTriggers.forEach(upd =>
                {
                    if(upd.tb.id)
                        tx.executeSql(triggerSql(upd))
                });
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

        updTriggers.forEach(tg =>
            sqls.push(`DROP TRIGGER IF EXISTS tg_update_${tg.name}`)
        );

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
                console.log('Tables and triggers have been deleted.');
                Database.init()
                    .then(() => resolve(true))
                    .catch(err => reject(err));
            });
        }));
    }
}