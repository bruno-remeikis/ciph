import { RouteProp } from '@react-navigation/core';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

// RootStackParamList
import RootStackParamList from '../../../../AppRootStackParamList';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Styles
import styles from './styles';

// Components
import GenericAppHeader from '../GenericAppHeader';
import Modal from '../../Modal';
import ArtistService from '../../../services/ArtistService';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

interface ArtistHeaderProps {
    route: RouteProp<RootStackParamList, "Artist">;
    navigation: any;
}

const ArtistHeader: React.FC<ArtistHeaderProps> = ({ route, navigation }) =>
{
    const artist = route.params.artist;

    const { setUpdated } = useUpdated();

    const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
    const [name, setName] = useState(artist.name);

    function handleRenameArtist()
    {
        if(artist.id)
            ArtistService.updateName(artist.id, name)
                .then(() =>
                {
                    artist.name = name;
                    setUpdated({ artist });
                    navigation.navigate('Artist', { artist });
                })
                .catch(err => alert(err))
                .finally(() => setIsEditModalVisible(false))
    }

    return (
        <>
            <GenericAppHeader
                menuItems={
                [{
                    icon: {
                        component: FeatherIcon,
                        name: 'edit-2',
                    },
                    text: 'Editar',
                    onClick: () => setIsEditModalVisible(true),
                }]}
            />

            {/* Editar (mudar nome) */}
            <Modal
                visible={isEditModalVisible}
                setVisible={setIsEditModalVisible}
                style={styles.editModal}
            >
                <Text style={styles.editModalLabel}>Nome</Text>
                <TextInput
                    style={styles.editModalInput}
                    value={name}
                    placeholder="Nome do artista"
                    onChangeText={text => setName(text)}
                    selectTextOnFocus
                />

                <View style={styles.editModalBtns}>
                    <Pressable
                        style={styles.editModalBtn}
                        onPress={handleRenameArtist}
                    >
                        <Text style={styles.editModalBtnContent}>Salvar</Text>
                    </Pressable>

                    <Pressable
                        style={styles.editModalBtn}
                        onPress={() => setIsEditModalVisible(false)}
                    >
                        <Text>Cancelar</Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    );
}

export default ArtistHeader;