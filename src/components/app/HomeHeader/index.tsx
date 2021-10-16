import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

// File management
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

// Database
import Database from '../../../database/Database';

// Icons
import FeatherIcon from 'react-native-vector-icons/Feather';

// Components
import GenericAppHeader from '../GenericAppHeader';
import Modal from '../../Modal';
import DialogModal from '../../DialogModal';
import Button from '../../Button';

// Contexts
import { useUpdated } from '../../../contexts/Updated';

// Utils
import { colors } from '../../../utils/consts';

// Services
import ExportService, { DataJson } from '../../../services/ExportService';
import ImportService from '../../../services/ImportService';

const Pointer: React.FC = () =>
{
	const opacity = useRef(new Animated.Value(1)).current;

	useEffect(() =>
	{
		Animated.loop
		(
			Animated.sequence
			([
				Animated.delay(300),
				Animated.timing(opacity,
				{
					toValue: 0,
					duration: 300,
					useNativeDriver: false,
				}),
				Animated.timing(opacity,
				{
					toValue: 1,
					duration: 300,
					useNativeDriver: false,
				})
			])
		).start();
	}, []);

	return (
		<Animated.View style={{
			position: 'absolute',
			width: 2,
			height: 20,
			backgroundColor: colors.primary,
			opacity
		}} />
	);
}

const HomeHeader: React.FC = () =>
{
	// ---------- CONSTS ----------

	const verifCodeLength = 4;

	// ---------- CONTEXTS ----------

	const { setUpdated } = useUpdated();

	// ---------- STATES ----------

	const [isConfirmResetVisible, setIsConfirmResetVisible] = useState<boolean>(false);
	const [isVerifyResetVisible, setIsVerifyResetVisible] = useState<boolean>(false);
	
	const [verifCode, setVerifCode] = useState<string | null>(null);
	const [verifCodeValue, setVerifCodeValue] = useState<string>('');

	// ---------- REFS ----------

	const verifCodeRef = useRef<TextInput>(null);

	// ---------- EVENTS ----------

	Keyboard.addListener('keyboardDidHide', () => verifCodeRef.current?.blur());

	// ---------- FUNCTIONS ----------

	async function handleExport()
	{
		try
		{
			// Criar JSON com todos os dados
			const data = await ExportService.createDataJson();

			// Criar arquivo em cache
			const path = FileSystem.cacheDirectory + 'ciph-data.json';
			await FileSystem.writeAsStringAsync(path, JSON.stringify(data), { encoding: 'utf8' });
			
			// Verificar se é possível compartilhar arquivo
			const avaliable = await Sharing.isAvailableAsync();
			if(avaliable)
				// Abrir menú de compartilhamento
				await Sharing.shareAsync(path);
		}
		catch(err)
		{
			console.error(err);
			alert(err);
		}
	}

	async function handleImport()
	{
		try
		{
			const file = await DocumentPicker.getDocumentAsync({
				copyToCacheDirectory: false,
				//type: 'application/json'
			});

			if(file.type === 'success')
			{
				const content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
				const json: DataJson & any = JSON.parse(content);

				ImportService.consumeDataJson(json);
				setUpdated(true);
			}
		}
		catch(err)
		{
			console.log(err);
			alert(err);
		}
	}

	function showVerifyReset()
	{
		setIsConfirmResetVisible(false);

		let newVerificationCode: string = "";
		for(let i = 0; i < verifCodeLength; i++)
		{
			// 36 = (0...9) + (A...Z)
			// (DEC) 48 = (ASCII) "0"
			let intChar = Math.random() * 36 + 48;

			// (DEC) 58 = (ASCII) ":"
			if(intChar >= 58)
				intChar += 7;

			newVerificationCode += String.fromCharCode(intChar);
		}

		setVerifCode(newVerificationCode);
		setIsVerifyResetVisible(true);
	}

	function handleResetData()
	{
		if(verifCodeValue === verifCode)
			Database.recreate()
				.then(() => setUpdated(true)) // <- Atualiza HomeScreen
				.catch(err => alert(err));
		else
			alert('Código inválido');

		setIsVerifyResetVisible(false);
	}

	// ---------- EFFECTS ----------

	useEffect(() =>
	{
		if(isVerifyResetVisible)
		{
			setVerifCodeValue('');
			setTimeout(() => verifCodeRef.current?.focus(), 2000);
		}
	},
	[isVerifyResetVisible]);

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
					onClick: handleImport  ,
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
                        onClick: showVerifyReset
                    },
                    { text: 'Cancelar' }
                ]}
			/>

			{/* Confirmar reset novamente */}
			<Modal
				visible={isVerifyResetVisible}
				setVisible={setIsVerifyResetVisible}
				style={styles.verifyModal}
				//onTouchStart={() => verifCodeRef.current?.focus()}
			>
				<Text style={{ fontSize: 16, textAlign: 'center' }}>
					Para prosseguir, digite o código
				</Text>

				{/* Código aleatório */}
				<Text style={styles.verifCode}>
					{verifCode}
				</Text>

				{/*<Text style={{ fontSize: 16, textAlign: 'center' }}>
					para continuar
				</Text>*/}

				{/* Input invisível */}
				<TextInput
					ref={verifCodeRef}
					style={styles.verifCodeInput}
					maxLength={verifCodeLength}
					value={verifCodeValue}
					onChangeText={text => setVerifCodeValue(text.toUpperCase())}
					autoCapitalize='characters'
					returnKeyType='next'
					onSubmitEditing={() => handleResetData()}
				/>

				{/* Caracteres digitados pelo usuário */}
				<View style={styles.verifCodeChars}>
					{Array.from(Array(verifCodeLength).keys()).map(i =>
						<Pressable
							key={i}
							style={{ alignItems: 'center', justifyContent: 'center' }}
							onPress={() => verifCodeRef.current?.focus()}
						>
							<Text
								//key={i}
								style={[
									styles.verifCodeChar,
									/*verifCodeValue.length === i ? {
										borderColor: `rgba(${colors.primaryRGB}, 1)`,
									} : null*/
								]}
							>
								{verifCodeValue.charAt(i)}
							</Text>

							{verifCodeValue.length === i
							? /*<View style={{
								position: 'absolute',
								width: 2,
								height: 20,
								backgroundColor: colors.primary,
							}} />*/ <Pointer /> : null}
						</Pressable>
					)}
				</View>

				<View style={styles.buttons}>
					<Button
						text='Cancelar'
						onClick={() => setIsVerifyResetVisible(false)}
					/>
					<Button
						style={{ marginLeft: 6 }}
						text='Resetar'
						backgroundColor={colors.red}
						onClick={handleResetData}
					/>
				</View>
			</Modal>
		</>
	);
}

export default HomeHeader;



const styles = StyleSheet.create({
	// VERIFY MODAL
	verifyModal: {
		padding: 18,
	},
	verifCode: {
		letterSpacing: 6,
		fontSize: 22,
		textAlign: 'center',
	},
	verifCodeInput: {
		position: 'absolute',
		width: 0,
		height: 0,
	},
	verifCodeChars: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 12,
	},
	verifCodeChar: {
		//width: 32,
		width: 42,
		height: 42,
		borderWidth: 1,
		borderColor: 'rgba(0, 0, 0, 0.14)',
		borderRadius: 6,
		textAlign: 'center',
		textAlignVertical: 'center',
		fontSize: 20,
	},
	buttons: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 18,
	},
});