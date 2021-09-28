import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useKeepAwake } from 'expo-keep-awake';
import { format } from 'date-fns';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/core';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Icons
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Contexts
import { UpdatedProvider, useUpdated } from './src/contexts/Updated';

// Components
import Modal from './src/components/Modal';
import ConfirmModal from './src/components/ConfirmModal';

// Database
import Database from './src/database/Database';

// Models
import { Song } from './src/models/Song';

// Utils
import { colors, dateFormat } from './src/utils/consts';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SongScreen from './src/screens/SongScreen';
import NewSongScreen from './src/screens/NewSongScreen';
import SongService from './src/services/SongService';

const menuIconSize = 24;



// ---------- HOME SCREEN HEADER ----------

const HomeHeader: React.FC = () =>
{
	const { setUpdated } = useUpdated();

	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);

	return (
		<>
			<Pressable
				style={styles.menuBtn}
				onPress={() => setIsMenuVisible(true)}
			>
				<EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
			</Pressable>

			{/* Menú */}
			<Modal
				style={styles.menuContainer}
				visible={isMenuVisible}
				setVisible={setIsMenuVisible}
			>
				<Pressable
					style={styles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						setIsConfirmResetVisible(true);
					}}
				>
					<FeatherIcon name='trash-2' size={menuIconSize} color={colors.red} />
					<Text style={[styles.menuItemContent, {color: colors.red}]}>Resetar dados</Text>
				</Pressable>
			</Modal>

			{/* Confirmar reset */}
			<ConfirmModal
                visible={isConfirmResetVisible}
                setVisible={setIsConfirmResetVisible}
                text='Deseja mesmo resetar todos os dados?'
                buttons={[
                    {
                        text: 'Excluir',
                        color: colors.red,
                        onClick: () =>
						{
							Database.recreate()
								.then(() => setUpdated(true)) // <- Atualiza HomeScreen
								.catch(err => alert(err))
								.finally(() => setIsConfirmResetVisible(false));
						}
                    },
                    { text: 'Cancelar' }
                ]}
            />
		</>
	);
}



// ---------- SONG SCREEN HEADER ----------

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
				style={styles.menuBtn}
				onPress={() => setIsMenuVisible(true)}
			>
				<EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
			</Pressable>

			{/* Menú */}
			<Modal
				style={styles.menuContainer}
				visible={isMenuVisible}
				setVisible={setIsMenuVisible}
			>
				{/* Editar */}
				<Pressable
					style={styles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						navigation.navigate('NewSong', { song });
					}}
				>
					<FeatherIcon name='edit-2' size={menuIconSize} color={colors.text} />
					<Text style={styles.menuItemContent}>Editar</Text>
				</Pressable>

				{/* Sobre */}
				<Pressable
					style={styles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						setIsInfoVisible(true);
					}}
				>
					<FeatherIcon name='info' size={menuIconSize} color={colors.text} />
					<Text style={styles.menuItemContent}>Sobre</Text>
				</Pressable>

				{/* Deletar */}
				<Pressable
					style={[ styles.menuItem, styles.menuItemDelete ]}
					onPress={() => setIsConfirmDeleteVisible(true)}
				>
					<FeatherIcon name='x' size={menuIconSize} color={colors.red} />
					<Text style={[styles.menuItemContent, { color: colors.red }]}>Deletar</Text>
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



// ---------- APP NAVIGATION ----------

type RootStackParamList = {
	Home: { update?: boolean } | undefined;
	Song: { song: Song };
	NewSong: { song: Song } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = () =>
{
	// Impedir que tela descanse
	useKeepAwake();
	


	// ---------- EFFECTS ----------

	useEffect(() => { Database.init() }, []);



	// ---------- RETURN ----------

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerStyle: {
						backgroundColor: colors.primary,
					},
					headerTintColor: '#fff',
					headerTitleStyle: {
						fontWeight: 'bold',
					},
				}}
			>
				{/* HOME */}
				<Stack.Screen
					name="Home"
					component={HomeScreen}
					options={() => ({
						title: 'Ciphersonal',
						headerRight: () => <HomeHeader />
					})}
					initialParams={{ update: true }}
				/>

				{/* SONG */}
				<Stack.Screen
					name="Song"
					component={SongScreen}
					options={({ route, navigation }) => ({
						title: route.params.song.name,
						headerRight: () =>
							<SongHeader
								route={route}
								navigation={navigation}
							/>
					})}
				/>

				{/* NEW SONG */}
				<Stack.Screen
					name="NewSong"
					component={NewSongScreen}
					options={{ title: 'Nova música' }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
  	);
}



// ---------- APP ----------

const App: React.FC = () =>
	<UpdatedProvider>
		<AppContent />
	</UpdatedProvider>

export default App;



// ---------- STYLES ----------

const styles = StyleSheet.create({
	menuBtn: {
		padding: 10,
	},
	menuContainer: {
		minWidth: 170,
		padding: 9,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 9,
	},
	menuItemDelete: {
		marginTop: 9,
		borderTopWidth: 1,
		borderTopColor: colors.inputBorder,
	},
	menuItemContent: {
		marginLeft: 12,
		fontSize: 20,
	},

	aboutModal: {
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	aboutTitle: {
		fontSize: 20,
	},
	aboutText: {
		fontSize: 16,
	}
});