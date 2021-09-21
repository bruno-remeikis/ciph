import React, { useEffect, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';

import EntypoIcon from 'react-native-vector-icons/Entypo';

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
import { colors } from './src/utils/colors';

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

	const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
	const [isConfirmModalVisible, setIsConfirmModalVisible] = useState<boolean>(false);
	


	// ---------- EFFECTS ----------

	useEffect(() => { Database.init() }, []);



	// ---------- RETURN ----------

	return (
		<>
			{/* MENÚ */}
			<Modal
				visible={isModalVisible}
				setVisible={setIsModalVisible}
			>
				<Pressable
					style={{ padding: 12 }}
					onPress={() =>
					{
						setIsModalVisible(false);
						setIsConfirmModalVisible(true);
					}}
				>
					<Text>Resetar dados</Text>
				</Pressable>
			</Modal>

			<ConfirmModal
                visible={isConfirmModalVisible}
                setVisible={setIsConfirmModalVisible}
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
								.finally(() => setIsConfirmModalVisible(false));
						}
                    },
                    { text: 'Cancelar' }
                ]}
            />

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
								<Pressable onPress={() => setIsModalVisible(true)}>
									<EntypoIcon name='dots-three-vertical' size={20} color='#ffffff' />
								</Pressable>
						})}
						initialParams={{ update: true }}
					/>

					{/* SONG */}
					<Stack.Screen
						name="Song"
						component={SongScreen}
						options={({ route }) => ({ title: route.params.song.name })}
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