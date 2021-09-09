import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';

import SongService from '../services/SongService';

import { colors } from '../utils/colors';

const NewSongScreen: React.FC<any> = ({ navigation }) =>
{
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');

    function handleSubmit()
    {
        SongService.create({ name, artist })
        .then(() =>
        {
            navigation.navigate('Home', { update: true });
        })
        .catch(err =>
        {
            console.error(err);
            alert(err);
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputGroup}>
                <Text>Nome</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={text => setName(text)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text>Artista/banda</Text>
                <TextInput
                    style={styles.input}
                    value={artist}
                    onChangeText={text => setArtist(text)}
                />
            </View>

            <Pressable
                style={[styles.submit, styles.inputGroup]}
                onPress={handleSubmit}
            >
                <Text>Salvar música</Text>
            </Pressable>
        </View>
    );
}

export default NewSongScreen;

const styles = StyleSheet.create({
    container: {
        padding: 18,
    },

    inputGroup: {
        marginBottom: 10,
    },

    input: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
    },

    submit: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        padding: 10
    }
});