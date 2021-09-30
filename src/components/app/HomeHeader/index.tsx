import React, { useState } from 'react';

// Database
import Database from '../../../database/Database';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Components
import ConfirmModal from '../../ConfirmModal';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors } from '../../../utils/consts';
import GenericAppHeader from '../GenericAppHeader';

const HomeHeader: React.FC = () =>
{
	const { setUpdated } = useUpdated();

	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);

	return (
		<>
			<GenericAppHeader
				menuItems={
				[{
					icon: {
						component: FeatherIcon,
						name: 'trash-2',
					},
					text: 'Resetar dados',
					color: colors.red,
					onClick: () => setIsConfirmResetVisible(true)
				}]}
			/>

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