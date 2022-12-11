import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';

// Components
import Modal, { ModalProps } from './Modal';
import Button from '../Button';

// Utils
import { colors } from '../../utils/consts';

// Entities
import { Tag } from '../../models/entities/Tag';

// Services
import TagService from '../../services/TagService';



interface NewTagModalProps extends ModalProps
{
    setReturnObject?: Dispatch<SetStateAction<Tag>>;
}

const NewTagModal: React.FC<NewTagModalProps> = ({ setReturnObject, ...props }) =>
{
    const [tagName, setTagName] = useState('');

    function handleSubmit()
    {
        const newTag: Tag = {
            name: tagName,
            color: null
        };

        TagService.create(newTag).then((res: any) =>
        {
            if(setReturnObject)
                setReturnObject({
                    id: res,
                    name: tagName,
                    color: null,
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
    btns: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        marginTop: 8,
    },
});