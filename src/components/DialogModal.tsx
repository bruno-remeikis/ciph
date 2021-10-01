import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Components
import Modal from './Modal';



type Button = {
    text: string;
    color?: string;
    onClick?: Function;
};

interface DialogModalProps {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    //iconType: 'warning',
    title: string;
    text: string;
    buttons: Button[]
}

const DialogModal: React.FC<DialogModalProps> = ({ visible, setVisible, /*iconType, */title, text, buttons }) =>
{
    return (
        <Modal
            visible={visible}
            setVisible={setVisible}
            style={styles.container}
        >
            <FeatherIcon name='alert-triangle' size={50} color='rgb(237, 192, 69)' />

            <Text style={styles.title}>{ title }</Text>
            <Text style={styles.text}>{ text }</Text>

            <View style={styles.buttons}>
                {buttons.map((btn, i) =>
                    <Pressable
                        key={i}
                        style={[
                            styles.button, {
                                backgroundColor: btn.color
                                    ? btn.color
                                    : 'rgba(0, 0, 0, 0.22)',
                                marginRight: i > 0
                                    ? 6 : 0,
                            }
                        ]}
                        onPress={() =>
                        {
                            if(btn.onClick)
                                btn.onClick();
                            else
                                setVisible(false);
                        }}
                    >
                        <Text
                            style={[
                                styles.buttonText,
                                { color: 'white' }
                            ]}
                        >{ btn.text }</Text>
                    </Pressable>
                )}
            </View>
        </Modal>
    );
}

export default DialogModal;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        minWidth: 200,
        maxWidth: 300,
        padding: 18,
    },

    title: {
        textAlign: 'center',
        fontSize: 24,
    },
    text: {
        color: 'rgba(0, 0, 0, 0.8)',
        textAlign: 'center',
        marginTop: 6,
        fontSize: 16,
    },

    buttons: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 18,
    },
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