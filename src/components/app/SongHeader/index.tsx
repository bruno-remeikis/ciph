import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/core';

import { format } from 'date-fns';

// RootStackParamList
import RootStackParamList from '../../../../AppRootStackParamList';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Styles
import styles from './styles';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Components
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

// Services
import SongService from '../../../services/SongService';

// Utils
import { colors, dateFormat } from '../../../utils/consts';
import GenericAppHeader from '../GenericAppHeader';

interface SongHeaderProps {
	route: RouteProp<RootStackParamList, "Song">;
	navigation: any;
}

const SongHeader: React.FC<SongHeaderProps> = ({ route, navigation }) =>
{
	const song = route.params.song;

	const { setUpdated } = useUpdated();

	const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState<boolean>(false);
	const [isInfoVisible, setIsInfoVisible] = useState<boolean>(false);

	function handleDelete()
    {
		setIsConfirmDeleteVisible(false);

        if(song.id !== undefined)
            SongService.delete(song.id)
            .then(() =>
            {
                setUpdated(true);
                navigation.pop(2); // <- Volta 2 telas
            })
            .catch(err => alert(err));
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
					onClick: () => navigation.navigate('NewSong', { song })
				},
				{
					icon: {
						component: FeatherIcon,
						name: 'info'
					},
					text: 'Sobre',
					onClick: () => setIsInfoVisible(true)
				},
				{
					icon: {
						component: FeatherIcon,
						name: 'x'
					},
					text: 'Deletar',
					color: colors.red,
					division: true,
					onClick: () => setIsConfirmDeleteVisible(true)
				}]}
			/>

			{/* Sobre */}
			<Modal
				visible={isInfoVisible}
				setVisible={setIsInfoVisible}
			>
				<View style={styles.aboutModal}>
					{song !== null && (
						song.insertDate !== undefined ||
						song.updateDate !== undefined
					) ? <>
						{song.insertDate !== undefined
						? <View>
							<Text style={styles.aboutTitle}>Criado</Text>
							<Text style={styles.aboutText}>
								{format(new Date(song.insertDate), dateFormat)}
							</Text>
						</View> : null}

						{song.updateDate !== undefined
						? <View style={{ marginTop: 6 }}>
							<Text style={styles.aboutTitle}>Editado</Text>
							<Text style={styles.aboutText}>{
								song.updateDate !== null
									? format(new Date(song.updateDate), dateFormat)
									: 'Nunca'
							}</Text>
						</View> : null}
					</>
					: <Text>Não há informações</Text>}
				</View>
			</Modal>

			{/* Confirmar delete */}
			<ConfirmModal
				visible={isConfirmDeleteVisible}
				setVisible={setIsConfirmDeleteVisible}
				text='Deseja mesmo excluir esta música?'
				buttons={[
					{
						text: 'Excluir',
						color: colors.red,
						onClick: handleDelete
					},
					{ text: 'Cancelar' }
				]}
			/>
		</>
	);
}

export default SongHeader;