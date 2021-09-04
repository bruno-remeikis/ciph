import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput } from 'react-native';

import MusicService from '../services/MusicService';

import { colors } from '../utils/colors';

export const NewMusic: React.FC<any> = ({ navigation }) =>
{
    const [name, setName] = useState('');
    const [artist, setArtist] = useState('');

    function handleSubmit()
    {
        MusicService.create({ name, artist })
        .then(res =>
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