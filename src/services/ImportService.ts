// Services
import ArtistService from "./ArtistService";
import SongArtistService from "./SongArtistService";
import SongService from "./SongService";
import SongTagService from "./SongTagService";
import TagService from "./TagService";

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
         TagService,
         SongTagService
        ].forEach(async (serviceClass) =>
            await serviceClass.import(json)
        );
    }
}