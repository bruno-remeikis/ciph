import React, { useState } from 'react';
//import fs from 'react-native-fs';

// Database
import Database from '../../../database/Database';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Components
import GenericAppHeader from '../GenericAppHeader';
import Modal from '../../Modal';
import DialogModal from '../../DialogModal';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors } from '../../../utils/consts';
import { Text } from 'react-native';



const HomeHeader: React.FC = () =>
{
	const { setUpdated } = useUpdated();

	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);
	const [isVerifyResetVisible, setIsVerifymResetVisible] = useState<boolean>(false);
	
	const [verificationCode, setVerificationCode] = useState<string | null>(null);

	function handleExport()
	{
		/*const path = fs.DocumentDirectoryPath + '/ciph-data.txt';
		fs.writeFile(path, '').then(res => // 'utf8'
		{

		})
		.catch(err => alert(err));*/
	}

	function showVerifyReset()
	{
		setIsConfirmResetVisible(false);

		let newVerificationCode: string = "";
		for(let i = 0; i < 4; i++)
		{
			// 36 = (0...9) + (A...Z)
			// (DEC) 48 = (ASCII) "0"
			let intChar = Math.random() * 36 + 48;

			// (DEC) 58 = (ASCII) ":"
			if(intChar >= 58)
				intChar += 7;

			newVerificationCode += String.fromCharCode(intChar);
		}

		setVerificationCode(newVerificationCode);
		setIsVerifymResetVisible(true);
	}

	function handleResetData()
	{
		Database.recreate()
			.then(() => setUpdated(true)) // <- Atualiza HomeScreen
			.catch(err => alert(err))
			.finally(() => setIsConfirmResetVisible(false));
	}

	return (
		<>
			<GenericAppHeader
				menuItems={
				[{
					icon: {
						component: FeatherIcon,
						name: 'save',
					},
					text: 'Exportar dados',
					onClick: handleExport,
				},
				{
					icon: {
						component: FeatherIcon,
						name: 'upload',
					},
					text: 'Importar dados',
					onClick: ()=> {},
				},
				{
					icon: {
						component: FeatherIcon,
						name: 'trash-2',
					},
					text: 'Resetar dados',
					color: colors.red,
					division: true,
					onClick: () => setIsConfirmResetVisible(true)
				}]}
			/>

			{/* Confirmar reset */}
			<DialogModal
				visible={isConfirmResetVisible}
				setVisible={setIsConfirmResetVisible}
				title='Tem certeza?'
				text='Todos os dados serão deletados permanentemente'
				buttons={[
                    {
                        text: 'Sim, resetar!',
                        color: colors.red,
                        onClick: showVerifyReset //handleResetData
                    },
                    { text: 'Cancelar' }
                ]}
			/>

			{/* Confirmar reset novamente */}
			<Modal
				visible={isVerifyResetVisible}
				setVisible={setIsVerifymResetVisible}
			>
				<Text style={{ letterSpacing: 20, fontSize: 26 }}>
					{verificationCode}
				</Text>

			</Modal>
		</>
	);
}

export default HomeHeader;