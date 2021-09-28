import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import IonIcon from 'react-native-vector-icons/Ionicons';

// Services
import SearchService, { filterValue } from '../services/SearchService';

// Models
import { Song } from '../models/entities/Song';
import { Artist } from '../models/entities/Artist';
import { Search } from '../models/bo/Search';

// Utils
import { colors } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';
import SearchItem from '../components/SearchItem';

const HomeScreen: React.FC<any> = ({ navigation, route }) =>
{
	const filters: { label: string, value: filterValue }[] =
	[
		{ label: 'Tudo',    value: 'all' },
		{ label: 'Músicas',  value: 'songs' },
		{ label: 'Artistas', value: 'artists' },
	];

	// ---------- CONTEXTS ----------

	const { updated, setUpdated } = useUpdated();

	

	// ---------- STATES ----------

	const [search, setSearch] = useState<string>('');
	const [searching, setSearching] = useState<boolean>(false);
	const [results, setResults] = useState<Search[]>([]);
	const [statusText, setStatusText] = useState<string>('');

	const [filter, setFilter] = useState<filterValue>('all');



	// ---------- FUNCTIONS ----------

	function handleSearch(text: string, filter: filterValue)
	{
		setSearching(true);
		setSearch(text);

		SearchService.find(text, filter)
			.then((res: any) => setResults(res._array))
			.catch(err => alert(err))
			.finally(() => setSearching(false));
	}

	/*function searchSongs(text: string)
	{
		setSearching(true);
		setSearch(text);

		if(filter === 'songs')
			SongService.find(text)
				.then((res: any) => setResults(res._array))
				.catch(err => alert(err))
				.finally(() => setSearching(false));
	}*/



	// ---------- EFFECTS ----------

	/**
	 * Carrega músicas ao abrir app
	 */
	useEffect(() => handleSearch('', filter), []);

	/**
	 * Atualiza músicas
	 */
	useEffect(() =>
	{
		if(updated)
		{
			//searchSongs(search);
			handleSearch(search, filter);

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

		if(results.length === 0)
		{
			if(search.length !== 0)
				return 'Nenhum resultado.';
			return 'Você ainda não tem nenhuma música.';
		}

		if(search.length !== 0)
			return 'Resultados';
		return 'Todas';
	}),
	[searching, results]);



	// ---------- RETURN ----------

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				keyboardShouldPersistTaps='handled'
			>
				<View style={styles.mainContent}>
					<View style={styles.filter}>
						{filters.map((item, i) =>
							<Pressable
								key={i}
								style={[
									styles.filterItem,
									filter === item.value
										? styles.selectedFilterItem
										: null
								]}
								onPress={() =>
								{
									handleSearch(search, item.value);
									setFilter(item.value);
								}}
							>
								<Text
									style={filter === item.value
										? styles.selectedFilterItemText
										: styles.filterItemText
									}
								>{ item.label }</Text>
							</Pressable>
						)}
					</View>

					<View style={styles.search}>
						<TextInput
							style={styles.searchInput}
							placeholder="Pesquisar"
							value={search}
							onChangeText={text => handleSearch(text, filter)}
						/>
						<Pressable
							style={styles.searchClearBtn}
							onPress={() =>
							{
								setSearch('');
								//searchSongs('');
								handleSearch('', filter);
							}}
						>
							<FeatherIcon name='x' size={16} color='#000000' />
						</Pressable>
					</View>

					<View>
						<View style={styles.searchStatus}>
							<Text>{statusText}</Text>
						</View>

						{results.map((item: Search) =>
							<SearchItem
								key={`${item.type}-${item.id}`}
								navigation={navigation}
								searchItem={item}
							/>
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

	// FILTER
	filter: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	filterItem: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		marginRight: 4,
		borderWidth: 1,
		borderColor: colors.inputBorder,
		borderRadius: 999,
	},
	selectedFilterItem: {
		backgroundColor: colors.primary, //colors.background2,
		borderColor: colors.primary,
	},
	filterItemText: {
		color: colors.text,
	},
	selectedFilterItemText: {
		color: 'white',
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