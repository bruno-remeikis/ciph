import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DatabaseInit from './src/database/DatabaseInit';

import { Music } from './src/models/Music';

import { colors } from './src/utils/colors';

import { HomeScreen } from './src/screens/HomeScreen';
import { MusicScreen } from './src/screens/MusicScreen';
import { NewMusicScreen } from './src/screens/NewMusicScreen';

type RootStackParamList = {
	Home: { update?: boolean } | undefined;
	Music: { music: Music };
	NewMusic: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App()
{
	new DatabaseInit;

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

				{/* MUSIC */}
				<Stack.Screen
					name="Music"
					component={MusicScreen}
					//options={{ title: 'Music' }}
					options={({ route }) => ({ title: route.params.music.name })}
				/>

				{/* NEW MUSIC */}
				<Stack.Screen
					name="NewMusic"
					component={NewMusicScreen}
					//options={{ title: 'Music' }}
					options={{ title: 'Nova música' }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
  	);
}