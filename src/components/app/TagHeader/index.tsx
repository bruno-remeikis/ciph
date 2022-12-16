import React, { useState, useEffect } from 'react';
import { RouteProp } from "@react-navigation/native";

// RootStackParamList
import RootStackParamList from "../../../../AppRootStackParamList";

// Components
import GenericAppHeader from "../GenericAppHeader";
import DialogModal from '../../modals/DialogModal';
import NewTagModal from '../../modals/NewTagModal';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';
import TagService from '../../../services/TagService';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors } from '../../../utils/consts';

// Models
import { Tag } from '../../../models/entities/Tag';

// Contexts
import { useCurrentTag } from '../../../contexts/CurrentTag';



interface TagHeaderProps {
    route: RouteProp<RootStackParamList, "Tag">;
    navigation: any;
}

const TagHeader: React.FC<TagHeaderProps> = ({ route, navigation }) =>
{
    // ---------- CONSTS ----------

    const tag = route.params.tag;



    // ---------- CONTEXTS ----------

    const { setUpdated } = useUpdated();
    
    const { currentTag, setCurrentTag } = useCurrentTag();



    // ---------- STATES ----------

    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [returnedTag, setReturnedTag] = useState<Tag | null>(null);
    const [isConfirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState<boolean>(false);



    // ---------- FUNCTIONS ----------

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



    // ---------- EFFECTS ----------

    /**
     * Quando a tag for atualizada
     */
    useEffect(() =>
    {
        if(returnedTag !== null
        && currentTag !== null)
        {
            setCurrentTag({ ...currentTag, tag: returnedTag });
        }
    },
    [returnedTag]);

    

    // ---------- RETURN ----------

    return (
        <>
            <GenericAppHeader
                menuItems={
                [{
                    icon: {
                        component: FeatherIcon,
                        name: 'edit-2',
                    },
                    text: 'Editar',
                    onClick: () => setEditModalVisible(true),
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

            {/* Editar repertório */}
            <NewTagModal
                visible={isEditModalVisible}
                setVisible={setEditModalVisible}
                tag={tag}
                setReturnObject={setReturnedTag}
                navigation={navigation}
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