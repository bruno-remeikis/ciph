import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native';

import SongService from '../services/SongService';
import { Song } from '../models/Song';

import { colors } from '../utils/colors';
import DatabaseInit from '../database/DatabaseInit';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
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
		.then((res: any) =>
		{
			setSongs(res._array);
		})
		.catch(err => alert(err))
		.finally(() => setSearching(false));
	}



	// ---------- EFFECTS ----------

	/**
	 * Carrega as músicas quando esta tela ganha foco e caso seja necessário
	 */
	useEffect(() =>
	{
		//This will run whenever params change
		const { params = {} } = route;
		
	   	//your logic here
		if(params.update)
			searchSongs(search);
   	},
	[route]);

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
			<ScrollView style={styles.scrollView}>
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
							<Text style={styles.searchClearBtnText}>X</Text>
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
								<Text>
									{/*song.artists.map((artist, i) =>
									{
										const diff = song.artists.length - i;
										var after = '';

										if(diff > 1)
											after = ' & ';
										else if(diff === 1)
											after = ', ';

										return artist.name + after;
									})*/
									
									song.artist}
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</ScrollView>

			<Pressable
				style={styles.deleteAllBtn}
				onPress={() =>
				{
					DatabaseInit.recreate()
						.then(() => searchSongs(''))
						.catch(err => alert(err));
				}}
			>
				<Text style={styles.deleteBtnContent}>X</Text>
			</Pressable>

			<Pressable
				style={styles.newBtn}
				onPress={() => navigation.navigate('NewSong')}
			>
				<Text style={styles.newBtnContent}>+</Text>
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
		width: 30,
		height: '100%',
		marginRight: 6,
		fontSize: 6,
	},
	searchClearBtnText: {
		flex: 1,
		textAlignVertical: 'center',
		fontSize: 12,
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
	newBtnContent: {
		color: 'white',
		fontSize: 40
	},

	deleteAllBtn: {
		position: 'absolute',
		bottom: 18,
		left: 18,

		justifyContent: 'space-around',
		alignItems: 'center',

		backgroundColor: colors.primary,

		width: 60,
		height: 60,
		borderRadius: 999
	},
	deleteBtnContent: {
		color: 'white',
		fontSize: 26
	}
});