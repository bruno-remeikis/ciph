import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

// Icons
import EntypoIcon from 'react-native-vector-icons/Entypo';

// Components
import MenuModal, { MenuItem } from '../../MenuModal';

interface GenericAppHeaderProps {
    menuItems: MenuItem[];
}

const GenericAppHeader: React.FC<GenericAppHeaderProps> = ({ menuItems }) =>
{
    const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

    return (
        <>
            <Pressable
                style={styles.menuBtn}
                onPress={() => setIsMenuVisible(true)}
            >
                <EntypoIcon name='dots-three-vertical' size={18} color='#ffffff' />
            </Pressable>

            <MenuModal
                visible={isMenuVisible}
                setVisible={setIsMenuVisible}
                items={menuItems.map(item => ({
                    ...item,
                    onClick: () => {
                        setIsMenuVisible(false);
                        item.onClick();
                    }
                }))}
            />
        </>
    );
}

export default GenericAppHeader;



// ---------- STYLES ----------
const styles = StyleSheet.create({
    menuBtn: {
		padding: 10,
	}
});