import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native';

import SongService from '../services/SongService';
import ArtistService from '../services/ArtistService';

import { colors } from '../utils/colors';

const NewSongScreen: React.FC<any> = ({ navigation }) =>
{
    const [name, setName] = useState('');
    const [artists, setArtists] = useState<string[]>(['']);

    function handleSubmit()
    {
        SongService.create({ name })
        .then(res =>
        {
            ArtistService.create(res, artists).then(() =>
                navigation.navigate('Home', { update: true })
            )
            .catch(err =>
            {
                console.error(err);
                alert(err);
            });
        })
        .catch(err =>
        {
            console.error(err);
            alert(err);
        });
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={[ styles.input, styles.textInput ]}
                        value={name}
                        onChangeText={text => setName(text)}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Artistas / bandas</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexGrow: 1 }}>
                            {artists.map((artist, i) =>
                                <View
                                    key={i}
                                    style={[ styles.input, {
                                        marginTop: i !== 0 ? 6 : 0,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'stretch',
                                    }]}
                                >
                                    <TextInput
                                        style={styles.textInput}
                                        value={artist}
                                        onChangeText={text =>
                                        {
                                            const values = [...artists];
                                            values[i] = text.replace(',', '');
                                            setArtists(values);
                                        }}
                                    />

                                    {artists.length > 1 &&
                                    <Pressable
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'space-around',
                                            width: 30,
                                        }}
                                        onPress={() =>
                                        {
                                            const array = [...artists];
                                            array.splice(i, 1);
                                            setArtists(array);
                                        }}
                                    >
                                        <Text style={{ fontSize: 10, textAlignVertical: 'center' }}>X</Text>
                                    </Pressable>}
                                </View>
                            )}
                        </View>

                        <View style={{ marginLeft: 8 }}>
                            <View style={styles.line} />

                            <Pressable 
                                style={styles.btnAddArtist}
                                onPress={() => setArtists([ ...artists, '' ])}
                            >
                                <Text style={{ fontSize: 18 }}>+</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                <Pressable
                    style={[styles.submit, styles.inputGroup, { marginBottom: 0 }]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitContent}>Adicionar</Text>
                </Pressable>
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
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 999,
    },
    submitContent: {
        fontSize: 16,
    },
});