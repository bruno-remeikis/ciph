import React from 'react';
import { StyleSheet, Text, Pressable, ViewStyle } from 'react-native';



export interface ButtonProps {
    style?: ViewStyle;
    text: string;
    backgroundColor?: string;
    color?: string;
    onClick?: Function;
};

const Button: React.FC<ButtonProps> = ({ style, text, backgroundColor, color, onClick }) =>
{
    if(!backgroundColor)
        backgroundColor = 'rgba(0, 0, 0, 0.22)';
    if(!color)
        color = 'white';

    return (
        <Pressable
            style={[ style, styles.button, { backgroundColor } ]}
            onPress={() =>
            {
                if(onClick)
                    onClick();
            }}
        >
            <Text style={[ styles.buttonText, { color } ]}>
                { text }
            </Text>
        </Pressable>
    );
}

export default Button;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 6,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});