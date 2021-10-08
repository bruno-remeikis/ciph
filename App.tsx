import React, { useEffect } from 'react';

import { useKeepAwake } from 'expo-keep-awake';

// RootStackParamList
import RootStackParamList from './AppRootStackParamList';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Contexts
import { UpdatedProvider } from './src/contexts/Updated';
import { MessageProvider } from './src/contexts/Message';

// Database
import Database from './src/database/Database';

// Utils
import { colors } from './src/utils/consts';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import NewSongScreen from './src/screens/NewSongScreen';
import SongScreen from './src/screens/SongScreen';
import ArtistScreen from './src/screens/ArtistScreen';

// Components: Headers
import HomeHeader from './src/components/app/HomeHeader';
import SongHeader from './src/components/app/SongHeader';
import ArtistHeader from './src/components/app/ArtistHeader';

// Components: Others
import Message from './src/components/app/Message';



// ---------- APP NAVIGATION ----------

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () =>
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

				{/* NEW SONG */}
				<Stack.Screen
					name="NewSong"
					component={NewSongScreen}
					options={{ title: 'Nova música' }}
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

				{/* SONG */}
				<Stack.Screen
					name="Artist"
					component={ArtistScreen}
					options={({ route, navigation }) => ({
						title: route.params.artist.name,
						headerRight: () =>
							<ArtistHeader
								route={route}
								navigation={navigation}
							/>
					})}
				/>
			</Stack.Navigator>
		</NavigationContainer>
  	);
}



// ---------- APP ----------

const App: React.FC = () =>
	<UpdatedProvider>
		<MessageProvider>
			<AppNavigator />
			<Message />
		</MessageProvider>
	</UpdatedProvider>

export default App;