import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Services
import SongService from '../services/SongService';

// Models
import { Song } from '../models/Song';

// Utils
import { colors } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
	// ---------- CONTEXTS ----------

	const { updated, setUpdated } = useUpdated();

	

	// ---------- STATES ----------

	const [search, setSearch] = useState<string>('');
	const [searching, setSearching] = useState<boolean>(false);
	const [songs, setSongs] = useState<Song[]>([]);
	const [statusText, setStatusText] = useState<string>('');



	// ---------- FUNCTIONS ----------

	function searchSongs(text: string)
	{
		setSearching(true);
		setSearch(text);

		SongService.find(text)
			.then((res: any) => setSongs(res._array))
			.catch(err => alert(err))
			.finally(() => setSearching(false));
	}



	// ---------- EFFECTS ----------

	/**
	 * Carrega músicas ao abrir app
	 */
	useEffect(() => searchSongs(""), []);

	/**
	 * Atualiza músicas
	 */
	useEffect(() =>
	{
		if(updated)
		{
			searchSongs(search);

			// Se não for boolean, será setado como false em SongScreen
			if(typeof updated === 'boolean')
				setUpdated(false);
		}
	},
	[updated]);

	/**
	 * Atualiza mensagem de status
	 */
	useEffect(() => setStatusText((): string =>
	{
		if(searching)
			return 'Pesquisando ...';

		if(songs.length === 0)
		{
			if(search.length !== 0)
				return 'Nenhum resultado.';
			return 'Você ainda não tem nenhuma música.';
		}

		if(search.length !== 0)
			return 'Resultados';
		return 'Todas';
	}),
	[searching, songs]);



	// ---------- RETURN ----------

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				keyboardShouldPersistTaps='handled'
			>
				<View style={styles.mainContent}>
					<View style={styles.search}>
						<TextInput
							style={styles.searchInput}
							placeholder="Pesquisar"
							value={search}
							onChangeText={text => searchSongs(text)}
						/>
						<Pressable
							style={styles.searchClearBtn}
							onPress={() =>
							{
								setSearch('');
								searchSongs('');
							}}
						>
							<FeatherIcon name='x' size={16} color='#000000' />
						</Pressable>
					</View>

					<View>
						<View style={styles.searchStatus}>
							<Text>{statusText}</Text>
						</View>

						{songs.map(song =>
							<Pressable
								key={song.id}
								style={styles.song}
								onPress={() => navigation.navigate('Song', { song })}
							>
								<Text style={{ fontSize: 20 }}>{song.name}</Text>
								<Text>{ song.artists && typeof song.artists === 'string'
									? song.artists
									: ''
								}</Text>
							</Pressable>
						)}
					</View>
				</View>
			</ScrollView>

			<Pressable
				style={styles.newBtn}
				onPress={() => navigation.navigate('NewSong')}
			>
				<FeatherIcon name='plus' size={30} color='#ffff' />
			</Pressable>
		</View>
  	);
}

export default HomeScreen;



// ---------- STYLES ----------

const styles = StyleSheet.create({
	// CONTAINER
	container: {
		flex: 1,
		backgroundColor: colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},

	scrollView: {
		width: '100%',
	},
	mainContent: {
		padding: 18,
	},

	// SEARCH
	search: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		
		borderWidth: 1,
		borderColor: colors.inputBorder,
		borderRadius: 999,
	},
	searchInput: {
		flex: 1,
		
		paddingHorizontal: 18,
		paddingVertical: 4,
	},
	searchClearBtn: {
		alignItems: 'center',
		marginRight: 12,
		fontSize: 6,
	},
	searchStatus: {
		width: '100%',
		height: 30,
		alignItems: 'center',
		justifyContent: 'space-around'
	},

	// Song
	song: {
		backgroundColor: colors.background2,

		width: '100%',
		paddingHorizontal: 10,
		paddingVertical: 4,
		marginBottom: 8,

		borderLeftWidth: 4,
		borderLeftColor: colors.primary,
		borderRadius: 4,
		//elevation: 0.8,
	},

	// NEW BUTTON
	newBtn: {
		position: 'absolute',
		bottom: 18,
		right: 18,

		justifyContent: 'space-around',
		alignItems: 'center',

		backgroundColor: colors.primary,

		width: 60,
		height: 60,
		borderRadius: 999
	},
});