import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator, Animated, Easing, ViewProps, StyleProp, ViewStyle, FlatList } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';

// Services
import SearchService, { filterValue } from '../services/SearchService';

// Models
import { Search } from '../models/bo/Search';

// Utils
import { colors } from '../utils/consts';

// Contexts
import { useUpdated } from '../contexts/Updated';
import SearchItem from '../components/SearchItem';

interface FadeProps {
	style?: StyleProp<ViewStyle>;
	visible: boolean;
}

const Fade: React.FC<FadeProps> = ({ children, style, visible }) =>
{
	// Initial value for opacity: 0
	const fadeAnim = useRef(new Animated.Value(0)).current;

	function fade()
	{
		Animated.timing(fadeAnim, {
			toValue: visible ? 1 : 0,
			duration: 200,
			useNativeDriver: false,
		}) .start();
	}

	useEffect(() => fade(), [visible]);

	return (
		<Animated.View // Special animatable View
			style={[
				style,
				{ opacity: fadeAnim } // Bind opacity to animated value
			]}
		>
			{children}
		</Animated.View>
	);
}

const HomeScreen: React.FC<any> = ({ navigation }) =>
{
	const filters: { label: string, value: filterValue }[] =
	[
		{ label: 'Tudo',    value: 'all' },
		{ label: 'Músicas',  value: 'songs' },
		{ label: 'Artistas', value: 'artists' },
	];

	// ---------- CONTEXTS ----------

	const { updated, setUpdated } = useUpdated();



	// ---------- REFS ----------

	const resultsRef = useRef<FlatList | null>(null);

	

	// ---------- STATES ----------

	const [headerHeight, setHeaderHeight] = useState(0);

	const [search, setSearch] = useState<string>('');
	const [results, setResults] = useState<Search[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const [filter, setFilter] = useState<filterValue>('all');

	const [showNavBtn, setShowNavBtn] = useState<boolean>(false);



	// ---------- FUNCTIONS ----------

	function handleSearch(text: string, filter: filterValue)
	{
		setLoading(true);
		setSearch(text);

		SearchService.find(text, filter)
			.then((res: any) => setResults(res._array))
			.catch(err => alert(err))
			.finally(() => setLoading(false));
	}



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



	// ---------- RETURN ----------

	return (
		<View style={styles.container}>
			<View style={styles.loadContainer}>
				<ActivityIndicator
					style={styles.loadIcon}
					animating={loading}
					color={colors.primary}
					size={50}
				/>
			</View>

			<View
				style={styles.header}
				onLayout={(event) => setHeaderHeight(
					event.nativeEvent.layout.height
				)}
			>
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
							handleSearch('', filter);
						}}
					>
						<FeatherIcon name='x' size={16} color='#000000' />
					</Pressable>
				</View>

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
			</View>

			<FlatList
				ref={resultsRef}
				style={[
					styles.results,
					styles.content,
					{
						marginTop: headerHeight,
						opacity: !loading ? 1 : 0,
					}
				]}
				data={results}
				keyExtractor={item => `${item.type}-${item.id}`}
				renderItem={({ item }) =>
				(
					<SearchItem
						key={`${item.type}-${item.id}`}
						navigation={navigation}
						searchItem={item}
					/>
				)}
				onScroll={event => setShowNavBtn(
					event.nativeEvent.contentOffset.y !== 0
				)}
				// Tempo (ms) de atualização do evento de scroll:
				scrollEventThrottle={16}
				// Permitir que usuário interaja com os ítens
				// mesmo que o teclado esteja aberto:
				keyboardShouldPersistTaps='handled'
			/>

			<View style={styles.btns}>
				<Fade visible={showNavBtn}>
					<Pressable
						style={styles.goTopBtn}
						onPress={() =>
						{
							if(resultsRef.current)
								resultsRef.current.scrollToIndex({
									index: 0,
									animated: true,
								});
						}}
					>
						<EntypoIcon name='chevron-thin-up' size={16} color={colors.text} />
					</Pressable>
				</Fade>

				<Pressable
					style={styles.newBtn}
					onPress={() => navigation.navigate('NewSong')}
				>
					<FeatherIcon name='plus' size={30} color='#ffff' />
				</Pressable>
			</View>
		</View>
  	);
}

export default HomeScreen;



// ---------- STYLES ----------

const paddingArround = 18;

const styles = StyleSheet.create({
	// CONTAINER
	container: {
		flex: 1,
		backgroundColor: colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		padding: paddingArround,
		paddingTop: 0,
	},

	// HEADER
	header: {
		position: 'absolute',
		top: 0,
		zIndex: 1,
		backgroundColor: colors.background,
		width: '100%',
		padding: paddingArround,
		paddingBottom: 8,
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

	// FILTER
	filter: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
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
		backgroundColor: colors.primary,
		borderColor: colors.primary,
	},
	filterItemText: {
		color: colors.text,
	},
	selectedFilterItemText: {
		color: 'white',
	},

	// LOAD ICON
	loadContainer: {
		position: 'absolute',
		zIndex: 1,
	},
	loadIcon: {
		alignSelf: 'center',
	},

	// RESULTS
	results: {
		width: '100%',
	},

	// BUTTONS
	btns: {
		position: 'absolute',
		bottom: 18,
		right: 18,
		alignItems: 'center',
	},
	goTopBtn: {
		justifyContent: 'space-around',
		alignItems: 'center',

		backgroundColor: '#DEDEDE',

		width: 40,
		height: 40,
		marginBottom: 8,
		borderRadius: 999,
	},
	newBtn: {
		justifyContent: 'space-around',
		alignItems: 'center',

		backgroundColor: colors.primary,

		width: 60,
		height: 60,
		borderRadius: 999,
	},
});