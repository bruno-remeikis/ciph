import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

// Components
import Modal, { ModalProps } from './Modal';
import Button from './Button';

// Utils
import { colors } from '../utils/consts';



export interface InputModalProps extends ModalProps
{
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    onSubmit: Function;
};

const InputModal: React.FC<InputModalProps> = ({ value, setValue, onSubmit, ...props }) =>
    <Modal
        {...props}
        style={[ props.style, { padding: 10 } ]}
    >
        <TextInput
            style={styles.input}
            value={value}
            placeholder="Nome da página"
            onChangeText={text => setValue(text)}
            selectTextOnFocus
        />

        <View style={styles.btns}>
            <Button
                style={{ marginLeft: 6 }}
                text='Salvar'
                backgroundColor={colors.primary}
                onClick={onSubmit}
            />
            <Button
                text='Cancelar'
                onClick={() => props.setVisible(false)}
            />
        </View>
    </Modal>

export default InputModal;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    input: {
        width: 260,
        marginBottom: 2,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 4,
    },
    btns: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 6,
    },
});