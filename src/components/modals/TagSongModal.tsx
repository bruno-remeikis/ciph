import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { StyleSheet, FlatList, Pressable, Text, View } from 'react-native';

// Components
import Modal, { ModalProps } from './Modal';
import NewTagModal from './NewTagModal';
import Button from '../Button';

// Services
import TagService from '../../services/TagService';

// Models
import { Tag } from '../../models/entities/Tag';

// Contexts
import { useUpdated } from '../../contexts/Updated';
import { useSelectedItems } from '../../contexts/SelectedItems';
import { colors } from '../../utils/consts';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import SongTagService from '../../services/SongTagService';
import { Song } from '../../models/entities/Song';
import { hexToRGB } from '../../utils/functions';



interface SelectableTag extends Tag {
    selected: boolean;
};

interface TagSongModalProps extends ModalProps {
    setReturnObject?: Dispatch<SetStateAction<Tag[]>>;
    songId?: number; // Caso undefined, utiliza o context SelectedItems
}

const TagSongModal: React.FC<TagSongModalProps> = ({ setReturnObject, songId, ...props }) =>
{
    // ---------- CONTEXTS ----------
    
    const { setUpdated } = useUpdated();
    const { selectedItems, setSelectedItems } = useSelectedItems();


    
    // ---------- STATES ----------

    const [tags, setTags] = useState<SelectableTag[]>([]);

    const [isNewTagModalVisible, setNewTagModalVisible] = useState<boolean>(false);
    const [returnedTag, setReturnedTag] = useState<Tag | null>(null);



    // ---------- FUNCTIONS ----------

    function addTagsToSongs()
    {
        if(!tags || (songId === undefined && !selectedItems))
            return;

        var songIds;
        if(songId)
            songIds = songId;
        else if(selectedItems)
            songIds = selectedItems.map(song => song.id);
        else
            return;

        const tagIds: number[] = [];

        for(const tag of tags)
            if(tag.selected && tag.id)
                tagIds.push(tag.id);

        SongTagService.create(songIds, tagIds).then(() =>
        {
            if(setReturnObject)
                setReturnObject(tags.filter(tag => tag.selected));

            setUpdated(true);
            setSelectedItems(null);

            props.setVisible(false);
        })
        .catch(err => alert(err));
    }



    // ---------- EFFECTS ----------

    // Atualiza tags quando modal é chamado
    useEffect(() =>
    {
        if(props.visible)
        {
            /*if(songId)
                TagService.findNotAdded(songId)
                    .then((res: any) => setTags(res._array))
                    .catch(err => alert(err));
            else*/
                TagService.find()
                    .then((res: any) => setTags(res._array))
                    .catch(err => alert(err));
        }
    },
    [props.visible]);

    // Adiciona tag recém inserida à lista
    useEffect(() =>
    {
        if(!isNewTagModalVisible && returnedTag)
        {
            setTags([...tags, { ...returnedTag, selected: true }]);
            setReturnedTag(null);
        }
    },
    [isNewTagModalVisible]);



    // ---------- RETURN ----------

    return (
        <>
            <NewTagModal
				visible={isNewTagModalVisible}
				setVisible={setNewTagModalVisible}
                setReturnObject={setReturnedTag}
			/>

            <Modal
                {...props}
                style={styles.container}
                //onHide={() => }
            >
                <Text style={styles.title}>Adicionar a Repertórios</Text>

                {tags.length === 0 ?
                    <View style={styles.noTag}>
                        <Text style={styles.noTagText}>Ainda não há repertórios</Text>
                    </View>
                    : null}

                <FlatList
                    /*style={{
                        width: '100%',
                        marginTop: headerHeight,
                        opacity: !showLoading ? 1 : 0,
                    }}*/
                    //contentContainerStyle={styles.results}
                    data={tags}
                    keyExtractor={item => `${item.id}`}
                    renderItem={({ item }) =>
                    (
                        <View style={styles.tagContainer}>
                            <Pressable
                                style={[styles.tag, { backgroundColor: item.color ? String(hexToRGB(item.color, 0.08)) : `rgba(${colors.primaryRGB}, 0.08)` }, item.selected ? {
                                    borderColor: item.color ? item.color : colors.primary,
                                    borderWidth: 1,
                                } : {
                                    borderColor: item.color ? String(hexToRGB(item.color, 0.4)) : `rgba(${colors.primaryRGB}, 0.4)`
                                }]}
                                onPress={() => {
                                    setTags(tags.map(tag =>
                                    {
                                        if(tag.id === item.id)
                                            return { ...tag, selected: !tag.selected };

                                        return tag;
                                    }));
                                }}
                            >
                                <Text style={styles.tagName}>{item.name}</Text>

                                <View style={styles.rightBox}>
                                    <Text style={styles.amount}>{ item.amount }</Text>
                                    <FeatherIcon
                                        name={item.selected ? 'check-square' : 'square'}
                                        size={20}
                                        color={item.selected ? 'rgb(0, 0, 255)' : '#000000'}
                                    />
                                </View>
                            </Pressable>
                        </View>
                    )}
                    // Tempo (ms) de atualização do evento de scroll:
                    scrollEventThrottle={16}
                    // Permitir que usuário interaja com os ítens
                    // mesmo que o teclado esteja aberto:
                    keyboardShouldPersistTaps='handled'
                />

                <Pressable
                    style={styles.newTag}
                    onPress={() => setNewTagModalVisible(true)}
                >
                    <FeatherIcon name='plus' size={20} />
                    <Text style={styles.newTagText}>Novo repertório</Text>
                </Pressable>

                <View style={styles.btns}>
                    <Button
                        style={styles.btn}
                        text='Adicionar'
                        backgroundColor={colors.primary}
                        onClick={addTagsToSongs}
                    />
                    <Button
                        style={styles.btn}
                        text='Cancelar'
                    />
                </View>
            </Modal>
        </>
    );
}

export default TagSongModal;



const styles = StyleSheet.create({
    container: {
        //alignItems: 'center',
        width: '84%',
        //maxHeight: 300,
        maxHeight: '80%',
        padding: 18,
    },
    title: {
        fontSize: 22,
        marginBottom: 8,
        textAlign: 'center',
    },
    noTag: {
        alignItems: 'center',
    },
    noTagText: {
        backgroundColor: '#dddddd',
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginVertical: 10,
        borderRadius: 99,
    },
    tagContainer: {
        justifyContent: 'space-around',
        height: 42,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        //backgroundColor: colors.background2,
        paddingHorizontal: 10,
        paddingVertical: 6,
        //marginTop: 4,
        borderRadius: 2,
        borderLeftWidth: 4,
        //borderLeftColor: `rgba(${colors.primaryRGB}, 0.4)`,
    },
    tagName: {
        fontSize: 18,
    },

    rightBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amount: {
        marginRight: 10,
    },

    newTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
        paddingVertical: 8,
    },
    /*newTagFirst: {
        flexDirection: 'column-reverse',
        //backgroundColor: 'red',
    },*/
    newTagText: {
        fontSize: 18,
        marginLeft: 4,
    },

    
    btns: {
        flexDirection: 'row-reverse',
        marginTop: 8,
    },
    btn: {
        marginLeft: 4,
    },
});