import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, FlatList } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Models
import { song, Song } from '../models/entities/Song';

// Services
import SongService from '../services/SongService';

// Utils
import { colors, shadow, sizes } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';

// Components
import Fade from '../components/animations/Fade';
import SearchItem from '../components/SearchItem';

// Contexts
import { useCurrentTag } from '../contexts/CurrentTag';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ----------

    const { id, name } = route.params.artist;



    // ---------- CONTEXTS ----------

    const { setCurrentTag } = useCurrentTag();



    // ---------- REFS ----------

    const resultsRef = useRef<FlatList | null>(null);



    // ---------- STATES ----------

    const { updated, setUpdated } = useUpdated();

    const [songs, setSongs] = useState<Song[]>([]);
    const [nameInfo, setNameInfo] = useState(name);

    const [scrollOnTop, setScrollOnTop] = useState<boolean>(true);



    // ---------- FUNCTIONS ----------

    function loadSongs()
    {
        SongService.findByArtistId(id, true)
            .then((res: any) => setSongs(
                res._array.map((song: Song) => ({
                    ...song,
                    artists: typeof song.artists === 'string' && song.artists.length > 0
                        ? `${name}, ${song.artists}`
                        : song.artists,
                }))
            ))
            .catch(err => alert(err));
    }



    // ---------- EFFECTS ----------

    useEffect(() => loadSongs(), []);

    useEffect(() =>
	{
		const unsubscribe = navigation.addListener( 'focus', () => setCurrentTag(null));
        
		return unsubscribe;
	},
	[navigation]);

    /**
     * Atualiza dados do artista
     */
    useEffect(() =>
    {
        if(typeof updated === 'object'
        && updated.artist)
        {
            setNameInfo(updated.artist.name);

            if(!updated.song)
                setUpdated(false);
        }
        else
            loadSongs();
    },
    [updated]);



    // ---------- RETURN ----------

    return (
        <View style={styles.container}>
            <Fade
                style={styles.header}
                visible={!scrollOnTop}
                property='elevation'
                initial={{ value: 0, time: 120 }}
                final={{ value: 2, time: 180 }}
            >
                <IonIcon
                    style={{ marginRight: 12 }}
                    name={'person'}
                    size={34}
                    color={colors.primary}
                />
                <Text style={{ fontSize: 24 }}>{nameInfo}</Text>
            </Fade>

            <FlatList
                ref={resultsRef}
                contentContainerStyle={styles.songs}
				data={songs}
				keyExtractor={item => `${item.id}`}
				renderItem={({ item }) =>
				(
					<SearchItem
						navigation={navigation}
						searchItem={{
                            ...item,
                            type: 'song',
                            id: item.id ? item.id : 0,
                        }}
					/>
				)}
                onScroll={event => setScrollOnTop(
					event.nativeEvent.contentOffset.y === 0
				)}
				// Tempo (ms) de atualização do evento de scroll:
				scrollEventThrottle={16}
				// Permitir que usuário interaja com os ítens
				// mesmo que o teclado esteja aberto:
				keyboardShouldPersistTaps='handled'
            />

            <View style={styles.btns}>
                <Pressable
					style={styles.newBtn}
					onPress={() => navigation.navigate('NewSong', { artist: { id, name: nameInfo } })}
				>
					<FeatherIcon name='plus' size={30} color='#ffff' />
				</Pressable>
            </View>
        </View>
    );
}

export default HomeScreen;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    // CONTAINER
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },

    // HEADER
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: sizes.screenPadding,
        paddingBottom: 12,
        ...shadow,
    },

    // SONGS
    songs: {
        paddingHorizontal: sizes.screenPadding,
        paddingBottom: sizes.screenPadding,
    },

    // BUTTONS
	btns: {
		position: 'absolute',
		bottom: 18,
		right: 18,
		alignItems: 'center',
	},
	newBtn: {
		justifyContent: 'space-around',
		alignItems: 'center',

		backgroundColor: colors.primary,

		width: 60,
		height: 60,
		borderRadius: 999,
	},
});