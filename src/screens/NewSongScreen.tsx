import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native';

import SongService from '../services/SongService';
import ArtistService from '../services/ArtistService';

import { Artist } from '../models/Artist';

import { colors } from '../utils/colors';

const NewSongScreen: React.FC<any> = ({ navigation, route }) =>
{
    // ---------- CONSTS ---------- //

    const id: number | null = route.params?.song?.id
        ? route.params.song.id
        : null;

    const updateScreen = id ? true : false;
    
    const initialName: string | null = route.params?.song?.name
        ? route.params.song.name
        : null;



    // ---------- TYPES ---------- //

    type ArtistProps = {
        obj: Artist;
        initial?: boolean;
    }



    // ---------- STATES ---------- //

    const [name, setName] = useState(initialName ? initialName : '');
    const [artists, setArtists] = useState<ArtistProps[]>([{ obj: { name: '' } }]);
    // IDs dos artistas iniciais (usado na tela de update)
    //const [initialArtistIds, setInitialArtistIds] = useState<number[]>([]);
    // IDs dos artistas deletados (usado na tela de update)
    const [deletedArtistIds, setDeletedArtistIds] = useState<number[]>([]);
    // Artistas da pesquisa (exibidos com )
    const [researchArtists, setResearchArtists] = useState<Artist[]>([]);
    // Index do campo de artista com foco (usado pra exibir 'researchArtists')
    const [currentFocusIndex, setCurrentFocusIndex] = useState<number | null>(null);

    const [invalidName, setInvalidName] = useState(false);
    const [invalidArtists, setInvalidArtists] = useState(false);



    // ---------- FUNCTIONS ---------- //

    function handleSubmit()
    {
        // Validar artistas
        let validArtist = false;
        for(const artist of artists)
            if(artist.obj.name.trim().length > 0)
            {
                validArtist = true;
                break;
            }

        let invalid = false;
        
        // Validar nome
        if(name.trim().length === 0)
        {
            setInvalidName(true);
            invalid = true;
        }

        // Validar artistas
        if(!validArtist)
        {
            setInvalidArtists(true);
            invalid = true;
        }

        // Validar
        if(invalid)
            return;

        if(updateScreen)
        {
            if(name !== initialName  && id)
                SongService.update({ id, name })
                .then(() => navigation.navigate('Home', { update: true }))
                .catch(err => alert(err));
        }
        else
        {
            SongService.create({ name }, artists.map(({ obj }) => obj))
            .then(() => navigation.navigate('Home', { update: true }))
            .catch(err => alert(err));
        }
    }
    
    function handleSearch(text: string)
    {
        if(text.trim().length === 0)
        {
            setResearchArtists([]);
            return;
        }

        ArtistService.findByName(text.trim())
        .then((res: any) => { console.log(res._array); setResearchArtists(res._array)})
        .catch(err => alert(err));
    }



    // ---------- EFFECTS ---------- //

    /**
     * Carrega os artistas caso uma música tenha sido passada para a rota
     */
    useEffect(() =>
    {
        if(id)
            ArtistService.findBySongId(id)
            .then((res: any) => setArtists(
                res._array.map((obj: Artist) =>
                {
                    return { obj, initial: true };
                })
            ))
            .catch(err => alert(err));
    },
    [id]);



    // ---------- RETURN ---------- //

    return (
        <ScrollView keyboardShouldPersistTaps='handled'>
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textInput,
                            invalidName ? { borderColor: '#e34a40' } : {}
                        ]}
                        value={name}
                        onChangeText={text =>
                        {
                            setInvalidName(false);
                            setName(text);
                        }}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Artistas / bandas</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexGrow: 1 }}>
                            {artists.map((artist, i) =>
                                <View key={i}>
                                    <View
                                        style={[
                                            styles.input,
                                            {
                                                marginTop: i !== 0 ? 6 : 0,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'stretch',
                                            },
                                            invalidArtists
                                                ? { borderColor: '#e34a40' }
                                                : artist.obj.id
                                                    ? {
                                                        borderColor: colors.primary,
                                                        backgroundColor: `rgba(${colors.primaryRGB}, 0.2)`
                                                    }
                                                    : {}
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.textInput}
                                            value={artist.obj.name}
                                            onChangeText={text =>
                                            {
                                                setInvalidArtists(false);

                                                const values = [...artists];
                                                values[i].obj.name = text.replace(',', '');
                                                setArtists(values);
                                                handleSearch(text);
                                            }}
                                            onFocus={() =>
                                            {
                                                handleSearch(artist.obj.name);
                                                setCurrentFocusIndex(i);
                                            }}
                                            onBlur={() =>
                                            {
                                                setCurrentFocusIndex(null);
                                            }}
                                            editable={!artist.obj.id}
                                        />

                                        {artists.length > 1 || artists[0].obj.id ?
                                            <Pressable
                                                style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'space-around',
                                                    width: 30,
                                                }}
                                                onPress={() =>
                                                {
                                                    const array = [...artists];

                                                    // Se for o último E possuir ID
                                                    if(array.length === 1 && array[0].obj.id)
                                                        array.push({ obj: { name: '' } });

                                                    // Adiciona artista à lista de deletados
                                                    // para que, posteriormente, possa ser deletado do BD
                                                    if(artist.initial && artist.obj.id)
                                                        setDeletedArtistIds([ ...deletedArtistIds, artist.obj.id ]);

                                                    array.splice(i, 1);
                                                    setArtists(array);
                                                }}
                                            >
                                                <Text style={{ fontSize: 10, textAlignVertical: 'center' }}>X</Text>
                                            </Pressable>
                                        : null}
                                    </View>

                                    {currentFocusIndex !== null &&
                                     currentFocusIndex === i &&
                                     researchArtists.length !== 0 ?
                                        <View style={{ position: 'relative' }}>
                                            <View style={{
                                                position: 'absolute',
                                                zIndex: 1,
                                                left: 0,
                                                right: 0,
                                                backgroundColor: 'white',
                                                //paddingVertical: 4,
                                                //marginHorizontal: 4,
                                                borderWidth: 1,
                                                borderTopWidth: 0,
                                                borderColor: colors.inputBorder,
                                                //borderTopLeftRadius: 8,
                                            }}>
                                                {researchArtists.map((researchArtist, j) =>
                                                    <Pressable
                                                        key={j}
                                                        style={{
                                                            backgroundColor: j % 2 === 0 ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                                                            paddingHorizontal: 12,
                                                            paddingVertical: 6,
                                                        }}
                                                        onPress={() =>
                                                        {
                                                            const array = [...artists];
                                                            array[i] = { obj: researchArtist };
                                                            setArtists(array);
                                                            //setCurrentFocusIndes(null);
                                                        }}
                                                    >
                                                        <Text>{ researchArtist.name }</Text>
                                                    </Pressable>
                                                )}
                                            </View>
                                        </View>
                                    : null}
                                </View>
                            )}
                        </View>

                        <View style={{ marginLeft: 8 }}>
                            <View style={styles.line} />

                            <Pressable 
                                style={styles.btnAddArtist}
                                onPress={() => setArtists([ ...artists, { obj: { name: '' } } ])}
                            >
                                <Text style={{ fontSize: 18 }}>+</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={[ styles.inputGroup, { flexDirection: 'row-reverse' } ]}>
                    <Pressable
                        style={[styles.submit]}
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitContent}>
                            {updateScreen ? 'Salvar' : 'Adicionar'}
                        </Text>
                    </Pressable>

                    {id ?
                        <Pressable
                            style={{
                                alignSelf: 'center',
                                marginRight: 18,
                            }}
                            onPress={() => alert('a')}
                        >
                            <Text style={{
                                textAlignVertical: 'center',
                                color: 'red',
                                fontSize: 14
                            }}>Excluir</Text>
                        </Pressable>
                    : null}
                </View>
            </View>
        </ScrollView>
    );
}

export default NewSongScreen;

const styles = StyleSheet.create({
    container: {
        padding: 18,
    },

    inputGroup: {
        marginBottom: 14,
    },
    label: {
        marginLeft: 6,
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
    },
    textInput: {
        flex: 1,
        color: 'black',
        paddingHorizontal: 14,
        paddingVertical: 4,
    },
    line: {
        alignSelf: 'center',
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        width: 4,
        marginBottom: 4,
        borderRadius: 999,
    },
    btnAddArtist: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(0, 0, 0, 0.06)', //'green',
        width: 30,
        height: 30,
        marginBottom: 2,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 999,
    },

    submit: {
        backgroundColor: colors.primary,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 999,
    },
    submitContent: {
        fontSize: 16,
    },
});