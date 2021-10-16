// Services
import ArtistService from "./ArtistService";
import SongArtistService from "./SongArtistService";
import SongService from "./SongService";

export default class ImportService
{
    /**
     * Persiste ítens do JSON.
     * 
     * @param json Objeto JSON contendo lista de
     * entidades a serem inseridas
     */
    static consumeDataJson(json: any)
    {
        [SongService,
         ArtistService,
         SongArtistService,
        ].forEach(async (serviceClass) =>
            await serviceClass.import(json)
        );
    }
}