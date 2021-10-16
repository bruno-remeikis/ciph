// Models
import { Artist } from "../models/entities/Artist";
import { Song } from "../models/entities/Song";
import { SongArtist } from "../models/entities/SongArtist";

// Services
import SongService from "./SongService";
import SheetService from "./SheetService";
import ArtistService from "./ArtistService";
import SongArtistService from "./SongArtistService";

export type DataJson = {
    songs: Song[];
    artists: Artist[];
    songsArtists: SongArtist[];
}

export default class ExportService
{
    static async createDataJson(): Promise<DataJson>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // Songs
                let songs: any = await SongService.export();
                songs = songs._array;

                // Sheets
                for(let i = 0; i < songs.length; i++)
                    if(songs[i].id)
                    {
                        const sheets: any = await SheetService.export(songs[i].id);
                        songs[i].sheets = sheets._array;
                    }

                // Artists
                let artists: any = await ArtistService.export();
                artists = artists._array;

                // Songs _ Artists
                let songsArtists: any = await SongArtistService.export();
                songsArtists = songsArtists._array;

                resolve({
                    songs,
                    artists,
                    songsArtists,
                });
            }
            catch(err)
            {
                reject(err);
            }
        });
    }
}