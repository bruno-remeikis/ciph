import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RouteProp } from '@react-navigation/core';

import { format } from 'date-fns';

// RootStackParamList
import RootStackParamList from '../../../../AppRootStackParamList';

// Icons
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Styles
import modalStyles from '../../../styles/modals';
import styles from './styles';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Components
import Modal from '../../../components/Modal';
import ConfirmModal from '../../../components/ConfirmModal';

// Services
import SongService from '../../../services/SongService';

// Utils
import { colors, dateFormat, sizes } from '../../../utils/consts';

interface SongHeaderProps {
	route: RouteProp<RootStackParamList, "Song">;
	navigation: any;
}

const SongHeader: React.FC<SongHeaderProps> = ({ route, navigation }) =>
{
	const song = route.params.song;

	const { setUpdated } = useUpdated();

	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
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
			<Pressable
				style={modalStyles.menuBtn}
				onPress={() => setIsMenuVisible(true)}
			>
				<EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
			</Pressable>

			{/* Menú */}
			<Modal
				style={modalStyles.menuContainer}
				visible={isMenuVisible}
				setVisible={setIsMenuVisible}
			>
				{/* Editar */}
				<Pressable
					style={modalStyles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						navigation.navigate('NewSong', { song });
					}}
				>
					<FeatherIcon name='edit-2' size={sizes.headerIcon} color={colors.text} />
					<Text style={modalStyles.menuItemContent}>Editar</Text>
				</Pressable>

				{/* Sobre */}
				<Pressable
					style={modalStyles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						setIsInfoVisible(true);
					}}
				>
					<FeatherIcon name='info' size={sizes.headerIcon} color={colors.text} />
					<Text style={modalStyles.menuItemContent}>Sobre</Text>
				</Pressable>

				{/* Deletar */}
				<Pressable
					style={[ modalStyles.menuItem, modalStyles.menuItemDelete ]}
					onPress={() => setIsConfirmDeleteVisible(true)}
				>
					<FeatherIcon name='x' size={sizes.headerIcon} color={colors.red} />
					<Text style={[modalStyles.menuItemContent, { color: colors.red }]}>Deletar</Text>
				</Pressable>
			</Modal>

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