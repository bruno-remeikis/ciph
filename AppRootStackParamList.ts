// Models
import { Artist } from "./src/models/entities/Artist";
import { Song } from "./src/models/entities/Song";

type RootStackParamList = {
	Home: { update?: boolean } | undefined;
	NewSong: { song: Song } | undefined;
	Song: { song: Song };
	Artist: { artist: Artist };
};

export default RootStackParamList;