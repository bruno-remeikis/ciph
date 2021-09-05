import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView, Modal } from 'react-native';

import { Music } from '../models/Music';
import { Sheet } from '../models/Sheet';

import SheetService from '../services/SheetService';
import { colors } from '../utils/colors';



// SHEET

interface SheetCompProps
{
    sheet: Sheet;
    currentId: number;
}

const SheetComp: React.FC<SheetCompProps> = ({ sheet, currentId }) =>
{
    //const [lines, setLines] = useState(sheet.content.split('\n').length - 1);
    const [content, setContent] = useState(sheet.content);

    return (
        <TextInput
            style={[
                styles.sheet,
                { display: currentId === sheet.id ? 'flex' : 'none' }
            ]}
            multiline={true}
            //numberOfLines={/*lines*/ 8}
            value={content}
            onChangeText={text => setContent(text)}
            /*onContentSizeChange={(event) =>
                setLines(event.nativeEvent.contentSize.height)}*/
        />
    );
}



// SCREEN

const sheetLinkVerticalPadding = 2;
export const MusicScreen: React.FC<any> = ({ navigation, route }) =>
{
    // CONSTS

    const { id, name, artist } = route.params.music;



    // STATES

    const [modalVisible, setModalVisible] = useState(false);
    // Guarda se a View interna (conteúdo) do Modal foi tocada
    const [touchIn, setTouchIn] = useState(false);
    // ID da folha (sheet) a ser renomeada
    const [renamedSheet, setRenamedSheet] = useState<Sheet | null>(null);
    // Valor do novo título da folha (sheet) a ser renomeada
    const [newSheetTitle, setNewSheetTitle] = useState('');

    const [sheets, setSheets] = useState<Sheet[]>([]);
    // ID da folha (sheet) aberta no momento
    const [currentSheetId, setCurrentSheetId] = useState(0);



    // FUNCTIONS

    function createSheet()
    {
        const newSheet: Sheet = {
            musicId: id,
            title: 'Nova página',
            content: ''
        };

        SheetService.create(newSheet).then((res: any) =>
        {
            newSheet.id = res;
            setSheets([...sheets, newSheet]);
            setCurrentSheetId(res);

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



    // EFFECTS

    useEffect(() =>
    {
        SheetService.findByMusicId(id).then((res: any) =>
        {
            setSheets(res._array);

            setCurrentSheetId(res._array.length > 0
                ? res._array[0].id
                : 0
            );
        })
        .catch(err => alert(err));
    },
    []);



    // RETURN

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
                            autoFocus
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
                    <Text style={{ fontSize: 24 }}>{ name }</Text>
                    <Text style={{ fontSize: 16 }}>{ artist }</Text>

                    <View>
                        <ScrollView
                            style={styles.sheetLinks}
                            horizontal
                        >
                            {sheets.map(sheet =>
                                <View
                                    key={sheet.id}
                                    style={{ flexDirection: 'column-reverse' }}
                                >
                                    <Pressable
                                        style={[styles.sheetLink, { paddingBottom: currentSheetId === sheet.id
                                            ? sheetLinkVerticalPadding + 6
                                            : sheetLinkVerticalPadding
                                        }]}
                                        onPress={() =>
                                        {
                                            if(currentSheetId !== sheet.id)
                                                setCurrentSheetId(sheet.id ? sheet.id : 0)
                                            else
                                                openModal(sheet);
                                        }}
                                    >
                                        <Text>{sheet.title}</Text>
                                    </Pressable>
                                </View>
                            )}

                            <View style={{ flexDirection: 'column-reverse' }}>
                                <Pressable
                                    style={styles.sheetLink}
                                    onPress={createSheet}
                                >
                                    <Text>+</Text>
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
                                currentId={currentSheetId}
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
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    // SHEET
    sheetLinks: {
        //flexDirection: 'row',
        marginTop: 8,
    },
    sheetLink: {
        backgroundColor: colors.primary,
        
        marginRight: 2,
        paddingHorizontal: 10,
        paddingVertical: sheetLinkVerticalPadding,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    sheets: {
        flex: 1,
    },
    sheet: {
        flex: 1,
        backgroundColor: 'white',

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