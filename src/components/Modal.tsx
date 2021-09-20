import React, { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, View, Modal } from 'react-native';

import { colors } from '../utils/colors';

interface ModalProps {
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
}

const ModalComponent: React.FC<ModalProps> = ({ children, visible, setVisible }) =>
{
    // Guarda se a View interna (conteúdo) do Modal foi tocada
    const [touchIn, setTouchIn] = useState<boolean>(false);

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={() => setVisible(false)}
        >
            <View
                style={styles.modalBackground}
                onTouchEnd={() =>
                {
                    if(!touchIn)
                        setVisible(false);
                    else
                        setTouchIn(false);
                }}
            >
                <View
                    style={styles.modalBox}
                    onTouchStart={() => setTouchIn(true)}
                >
                    { children }
                </View>
            </View>
        </Modal>
    );
}

export default ModalComponent;

const styles = StyleSheet.create({
    // MODAL
    modalBackground: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalBox: {
        backgroundColor: colors.background,
        borderRadius: 8,
    },
});