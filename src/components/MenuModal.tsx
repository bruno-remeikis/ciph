import React, { createElement } from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';

// Icons
import { Icon } from 'react-native-vector-icons/Icon';
import { colors } from '../utils/consts';

// Components
import Modal, { ModalProps } from './Modal';



export type MenuItem = {
    icon? : {
        component: typeof Icon;
        name: string;
    };
    text: string;
    color?: string;
    onClick: Function;
    division?: boolean;
};

interface MenuModalProps extends ModalProps
{
    items: MenuItem[];
}

const MenuModal: React.FC<MenuModalProps> = ({ items, ...props }) =>
{
    return (
        <Modal
            {...props}
            style={[ props.style, styles.menuContainer ]}
        >
            {items.map((item, i) =>
                <Pressable
                    key={i}
                    style={[
                        styles.menuItem,
                        item.division
                            ? styles.menuItemDivision
                            : null
                    ]}
                    onPress={() =>
                    {
                        props.setVisible(false);
                        item.onClick();
                    }}
                >
                    {item.icon ? createElement(item.icon.component, {
                        name: item.icon.name,
                        size: 24,
                        color: item.color ? item.color : colors.text
                    }) : null}

                    <Text style={[styles.menuItemContent, {
                        color: item.color ? item.color : colors.text,
                    }]}>
                        {item.text}
                    </Text>
                </Pressable>
            )}
        </Modal>
    );
}

export default MenuModal;

const styles = StyleSheet.create({
    menuBtn: {
		padding: 10,
	},
	menuContainer: {
		minWidth: 170,
        maxWidth: 300,
		padding: 9,
	},
	menuItem: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 9,
	},
	menuItemDivision: {
		marginTop: 9,
		borderTopWidth: 1,
		borderTopColor: colors.inputBorder,
	},
	menuItemContent: {
		marginLeft: 12,
		fontSize: 20,
	},
});