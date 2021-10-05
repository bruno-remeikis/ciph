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
import InputModal from '../../InputModal';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Services
import ArtistService from '../../../services/ArtistService';



interface ArtistHeaderProps {
    route: RouteProp<RootStackParamList, "Artist">;
    navigation: any;
}

const ArtistHeader: React.FC<ArtistHeaderProps> = ({ route, navigation }) =>
{
    const artist = route.params.artist;

    const { setUpdated } = useUpdated();

    const [isRenameModalVisible, setIsRenameModalVisible] = useState<boolean>(false);
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
                .finally(() => setIsRenameModalVisible(false))
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
                    text: 'Renomear',
                    onClick: () => setIsRenameModalVisible(true),
                }]}
            />

            {/* Renomear artista */}
            <InputModal
                visible={isRenameModalVisible}
                setVisible={setIsRenameModalVisible}
                value={name}
                setValue={setName}
                onSubmit={handleRenameArtist}
            />
        </>
    );
}

export default ArtistHeader;