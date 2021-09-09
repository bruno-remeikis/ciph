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
                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={text => setName(text)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Artista/banda</Text>
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
                <Text style={styles.submitContent}>Adicionar</Text>
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
        marginBottom: 14,
    },
    label: {
        marginLeft: 6,
        marginBottom: 6,
        fontSize: 16,
    },
    input: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 8,
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