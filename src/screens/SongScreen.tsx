import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Switch, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// Models
import { Sheet } from '../models/Sheet';

// Services
import SheetService from '../services/SheetService';

// Utils
import { colors, opacities } from '../utils/consts';

// Components
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';

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

    const { id, name, artists } = route.params.song;



    // ---------- STATES ----------

    const [nameInfo, setNameInfo] = useState(name);
    const [artistsInfo, setArtistsInfo] = useState(
        artists && typeof artists === 'string' ? artists : ''
    );

    //const [modalVisible, setModalVisible] = useState(false);
    const [isRenameVisible, setIsRenameVisible] = useState<boolean>(false);
    const [isDeleteSheetVisible, setIsDeleteSheetVisible] = useState<boolean>(false);

    // ID da folha (sheet) a ser renomeada
    const [renamedSheet, setRenamedSheet] = useState<Sheet | null>(null);
    // Valor do novo título da folha (sheet) a ser renomeada
    const [newSheetTitle, setNewSheetTitle] = useState('');

    const [sheets, setSheets] = useState<Sheet[]>([]);
    // Folha (sheet) aberta no momento
    const [currentSheet, _setCurrentSheet] = useState<Sheet | null>();
    const [enableEdition, setEnableEdition] = useState(false);
    const [changed, _setChanged] = useState(false);
    //const [content, setContent] = useState('');



    // ---------- REFS ----------

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

            // Atualizar nome da folha:
            openModal(newSheet);
        })
        .catch(err => alert(err));
    }

    function openModal(sheet: Sheet)
    {
        setRenamedSheet(sheet);
        setNewSheetTitle(sheet.title);

        setIsRenameVisible(true);
    }

    function saveRenamedSheet()
    {
        setIsRenameVisible(false);

        if(renamedSheet && renamedSheet.id)
        {
            if(newSheetTitle.length > 0)
            {
                SheetService.updateTitle(renamedSheet?.id, newSheetTitle).then(res =>
                {
                    // Se um registro foi atualizado:
                    if(res)
                        // Atualiza ítem alterado na lista de folhas
                        setSheets(sheets.map(sheet =>
                        {
                            if(sheet.id === renamedSheet.id)
                                return { ...sheet, title: newSheetTitle };

                            return sheet;
                        }));
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
            SheetService.updateContent(id, content)
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
                        break;
                    }

                    newCurrentSheet = sheets[i];
                };

                setSheets(updSheets);
                setCurrentSheet(newCurrentSheet);
            }
        })
        .catch(err => alert(err))
        .finally(() => setIsDeleteSheetVisible(false));
    }



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
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
        SecureStore.getItemAsync('enable-edition').then(res =>
        {
            setEnableEdition(res === 'true' ? true : false);
        })
        .catch(err => alert(err));

        // Salvar pagina atual ao minimizar app
        AppState.addEventListener('change', saveSheetContent);
    },
    []);

    /**
     * Salva pagina atual ao clicar em voltar
     */
    useEffect(() =>
    {
        navigation.addListener('beforeRemove', saveSheetContent);
    },
    [navigation]);

    /**
	 * Carrega a música quando esta tela ganha foco e caso seja necessário
	 */
    useEffect(() =>
    {
        const unsubscribe = navigation.addListener('focus', () =>
        {
            if(typeof updated === 'object')
            {
                setNameInfo(updated.name);
                setArtistsInfo(
                    typeof updated.artists === 'string'
                        ? updated.artists
                        : ''
                );
                setUpdated(false);
            }

            /*SecureStore.getItemAsync('updated-song').then(res =>
            {
                if(res)
                {
                    const song = JSON.parse(res);
                    setNameInfo(song.name);
                    setArtistsInfo(song.artists);

                    SecureStore.deleteItemAsync('updated-song');
                }
            });*/
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    },
    [navigation]);



    // ---------- RETURN ----------

    return (
        <>
            <ConfirmModal
                visible={isDeleteSheetVisible}
                setVisible={setIsDeleteSheetVisible}
                text='Deseja mesmo excluir esta página?'
                buttons={[
                    {
                        text: 'Excluir',
                        color: colors.red,
                        onClick: handleDeleteSheet
                    },
                    { text: 'Cancelar' }
                ]}
            />

            <Modal
                visible={isRenameVisible}
                setVisible={setIsRenameVisible}
            >
                <View style={{ padding: 10 }}>
                    <TextInput
                        style={styles.modalInput}
                        value={newSheetTitle}
                        placeholder="Nome da página"
                        onChangeText={text => setNewSheetTitle(text)}
                        //autoFocus
                        selectTextOnFocus
                    />

                    <View style={styles.modalBtns}>
                        <View>
                            <Pressable
                                style={[styles.modalBtn, { alignSelf: 'flex-start' }]}
                                onPress={() =>
                                {
                                    setIsRenameVisible(false);
                                    setIsDeleteSheetVisible(true);
                                }}
                            >
                                <Text style={{ color: colors.red }}>Excluir</Text>
                            </Pressable>
                        </View>

                        <View style={styles.modalBtns}>
                            <Pressable
                                style={styles.modalBtn}
                                onPress={() => setIsRenameVisible(false)}
                            >
                                <Text>Cancelar</Text>
                            </Pressable>

                            <Pressable
                                style={styles.modalBtn}
                                onPress={saveRenamedSheet}
                            >
                                <Text style={styles.modalBtnContent}>Salvar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, padding: 12 }}>
                    <View style={styles.header}>
                        <Pressable
                            style={{ flex: 1, marginRight: 8 }}
                            onPress={() =>
                            {
                                if(enableEdition)
                                    navigation.navigate('NewSong', { song: {
                                        id,
                                        name: nameInfo
                                    } });
                            }}
                        >
                            <Text style={{ fontSize: 24 }}>{ nameInfo }</Text>
                            <Text style={{ fontSize: 16 }}>{ artistsInfo }</Text>
                        </Pressable>

                        <View>
                            <View style={{
                                alignItems: 'center',
                                backgroundColor: `rgba(${colors.primaryRGB}, 0.24)`,
                                paddingHorizontal: 4,
                                paddingVertical: 6,
                                borderRadius: 8,
                            }}>
                                <MaterialCommunityIcon
                                    name={enableEdition ? 'pencil' : 'pencil-off'}
                                    size={20}
                                    color='#000000'
                                />
                                
                                <Switch
                                    trackColor={{
                                        true: 'rgb(111, 184, 0)',
                                        false: 'rgba(0, 0, 0, 0.14)'
                                    }}
                                    thumbColor={colors.primary}
                                    onValueChange={v =>
                                    {
                                        setEnableEdition(v);
                                        SecureStore.setItemAsync('enable-edition', v ? 'true' : 'false');
                                    }}
                                    value={enableEdition}
                                />
                            </View>
                        </View>
                    </View>

                    <View>
                        <ScrollView
                            style={styles.tabs}
                            horizontal
                        >
                            {/* Abas */}
                            {sheets.map(sheet =>
                                <View
                                    key={sheet.id}
                                    style={{ flexDirection: 'column-reverse' }}
                                >
                                    <Pressable
                                        style={[styles.tab,
                                        {
                                            paddingBottom: currentSheet?.id === sheet.id
                                                ? tabVerticalPadding + 6
                                                : tabVerticalPadding
                                        }]}
                                        onPress={() =>
                                        {
                                            if(currentSheet?.id !== sheet.id)
                                            {
                                                saveSheetContent();
                                                setCurrentSheet(sheet);
                                            }
                                            else if(enableEdition)
                                                openModal(sheet);
                                        }}
                                    >
                                        <Text style={styles.tabContent}>{sheet.title}</Text>
                                    </Pressable>
                                </View>
                            )}

                            <View style={{ flexDirection: 'column-reverse' }}>
                                <Pressable
                                    style={[
                                        styles.tab,
                                        !enableEdition ? {
                                            opacity: opacities.disabled
                                        } : null
                                    ]}
                                    onPress={() =>
                                    {
                                        if(enableEdition)
                                            createSheet();
                                    }}
                                >
                                    <FeatherIcon
                                        style={styles.tabPlus}
                                        name='plus'
                                        size={14}
                                        color='#000000'
                                    />
                                    {/*<Text style={styles.tabContent}>+</Text>*/}
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.sheets}>
                        {sheets.length > 0
                            // Pagina com conteúdo atual:
                            ? <TextInput
                                style={styles.sheet}
                                multiline={true}
                                value={/*content*/ currentSheet?.content}
                                onChangeText={content =>
                                {
                                    /*setContent(text)*/
                                    if(currentSheet)
                                    {
                                        setCurrentSheet({ ...currentSheet, content });
                                        setChanged(true);
                                    }
                                }}
                                editable={enableEdition}
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
                                        {/*<Text style={{ fontSize: 22 }}>+</Text>*/}
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
    modalInput: {
        width: 240,
        marginBottom: 2,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 4,
    },
    modalBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalBtn: {
        padding: 6,
    },
    modalBtnContent: {
        color: colors.primary,
        //fontWeight: 'bold',
        fontSize: 16,
    },

    // HEADER
    header: {
        flexDirection: 'row',
        //alignItems: 'center',
        justifyContent: 'space-between',
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