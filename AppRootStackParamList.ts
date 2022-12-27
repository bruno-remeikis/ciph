// Models
import { Artist } from "./src/models/entities/Artist";
import { Song } from "./src/models/entities/Song";
import { Tag } from "./src/models/entities/Tag";

type RootStackParamList = {
	Home: { update?: boolean } | undefined;
	NewSong: { song: Song } | undefined;
	Song: { song: Song };
	Artist: { artist: Artist };
	Tag: { tag: Tag };
};

export default RootStackParamList;