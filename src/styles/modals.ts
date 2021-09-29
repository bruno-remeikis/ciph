import { StyleSheet } from 'react-native';

// Utils
import { colors } from '../utils/consts';

export default StyleSheet.create({
    menuBtn: {
		padding: 10,
	},
	menuContainer: {
		minWidth: 170,
		padding: 9,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 9,
	},
	menuItemDelete: {
		marginTop: 9,
		borderTopWidth: 1,
		borderTopColor: colors.inputBorder,
	},
	menuItemContent: {
		marginLeft: 12,
		fontSize: 20,
	},
});