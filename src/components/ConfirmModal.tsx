import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';

import Modal from './Modal';

type Button = {
    text: string;
    color?: string;
    onClick?: Function;
};

interface ConfirmModalProps {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    text: string;
    buttons: Button[]
}

const border = {
    width: 1,
    color: 'rgba(0, 0, 0, 0.2)',
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, setVisible, text, buttons }) =>
{
    return (
        <Modal
            visible={visible}
            setVisible={setVisible}
        >
            <View style={[ styles.container, styles.header ]}>
                <Text style={styles.headerContent}>Confirmação</Text>
            </View>

            <View style={styles.container}>
                <Text>{ text }</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.buttons}>
                    {buttons.map((btn, i) =>
                        <Pressable
                            key={i}
                            style={styles.button}
                            onPress={() =>
                            {
                                if(btn.onClick)
                                    btn.onClick();
                                else
                                    setVisible(false);
                            }}
                        >
                            <Text style={{
                                color: btn.color ? btn.color : 'rgba(0, 0, 0, 0.6)'
                            }}>{ btn.text }</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Modal>
    );
}

export default ConfirmModal;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    header: {
        borderBottomWidth: border.width,
        borderBottomColor: border.color,
    },
    headerContent: {
        fontSize: 16
    },

    footer: {
        borderTopWidth: border.width,
        borderTopColor: border.color,
    },
    buttons: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginRight: 4
    },
    button: {
        padding: 12
    },
});