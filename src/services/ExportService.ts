// Models
import { Artist } from "../models/entities/Artist";
import { Song } from "../models/entities/Song";
import { SongArtist } from "../models/entities/SongArtist";

// Services
import SongService from "./SongService";
import SheetService from "./SheetService";
import ArtistService from "./ArtistService";
import SongArtistService from "./SongArtistService";

type DataJson = {
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
                // Song
                let songs: any = await SongService.findAll();

                // Sheet
                songs = songs._array.map((song: Song) =>
                {
                    let sheets: any = [];

                    if(song.id)
                        SheetService.findBySongId(song.id).then((res: any) =>
                        {
                            sheets = res._array;
                        });

                    return { sheets, ...song };
                });

                // Artist
                let artists: any = await ArtistService.findAll();
                artists = artists._array;

                // SongArtist
                let songsArtists: any = await SongArtistService.findAll();
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