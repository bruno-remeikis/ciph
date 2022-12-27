import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { RouteProp } from '@react-navigation/core';

// RootStackParamList
import RootStackParamList from '../../../../AppRootStackParamList';

// Components
import GenericAppHeader from '../GenericAppHeader';

// Contexts
import { useSelectedItems } from '../../../contexts/SelectedItems';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import TagSongModal from '../../modals/TagSongModal';



export const SelectionHeaderLeft: React.FC = () =>
{
    const { selectedItems, setSelectedItems } = useSelectedItems();

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.deselectAllBtn}
                onPress={() => setSelectedItems(null)}
            >
                <FeatherIcon name='arrow-left' size={22} color='#ffffff' />
            </Pressable>

            <Text style={styles.amount}>{selectedItems?.length}</Text>
        </View>
    );
}

export const SelectionHeaderRight: React.FC = () =>
{
    // CONTEXTS

    const { selectedItems } = useSelectedItems();

    // STATES

    const [showAddTagBtn, setShowAddTagBtn] = useState(false);
    const [isTagSongModalVisible, setTagSongModalVisible] = useState(false);

    // EFFECTS

    useEffect(() =>
    {
        setShowAddTagBtn(() =>
        {
            if(selectedItems)
                for(var item of selectedItems)
                    if(item.type !== 'song')
                        return false;
            return true;
        });
    },
    [selectedItems]);

    // RETURN

    return (
        <View style={styles.container}>
            <TagSongModal
                visible={isTagSongModalVisible}
                setVisible={setTagSongModalVisible}
            />

            {showAddTagBtn ?
                <Pressable
                    style={styles.rightBtn}
                    onPress={() => setTagSongModalVisible(true)}
                >
                    <AntDesignIcon name='addfolder' size={26} color='#ffffff' />
                </Pressable> : null}

            {/*<Pressable
                style={styles.rightBtn}
                //onPress={() => setSelectedItems(null)}
            >
                <FeatherIcon name='trash-2' size={26} color='#ffffff' />
            </Pressable>*/}
        </View>
    )
}



// ---------- STYLES ----------

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deselectAllBtn: {
        marginRight: 16,
    },
    amount: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },

    rightBtn: {
        marginLeft: 16,
    }
});