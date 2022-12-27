import React, { useState } from 'react';
import { RouteProp } from "@react-navigation/native";

// RootStackParamList
import RootStackParamList from "../../../../AppRootStackParamList";

// Components
import GenericAppHeader from "../GenericAppHeader";
import InputModal from '../../modals/InputModal';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import TagService from '../../../services/TagService';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors } from '../../../utils/consts';
import DialogModal from '../../modals/DialogModal';



interface TagHeaderProps {
    route: RouteProp<RootStackParamList, "Tag">;
    navigation: any;
}

const TagHeader: React.FC<TagHeaderProps> = ({ route, navigation }) =>
{
    const tag = route.params.tag;

    const { setUpdated } = useUpdated();

    const [isRenameModalVisible, setRenameModalVisible] = useState<boolean>(false);
    const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);

    const [name, setName] = useState<string>(tag.name);

    function handleRenameTag()
    {
        if(tag.id)
            TagService.updateName(tag.id, name)
                .then(() =>
                {
                    tag.name = name;
                    setUpdated({ tag });
                    navigation.navigate('Tag', { tag });
                })
                .catch(err => alert(err))
                .finally(() => setRenameModalVisible(false))
    }

    function handleDelete()
    {
        if(tag.id !== undefined)
            TagService.delete(tag.id)
            .then(() =>
            {
                setUpdated(true);
                navigation.pop(2); // <- Volta 2 telas
            })
            .catch(err => alert(err))
            .finally(() => setConfirmDeleteModalVisible(false));
    }

    return (
        <>
            <GenericAppHeader
                menuItems={
                [{
                    icon: {
                        component: FeatherIcon,
                        name: 'edit-2',
                    },
                    text: 'Renomear',
                    onClick: () => setRenameModalVisible(true),
                },
                {
					icon: {
						component: FeatherIcon,
						name: 'x'
					},
					text: 'Deletar',
					color: colors.red,
					division: true,
					onClick: () => setConfirmDeleteModalVisible(true)
				}]}
            />

            {/* Renomear repertório */}
            <InputModal
                visible={isRenameModalVisible}
                setVisible={setRenameModalVisible}
                value={name}
                setValue={setName}
                onSubmit={handleRenameTag}
                placeholder='Nome do Repertório'
            />

            {/* Confirmar delete */}
			<DialogModal
				visible={isConfirmDeleteModalVisible}
				setVisible={setConfirmDeleteModalVisible}
				title='Tem certeza?'
				text='Este repertório será deletado permanentemente'
				buttons={[
					{
						text: 'Sim, deletar!',
						color: colors.red,
						onClick: handleDelete
					},
					{ text: 'Cancelar' }
				]}
			/>
        </>
    );
}

export default TagHeader;