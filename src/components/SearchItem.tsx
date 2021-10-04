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
            style={styles.container}
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
            <View style={styles.content}>
                <IonIcon
                    style={styles.icon}
                    name={searchItem.type === 'song' ? 'musical-notes' : 'person'}
                    size={30}
                    color={colors.primary}
                />

                <View style={styles.info}>
                    <Text style={styles.name}>{searchItem.name}</Text>

                    {searchItem.type === 'song' &&
                     searchItem.artists &&
                     typeof searchItem.artists === 'string'
                    ? <Text style={styles.artists}>{searchItem.artists}</Text>
                    : null}
                </View>
            </View>
        </Pressable>
    );
}

export default SearchItem;



const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',

		backgroundColor: colors.background2,

		width: '100%',
		minHeight: 46,
        paddingVertical: 3,
        paddingRight: 6,
		marginBottom: 8,

		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
		borderRadius: 4,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	icon: {
		marginLeft: 10,
		marginRight: 12,
	},

    info: {
        flexShrink: 1,
    },
	name: {
		fontSize: 20,
	},
	artists: {
		color: 'rgba(0, 0, 0, 0.7)',
	},
});