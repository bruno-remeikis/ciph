import React from 'react';
import { StyleSheet, Text, View } from "react-native";

// Contexts
import { useMessage } from '../../../contexts/Message';

// Animations
import Fade from '../../animations/Fade';

const Message: React.FC = () =>
{
    const {  } = useMessage();

	return (
        <View
            style={styles.container}
            pointerEvents='none'
        >
            <Fade
                style={styles.message}
                visible={true}
                property='opacity'
                initial={{ value: 0, time: 120 }}
                final={{ value: 1, time: 200 }}
            >
                <Text style={styles.text}>Edição desabilitada</Text>
            </Fade>
        </View>
	);
}

export default Message;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,

        alignItems: 'center',

        width: '100%',
        marginBottom: 12,
    },
    message: {
        backgroundColor: 'rgba(210, 210, 210, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
    },
    text: {
        color: 'rgb(80, 80, 80)',
    },
});