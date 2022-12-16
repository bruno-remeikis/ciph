import React, { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable } from 'react-native';

// Components
import Modal, { ModalProps } from './Modal';
import ColorPickerModal from './ColorPickerModal';
import Button from '../Button';

// Utils
import { colors } from '../../utils/consts';
import { getContrastColor } from '../../utils/functions';

// Entities
import { Tag } from '../../models/entities/Tag';

// Services
import TagService from '../../services/TagService';

// Icons
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

// Contexts
import { useUpdated } from '../../contexts/Updated';
import { useCurrentTag } from '../../contexts/CurrentTag';



interface NewTagModalProps extends ModalProps
{
    navigation: any;
    tag?: Tag; // Caso modal seja usado para atualizar, e não para criar tag
    setReturnObject?: Dispatch<SetStateAction<Tag>>;
}

const NewTagModal: React.FC<NewTagModalProps> = ({ navigation, tag, setReturnObject, ...props }) =>
{
    // ---------- CONTEXTS ----------

    const { setUpdated } = useUpdated();

    const { currentTag, setCurrentTag } = useCurrentTag();



    // ---------- STATES ----------

    const [tagName, _setTagName] = useState<string>(() =>
    {
        console.log(currentTag);
        return currentTag ? currentTag.tag.name : '';
    });
    const [color, _setColor] = useState(currentTag?.tag.color ? currentTag.tag.color : colors.primaryHex);

    const [isColorPickerModalVisible, setColorPickerModalVisible] = useState<boolean>(false);



    // ---------- REFS ----------

    const colorRef = useRef(color);
    const setColor = (newValue: string) =>
    {
        colorRef.current = newValue;
        _setColor(newValue);
    }

    const tagNameRef = useRef(tagName);
    const setTagName = (newValue: string) =>
    {
        tagNameRef.current = newValue;
        _setTagName(newValue);
    }



    // ---------- FUNCTIONS ----------

    function handleSubmit()
    {
        if(tag)
        {
            if(!tag.id)
                return;

            const obj: Tag = {
                ...tag,
                name: tagName,
                color
            }

            TagService.update(obj).then((res: any) =>
            {
                if(setReturnObject)
                    setReturnObject(obj);

                setUpdated({ tag });
                props.setVisible(false);

                if(currentTag !== null)
                    setCurrentTag({ ...currentTag, tag: obj });

                navigation.navigate('Tag', { tag: obj });
            })
            .catch(err => alert(err));
        }
        else
        {
            const obj: Tag = {
                name: tagName.trim(),
                color: color,
            };

            TagService.create(obj).then((res: any) =>
            {
                if(setReturnObject)
                    setReturnObject({
                        id: res,
                        name: obj.name,
                        color: obj.color,
                        amount: 0
                    });

                props.setVisible(false);
            })
            .catch(err => alert(err));
        }
    }



    // ---------- EFFECTS ----------

    useEffect(() =>
    {
        if(props.visible)
            setTagName('');
    },
    [props.visible]);



    // ---------- RETURN ----------

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
                <Text style={styles.title}>
                    {tag ? 'Editar' : 'Novo'} Repertório
                </Text>

                <TextInput
                    style={styles.input}
                    value={tagNameRef.current}
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
                        onPress={() => setColor(colors.primaryHex)}
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