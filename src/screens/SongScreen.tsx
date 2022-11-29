import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Switch, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';

// Models
import { Artist } from '../models/entities/Artist';
import { Sheet } from '../models/entities/Sheet';

// Services
import ArtistService from '../services/ArtistService';
import SheetService from '../services/SheetService';

// Utils
import { colors, opacities, sizes } from '../utils/consts';

// Components
import DialogModal from '../components/DialogModal';
import MenuModal from '../components/MenuModal';
import InputModal from '../components/InputModal';

// Contexts
import { useUpdated } from '../contexts/Updated';



// Consts

const tabVerticalPadding = 2;



// Screen

const SongScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONTEXTS ----------

    const { updated, setUpdated } = useUpdated();

    // ---------- CONSTS ----------

    const { id, name } = route.params.song;



    // ---------- STATES ----------

    const [nameInfo, setNameInfo] = useState(name);
    const [artists, setArtists] = useState<Artist[]>([]);

    const [isSheetMenuVisible, setIsSheetMenuVisible] = useState<boolean>(false);
    const [isRenameSheetVisible, setIsRenameSheetVisible] = useState<boolean>(false);
    const [isDeleteSheetVisible, setIsDeleteSheetVisible] = useState<boolean>(false);

    // Valor do novo título da folha (sheet) a ser renomeada
    const [newSheetTitle, setNewSheetTitle] = useState('');

    const [sheets, _setSheets] = useState<Sheet[]>([]);
    // Folha (sheet) aberta no momento
    const [currentSheet, _setCurrentSheet] = useState<Sheet | null>();
    const [editable, setEditable] = useState(false);
    const [changed, _setChanged] = useState(false);



    // ---------- REFS ----------

    const sheetsRef = useRef(sheets);
    const setSheets = (newValue: Sheet[]) =>
    {
        sheetsRef.current = newValue;
        _setSheets(newValue);
    }

    const currentSheetRef = useRef(currentSheet);
    const setCurrentSheet = (newValue: Sheet | null) =>
    {
        currentSheetRef.current = newValue;
        _setCurrentSheet(newValue);
    }

    const changedRef = useRef(changed);
    const setChanged = (newValue: boolean) =>
    {
        changedRef.current = newValue;
        _setChanged(newValue);
    }



    // ---------- FUNCTIONS ----------

    function createSheet()
    {
        saveSheetContent();

        const newSheet: Sheet = {
            songId: id,
            title: 'Nova página',
            content: ''
        };

        SheetService.create(newSheet).then((res: any) =>
        {
            newSheet.id = res;
            setSheets([...sheets, newSheet]);
            setCurrentSheet(newSheet);

            showIsRenameSheetVisible(newSheet.title);
        })
        .catch(err => alert(err));
    }

    function saveRenamedSheet()
    {
        setIsRenameSheetVisible(false);

        const title = newSheetTitle.trim();

        if(currentSheet && currentSheet.id)
        {
            if(title.length > 0)
            {
                SheetService.updateTitle(currentSheet.id, title).then(res =>
                {
                    // Se um registro foi atualizado:
                    if(res > 0)
                    {
                        // Atualiza ítem alterado na lista de folhas
                        setSheets(sheets.map(sheet =>
                            sheet.id === currentSheet.id
                                ? { ...sheet, title }
                                : sheet
                        ));

                        if(currentSheet)
                            setCurrentSheet({ ...currentSheet, title });
                    }
                    else
                        alert('ERRO\nNão foi possível atualizar o título da página');
                })
                .catch(err => alert(err));
            }
        }
        else
            alert('ERRO\nNão foi possível atualizar o título da página');
    }

    function saveSheetContent()
    {
        if(!currentSheetRef.current
        || !changedRef.current)
            return;

        setChanged(false);

        const { id, content } = currentSheetRef.current;

        if(id)
            SheetService.updateContent(id, content).then(() =>
            {
                // Atualiza conteúdo (necessário caso o usuário
                // tenha clicado em outra aba. Sem isso, o conteúdo
                // da aba atualizada se mantia ao voltar nela)
                setSheets(sheetsRef.current.map(s =>
                    s.id === id
                        ? { ...s, content }
                        : s
                ));
            })
            .catch(err => alert(err));
    }

    function handleDeleteSheet()
    {
        if(!currentSheet || currentSheet.id === undefined)
            return;

        SheetService.delete(currentSheet.id).then(res =>
        {
            if(res !== 0)
            {
                const updSheets: Sheet[] = [...sheets];
                let newCurrentSheet = null;

                for(let i = 0; i < sheets.length; i++)
                {
                    if(sheets[i].id === currentSheet.id)
                    {
                        updSheets.splice(i, 1);

                        if(sheets.length > 0)
                            newCurrentSheet = sheets[i > 0 ? i - 1 : i];

                        break;
                    }
                };

                setSheets(updSheets);
                setCurrentSheet(newCurrentSheet);
            }
        })
        .catch(err => alert(err))
        .finally(() => setIsDeleteSheetVisible(false));
    }

    function loadArtists()
    {
        ArtistService.findBySongId(id).then((res: any) =>
        {
            setArtists(res._array);
        })
        .catch(err => alert(err));
    }

    function switchEditable(v: boolean)
    {
        setEditable(v);
        SecureStore.setItemAsync('editable', v ? 'true' : 'false');
    }

    /**
     * Clona a página atual, alterando ou adicionando um índex
     * ao final do nome desta nova página a ser adicionada
     * 
     * Ex.:
     * - Página original: "Letra"
     * - Nova página: "Letra (1)"
     */
    function handleCloneSheet(): void
    {
        saveSheetContent();

        if(!currentSheet)
            return;

        /**
         * Verifica se vTitle possui indexação
         * Ex.:
         * - "Letra (1)" = true
         * - "Letra (a)" = false
         * - "Letra"     = false
         */
        function haveIndex(title: string): { title: string, number: number } | null
        {
            // Se possuir parêntesis fechado:
            if(title.length >= 3
            && title.charAt(title.length - 1) === ')')
            {
                const openParenthesis = title.indexOf('(');
    
                // Se possuir parêntesis aberto:
                if(openParenthesis !== undefined)
                {
                    const number = parseInt(title.substring(
                        openParenthesis + 1,
                        title.length - 1
                    ));
    
                    // Se entre os parêntesis existir um número:
                    return number !== NaN
                        ? {
                            title: title.substring(0, openParenthesis).trim(),
                            number
                        }
                        : null;
                }
            }

            return null;
        }

        // Trata título
        let title = currentSheet.title.trim();

        // Pega título raiz (sem o index, caso exista)
        const originHaveIndex = haveIndex(title);
        let rootTitle: string = originHaveIndex !== null
            ? originHaveIndex.title
            : title;

        // Busca o maior índex entre as páginas com mesmo título raiz
        let majorIndex: number = -1;
        sheets.forEach(sheet =>
        {
            const sheetHaveIndex = haveIndex(sheet.title.trim());

            if(sheetHaveIndex !== null
            && sheetHaveIndex.title === rootTitle
            && sheetHaveIndex.number > majorIndex)
            {
                majorIndex = sheetHaveIndex.number;
            }
            else if(sheet.title.trim() === rootTitle)
            {
                majorIndex = 0;
            }
        });

        // Adiciona índex ao título
        title = `${rootTitle} (${majorIndex + 1})`;

        const newSheet: Sheet = {
            songId: id,
            title,
            content: currentSheet.content,
        };

        SheetService.create(newSheet).then((res: any) =>
        {
            newSheet.id = res;

            // Adicionar nova página à direita da orígem do clone
            const updSheets: Sheet[] = [];
            sheets.forEach(sheet =>
            {
                updSheets.push(sheet);

                if(sheet.id === currentSheet.id)
                    updSheets.push(newSheet);
            });
            setSheets(updSheets);

            setCurrentSheet(newSheet);
        })
        .catch(err => alert(err));
    }

    function showIsRenameSheetVisible(title?: string)
    {
        if(title)
            setNewSheetTitle(title);
        else if(currentSheet)
            setNewSheetTitle(currentSheet.title);

        setIsRenameSheetVisible(true);
    }


    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        // Busca artistas
        loadArtists();

        // Busca páginas ao carregar tela
        SheetService.findBySongId(id).then((res: any) =>
        {
            setSheets(res._array);

            setCurrentSheet(res._array.length > 0
                ? res._array[0]
                : null
            );
        })
        .catch(err => alert(err));

        // Setar estado 'enableEdition' de acordo com o storage
        SecureStore.getItemAsync('editable').then(res =>
        {
            setEditable(res === 'true' ? true : false);
        })
        .catch(err => alert(err));

        // Salvar pagina atual ao minimizar app
        AppState.addEventListener('change', saveSheetContent);
    },
    []);

    // Resolvido com onBlur do TextInput:
    /**
     * Salva pagina atual ao clicar em voltar
     */
    /*useEffect(() =>
    {
        //navigation.addListener('beforeRemove', saveSheetContent);
    },
    [navigation]);*/

    /**
     * Atualiza dados da música
     */
    useEffect(() =>
    {
        if(typeof updated === 'object'
        && updated.song)
        {
            setNameInfo(updated.song.name);
            loadArtists();

            if(!updated.artist)
                setUpdated(false);
        }
    },
    [updated]);



    // ---------- RETURN ----------

    return (
        <>
            {/* SHEET MENÚ */}
            <MenuModal
                visible={isSheetMenuVisible}
                setVisible={setIsSheetMenuVisible}
                items={
                [{
                    icon: {
                        component: FeatherIcon,
                        name: 'edit-2'
                    },
                    text: 'Renomear',
                    onClick: showIsRenameSheetVisible
                },
                {
                    icon: {
                        component: FeatherIcon,
                        name: 'copy'
                    },
                    text: 'Clonar',
                    onClick: handleCloneSheet
                },
                {
                    icon: {
                        component: FeatherIcon,
                        name: 'x'
                    },
                    text: 'Excluir',
                    color: colors.red,
                    division: true,
                    onClick: () => setIsDeleteSheetVisible(true)
                }]}
            />

            {/* RENAME SHEET */}
            <InputModal
                visible={isRenameSheetVisible}
                setVisible={setIsRenameSheetVisible}
                value={newSheetTitle}
                setValue={setNewSheetTitle}
                onSubmit={saveRenamedSheet}
            />

            {/* DELETE SHEET DIALOG */}
			<DialogModal
				visible={isDeleteSheetVisible}
				setVisible={setIsDeleteSheetVisible}
				title='Tem certeza?'
				text='Esta página será deletada permanentemente'
				buttons={
                [{
                    text: 'Sim, deletar!',
                    color: colors.red,
                    onClick: handleDeleteSheet
                },
                {
                    text: 'Cancelar',
                }]}
			/>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <IonIcon
                                style={{ marginRight: 12 }}
                                name={'musical-notes'}
                                size={34}
                                color={colors.primary}
                            />

                            <View style={styles.headerInfo}>
                                <Text style={{ fontSize: 24 }}>{ nameInfo }</Text>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {artists.map((artist, i) =>
                                        <Pressable
                                            key={artist.id}
                                            onPress={() => {
                                                navigation.popToTop(); // Previne que estado desta tela seja resgatado ao tentar acessar outra música
                                                navigation.navigate('Artist', { artist });
                                            }}
                                        >
                                            <Text style={{ fontSize: 16 }}>
                                                {`${artist.name}${i !== artists.length - 1 ? ', ' : ''}`}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                                
                            </View>
                        </View>

                        <View>
                            <Pressable
                                style={styles.switchBox}
                                onPress={() => switchEditable(!editable)}
                            >
                                <MaterialCommunityIcon
                                    name={editable ? 'pencil' : 'pencil-off'}
                                    size={20}
                                    color='#000000'
                                />
                                
                                <Switch
                                    trackColor={{
                                        true: 'rgb(111, 184, 0)',
                                        false: 'rgba(0, 0, 0, 0.14)'
                                    }}
                                    thumbColor={colors.primary}
                                    onValueChange={switchEditable}
                                    value={editable}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Abas */}
                    <View>
                        <ScrollView
                            style={styles.tabs}
                            horizontal
                            keyboardShouldPersistTaps='handled'
                        >
                            {sheets.map(sheet =>
                                <View
                                    key={sheet.id}
                                    style={{ flexDirection: 'column-reverse' }}
                                >
                                    <Pressable
                                        style={[
                                            styles.tab,
                                            {
                                                paddingBottom: currentSheet?.id === sheet.id
                                                    ? tabVerticalPadding + 6
                                                    : tabVerticalPadding
                                            }
                                        ]}
                                        onPress={() =>
                                        {
                                            saveSheetContent();

                                            if(currentSheet?.id !== sheet.id)
                                                setCurrentSheet(sheet);
                                            else if(editable)
                                            {
                                                //setRenamedSheet(sheet);
                                                //setNewSheetTitle(sheet.title);
                                                setIsSheetMenuVisible(true);
                                            }
                                        }}
                                    >
                                        <Text style={styles.tabContent}>{sheet.title}</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* Nova aba */}
                            <View style={{ flexDirection: 'column-reverse' }}>
                                <Pressable
                                    style={[
                                        styles.tab,
                                        !editable ? {
                                            opacity: opacities.disabled
                                        } : null
                                    ]}
                                    onPress={() =>
                                    {
                                        if(editable)
                                            createSheet();
                                    }}
                                >
                                    <FeatherIcon
                                        style={styles.tabPlus}
                                        name='plus'
                                        size={14}
                                        color='#000000'
                                    />
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>

                    {/* SHEET (Página) */}
                    <View style={styles.sheets}>
                        {sheets.length > 0
                            // Pagina com conteúdo atual:
                            ? <TextInput
                                style={styles.sheet}
                                multiline={true}
                                value={currentSheet?.content}
                                onChangeText={content =>
                                {
                                    if(currentSheet)
                                    {
                                        setCurrentSheet({ ...currentSheet, content });
                                        setChanged(true);
                                    }
                                }}
                                onBlur={() => saveSheetContent()}
                                editable={editable}
                            />
                            // Caso não hajam paginas ainda:
                            : <View style={[styles.sheet, styles.emptySheet]}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16 }}>Nova página</Text>
                                    <Pressable
                                        style={styles.newSheetBtn}
                                        onPress={createSheet}
                                    >
                                        <FeatherIcon name='plus' size={18} color='#000000' />
                                    </Pressable>
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

export default SongScreen;

const styles = StyleSheet.create({
    // CONTAINER
    container: {
        flex: 1,
        padding: sizes.screenPadding,
    },

    // HEADER
    header: {
        flexDirection: 'row',
        //alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
        marginRight: 8,
    },
    switchBox: {
        alignItems: 'center',
        backgroundColor: `rgba(${colors.primaryRGB}, 0.24)`,
        paddingHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 8,
    },

    // SHEET
    tabs: {
        marginTop: 8,
    },
    tab: {
        backgroundColor: colors.primary,
        
        marginRight: 2,
        paddingHorizontal: 10,
        paddingVertical: tabVerticalPadding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tabContent: {
        color: 'black',
        fontSize: 18,
    },
    tabPlus: {
        marginVertical: 4.4,
    },
    sheets: {
        flex: 1,
    },
    sheet: {
        flex: 1,
        backgroundColor: 'white',
        color: 'black',

        width: '100%',
        minHeight: 240,
        paddingHorizontal: 12,
        paddingVertical: 6,

        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',

        textAlignVertical: 'top',
    },
    emptySheet: {
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'transparent',
    },
    newSheetBtn: {
        alignItems: 'center',
        justifyContent: 'space-around',

        backgroundColor: colors.primary,

        width: 50,
        height: 50,
        marginTop: 8,
        borderRadius: 999,
    }
});