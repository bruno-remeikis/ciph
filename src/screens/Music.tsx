import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { music } from '../models/music';

export const Music: React.FC<any> = ({ navigation, route }) =>
{
    const { name, artist } = route.params.music;

    return (
        <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 30 }}>{ name }</Text>
            <Text style={{ fontSize: 18 }}>{ artist }</Text>
        </View>
    )
}

const styles = StyleSheet.create({

});