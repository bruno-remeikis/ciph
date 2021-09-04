import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import MusicService from '../services/MusicService';
import { music } from '../models/music';

import { colors } from '../utils/colors';

export const Home: React.FC<any> = ({ navigation, route }) =>
{
	// STATES

	const [search, setSearch] = useState('');
	const [searching, setSearching] = useState(false);
	const [musics, setMusics] = useState<music[]>([]);



	// FUNCTIONS

	function deleteAll()
	{
		MusicService.deleteAll()
		.then(() => setMusics([]))
		.catch(err => alert(err));
	}

	function searchMusics(text: string)
	{
		setSearching(true);
		setSearch(text);

		MusicService.find(text)
		.then((res: any) =>
		{
			setMusics(res._array);
			setSearching(false);
		})
		.catch(err => alert(err));
	}

	function getStatusText(): string
	{
		if(searching)
			return 'Pesquisando ...';

		if(musics.length === 0)
		{
			if(search.length !== 0)
				return 'Nenhum resultado.';
			return 'Você ainda não tem nenhuma música.';
		}

		if(search.length !== 0)
			return 'Resultados';
		return 'Todas';
	}



	// EFFECTS

	/**
	 * Busca as músicas ao carregar ou voltar nesta tela
	 */
	useEffect(() =>
	{
		// return to unsubscribe
		return navigation.addListener('focus', () =>
		{
			searchMusics(search);
		});
	},
	[navigation]);

	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.mainContent}>
					<TextInput
						style={styles.search}
						placeholder="Pesquisar"
						value={search}
						onChangeText={text => searchMusics(text)}
					/>

					<View>
						<View style={styles.searchStatus}>
							<Text>{getStatusText()}</Text>
						</View>

						{musics.map(music =>
							<Pressable
								key={music.id}
								style={styles.music}
								onPress={() => navigation.navigate('Music', { music })}
							>
								<Text style={{ fontSize: 20 }}>{music.name}</Text>
								<Text>
									{/*music.artists.map((artist, i) =>
									{
										const diff = music.artists.length - i;
										var after = '';

										if(diff > 1)
											after = ' & ';
										else if(diff === 1)
											after = ', ';

										return artist.name + after;
									})*/
									
									music.artist}
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			</ScrollView>

			<Pressable
				style={styles.deleteAllBtn}
				onPress={deleteAll}
			>
				<Text style={styles.deleteBtnContent}>X</Text>
			</Pressable>

			<Pressable
				style={styles.newBtn}
				onPress={() => navigation.navigate('NewMusic')}
			>
				<Text style={styles.newBtnContent}>+</Text>
			</Pressable>
		</View>
  	);
}

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
		paddingHorizontal: 18,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 999,
	},
	searchStatus: {
		width: '100%',
		height: 30,
		alignItems: 'center',
		justifyContent: 'space-around'
	},

	// MUSIC
	music: {
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