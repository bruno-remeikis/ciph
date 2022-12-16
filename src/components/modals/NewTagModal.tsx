import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

// Components
import Modal, { ModalProps } from './Modal';
import ColorPickerModal from './ColorPickerModal';
import Button from '../Button';

// Utils
import { colors } from '../../utils/consts';

// Entities
import { Tag } from '../../models/entities/Tag';

// Services
import TagService from '../../services/TagService';

// Icons
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { getContrastColor } from '../../utils/functions';



interface NewTagModalProps extends ModalProps
{
    setReturnObject?: Dispatch<SetStateAction<Tag>>;
}

const NewTagModal: React.FC<NewTagModalProps> = ({ setReturnObject, ...props }) =>
{
    const primaryColorHex = '#d98859';

    const [tagName, setTagName] = useState('');
    const [color, _setColor] = useState(primaryColorHex);

    const colorRef = useRef(color);
    const setColor = (newValue: string) =>
    {
        colorRef.current = newValue;
        _setColor(newValue);
    }

    const [isColorPickerModalVisible, setColorPickerModalVisible] = useState<boolean>(false);

    function handleSubmit()
    {
        const newTag: Tag = {
            name: tagName.trim(),
            color: color,
        };

        TagService.create(newTag).then((res: any) =>
        {
            if(setReturnObject)
                setReturnObject({
                    id: res,
                    name: newTag.name,
                    color: newTag.color,
                    amount: 0
                });

            props.setVisible(false);
        })
        .catch(err => alert(err));
    }

    useEffect(() =>
    {
        if(props.visible)
            setTagName('');
    },
    [props.visible]);

    return (
        <>
            <ColorPickerModal
                visible={isColorPickerModalVisible}
                setVisible={setColorPickerModalVisible}
                color={colorRef.current}
                setColor={_setColor}
                //onHide={() => colorRef.current = color}
            />

            <Modal
                {...props}
                style={styles.container}
            >
                <Text style={styles.title}>Novo Repertório</Text>

                <TextInput
                    style={styles.input}
                    value={tagName}
                    placeholder="Nome do Repertório"
                    onChangeText={text => setTagName(text)}
                    selectTextOnFocus
                />

                <View style={styles.colorPickerContainer}>
                    <Pressable
                        style={[styles.colorPicker, { backgroundColor: color }]}
                        onPress={() => setColorPickerModalVisible(true)}
                    >
                        <Text style={{ color: getContrastColor(color), fontSize: 16 }}>Escolher cor</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setColor(primaryColorHex)}
                        style={styles.colorPickerUndo}
                    >
                        <FontAwesomeIcon name='undo' size={20} />
                    </Pressable>
                </View>

                <View style={styles.btns}>
                    <Button
                        style={{ marginLeft: 6 }}
                        text='Salvar'
                        backgroundColor={colors.primary}
                        onClick={handleSubmit}
                    />
                    <Button
                        text='Cancelar'
                        onClick={() => props.setVisible(false)}
                    />
                </View>
            </Modal>
        </>
    );
}

export default NewTagModal;



// ---------- STYLES ----------

const styles = StyleSheet.create({
    container: {
        //alignItems: 'center',
        minWidth: 200,
        maxWidth: 300,
        padding: 18,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 8,
    },
    input: {
        width: 260,
        marginBottom: 2,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 4,
    },

    colorPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    colorPicker: {
        justifyContent: 'space-around',
        width: 140,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    colorPickerUndo: {
        marginLeft: 10,
    },

    /*chooseColor: {
        flexDirection: 'row',
        marginTop: 8,
    },
    chooseColorLeft: {
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.22)',
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    },
    chooseColorRight: {
        width: 100,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
    },*/

    btns: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 8,
    },
});