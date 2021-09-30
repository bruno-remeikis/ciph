import { StyleSheet } from 'react-native';

// Utils
import { colors } from '../../../utils/consts';

export default StyleSheet.create({
    editModal: {
        padding: 10,
    },
    editModalLabel: {
        fontSize: 16,
        marginBottom: 4,
    },
    editModalInput: {
        width: 240,
        marginBottom: 2,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 4,
    },
    editModalBtns: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
    },
    editModalBtn: {
        padding: 6,
    },
    editModalBtnContent: {
        color: colors.primary,
        fontSize: 16,
    },
});