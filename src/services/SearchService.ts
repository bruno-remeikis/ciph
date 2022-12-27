import { SQLResultSetRowList } from 'expo-sqlite';
import { remove } from 'remove-accents';

// Database
import { db } from '../database/connection';

// Models
import { song } from '../models/entities/Song';
import { artist } from '../models/entities/Artist';
import { tag } from '../models/entities/Tag';
import { song_artist } from '../models/entities/SongArtist';

// Utils
import { dbDatetimeFormat } from '../utils/functions';
import { song_tag } from '../models/entities/SongTag';


export type filterValue = 'all' | 'songs' | 'artists' | 'tags';

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
        search = search.trim();

        // Quebra a pesquisa por palavras
        let words: string[] = [];
        
        let songWhere = '';
        let artistWhere = '';
        let tagWhere = '';

        if(search.length > 0)
        {
            words = search.split(" ");

            // Pesquisa separadamente por cada palavra
            words.forEach(word =>
            {
                word = remove(word); // < -Remover acentos
                songWhere += `or ${song.unaccentedName} like '%${word}%' `;
                artistWhere += `or ${artist.unaccentedName} like '%${word}%' `;
                tagWhere += `or ${tag.unaccentedName} like '%${word}%'`;
            });

            artistWhere = artistWhere.replace('or', 'where');
            tagWhere = tagWhere.replace('or', 'where');
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
                    ) as artists,
                    null as amount,
                    null as color,
                    (
                        select
                            ('[' || GROUP_CONCAT(
                                ('{ \"name\": \"' || ${tag.name} || '\", \"color\": \"' || ${tag.color} || '\" }'),
                                ', '
                            ) || ']')
                        from
                            ${song_tag.table}
                        inner join
                            ${tag.table} on
                                ${song_tag.tagId} = ${tag.id}
                        where
                            ${song_tag.songId} = id
                    ) as tags
                from (
                    select
                        ${song.id} as id,
                        ${song.name} as name,
                        ${song.insertDate} as insertDate,
                        ${song.updateDate} as updateDate
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
                    ${words.length !== 0 ? `order by ${song.insertDate} desc` : ''}
                )`;

            const artistsSql =
                `select * from
                (
                    select
                        'artist' as type,
                        ${artist.id} as id,
                        ${artist.name} as name,
                        ${artist.insertDate} as insertDate,
                        ${artist.updateDate} as updateDate,
                        null as artists,
                        null as amount,
                        null as color,
                        null as tags
                    from
                        ${artist.table}
                    ${artistWhere}
                    ${words.length !== 0 ? `order by ${artist.insertDate} desc` : ''}
                )`;

            const tagsSql =
                `select
                    'tag' as type,
                    ${tag.id} as id,
                    ${tag.name} as name,
                    ${tag.insertDate} as insertDate,
                    ${tag.updateDate} as updateDate,
                    null as artists,
                    (
                        select count(*)
                        from ${song_tag.table}
                        where ${song_tag.tagId} = ${tag.id}
                    ) as amount,
                    ${tag.color} as color,
                    null as tags
                from
                    ${tag.table}
                ${tagWhere}
                ${words.length !== 0 ? `order by ${tag.insertDate} desc` : ''}`;

            const sql =
                `select
                    type,
                    id,
                    name,
                    ${dbDatetimeFormat('insertDate')} as insertDate,
                    ${dbDatetimeFormat('updateDate')} as updateDate,
                    artists,
                    amount,
                    color,
                    tags
                from
                (
                    ${filter === 'all' || filter === 'artists' ? artistsSql : ''}
                    ${filter === 'all' ? 'union all' : ''}
                    ${filter === 'all' || filter === 'songs' ? songsSql : ''}
                    ${filter === 'all' ? 'union all' : ''}
                    ${filter === 'all' || filter === 'tags' ? tagsSql : ''}
                )
                ${words.length === 0 ? 'order by insertDate desc' : ''}`;

            tx.executeSql(sql, [], (_, { rows }) => resolve(rows));
        },
        err =>
        {
            console.error(err);
            reject(err);
        }));
    }
}