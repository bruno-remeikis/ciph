import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Modal, Switch, AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { Sheet } from '../models/Sheet';

import SheetService from '../services/SheetService';
import { colors } from '../utils/colors';



// ---------- CONSTS ----------

const tabVerticalPadding = 2;



// ---------- INTERFACES ----------

interface SheetCompProps
{
    sheet: Sheet;
    sheets: Sheet[];
    setSheets: Function;
    setChanged: Function;
    currentSheet: Sheet | undefined;
    enableEdition: boolean;
}



// ---------- COMPONENTS ----------

const SheetComp: React.FC<SheetCompProps> = ({ sheet, sheets, setSheets, setChanged, currentSheet, enableEdition }) =>
{
    function setContent(text: string)
    {
        sheet.content = text;
        setSheets(sheets.map((s: Sheet) =>
            s.id === sheet.id ? sheet : s
        ));
        setChanged(true);
    }

    return (
        <TextInput
            style={[
                styles.sheet,
                { display: currentSheet?.id === sheet.id ? 'flex' : 'none' }
            ]}
            multiline={true}
            value={sheet.content}
            onChangeText={setContent}
            editable={enableEdition}
            
        />
    );
}

export const MusicScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ---------- //

    const { id, name, artist } = route.params.music;



    // ---------- STATES ----------

    const [modalVisible, setModalVisible] = useState(false);
    // Guarda se a View interna (conteúdo) do Modal foi tocada
    const [touchIn, setTouchIn] = useState(false);
    // ID da folha (sheet) a ser renomeada
    const [renamedSheet, setRenamedSheet] = useState<Sheet | null>(null);
    // Valor do novo título da folha (sheet) a ser renomeada
    const [newSheetTitle, setNewSheetTitle] = useState('');

    const [sheets, setSheets] = useState<Sheet[]>([]);
    // Folha (sheet) aberta no momento
    const [currentSheet, _setCurrentSheet] = useState<Sheet>();
    const [enableEdition, setEnableEdition] = useState(false);
    const [changed, _setChanged] = useState(false);



    // ---------- REFS ----------

    const currentSheetRef = useRef(currentSheet);
    const setCurrentSheet = (newValue: Sheet) =>
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
            musicId: id,
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

        setModalVisible(true);
    }

    function closeModal()
    {
        setModalVisible(false);
        //setRenamedSheet(null);
        //setNewSheetTitle('');
    }

    function saveRenamedSheet()
    {
        closeModal();

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

        SheetService.updateContent(currentSheetRef.current).then(() =>
        {
            
        })
        .catch(err => alert(err));
    }



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        // Busca páginas ao carregar tela
        SheetService.findByMusicId(id).then((res: any) =>
        {
            setSheets(res._array);

            setCurrentSheet(res._array.length > 0
                ? res._array[0]
                : undefined
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



    // ---------- RETURN ----------

    return (
        <>
            <Modal
                animationType='fade'
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',

                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    }}
                    onTouchEnd={() =>
                    {
                        if(!touchIn)
                            closeModal();
                        setTouchIn(false);
                    }}
                >
                    <View
                        style={{ backgroundColor: colors.background, padding: 10, borderRadius: 8 }}
                        onTouchStart={() => setTouchIn(true)}
                    >
                        <TextInput
                            style={{ width: 220, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 4 }}
                            value={newSheetTitle}
                            placeholder="Nome da página"
                            onChangeText={text => setNewSheetTitle(text)}
                            //autoFocus
                            selectTextOnFocus
                        />
                        <View style={{ flexDirection: 'row-reverse', marginTop: 2, alignItems: 'center' }}>
                            <Pressable
                                style={{ padding: 6 }}
                                onPress={saveRenamedSheet}
                            >
                                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Salvar</Text>
                            </Pressable>
                            <Pressable
                                style={{ padding: 6, }}
                                onPress={closeModal}
                            >
                                <Text>Cancelar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 1, padding: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ fontSize: 24 }}>{ name }</Text>
                            <Text style={{ fontSize: 16 }}>{ artist }</Text>
                        </View>

                        <View>
                            <Text>Edição {enableEdition ? 'habilitada' : 'desabilitada'}</Text>
                            <Switch
                                trackColor={{
                                    true: 'rgb(18, 163, 33)',
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
                                            else
                                                openModal(sheet);
                                        }}
                                    >
                                        <Text style={styles.tabContent}>{sheet.title}</Text>
                                    </Pressable>
                                </View>
                            )}

                            <View style={{ flexDirection: 'column-reverse' }}>
                                <Pressable
                                    style={styles.tab}
                                    onPress={createSheet}
                                >
                                    <Text style={styles.tabContent}>+</Text>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.sheets}>
                        {/* Folhas (sheets) do banco */}
                        {sheets.map(sheet =>
                            <SheetComp
                                key={sheet.id}
                                sheet={sheet}
                                sheets={sheets}
                                setSheets={setSheets}
                                setChanged={setChanged}
                                currentSheet={currentSheet}
                                enableEdition={enableEdition}
                            />
                        )}

                        {/* Caso não haja nenhuma folha (sheet) */}
                        {sheets.length === 0 &&
                        <View style={[styles.sheet, styles.emptySheet]}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ fontSize: 16 }}>Nova página</Text>
                                <Pressable
                                    style={styles.newSheetBtn}
                                    onPress={createSheet}
                                >
                                    <Text style={{ fontSize: 22 }}>+</Text>
                                </Pressable>
                            </View>
                        </View>}
                    </View>

                    {/*<View style={{ flexDirection: 'row-reverse' }}>
                        <Pressable
                            style={{ backgroundColor: colors.primary, paddingHorizontal: 26, paddingVertical: 10, marginTop: 8, borderRadius: 999 }}
                            onPress={saveSheetContent}
                        >
                            <Text style={{ fontSize: 18 }}>Save</Text>
                        </Pressable>
                    </View>*/}
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
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
        fontSize: 18,
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