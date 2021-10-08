import React, { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, View, Modal, StyleProp, ViewStyle, Pressable } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Utils
import { colors } from '../utils/consts';



export interface ModalProps
{
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    style?: StyleProp<ViewStyle>;
}

const ModalComponent: React.FC<ModalProps> = ({ children, visible, setVisible, style }) =>
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
                    style={[ styles.modalBox, style ]}
                    onTouchStart={() => setTouchIn(true)}
                >
                    <Pressable
                        style={styles.closeBtn}
                        onPress={() => setVisible(false)}
                    >
                        <FeatherIcon name='x' size={16} color={colors.text} />
                    </Pressable>

                    { children }
                </View>
            </View>
        </Modal>
    );
}

export default ModalComponent;



// ---------- STYLES ----------

const closeBtnSize = 30;

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

    closeBtn: {
        position: 'absolute',
        zIndex: 1,
        top: - closeBtnSize / 2.5,
        right: - closeBtnSize / 2.5,

        alignItems: 'center',
        justifyContent: 'space-around',

        backgroundColor: colors.background,

        width: closeBtnSize,
        height: closeBtnSize,

        borderRadius: 999,

        // Shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
});