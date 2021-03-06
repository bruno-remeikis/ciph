import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, FlatList } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import SearchItem from '../components/SearchItem';

// Models
import { Song } from '../models/entities/Song';

// Services
import SongService from '../services/SongService';

// Utils
import { colors, shadow, sizes } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';

// Components
import Fade from '../components/animations/Fade';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ----------

    const { id, name } = route.params.artist;



    // ---------- REFS ----------

    const resultsRef = useRef<FlatList | null>(null);



    // ---------- STATES ----------

    const { updated, setUpdated } = useUpdated();

    const [songs, setSongs] = useState<Song[]>([]);
    const [nameInfo, setNameInfo] = useState(name);

    const [scrollOnTop, setScrollOnTop] = useState<boolean>(true);



    // ---------- EFFECTS ----------

    useEffect(() =>
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
    },
    []);

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
				// Tempo (ms) de atualiza????o do evento de scroll:
				scrollEventThrottle={16}
				// Permitir que usu??rio interaja com os ??tens
				// mesmo que o teclado esteja aberto:
				keyboardShouldPersistTaps='handled'
            />
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
        paddingBottom: sizes.screenPadding - 8,
    },
});