import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Icons
import IonIcon from 'react-native-vector-icons/Ionicons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

// Models
import { Search } from '../models/bo/Search';
import { Artist } from '../models/entities/Artist';
import { Song } from '../models/entities/Song';
import { Tag } from '../models/entities/Tag';


// Utils
import { colors } from '../utils/consts';

//Contexts
import { useSelectedItems, addSelectedItem, removeSelectedItem } from '../contexts/SelectedItems';



interface SearchItemProps {
    navigation: any;
    searchItem: Search;
    selectable?: boolean;
};

const SearchItem: React.FC<SearchItemProps> = ({ navigation, searchItem, selectable }) =>
{
    var iconName = '';
    var mainColor = colors.primary;
    switch(searchItem.type)
    {
        case 'song':
            iconName = 'musical-notes';
            break;
        case 'artist':
            iconName = 'person';
            break;
        case 'tag':
            iconName = 'folder1'; //'disc'; //'bookmark';
            if(searchItem.color)
                mainColor = searchItem.color;
            break;
    }



    // ---------- CONTEXTS ----------

    const selectedItemsCtx = useSelectedItems();
    const { selectedItems } = selectedItemsCtx;



    // ---------- STATES ----------

    const [isSelected, setIsSelected] = useState(false);



    // ---------- FUNCTIONS ----------

    function select()
    {
        if(!isSelected)
        {
            addSelectedItem(selectedItemsCtx, searchItem);
            setIsSelected(true);
        }
        else
        {
            removeSelectedItem(selectedItemsCtx, searchItem);
            setIsSelected(false);
        }
    }



    //---------- EFFECTS ----------

    useEffect(() =>
    {
        if(selectedItems == null)
            setIsSelected(false);
    },
    [selectedItems]);



    // ---------- RETURN ----------

    return (
        <View style={styles.main}>
            <Pressable
                style={[
                    styles.container,
                    { borderLeftColor: mainColor },
                    //isSelected ? { backgroundColor: 'white' } : null
                ]}
                onLongPress={() =>
                {
                    if(selectable)
                        select();
                }}
                onPress={() =>
                {
                    if(selectable && selectedItems != null)
                    {
                        select();
                    }
                    else
                    {
                        switch(searchItem.type)
                        {
                            case 'song':
                                const song: Song = {
                                    id: searchItem.id,
                                    name: searchItem.name,
                                    artists: searchItem.artists,
                                    insertDate: searchItem.insertDate,
                                    updateDate: searchItem.updateDate,
                                };
                                navigation.navigate('Song', { song });
                                break;
                            
                            case 'artist':
                                const artist: Artist ={
                                    id: searchItem.id,
                                    name: searchItem.name,
                                    insertDate: searchItem.insertDate,
                                    updateDate: searchItem.updateDate,
                                };
                                navigation.navigate('Artist', { artist });
                                break;

                            case 'tag':
                                const tag: Tag ={
                                    id: searchItem.id,
                                    name: searchItem.name,
                                    color: searchItem.color,
                                    amount: searchItem.amount,
                                    insertDate: searchItem.insertDate,
                                    updateDate: searchItem.updateDate,
                                };
                                navigation.navigate('Tag', { tag });
                                break;
                        }
                    }
                }}
            >
                <View style={styles.content}>
                    <View style={styles.leftContent}>
                        {searchItem.type === 'tag' ?
                            <AntDesignIcon
                                style={styles.icon}
                                name={iconName}
                                size={30}
                                color={mainColor}
                            /> :
                            <IonIcon
                                style={styles.icon}
                                name={iconName}
                                size={30}
                                color={mainColor}
                            />}

                        <View style={styles.info}>
                            <Text style={styles.name}>{searchItem.name}</Text>

                            {searchItem.type === 'song' &&
                            searchItem.artists &&
                            typeof searchItem.artists === 'string'
                                ? <Text style={styles.artists}>{searchItem.artists}</Text>
                                : null}
                        </View>
                    </View>

                    <View style={styles.rightContent}>
                        {searchItem.amount ?
                            <Text>{searchItem.amount}</Text>
                            : null}

                        {searchItem.position ?
                            <Text style={styles.position}>{searchItem.position}</Text>
                            : null}
                    </View>
                </View>

                { isSelected ? <View style={styles.selected} /> : null }
            </Pressable>
        </View>
    );
}

export default SearchItem;



const styles = StyleSheet.create({
    main: {
        flexDirection: 'row',
		alignItems: 'center',
    },
	container: {
        flex: 1,
		flexDirection: 'row',
		alignItems: 'center',

		backgroundColor: colors.background2,

		//width: '100%',
		minHeight: 46,
        paddingVertical: 3,
        paddingRight: 6,
		marginTop:/*Bottom:*/ 8,

		borderLeftWidth: 4,
		borderRadius: 4,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
        justifyContent: 'space-between',
	},
    leftContent: {
        flex: 1,
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

    rightContent: {
        marginRight: 6,
    },
    position: {
        color: colors.primary,
        marginRight: 6,
        fontSize: 14,
        fontWeight: 'bold',
    },

    selected: {
        position: 'absolute',
        zIndex: 999,
        top: -4,
        left: -100,
        bottom: -4,
        right: -100,

        backgroundColor: colors.primary,
        opacity: 0.25,
    },
});