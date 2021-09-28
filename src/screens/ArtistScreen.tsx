import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import SearchItem from '../components/SearchItem';

// Models
import { Song } from '../models/entities/Song';

// Services
import SongService from '../services/SongService';

// Utils
import { colors } from '../utils/consts';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ----------

    const { id, name } = route.params.artist;



    // ---------- STATES ----------

    const [songs, setSongs] = useState<Song[]>([]);



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        SongService.findByArtistId(id)
            .then((res: any) => setSongs(res._array))
            .catch(err => alert(err));
    },
    []);



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
                <Text style={{ fontSize: 24 }}>{name}</Text>
            </View>

            <View style={styles.songs}>
                {songs.map(song =>
                    <SearchItem
                        key={song.id}
                        navigation={navigation}
                        searchItem={{
                            type: 'song',
                            id: song.id ? song.id : 0,
                            name: song.name,
                            artists: song.artists,
                            insertDate: song.insertDate,
                            updateDate: song.updateDate,
                        }}
                    />
                )}
            </View>
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