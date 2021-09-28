import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';

// Models
import { Search } from '../models/bo/Search';
import { Artist } from '../models/entities/Artist';
import { Song } from '../models/entities/Song';

// Utils
import { colors } from '../utils/consts';

interface SearchItemProps {
    navigation: any;
    searchItem: Search;
};

const SearchItem: React.FC<SearchItemProps> = ({ navigation, searchItem }) =>
{
    return (
        <Pressable
            style={styles.item}
            onPress={() =>
            {
                if(searchItem.type === 'song')
                {
                    const song: Song = {
                        id: searchItem.id,
                        name: searchItem.name,
                        artists: searchItem.artists,
                        insertDate: searchItem.insertDate,
                        updateDate: searchItem.updateDate,
                    };

                    navigation.navigate('Song', { song });
                }
                else
                {
                    const artist: Artist ={
                        id: searchItem.id,
                        name: searchItem.name,
                        insertDate: searchItem.insertDate,
                        updateDate: searchItem.updateDate,
                    };

                    navigation.navigate('Artist', { artist });
                }
            }}
        >
            <View style={styles.itemContent}>
                <IonIcon
                    style={styles.itemIcon}
                    name={searchItem.type === 'song' ? 'musical-notes' : 'person'}
                    size={30}
                    color={colors.primary}
                />

                <View>
                    <Text style={styles.itemName}>{searchItem.name}</Text>

                    {searchItem.type === 'song' &&
                     searchItem.artists &&
                     typeof searchItem.artists === 'string'
                    ? <Text style={styles.itemArtists}>{searchItem.artists}</Text>
                    : null}
                </View>
            </View>
        </Pressable>
    );
}

export default SearchItem;



const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',

		backgroundColor: colors.background2,

		width: '100%',
		height: 52,
		marginBottom: 8,

		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
		borderRadius: 4,
	},
	itemContent: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	itemIcon: {
		marginLeft: 10,
		marginRight: 12,
	},
	itemName: {
		fontSize: 20
	},
	itemArtists: {
		color: 'rgba(0, 0, 0, 0.7)',
	},
});