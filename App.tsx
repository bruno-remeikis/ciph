import React, { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

import { useKeepAwake } from 'expo-keep-awake';

// RootStackParamList
import RootStackParamList from './AppRootStackParamList';

// React Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Contexts
import { UpdatedProvider } from './src/contexts/Updated';

// Database
import Database from './src/database/Database';

// Utils
import { colors } from './src/utils/consts';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import NewSongScreen from './src/screens/NewSongScreen';
import SongScreen from './src/screens/SongScreen';
import ArtistScreen from './src/screens/ArtistScreen';
import TagScreen from './src/screens/TagScreen';

// Headers
import HomeHeader from './src/components/app/HomeHeader';
import SongHeader from './src/components/app/SongHeader';
import ArtistHeader from './src/components/app/ArtistHeader';
import TagHeader from './src/components/app/TagHeader';
import { SelectionHeaderLeft, SelectionHeaderRight } from './src/components/app/SelectionHeader';

// Contexts
import { selectedItems, SelectedItemsProvider, useSelectedItems } from './src/contexts/SelectedItems';



// ---------- APP NAVIGATION ----------

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppContent: React.FC = () =>
{
	// Impedir que tela descanse
	useKeepAwake();



	// ---------- CONTEXTS ----------

	const { selectedItems, setSelectedItems } = useSelectedItems();



	// ---------- REFS ----------

	const selectedItemsRef = useRef(selectedItems);
	


	// ---------- EFFECTS ----------

	useEffect(() =>
	{
		// Inicia banco de dados
		Database.init();

		// Caso existam itens selecionados:
		// - Previne ação do botão 'voltar' do celular
		// - Desseleciona os itens
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () =>
		{
			if(selectedItemsRef.current != null)
			{
				setSelectedItems(null);
				return true;
			}
			
			return false;
		});
     	return () => backHandler.remove();
	},
	[]);

	useEffect(() =>
	{
		selectedItemsRef.current = selectedItems;
	},
	[selectedItems]);



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
					options={() => selectedItems == null ? {
						title: 'Ciphersonal',
						headerRight: () => <HomeHeader />
					} : {
						title: '',
						headerLeft: () => <SelectionHeaderLeft />,
						headerRight: () => <SelectionHeaderRight />
					}}
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

				{/* ARTIST */}
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

				{/* TAG */}
				<Stack.Screen
					name="Tag"
					component={TagScreen}
					options={({ route, navigation }) => ({
						title: route.params.tag.name,
						headerRight: () =>
							<TagHeader
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
		<SelectedItemsProvider>
			<AppContent />
		</SelectedItemsProvider>
	</UpdatedProvider>

export default App;