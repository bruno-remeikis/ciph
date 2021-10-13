import React, { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, View, Modal, StyleProp, ViewStyle, Pressable, ViewProps } from 'react-native';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Utils
import { colors } from '../utils/consts';



export interface ModalProps extends ViewProps
{
    visible: boolean;
    setVisible: Dispatch<SetStateAction<boolean>>;
    onHide?: Function;
}

const ModalComponent: React.FC<ModalProps> = ({ children, visible, setVisible, onHide, ...props }) =>
{
    // Guarda se a View interna (conteúdo) do Modal foi tocada
    const [touchIn, setTouchIn] = useState<boolean>(false);

    function close()
    {
        setVisible(false);

        if(onHide)
            onHide();
    }

    return (
        <Modal
            animationType='fade'
            transparent={true}
            visible={visible}
            onRequestClose={close}
        >
            <View
                style={styles.modalBackground}
                onTouchEnd={() =>
                {
                    if(!touchIn)
                        close();
                    else
                        setTouchIn(false);
                }}
            >
                <View
                    {...props}
                    style={[ styles.modalBox, props.style ]}
                    onTouchStart={event =>
                    {
                        setTouchIn(true);
                        
                        if(props.onTouchStart)
                            props.onTouchStart(event);
                    }}
                >
                    <Pressable
                        style={styles.closeBtn}
                        onPress={close}
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