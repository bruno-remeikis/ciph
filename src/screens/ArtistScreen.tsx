import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, FlatList } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import SearchItem from '../components/SearchItem';

// Models
import { Song } from '../models/entities/Song';

// Services
import SongService from '../services/SongService';

// Utils
import { colors } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
    const { id, name } = route.params.artist;

    const { updated, setUpdated } = useUpdated();

    const [songs, setSongs] = useState<Song[]>([]);
    const [nameInfo, setNameInfo] = useState(name);



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        SongService.findByArtistId(id)
            .then((res: any) => setSongs(res._array))
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
        <View style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IonIcon
                    style={{ marginRight: 12 }}
                    name={'person'}
                    size={34}
                    color={colors.primary}
                />
                <Text style={{ fontSize: 24 }}>{nameInfo}</Text>
            </View>

            <FlatList
				style={styles.songs}
				data={songs}
				keyExtractor={item => `${item.id}`}
				renderItem={({ item }) =>
				(
					<SearchItem
						navigation={navigation}
						searchItem={{
                            type: 'song',
                            id: item.id ? item.id : 0,
                            name: item.name,
                            artists: item.artists,
                            insertDate: item.insertDate,
                            updateDate: item.updateDate,
                        }}
					/>
				)}
				// Permitir que usuário interaja com os ítens
				// mesmo que o teclado esteja aberto:
				keyboardShouldPersistTaps='handled'
			/>
        </View>
    );
}

export default HomeScreen;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    songs: {
        marginTop: 8,
    },
});