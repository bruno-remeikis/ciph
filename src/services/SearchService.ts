import { SQLResultSetRowList } from 'expo-sqlite';
import { remove } from 'remove-accents';

// Database
import { db } from '../database/connection';

// Services
import SheetService from './SheetService';
import ArtistService from './ArtistService';
import SongArtistService from './SongArtistService';

// Models
import { Song, song } from '../models/entities/Song';
import { Artist, artist } from '../models/entities/Artist';
import { song_artist } from '../models/entities/SongArtist';
import { dbDatetimeFormat } from '../utils/functions';

export type filterValue = 'all' | 'songs' | 'artists';

export default class SearchService
{
    /**
     * Busca músicas e artistas pelos nomes.
     * Quebra o texto do parâmetro 'search' por palavras,
     * buscando todas as possibilidades.
     * 
     * @param search Texto de busca
     * @returns Lista de músicas e/ou artistas
     */
    static find(search: string, filter: filterValue): Promise<SQLResultSetRowList>
    {
        let songWhere = '';
        let artistWhere = '';
        if(search.trim().length > 0)
        {
            // Quebra a pesquisa por palavras
            const words = search.split(" ");

            // Pesquisa separadamente por cada palavra
            words.forEach(word =>
            {
                word = remove(word); // < -Remover acentos
                songWhere += `or ${song.unaccentedName} like '%${word}%' `;
                artistWhere += `or ${artist.unaccentedName} like '%${word}%' `;
            });

            artistWhere = artistWhere.replace('or', 'where');
        }

        return new Promise((resolve, reject) => db.transaction(tx =>
        {
            const songsSql =
                `select
                    'song' as type,
                    id,
                    name,
                    insertDate,
                    updateDate,
                    (
                        select
                            group_concat(${artist.name}, ', ')
                        from
                            ${song_artist.table}
                        left join
                            ${artist.table} on
                                ${song_artist.artistId} = ${artist.id}
                        where
                            ${song_artist.songId} = id and
                            ${song_artist.songId} = ${song_artist.songId}
                    ) as artists
                from (
                    select
                        ${song.id} as id,
                        ${song.name} as name,
                        ${dbDatetimeFormat(song.insertDate)} as insertDate,
                        ${dbDatetimeFormat(song.updateDate)} as updateDate
                    from
                        ${song.table}
                    left join
                        ${song_artist.table} on
                            ${song.id} = ${song_artist.songId}
                    left join
                        ${artist.table} on
                            ${song_artist.artistId} = ${artist.id}
                    ${artistWhere}
                    ${songWhere}
                    group by
                        ${song.id},
                        ${song_artist.songId}
                )`;

            const artistsSql =
                `select
                    'artist' as type,
                    ${artist.id} as id,
                    ${artist.name} as name,
                    ${artist.insertDate} as insertDate,
                    ${artist.updateDate} as updateDate,
                    null as artists
                from
                    ${artist.table}
                ${artistWhere}`;

            const sql =
                `select * from
                (
                    ${filter === 'all' || filter === 'songs' ? songsSql : ''}
                    ${filter === 'all' ? 'union all' : ''}
                    ${filter === 'all' || filter === 'artists' ? artistsSql : ''}
                )`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}