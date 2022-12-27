import React, { Dispatch, SetStateAction, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

// Components
import Modal, { ModalProps } from './Modal';
import Button from '../Button';

// Utils
import { colors } from '../../utils/consts';
import { getContrastColor } from '../../utils/functions';



export interface ColorPickerModalProps extends ModalProps
{
    color: string;
    setColor: Dispatch<SetStateAction<string>>;
};

const ColorPickerModal: React.FC<ColorPickerModalProps> = ({ color, setColor, ...props }) =>
{
    const [newColor, setNewColor] = useState(color);

    return (
        <Modal
            {...props}
            style={[ props.style, styles.container ]}
        >
            <ColorPicker
                color={newColor}
                onColorChange={color => setNewColor(color)}
                //onColorChangeComplete={color => alert(`Color selected: ${color}`)}
                thumbSize={30}
                sliderSize={20}
                noSnap
            />

            <View style={styles.btns}>
                <Button
                    style={{ marginLeft: 6 }}
                    text='Escolher'
                    backgroundColor={newColor}
                    color={String(getContrastColor(newColor))}
                    onClick={() =>
                    {
                        setColor(newColor);
                        props.setVisible(false);
                    }}
                />
                <Button
                    text='Cancelar'
                    onClick={() => props.setVisible(false)}
                />
            </View>
        </Modal>
    );
}

export default ColorPickerModal;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    container: {
        width: 300,
        height: 400,
        padding: 18,
    },
    btns: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 18,
    },
});