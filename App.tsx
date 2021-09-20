import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useKeepAwake } from 'expo-keep-awake';

import Database from './src/database/Database';

import { Song } from './src/models/Song';

import { colors } from './src/utils/colors';

import HomeScreen from './src/screens/HomeScreen';
import SongScreen from './src/screens/SongScreen';
import NewSongScreen from './src/screens/NewSongScreen';

type RootStackParamList = {
	Home: { update?: boolean } | undefined;
	Song: { song: Song };
	NewSong: { song: Song } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App()
{
	// Impedir que tela descanse
	useKeepAwake();

	// Criar banco de dados
	Database.init();

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
					options={{ title: 'Ciphersonal' }}
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
  	);
}