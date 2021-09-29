import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';

// Database
import Database from '../../../database/Database';

// Icons
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';

// Styles
import styles from '../../../styles/modals';

// Components
import Modal from '../../Modal';
import ConfirmModal from '../../ConfirmModal';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors, sizes } from '../../../utils/consts';

const HomeHeader: React.FC = () =>
{
	const { setUpdated } = useUpdated();

	const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);

	return (
		<>
			<Pressable
				style={styles.menuBtn}
				onPress={() => setIsMenuVisible(true)}
			>
				<EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
			</Pressable>

			{/* Menú */}
			<Modal
				style={styles.menuContainer}
				visible={isMenuVisible}
				setVisible={setIsMenuVisible}
			>
				<Pressable
					style={styles.menuItem}
					onPress={() =>
					{
						setIsMenuVisible(false);
						setIsConfirmResetVisible(true);
					}}
				>
					<FeatherIcon name='trash-2' size={sizes.headerIcon} color={colors.red} />
					<Text style={[styles.menuItemContent, {color: colors.red}]}>Resetar dados</Text>
				</Pressable>
			</Modal>

			{/* Confirmar reset */}
			<ConfirmModal
                visible={isConfirmResetVisible}
                setVisible={setIsConfirmResetVisible}
                text='Deseja mesmo resetar todos os dados?'
                buttons={[
                    {
                        text: 'Excluir',
                        color: colors.red,
                        onClick: () =>
						{
							Database.recreate()
								.then(() => setUpdated(true)) // <- Atualiza HomeScreen
								.catch(err => alert(err))
								.finally(() => setIsConfirmResetVisible(false));
						}
                    },
                    { text: 'Cancelar' }
                ]}
            />
		</>
	);
}

export default HomeHeader;