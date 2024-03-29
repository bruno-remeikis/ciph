import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';

// Models
import { Song } from '../models/entities/Song';

// Components
import SearchItem from '../components/SearchItem';
import SongService from '../services/SongService';
import Fade from '../components/animations/Fade';

// Utils
import { colors, sizes, shadow } from '../utils/consts';

// Icons
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

// Contexts
import { useUpdated } from '../contexts/Updated';
import { useCurrentTag } from '../contexts/CurrentTag';

const TagScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ----------

    const { id, name, color } = route.params.tag;

    // ---------- CONTEXTS ----------

    const { updated, setUpdated } = useUpdated();

    const { setCurrentTag } = useCurrentTag();

    // ---------- STATES ----------

    const [songs, setSongs] = useState<Song[]>([]);

    const [scrollOnTop, setScrollOnTop] = useState<boolean>(true);



    // ---------- FUNCTIONS ----------

    function loadSongs()
    {
        SongService.findByTagId(id)
            .then((res: any) => setSongs(res._array))
            .catch(err => alert(err));
    }



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        loadSongs();

        setCurrentTag({
            tag: route.params.tag,
            songList: [],
        })
    },
    []);

	useEffect(() =>
	{
		if(updated)
		{
            if(typeof updated === 'object' 
            && ((
                updated.songTag && updated.songTag.tagId === id
            ) || (
                updated.song
            ))) {
                loadSongs();
                setUpdated(true);
            }
		}
	},
	[updated]);



    // ---------- RETURN ----------

    return (
        <View style={styles.container}>
            {/*<StatusBar backgroundColor = 'rgb(255, 0, 0)' />*/}

            <Fade
                style={styles.header}
                visible={!scrollOnTop}
                property='elevation'
                initial={{ value: 0, time: 120 }}
                final={{ value: 2, time: 180 }}
            >
                <View style={styles.headerLeft}>
                    <AntDesignIcon
                        style={{ marginRight: 12 }}
                        name='folder1'
                        size={34}
                        color={color ? color : colors.primary}
                    />
                    <Text style={{
                        color: color ? color : colors.text,
                        fontSize: 24
                    }}>
                        { name }
                    </Text>
                </View>

                <View>
                    <Text style={{
                        color: color ? color : colors.text,
                        fontSize: 16
                    }}>
                        { songs.length }
                    </Text>
                </View>
            </Fade>

            <FlatList
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
        </View>
    );
}

export default TagScreen;



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
        paddingBottom: sizes.screenPadding,
        ...shadow,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },

    songs: {
        paddingHorizontal: sizes.screenPadding,
        paddingBottom: sizes.screenPadding,
    },
});