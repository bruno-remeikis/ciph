import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DatabaseInit from './src/database/DatabaseInit';

import { music } from './src/models/music';

import { colors } from './src/utils/colors';

import { Home } from './src/screens/Home';
import { Music } from './src/screens/Music';
import { NewMusic } from './src/screens/NewMusic';

type RootStackParamList = {
	Home: undefined;
	Music: { music: music };
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
					component={Home}
					options={{ title: 'Ciphersonal' }}
				/>

				{/* MUSIC */}
				<Stack.Screen
					name="Music"
					component={Music}
					//options={{ title: 'Music' }}
					options={({ route }) => ({ title: route.params.music.name })}
				/>

				{/* NEW MUSIC */}
				<Stack.Screen
					name="NewMusic"
					component={NewMusic}
					//options={{ title: 'Music' }}
					options={{ title: 'Nova música' }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
  	);
}