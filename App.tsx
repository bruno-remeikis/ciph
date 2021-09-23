import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';
import { format } from 'date-fns';

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

	// ---------- CONTEXTS ----------

	const { setUpdated } = useUpdated();



	// ---------- STATES ----------

	// HomeScreen
	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);
	// SongScreen
	const [isInfoVisible, setIsInfoVisible] = useState<boolean>(false);
	const [songInfo, setSongInfo] = useState<Song | null>(null);
	


	// ---------- EFFECTS ----------

	useEffect(() => { Database.init() }, []);



	// ---------- RETURN ----------

	return (
		<>
			{/* HomeScreen */}
			<Modal
				visible={isMenuVisible}
				setVisible={setIsMenuVisible}
			>
				<Pressable
					style={{ padding: 12 }}
					onPress={() =>
					{
						setIsMenuVisible(false);
						setIsConfirmResetVisible(true);
					}}
				>
					<Text>Resetar dados</Text>
				</Pressable>
			</Modal>
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



			{/* SongScreen */}
			<Modal
				visible={isInfoVisible}
				setVisible={setIsInfoVisible}
			>
				<View style={{ padding: 12 }}>
					{songInfo !== null && (
						songInfo.insertDate !== undefined ||
						songInfo.updateDate !== undefined
					) ? <>
						{songInfo.insertDate !== undefined
						? <>
							<Text style={{ fontWeight: 'bold' }}>Criado</Text>
							<Text>
								{format(songInfo.insertDate, dateFormat)}
							</Text>
						</> : null}

						{songInfo.updateDate !== undefined
						? <>
							<Text style={{ fontWeight: 'bold' }}>Editado</Text>
							<Text>{
								songInfo.updateDate !== null
									? format(songInfo.updateDate, dateFormat)
									: 'Nunca'
							}</Text>
						</> : null}
					</>
					: <Text>Não há informações</Text>}
				</View>
			</Modal>



			{/* Navigation */}
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
							headerRight: () =>
								<Pressable onPress={() => setIsMenuVisible(true)}>
									<EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
								</Pressable>
						})}
						initialParams={{ update: true }}
					/>

					{/* SONG */}
					<Stack.Screen
						name="Song"
						component={SongScreen}
						options={({ route }) => ({
							title: route.params.song.name,
							headerRight: () =>
								<Pressable onPress={() =>
								{
									setSongInfo(route.params.song);
									setIsInfoVisible(true);
								}}>
									<FeatherIcon name='info' size={24} color='#ffffff' />
								</Pressable>
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
		</>
  	);
}

const App: React.FC = () =>
	<UpdatedProvider>
		<AppContent />
	</UpdatedProvider>

export default App;